from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from datetime import datetime

from app.db.session import get_db
from app.models.user import User
from app.models.knowledge_query import KnowledgeQuery
from app.services.search_service import search_service
from app.services.embedding_service import embedding_service
from app.api.deps import get_current_user_mvp as get_current_user
from app.services.logging_service import session_logger, performance_monitor

router = APIRouter()


class KnowledgeQueryRequest(BaseModel):
    """Request model for knowledge queries"""
    query: str = Field(..., min_length=1, max_length=1000, description="Natural language query")
    search_mode: str = Field(default="hybrid", description="Search mode: hybrid, vector, text, semantic")
    limit: int = Field(default=10, ge=1, le=50, description="Maximum number of results")
    source_types: Optional[List[str]] = Field(default=None, description="Filter by source types")
    context: Optional[Dict[str, Any]] = Field(default=None, description="Additional context for the query")
    include_sources: bool = Field(default=True, description="Include source citations")
    save_query: bool = Field(default=True, description="Save query for analytics")


class KnowledgeQueryResponse(BaseModel):
    """Response model for knowledge queries"""
    query_id: Optional[int] = None
    query: str
    search_mode: str
    results: List[Dict[str, Any]]
    total_results: int
    query_analysis: Dict[str, Any]
    processing_time_ms: int
    timestamp: str
    suggestions: Optional[List[str]] = None


class EmbeddingStatsResponse(BaseModel):
    """Response model for embedding statistics"""
    total_embeddings: int
    by_source_type: Dict[str, int]
    recent_24h: int
    total_tokens: int
    estimated_cost_usd: float


class DataIngestionRequest(BaseModel):
    """Request model for data ingestion"""
    transcripts_dir: Optional[str] = Field(default=None, description="Directory containing transcripts")
    source_type: str = Field(default="meeting_transcript", description="Type of source documents")
    metadata: Optional[Dict[str, Any]] = Field(default=None, description="Additional metadata")


