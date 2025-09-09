from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Float, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base_class import Base

class Insight(Base):
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("session.id"))
    
    # Content
    title = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    evidence = Column(JSON)  # quotes, timestamps, sources
    
    # Categorization
    pillar = Column(String)  # capital_access, recognition, wellbeing
    theme_id = Column(Integer, ForeignKey("theme.id"))
    region = Column(String)
    sector = Column(String)
    
    # Scoring
    novelty_score = Column(Float)
    impact_score = Column(Float)
    feasibility_score = Column(Float)
    equity_score = Column(Float)
    evidence_strength = Column(Float)
    
    # Enhanced tracking
    quotes_linked = Column(JSON, default=lambda: [])  # Array of quote IDs
    participants_involved = Column(JSON, default=lambda: [])  # Array of participant names
    related_sessions = Column(JSON, default=lambda: [])  # Array of session IDs
    confidence_breakdown = Column(JSON, default=lambda: {})  # Per-score confidence
    evidence_diversity = Column(JSON, default=lambda: {})  # Diversity metrics
    theme_confidence = Column(Float)  # Confidence in theme classification
    
    # Metadata
    created_by_id = Column(Integer, ForeignKey("user.id"))
    last_updated_by = Column(Integer, ForeignKey("user.id"))
    insight_type = Column(String)  # key_finding, tension, signal, recommendation
    tags = Column(JSON, default=lambda: [])
    version = Column(Integer, default=1)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    session = relationship("Session", back_populates="insights")
    theme = relationship("Theme")
    created_by = relationship("User", foreign_keys=[created_by_id])
    last_updated_by_user = relationship("User", foreign_keys=[last_updated_by])
    
    # New relationships
    citations = relationship("Citation", back_populates="insight")