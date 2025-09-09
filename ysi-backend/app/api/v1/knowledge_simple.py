from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime

router = APIRouter()

class KnowledgeQueryRequest(BaseModel):
    """Request model for knowledge queries"""
    query: str = Field(..., min_length=1, max_length=1000, description="Natural language query")
    search_mode: str = Field(default="hybrid", description="Search mode: hybrid, vector, text, semantic")
    limit: int = Field(default=10, ge=1, le=50, description="Maximum number of results")
    context: Optional[Dict[str, Any]] = Field(default=None, description="Additional context for the query")

class KnowledgeQueryResponse(BaseModel):
    """Response model for knowledge queries"""
    query: str
    search_mode: str
    results: List[Dict[str, Any]]
    total_results: int
    processing_time_ms: int
    timestamp: str
    status: str = "mock"  # Indicates this is mock response

@router.get("/health")
async def knowledge_health():
    """Health check for knowledge service"""
    return {
        "status": "healthy",
        "service": "knowledge_base",
        "embeddings_ready": False,
        "search_ready": False,
        "mock_mode": True
    }

@router.get("/stats")
async def get_knowledge_stats():
    """Mock knowledge base statistics"""
    return {
        "total_embeddings": 0,
        "by_source_type": {},
        "recent_24h": 0,
        "total_tokens": 0,
        "estimated_cost_usd": 0.0,
        "status": "mock",
        "message": "Database not yet configured"
    }

@router.post("/query", response_model=KnowledgeQueryResponse)
async def query_knowledge_base_mock(request: KnowledgeQueryRequest):
    """
    Mock knowledge query endpoint for MVP testing
    """
    start_time = datetime.utcnow()
    
    # Mock response based on query
    mock_results = []
    
    if "funding" in request.query.lower():
        mock_results = [
            {
                "id": 1,
                "text": "María González: El funding es definitivamente nuestro mayor desafío. Los jóvenes innovadores tienen ideas brillantes, pero necesitamos capital de riesgo que esté dispuesto a invertir en proyectos de impacto social.",
                "source_type": "meeting_transcript",
                "similarity": 0.89,
                "highlighted_snippet": "El <mark>funding</mark> es definitivamente nuestro mayor desafío...",
                "metadata": {
                    "date": "2025-08-15",
                    "session_title": "Stakeholder Meeting",
                    "speaker": "María González"
                }
            },
            {
                "id": 2, 
                "text": "Carlos Santos: Podríamos estructurarlo como un fondo de 10 millones de euros, con tickets de inversión entre 50K y 500K euros para cada startup.",
                "source_type": "meeting_transcript",
                "similarity": 0.85,
                "highlighted_snippet": "...fondo de 10 millones de euros, con tickets de <mark>inversión</mark>...",
                "metadata": {
                    "date": "2025-08-15",
                    "session_title": "Stakeholder Meeting",
                    "speaker": "Carlos Santos"
                }
            }
        ]
    elif "sustainability" in request.query.lower() or "climate" in request.query.lower():
        mock_results = [
            {
                "id": 3,
                "text": "Sofia Patel: My renewable energy project needs 200K euros to reach the next milestone, but traditional investors don't understand our vision.",
                "source_type": "workshop_transcript", 
                "similarity": 0.91,
                "highlighted_snippet": "My renewable energy project needs 200K euros...",
                "metadata": {
                    "date": "2025-08-20",
                    "session_title": "Innovation Workshop",
                    "speaker": "Sofia Patel"
                }
            }
        ]
    elif "wellbeing" in request.query.lower():
        mock_results = [
            {
                "id": 4,
                "text": "María González: Hemos notado que muchos jóvenes emprendedores están experimentando burnout. ¿Cómo podemos apoyarlos mejor?",
                "source_type": "meeting_transcript",
                "similarity": 0.87,
                "highlighted_snippet": "muchos jóvenes emprendedores están experimentando <mark>burnout</mark>...",
                "metadata": {
                    "date": "2025-08-15", 
                    "session_title": "Stakeholder Meeting",
                    "speaker": "María González"
                }
            }
        ]
    else:
        mock_results = [
            {
                "id": 5,
                "text": "General discussion about YSI Catalyst program progress and stakeholder feedback.",
                "source_type": "meeting_transcript",
                "similarity": 0.75,
                "highlighted_snippet": "General discussion about YSI Catalyst program...",
                "metadata": {
                    "date": "2025-09-01",
                    "session_title": "Team Sync",
                    "type": "general"
                }
            }
        ]
    
    processing_time = int((datetime.utcnow() - start_time).total_seconds() * 1000)
    
    return KnowledgeQueryResponse(
        query=request.query,
        search_mode=request.search_mode,
        results=mock_results[:request.limit],
        total_results=len(mock_results),
        processing_time_ms=processing_time,
        timestamp=datetime.utcnow().isoformat(),
        status="mock"
    )

@router.get("/search/similar")
async def find_similar_content_mock(
    text: str,
    limit: int = 5,
    similarity_threshold: float = 0.7
):
    """Mock similar content search"""
    return {
        "similar_content": [
            {
                "id": 1,
                "text": f"Mock similar content for: {text[:50]}...",
                "similarity": 0.85,
                "source_type": "mock",
                "metadata": {"mock": True}
            }
        ],
        "total_results": 1,
        "similarity_threshold": similarity_threshold,
        "status": "mock"
    }