from typing import List, Dict, Any, Optional, Tuple
import logging
from datetime import datetime, timedelta
import re

from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, text, func, desc, asc
from sqlalchemy.dialects.postgresql import insert

from app.models.text_embedding import TextEmbedding
from app.models.user import User
from app.models.session import Session as YSISession
from app.models.participant import Participant
from app.services.embedding_service import embedding_service
from app.services.logging_service import performance_monitor, session_logger
from app.db.session import get_db

logger = logging.getLogger(__name__)


class AdvancedSearchService:
    """
    Advanced search service with hybrid search, natural language queries,
    and intelligent filtering based on Azure RAG PostgreSQL patterns
    """
    
    def __init__(self):
        self.rrf_k = 60  # Reciprocal Rank Fusion parameter
        self.default_limit = 10
        self.max_limit = 100
    
    @performance_monitor.monitor_operation("natural_language_query")
    async def natural_language_query(
        self,
        query: str,
        user_id: int,
        context: Optional[Dict[str, Any]] = None,
        limit: int = 10,
        search_mode: str = "hybrid",  # hybrid, vector, text, semantic
        db: Optional[Session] = None
    ) -> Dict[str, Any]:
        """
        Process natural language query with intelligent context and filtering
        """
        if db is None:
            db = next(get_db())
        
        try:
            # Parse query for intent and filters
            query_analysis = await self._analyze_query(query, context)
            
            # Apply search based on mode
            if search_mode == "hybrid":
                results = await self._hybrid_search_with_context(
                    query, query_analysis, user_id, limit, db
                )
            elif search_mode == "vector":
                results = await embedding_service.vector_similarity_search(
                    query=query,
                    limit=limit,
                    source_types=query_analysis.get('source_types'),
                    metadata_filters=query_analysis.get('filters', {}),
                    db=db
                )
            elif search_mode == "semantic":
                results = await self._semantic_search_with_reasoning(
                    query, query_analysis, user_id, limit, db
                )
            else:  # text search
                results = await self._enhanced_text_search(
                    query, query_analysis, limit, db
                )
            
            # Post-process and enrich results
            enriched_results = await self._enrich_search_results(results, query_analysis, db)
            
            # Log query for analytics
            await self._log_search_query(query, query_analysis, len(enriched_results), user_id)
            
            return {
                'query': query,
                'query_analysis': query_analysis,
                'results': enriched_results,
                'total_results': len(enriched_results),
                'search_mode': search_mode,
                'timestamp': datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Natural language query failed: {str(e)}")
            raise
    
    async def _analyze_query(self, query: str, context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Analyze query to extract intent, filters, and context
        """
        analysis = {
            'original_query': query,
            'intent': 'search',  # search, question, analysis, comparison
            'entities': [],
            'time_filters': {},
            'source_types': None,
            'filters': {},
            'query_type': 'general'  # stakeholder, meeting, topic, action, insight
        }
        
        query_lower = query.lower()
        
        # Extract stakeholder/participant references
        stakeholder_patterns = [
            r'\b(about|from|by|with)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)',
            r'\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(said|mentioned|discussed)',
            r'stakeholder\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)'
        ]
        
        for pattern in stakeholder_patterns:
            matches = re.findall(pattern, query)
            for match in matches:
                if isinstance(match, tuple):
                    name = match[1] if len(match) > 1 else match[0]
                else:
                    name = match
                if name and len(name) > 2:
                    analysis['entities'].append({
                        'type': 'person',
                        'value': name,
                        'confidence': 0.8
                    })
        
        # Extract time references
        time_patterns = {
            r'last (\d+) days?': lambda m: {'days': int(m.group(1))},
            r'past (\d+) weeks?': lambda m: {'weeks': int(m.group(1))},
            r'last week': lambda m: {'days': 7},
            r'this month': lambda m: {'current_month': True},
            r'recent': lambda m: {'days': 7},
            r'(\d{4}-\d{2}-\d{2})': lambda m: {'specific_date': m.group(1)}
        }
        
        for pattern, extract_func in time_patterns.items():
            match = re.search(pattern, query_lower)
            if match:
                analysis['time_filters'] = extract_func(match)
                break
        
        # Determine query type and source filters
        if any(word in query_lower for word in ['meeting', 'transcript', 'discussion', 'session']):
            analysis['query_type'] = 'meeting'
            analysis['source_types'] = ['meeting_transcript']
        
        elif any(word in query_lower for word in ['stakeholder', 'participant', 'person', 'who']):
            analysis['query_type'] = 'stakeholder'
        
        elif any(word in query_lower for word in ['action', 'task', 'follow up', 'next step']):
            analysis['query_type'] = 'action'
            analysis['source_types'] = ['action', 'next_step']
        
        elif any(word in query_lower for word in ['insight', 'pattern', 'theme', 'analysis']):
            analysis['query_type'] = 'insight'
            analysis['source_types'] = ['insight']
        
        # Determine intent
        if query.endswith('?') or any(word in query_lower for word in ['what', 'how', 'why', 'when', 'where', 'who']):
            analysis['intent'] = 'question'
        
        elif any(word in query_lower for word in ['compare', 'difference', 'versus', 'vs']):
            analysis['intent'] = 'comparison'
        
        elif any(word in query_lower for word in ['analyze', 'summarize', 'explain', 'tell me about']):
            analysis['intent'] = 'analysis'
        
        # Add context filters
        if context:
            if 'session_id' in context:
                analysis['filters']['session_id'] = context['session_id']
            if 'stakeholder_id' in context:
                analysis['filters']['stakeholder_id'] = context['stakeholder_id']
        
        return analysis
    
    async def _hybrid_search_with_context(
        self,
        query: str,
        query_analysis: Dict[str, Any],
        user_id: int,
        limit: int,
        db: Session
    ) -> List[Dict[str, Any]]:
        """
        Enhanced hybrid search with contextual understanding
        """
        # Get vector results
        vector_results = await embedding_service.vector_similarity_search(
            query=query,
            limit=limit * 2,
            source_types=query_analysis.get('source_types'),
            metadata_filters=query_analysis.get('filters', {}),
            similarity_threshold=0.6,
            db=db
        )
        
        # Get text search results
        text_results = await self._enhanced_text_search(query, query_analysis, limit * 2, db)
        
        # Apply time filtering if specified
        if query_analysis.get('time_filters'):
            vector_results = self._apply_time_filters(vector_results, query_analysis['time_filters'])
            text_results = self._apply_time_filters(text_results, query_analysis['time_filters'])
        
        # Reciprocal Rank Fusion
        fused_results = self._reciprocal_rank_fusion(
            vector_results, 
            text_results,
            vector_weight=0.7,
            text_weight=0.3
        )
        
        # Re-rank based on query intent and context
        reranked_results = await self._contextual_reranking(
            fused_results, query_analysis, user_id, db
        )
        
        return reranked_results[:limit]
    
    async def _enhanced_text_search(
        self,
        query: str,
        query_analysis: Dict[str, Any],
        limit: int,
        db: Session
    ) -> List[Dict[str, Any]]:
        """
        Enhanced full-text search with PostgreSQL features
        """
        # Build text search query
        search_query = db.query(TextEmbedding)
        
        # Apply source type filters
        if query_analysis.get('source_types'):
            search_query = search_query.filter(
                TextEmbedding.source_type.in_(query_analysis['source_types'])
            )
        
        # Apply metadata filters
        filters = query_analysis.get('filters', {})
        for key, value in filters.items():
            if key == 'session_id':
                search_query = search_query.filter(TextEmbedding.session_id == value)
            elif key == 'user_id':
                search_query = search_query.filter(TextEmbedding.user_id == value)
            else:
                search_query = search_query.filter(
                    TextEmbedding.metadata[key].astext == str(value)
                )
        
        # Text search using ILIKE for now (can be enhanced with ts_vector)
        search_terms = query.split()
        for term in search_terms:
            if len(term) > 2:  # Skip very short terms
                search_query = search_query.filter(
                    or_(
                        TextEmbedding.raw_text.ilike(f'%{term}%'),
                        TextEmbedding.processed_text.ilike(f'%{term}%'),
                        TextEmbedding.title.ilike(f'%{term}%')
                    )
                )
        
        results = search_query.order_by(desc(TextEmbedding.created_at)).limit(limit).all()
        
        # Format results
        formatted_results = []
        for embedding in results:
            formatted_results.append({
                'id': embedding.id,
                'text': embedding.raw_text,
                'source_type': embedding.source_type,
                'source_id': embedding.source_id,
                'metadata': embedding.metadata,
                'similarity': 0.5,  # Default for text search
                'created_at': embedding.created_at,
                'search_method': 'text'
            })
        
        return formatted_results
    
    async def _semantic_search_with_reasoning(
        self,
        query: str,
        query_analysis: Dict[str, Any],
        user_id: int,
        limit: int,
        db: Session
    ) -> List[Dict[str, Any]]:
        """
        Semantic search with reasoning and chain-of-thought
        """
        # For now, use enhanced vector search
        # In future, this could use more sophisticated LLM reasoning
        
        # Expand query based on analysis
        expanded_queries = [query]
        
        if query_analysis['query_type'] == 'stakeholder':
            for entity in query_analysis['entities']:
                if entity['type'] == 'person':
                    expanded_queries.append(f"discussion with {entity['value']}")
                    expanded_queries.append(f"feedback from {entity['value']}")
        
        elif query_analysis['query_type'] == 'meeting':
            expanded_queries.append("meeting discussion")
            expanded_queries.append("session transcript")
        
        # Search with multiple query variations
        all_results = []
        for expanded_query in expanded_queries:
            results = await embedding_service.vector_similarity_search(
                query=expanded_query,
                limit=limit,
                source_types=query_analysis.get('source_types'),
                metadata_filters=query_analysis.get('filters', {}),
                similarity_threshold=0.5,
                db=db
            )
            all_results.extend(results)
        
        # Deduplicate and score
        seen_ids = set()
        unique_results = []
        for result in all_results:
            if result['id'] not in seen_ids:
                seen_ids.add(result['id'])
                unique_results.append(result)
        
        # Sort by similarity and limit
        unique_results.sort(key=lambda x: x['similarity'], reverse=True)
        return unique_results[:limit]
    
    def _apply_time_filters(self, results: List[Dict[str, Any]], time_filters: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Apply time-based filtering to results"""
        if not time_filters:
            return results
        
        filtered_results = []
        now = datetime.utcnow()
        
        for result in results:
            created_at = result.get('created_at')
            if not created_at:
                continue
            
            # Convert to datetime if needed
            if isinstance(created_at, str):
                try:
                    created_at = datetime.fromisoformat(created_at.replace('Z', '+00:00'))
                except:
                    continue
            
            # Apply filters
            if 'days' in time_filters:
                cutoff = now - timedelta(days=time_filters['days'])
                if created_at >= cutoff:
                    filtered_results.append(result)
            
            elif 'weeks' in time_filters:
                cutoff = now - timedelta(weeks=time_filters['weeks'])
                if created_at >= cutoff:
                    filtered_results.append(result)
            
            elif 'current_month' in time_filters:
                if created_at.year == now.year and created_at.month == now.month:
                    filtered_results.append(result)
            
            elif 'specific_date' in time_filters:
                target_date = datetime.strptime(time_filters['specific_date'], '%Y-%m-%d').date()
                if created_at.date() == target_date:
                    filtered_results.append(result)
            
            else:
                filtered_results.append(result)  # No time filter applied
        
        return filtered_results
    
    def _reciprocal_rank_fusion(
        self,
        vector_results: List[Dict[str, Any]],
        text_results: List[Dict[str, Any]],
        vector_weight: float = 0.7,
        text_weight: float = 0.3
    ) -> List[Dict[str, Any]]:
        """
        Combine results using Reciprocal Rank Fusion
        """
        rrf_scores = {}
        
        # Score vector results
        for rank, result in enumerate(vector_results):
            doc_id = result['id']
            score = vector_weight / (self.rrf_k + rank + 1)
            
            if doc_id not in rrf_scores:
                rrf_scores[doc_id] = {'score': score, 'data': result}
            else:
                rrf_scores[doc_id]['score'] += score
        
        # Score text results
        for rank, result in enumerate(text_results):
            doc_id = result['id']
            score = text_weight / (self.rrf_k + rank + 1)
            
            if doc_id not in rrf_scores:
                rrf_scores[doc_id] = {'score': score, 'data': result}
            else:
                rrf_scores[doc_id]['score'] += score
        
        # Sort by combined score
        sorted_results = sorted(
            rrf_scores.values(),
            key=lambda x: x['score'],
            reverse=True
        )
        
        return [item['data'] for item in sorted_results]
    
    async def _contextual_reranking(
        self,
        results: List[Dict[str, Any]],
        query_analysis: Dict[str, Any],
        user_id: int,
        db: Session
    ) -> List[Dict[str, Any]]:
        """
        Re-rank results based on context and user preferences
        """
        # For now, simple reranking based on query type
        # In future, could use ML models for personalized ranking
        
        for result in results:
            base_score = result.get('similarity', 0.5)
            
            # Boost based on query type alignment
            if query_analysis['query_type'] == 'stakeholder':
                if any(entity['value'].lower() in result['text'].lower() 
                      for entity in query_analysis.get('entities', [])):
                    base_score *= 1.2
            
            elif query_analysis['query_type'] == 'meeting':
                if result.get('source_type') == 'meeting_transcript':
                    base_score *= 1.1
            
            # Boost recent content slightly
            if result.get('created_at'):
                try:
                    created_at = result['created_at']
                    if isinstance(created_at, str):
                        created_at = datetime.fromisoformat(created_at.replace('Z', '+00:00'))
                    
                    days_old = (datetime.utcnow() - created_at).days
                    if days_old < 7:
                        base_score *= 1.05
                except:
                    pass
            
            result['contextual_score'] = base_score
        
        # Sort by contextual score
        results.sort(key=lambda x: x.get('contextual_score', 0), reverse=True)
        return results
    
    async def _enrich_search_results(
        self,
        results: List[Dict[str, Any]],
        query_analysis: Dict[str, Any],
        db: Session
    ) -> List[Dict[str, Any]]:
        """
        Enrich search results with additional context
        """
        enriched_results = []
        
        for result in results:
            enriched_result = result.copy()
            
            # Add source context
            if result.get('source_id') and result.get('source_type'):
                source_context = await self._get_source_context(
                    result['source_type'], result['source_id'], db
                )
                enriched_result['source_context'] = source_context
            
            # Add snippet highlighting
            snippet = self._create_highlighted_snippet(
                result['text'], 
                query_analysis['original_query']
            )
            enriched_result['highlighted_snippet'] = snippet
            
            # Add relevance explanation
            enriched_result['relevance_explanation'] = self._generate_relevance_explanation(
                result, query_analysis
            )
            
            enriched_results.append(enriched_result)
        
        return enriched_results
    
    async def _get_source_context(self, source_type: str, source_id: int, db: Session) -> Dict[str, Any]:
        """Get context information about the source"""
        context = {}
        
        try:
            if source_type == 'meeting_transcript' and source_id:
                session = db.query(YSISession).filter(YSISession.id == source_id).first()
                if session:
                    context = {
                        'session_title': session.title,
                        'session_date': session.created_at.isoformat() if session.created_at else None,
                        'session_type': getattr(session, 'session_type', 'Unknown')
                    }
        except Exception as e:
            logger.error(f"Error getting source context: {str(e)}")
        
        return context
    
    def _create_highlighted_snippet(self, text: str, query: str, max_length: int = 300) -> str:
        """Create highlighted snippet around query matches"""
        query_terms = query.lower().split()
        text_lower = text.lower()
        
        # Find first occurrence of any query term
        best_pos = -1
        for term in query_terms:
            if len(term) > 2:
                pos = text_lower.find(term)
                if pos != -1 and (best_pos == -1 or pos < best_pos):
                    best_pos = pos
        
        if best_pos == -1:
            # No match found, return beginning
            snippet = text[:max_length]
        else:
            # Center snippet around match
            start = max(0, best_pos - max_length // 2)
            end = min(len(text), start + max_length)
            snippet = text[start:end]
            
            # Add ellipsis if truncated
            if start > 0:
                snippet = "..." + snippet
            if end < len(text):
                snippet = snippet + "..."
        
        return snippet
    
    def _generate_relevance_explanation(self, result: Dict[str, Any], query_analysis: Dict[str, Any]) -> str:
        """Generate explanation of why this result is relevant"""
        explanations = []
        
        similarity = result.get('similarity', 0)
        if similarity > 0.8:
            explanations.append("High semantic similarity to query")
        elif similarity > 0.6:
            explanations.append("Good semantic match")
        
        if result.get('search_method') == 'text':
            explanations.append("Contains exact text matches")
        
        if query_analysis.get('entities'):
            for entity in query_analysis['entities']:
                if entity['value'].lower() in result['text'].lower():
                    explanations.append(f"Mentions {entity['value']}")
        
        return "; ".join(explanations) if explanations else "Relevant to query"
    
    async def _log_search_query(
        self,
        query: str,
        query_analysis: Dict[str, Any],
        result_count: int,
        user_id: int
    ):
        """Log search query for analytics"""
        try:
            session_logger.logger.info(
                "SEARCH_QUERY",
                query=query[:200],  # Truncate long queries
                query_type=query_analysis.get('query_type'),
                intent=query_analysis.get('intent'),
                result_count=result_count,
                user_id=user_id,
                entities_found=len(query_analysis.get('entities', [])),
                has_time_filters=bool(query_analysis.get('time_filters')),
                timestamp=datetime.utcnow().isoformat()
            )
        except Exception as e:
            logger.error(f"Failed to log search query: {str(e)}")


# Global service instance
search_service = AdvancedSearchService()