@router.post("/query", response_model=KnowledgeQueryResponse)
@performance_monitor.monitor_operation("knowledge_query_api")
async def query_knowledge_base(
    request: KnowledgeQueryRequest,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Query the knowledge base using natural language
    Supports hybrid search, contextual understanding, and intelligent filtering
    """
    start_time = datetime.utcnow()
    
    try:
        # Execute search query
        search_result = await search_service.natural_language_query(
            query=request.query,
            user_id=current_user.id,
            context=request.context,
            limit=request.limit,
            search_mode=request.search_mode,
            db=db
        )
        
        # Save query for analytics if requested
        query_record = None
        if request.save_query:
            query_record = KnowledgeQuery(
                user_id=current_user.id,
                query_text=request.query,
                search_mode=request.search_mode,
                result_count=search_result['total_results'],
                query_analysis=search_result['query_analysis'],
                processing_time_ms=int((datetime.utcnow() - start_time).total_seconds() * 1000)
            )
            db.add(query_record)
            db.commit()
            db.refresh(query_record)
        
        # Generate query suggestions
        suggestions = await _generate_query_suggestions(
            request.query, search_result['query_analysis'], current_user.id, db
        )
        
        # Log query activity
        session_logger.log_ai_insight_generated(
            session_id=request.context.get('session_id') if request.context else None,
            insight_data={
                'type': 'knowledge_query',
                'query': request.query[:100],
                'result_count': search_result['total_results'],
                'search_mode': request.search_mode,
                'processing_time_ms': int((datetime.utcnow() - start_time).total_seconds() * 1000)
            }
        )
        
        return KnowledgeQueryResponse(
            query_id=query_record.id if query_record else None,
            query=search_result['query'],
            search_mode=request.search_mode,
            results=search_result['results'],
            total_results=search_result['total_results'],
            query_analysis=search_result['query_analysis'],
            processing_time_ms=int((datetime.utcnow() - start_time).total_seconds() * 1000),
            timestamp=search_result['timestamp'],
            suggestions=suggestions
        )
        
    except Exception as e:
        # Log error
        session_logger.logger.error(
            f"Knowledge query failed: {str(e)}",
            query=request.query,
            user_id=current_user.id,
            search_mode=request.search_mode
        )
        
        raise HTTPException(
            status_code=500,
            detail=f"Knowledge query failed: {str(e)}"
        )


@router.get("/search/similar")
async def find_similar_content(
    text: str = Query(..., min_length=10, description="Text to find similar content for"),
    source_type: Optional[str] = Query(default=None, description="Filter by source type"),
    limit: int = Query(default=5, ge=1, le=20),
    similarity_threshold: float = Query(default=0.7, ge=0.1, le=1.0),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Find similar content to the provided text"""
    try:
        results = await embedding_service.get_similar_documents(
            text=text,
            source_type=source_type,
            limit=limit,
            similarity_threshold=similarity_threshold
        )
        
        return {
            'similar_content': results,
            'total_results': len(results),
            'source_type_filter': source_type,
            'similarity_threshold': similarity_threshold
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Similar content search failed: {str(e)}"
        )


@router.get("/stats", response_model=EmbeddingStatsResponse)
async def get_knowledge_base_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get knowledge base statistics and metrics"""
    try:
        stats = embedding_service.get_embedding_stats(db)
        
        return EmbeddingStatsResponse(
            total_embeddings=stats.get('total_embeddings', 0),
            by_source_type=stats.get('by_source_type', {}),
            recent_24h=stats.get('recent_24h', 0),
            total_tokens=stats.get('total_tokens', 0),
            estimated_cost_usd=stats.get('estimated_cost_usd', 0.0)
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get knowledge base stats: {str(e)}"
        )


@router.get("/queries/recent")
async def get_recent_queries(
    limit: int = Query(default=20, ge=1, le=100),
    include_analysis: bool = Query(default=False),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get recent knowledge queries for the current user"""
    try:
        queries = db.query(KnowledgeQuery).filter(
            KnowledgeQuery.user_id == current_user.id
        ).order_by(KnowledgeQuery.created_at.desc()).limit(limit).all()
        
        result = []
        for query in queries:
            query_data = {
                'id': query.id,
                'query_text': query.query_text,
                'search_mode': query.search_mode,
                'result_count': query.result_count,
                'processing_time_ms': query.processing_time_ms,
                'created_at': query.created_at.isoformat()
            }
            
            if include_analysis:
                query_data['query_analysis'] = query.query_analysis
            
            result.append(query_data)
        
        return {
            'recent_queries': result,
            'total_queries': len(result)
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get recent queries: {str(e)}"
        )


@router.post("/ingest")
async def ingest_data(
    request: DataIngestionRequest,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Trigger data ingestion pipeline
    Admin-only endpoint for loading new data into the knowledge base
    """
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=403,
            detail="Only administrators can trigger data ingestion"
        )
    
    try:
        # Import here to avoid circular imports
        from app.scripts.data_ingestion import DataIngestionPipeline
        
        # Run ingestion in background
        def run_ingestion():
            try:
                pipeline = DataIngestionPipeline()
                import asyncio
                result = asyncio.run(pipeline.run_full_ingestion(request.transcripts_dir))
                
                # Log completion
                session_logger.logger.info(
                    "DATA_INGESTION_COMPLETED",
                    user_id=current_user.id,
                    transcripts_loaded=result.get('transcripts_loaded', 0),
                    embeddings_created=result.get('embeddings_created', 0),
                    duration_seconds=result.get('duration_seconds', 0),
                    errors=result.get('errors', 0)
                )
                
            except Exception as e:
                session_logger.logger.error(
                    f"DATA_INGESTION_FAILED: {str(e)}",
                    user_id=current_user.id,
                    transcripts_dir=request.transcripts_dir
                )
        
        background_tasks.add_task(run_ingestion)
        
        return {
            'message': 'Data ingestion started',
            'transcripts_dir': request.transcripts_dir,
            'source_type': request.source_type,
            'started_by': current_user.email,
            'started_at': datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to start data ingestion: {str(e)}"
        )


@router.post("/embeddings/process")
async def process_text_to_embedding(
    text: str = Query(..., min_length=10, description="Text to process into embedding"),
    source_type: str = Query(default="manual_input", description="Source type for the text"),
    metadata: Optional[Dict[str, Any]] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Process individual text into embedding
    Useful for testing and manual content addition
    """
    try:
        embedding = await embedding_service.process_text_chunk(
            text=text,
            source_type=source_type,
            metadata=metadata or {},
            user_id=current_user.id,
            db=db
        )
        
        if embedding:
            return {
                'embedding_id': embedding.id,
                'content_hash': embedding.content_hash,
                'token_count': embedding.token_count,
                'processing_duration_ms': embedding.processing_duration_ms,
                'source_type': embedding.source_type,
                'created_at': embedding.created_at.isoformat()
            }
        else:
            return {
                'message': 'Embedding already exists for this text',
                'content_hash': embedding_service.TextEmbedding.generate_content_hash(text)
            }
            
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to process text to embedding: {str(e)}"
        )


async def _generate_query_suggestions(
    original_query: str, 
    query_analysis: Dict[str, Any], 
    user_id: int, 
    db: Session
) -> List[str]:
    """Generate related query suggestions based on query analysis"""
    suggestions = []
    
    try:
        query_type = query_analysis.get('query_type', 'general')
        entities = query_analysis.get('entities', [])
        
        # Generate suggestions based on query type
        if query_type == 'stakeholder' and entities:
            person_name = entities[0]['value']
            suggestions.extend([
                f"What topics did {person_name} discuss most?",
                f"Recent interactions with {person_name}",
                f"Action items involving {person_name}"
            ])
        
        elif query_type == 'meeting':
            suggestions.extend([
                "What were the key insights from recent meetings?",
                "Action items from this week's meetings",
                "Meeting topics and themes summary"
            ])
        
        elif query_type == 'action':
            suggestions.extend([
                "Outstanding action items",
                "Completed actions this month",
                "High priority pending tasks"
            ])
        
        # Add general suggestions
        suggestions.extend([
            "Show me recent highlights",
            "What are the trending topics?",
            "Summary of key themes"
        ])
        
        # Limit to 3-5 suggestions
        return suggestions[:5]
        
    except Exception as e:
        session_logger.logger.error(f"Failed to generate query suggestions: {str(e)}")
        return []