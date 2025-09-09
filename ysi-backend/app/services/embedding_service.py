import os
import asyncio
import hashlib
import time
from typing import List, Dict, Any, Optional, Tuple
from datetime import datetime
import logging

import openai
import tiktoken
import numpy as np
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, text, func
from sqlalchemy.dialects.postgresql import insert

from app.models.text_embedding import TextEmbedding
from app.db.session import get_db
from app.core.config import settings
from app.services.logging_service import performance_monitor

logger = logging.getLogger(__name__)


class EmbeddingService:
    """
    Professional embedding service for YSI RAG system
    Based on Azure RAG PostgreSQL best practices
    """
    
    def __init__(self):
        self.openai_client = openai.AsyncOpenAI(
            api_key=settings.OPENAI_API_KEY
        )
        self.embedding_model = "text-embedding-ada-002"
        self.max_tokens = 8000  # Safe limit for ada-002
        self.encoding = tiktoken.get_encoding("cl100k_base")
        
    async def _get_embedding(self, text: str) -> Tuple[List[float], int, int]:
        """
        Get embedding for text with performance tracking
        Returns: (embedding, token_count, processing_time_ms)
        """
        start_time = time.time()
        
        # Count tokens
        token_count = len(self.encoding.encode(text))
        
        if token_count > self.max_tokens:
            # Truncate text if too long
            tokens = self.encoding.encode(text)[:self.max_tokens]
            text = self.encoding.decode(tokens)
            token_count = self.max_tokens
        
        try:
            response = await self.openai_client.embeddings.create(
                model=self.embedding_model,
                input=text
            )
            
            embedding = response.data[0].embedding
            processing_time = int((time.time() - start_time) * 1000)
            
            return embedding, token_count, processing_time
            
        except Exception as e:
            logger.error(f"Failed to get embedding: {str(e)}")
            raise
    
    def _chunk_text(self, text: str, chunk_size: int = 1000, overlap: int = 100) -> List[Dict[str, Any]]:
        """
        Intelligent text chunking with overlap
        Returns chunks with metadata
        """
        # Simple sentence-based chunking for now
        sentences = text.split('. ')
        chunks = []
        current_chunk = ""
        current_tokens = 0
        chunk_index = 0
        
        for sentence in sentences:
            sentence_tokens = len(self.encoding.encode(sentence))
            
            if current_tokens + sentence_tokens > chunk_size and current_chunk:
                # Save current chunk
                chunks.append({
                    'text': current_chunk.strip(),
                    'chunk_index': chunk_index,
                    'token_count': current_tokens,
                    'start_sentence': len(chunks) * (chunk_size // 10),  # Approximate
                })
                
                # Start new chunk with overlap
                overlap_text = '. '.join(current_chunk.split('. ')[-2:])  # Last 2 sentences
                current_chunk = overlap_text + '. ' + sentence
                current_tokens = len(self.encoding.encode(current_chunk))
                chunk_index += 1
            else:
                current_chunk += '. ' + sentence if current_chunk else sentence
                current_tokens += sentence_tokens
        
        # Add final chunk
        if current_chunk:
            chunks.append({
                'text': current_chunk.strip(),
                'chunk_index': chunk_index,
                'token_count': current_tokens,
                'start_sentence': chunk_index * (chunk_size // 10),
            })
        
        return chunks
    
    @performance_monitor.monitor_operation("process_text_chunk")
    async def process_text_chunk(
        self,
        text: str,
        source_type: str,
        source_id: Optional[int] = None,
        metadata: Optional[Dict[str, Any]] = None,
        user_id: Optional[int] = None,
        session_id: Optional[int] = None,
        db: Optional[Session] = None
    ) -> Optional[TextEmbedding]:
        """
        Process a single text chunk and store embedding
        """
        if db is None:
            db = next(get_db())
        
        # Check for existing embedding
        content_hash = TextEmbedding.generate_content_hash(text)
        existing = db.query(TextEmbedding).filter(
            TextEmbedding.content_hash == content_hash
        ).first()
        
        if existing:
            logger.info(f"Embedding already exists for hash: {content_hash}")
            return existing
        
        try:
            # Generate embedding
            embedding, token_count, processing_time = await self._get_embedding(text)
            
            # Create embedding record
            text_embedding = TextEmbedding(
                content_hash=content_hash,
                source_type=source_type,
                source_id=source_id,
                chunk_index=0,
                raw_text=text,
                processed_text=text.strip(),
                embedding=embedding,
                metadata=metadata or {},
                token_count=token_count,
                processing_duration_ms=processing_time,
                session_id=session_id,
                user_id=user_id
            )
            
            db.add(text_embedding)
            db.commit()
            db.refresh(text_embedding)
            
            logger.info(f"Created embedding {text_embedding.id} for {source_type}")
            return text_embedding
            
        except Exception as e:
            db.rollback()
            logger.error(f"Failed to process text chunk: {str(e)}")
            raise
    
    @performance_monitor.monitor_operation("batch_process_documents")
    async def batch_process_documents(
        self,
        documents: List[Dict[str, Any]],
        chunk_size: int = 1000,
        batch_size: int = 10
    ) -> List[TextEmbedding]:
        """
        Batch process multiple documents with chunking
        documents format: [{'text': str, 'source_type': str, 'source_id': int, 'metadata': dict}, ...]
        """
        all_embeddings = []
        db = next(get_db())
        
        try:
            for i in range(0, len(documents), batch_size):
                batch = documents[i:i + batch_size]
                batch_embeddings = []
                
                for doc in batch:
                    # Chunk the document
                    chunks = self._chunk_text(doc['text'], chunk_size)
                    
                    for chunk_data in chunks:
                        # Process each chunk
                        embedding = await self.process_text_chunk(
                            text=chunk_data['text'],
                            source_type=doc['source_type'],
                            source_id=doc.get('source_id'),
                            metadata={
                                **doc.get('metadata', {}),
                                'chunk_index': chunk_data['chunk_index'],
                                'total_chunks': len(chunks),
                                'chunk_tokens': chunk_data['token_count']
                            },
                            user_id=doc.get('user_id'),
                            session_id=doc.get('session_id'),
                            db=db
                        )
                        
                        if embedding:
                            batch_embeddings.append(embedding)
                
                all_embeddings.extend(batch_embeddings)
                
                # Small delay to avoid rate limiting
                await asyncio.sleep(0.1)
                
                logger.info(f"Processed batch {i // batch_size + 1}, total embeddings: {len(all_embeddings)}")
            
            return all_embeddings
            
        except Exception as e:
            logger.error(f"Batch processing failed: {str(e)}")
            raise
        finally:
            db.close()
    
    @performance_monitor.monitor_operation("vector_similarity_search")
    async def vector_similarity_search(
        self,
        query: str,
        limit: int = 10,
        similarity_threshold: float = 0.7,
        source_types: Optional[List[str]] = None,
        metadata_filters: Optional[Dict[str, Any]] = None,
        db: Optional[Session] = None
    ) -> List[Dict[str, Any]]:
        """
        Vector similarity search with metadata filtering
        """
        if db is None:
            db = next(get_db())
        
        try:
            # Get query embedding
            query_embedding, _, _ = await self._get_embedding(query)
            
            # Build base query
            query_builder = db.query(
                TextEmbedding,
                func.cosine_distance(TextEmbedding.embedding, query_embedding).label('distance')
            )
            
            # Apply filters
            if source_types:
                query_builder = query_builder.filter(TextEmbedding.source_type.in_(source_types))
            
            if metadata_filters:
                for key, value in metadata_filters.items():
                    query_builder = query_builder.filter(
                        TextEmbedding.metadata[key].astext == str(value)
                    )
            
            # Apply similarity threshold and limit
            results = query_builder.filter(
                func.cosine_distance(TextEmbedding.embedding, query_embedding) < (1 - similarity_threshold)
            ).order_by('distance').limit(limit).all()
            
            # Format results
            formatted_results = []
            for embedding, distance in results:
                similarity = 1 - distance
                formatted_results.append({
                    'id': embedding.id,
                    'text': embedding.raw_text,
                    'source_type': embedding.source_type,
                    'source_id': embedding.source_id,
                    'metadata': embedding.metadata,
                    'similarity': float(similarity),
                    'created_at': embedding.created_at
                })
            
            return formatted_results
            
        except Exception as e:
            logger.error(f"Vector search failed: {str(e)}")
            raise
    
    @performance_monitor.monitor_operation("hybrid_search")
    async def hybrid_search(
        self,
        query: str,
        limit: int = 10,
        vector_weight: float = 0.7,
        text_weight: float = 0.3,
        similarity_threshold: float = 0.6,
        source_types: Optional[List[str]] = None,
        metadata_filters: Optional[Dict[str, Any]] = None,
        db: Optional[Session] = None
    ) -> List[Dict[str, Any]]:
        """
        Hybrid search combining vector similarity and full-text search
        Uses Reciprocal Rank Fusion (RRF) for result combination
        """
        if db is None:
            db = next(get_db())
        
        try:
            # Vector search
            vector_results = await self.vector_similarity_search(
                query=query,
                limit=limit * 2,  # Get more results for fusion
                similarity_threshold=similarity_threshold,
                source_types=source_types,
                metadata_filters=metadata_filters,
                db=db
            )
            
            # Full-text search using PostgreSQL full-text search
            text_query = db.query(TextEmbedding).filter(
                TextEmbedding.raw_text.ilike(f'%{query}%')
            )
            
            # Apply same filters
            if source_types:
                text_query = text_query.filter(TextEmbedding.source_type.in_(source_types))
            
            if metadata_filters:
                for key, value in metadata_filters.items():
                    text_query = text_query.filter(
                        TextEmbedding.metadata[key].astext == str(value)
                    )
            
            text_results = text_query.limit(limit * 2).all()
            
            # Reciprocal Rank Fusion
            rrf_scores = {}
            k = 60  # RRF parameter
            
            # Score vector results
            for rank, result in enumerate(vector_results):
                doc_id = result['id']
                rrf_scores[doc_id] = rrf_scores.get(doc_id, 0) + vector_weight / (k + rank + 1)
                if doc_id not in rrf_scores or 'data' not in rrf_scores:
                    rrf_scores[doc_id] = {'score': rrf_scores[doc_id], 'data': result}
                else:
                    rrf_scores[doc_id]['score'] = rrf_scores[doc_id]
            
            # Score text results
            for rank, result in enumerate(text_results):
                doc_id = result.id
                score = text_weight / (k + rank + 1)
                
                if doc_id in rrf_scores:
                    rrf_scores[doc_id]['score'] += score
                else:
                    rrf_scores[doc_id] = {
                        'score': score,
                        'data': {
                            'id': result.id,
                            'text': result.raw_text,
                            'source_type': result.source_type,
                            'source_id': result.source_id,
                            'metadata': result.metadata,
                            'similarity': 0.5,  # Default for text-only matches
                            'created_at': result.created_at
                        }
                    }
            
            # Sort by RRF score and return top results
            sorted_results = sorted(
                rrf_scores.values(),
                key=lambda x: x['score'],
                reverse=True
            )[:limit]
            
            return [result['data'] for result in sorted_results]
            
        except Exception as e:
            logger.error(f"Hybrid search failed: {str(e)}")
            raise
    
    async def get_similar_documents(
        self,
        text: str,
        source_type: Optional[str] = None,
        limit: int = 5,
        similarity_threshold: float = 0.8
    ) -> List[Dict[str, Any]]:
        """
        Find similar documents to given text
        """
        filters = {}
        source_types = [source_type] if source_type else None
        
        return await self.vector_similarity_search(
            query=text,
            limit=limit,
            similarity_threshold=similarity_threshold,
            source_types=source_types
        )
    
    def get_embedding_stats(self, db: Optional[Session] = None) -> Dict[str, Any]:
        """
        Get embedding database statistics
        """
        if db is None:
            db = next(get_db())
        
        try:
            stats = {}
            
            # Total count
            stats['total_embeddings'] = db.query(TextEmbedding).count()
            
            # Count by source type
            source_counts = db.query(
                TextEmbedding.source_type,
                func.count(TextEmbedding.id)
            ).group_by(TextEmbedding.source_type).all()
            
            stats['by_source_type'] = {source: count for source, count in source_counts}
            
            # Recent activity
            stats['recent_24h'] = db.query(TextEmbedding).filter(
                TextEmbedding.created_at >= func.now() - text('interval \'24 hours\'')
            ).count()
            
            # Token usage
            total_tokens = db.query(func.sum(TextEmbedding.token_count)).scalar() or 0
            stats['total_tokens'] = total_tokens
            stats['estimated_cost_usd'] = total_tokens * 0.0001 / 1000  # ada-002 pricing
            
            return stats
            
        except Exception as e:
            logger.error(f"Failed to get embedding stats: {str(e)}")
            return {}


# Global service instance
embedding_service = EmbeddingService()