from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON, Boolean, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base_class import Base

class KnowledgeQuery(Base):
    __tablename__ = "knowledge_query"
    
    id = Column(Integer, primary_key=True, index=True)
    query_text = Column(Text, nullable=False)
    query_hash = Column(String(64), unique=True)  # For deduplication
    
    # Query results
    results = Column(JSON, default=lambda: {})  # Summary, confidence, citations
    filters_applied = Column(JSON, default=lambda: {})  # Pillar, region, etc.
    
    # Quality metrics
    confidence_score = Column(Float)  # 0-100
    diversity_score = Column(Float)  # 0-100
    
    # User and privacy
    user_id = Column(Integer, ForeignKey("users.id"))
    is_saved = Column(Boolean, default=False)
    is_public = Column(Boolean, default=False)
    
    # Usage tracking
    query_count = Column(Integer, default=1)  # How many times this query was run
    last_executed = Column(DateTime(timezone=True), default=func.now())
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User")