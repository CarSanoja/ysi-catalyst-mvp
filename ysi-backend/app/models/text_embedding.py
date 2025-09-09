from sqlalchemy import Column, Integer, String, Text, DateTime, JSON, Index, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from pgvector.sqlalchemy import Vector
from app.db.base_class import Base
import uuid
import hashlib


class TextEmbedding(Base):
    """
    Professional text embedding storage for RAG system
    Following Azure RAG PostgreSQL best practices
    """
    __tablename__ = "text_embeddings"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Unique identifier and content hash for deduplication
    uuid = Column(UUID(as_uuid=True), default=uuid.uuid4, unique=True, index=True)
    content_hash = Column(String(64), unique=True, index=True, nullable=False)  # SHA256 hash
    
    # Source tracking
    source_type = Column(String(50), nullable=False, index=True)  # 'meeting_transcript', 'document', 'note', 'interaction'
    source_id = Column(Integer, index=True)  # Reference to original record
    chunk_index = Column(Integer, default=0)  # For multi-chunk documents
    
    # Text content
    raw_text = Column(Text, nullable=False)
    processed_text = Column(Text)  # Cleaned/normalized version
    title = Column(String(500))  # Optional title/summary
    
    # Vector embeddings (OpenAI ada-002 = 1536 dimensions)
    embedding = Column(Vector(1536), nullable=False)
    
    # Full-text search support
    # Note: We'll handle TSVector in the migration
    
    # Metadata for hybrid search and filtering
    metadata = Column(JSON, default=lambda: {})  # stakeholder_ids, topics, date, etc.
    
    # Content classification
    language = Column(String(5), default="EN")
    content_type = Column(String(50))  # 'transcript', 'insight', 'action', 'quote'
    confidence_score = Column(String)  # Embedding quality score
    
    # Relationships and context
    session_id = Column(Integer, index=True)  # Optional session context
    user_id = Column(Integer, index=True)  # Creator/processor
    
    # Performance tracking
    token_count = Column(Integer)  # For cost tracking
    processing_duration_ms = Column(Integer)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    @classmethod
    def generate_content_hash(cls, text: str) -> str:
        """Generate SHA256 hash for content deduplication"""
        return hashlib.sha256(text.encode('utf-8')).hexdigest()
    
    @classmethod
    def create_from_text(cls, text: str, source_type: str, **kwargs):
        """Factory method to create embedding record"""
        return cls(
            raw_text=text,
            content_hash=cls.generate_content_hash(text),
            source_type=source_type,
            **kwargs
        )


# Indexes for optimal performance
# These will be created in the Alembic migration

# 1. HNSW index for vector similarity search
hnsw_index = Index(
    'embedding_hnsw_idx',
    TextEmbedding.embedding,
    postgresql_using='hnsw',
    postgresql_with={'m': 16, 'ef_construction': 64},
    postgresql_ops={'embedding': 'vector_cosine_ops'}
)

# 2. Composite index for source filtering
source_index = Index(
    'text_embeddings_source_idx',
    TextEmbedding.source_type,
    TextEmbedding.source_id,
    TextEmbedding.chunk_index
)

# 3. Metadata GIN index for JSON queries
metadata_index = Index(
    'text_embeddings_metadata_idx',
    TextEmbedding.metadata,
    postgresql_using='gin'
)

# 4. Temporal index for time-based queries
temporal_index = Index(
    'text_embeddings_temporal_idx',
    TextEmbedding.created_at,
    TextEmbedding.source_type
)