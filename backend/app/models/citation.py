from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base_class import Base

class Citation(Base):
    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("charter_document.id"), nullable=False)
    
    # Citation positioning
    section_id = Column(String(100), nullable=False)  # principles, priorities
    paragraph_id = Column(String(100))  # For precise positioning
    position_in_text = Column(Integer)  # Character position
    
    # Citation source
    citation_type = Column(String(20), nullable=False)  # quote, insight, session
    quote_id = Column(Integer, ForeignKey("quote.id"))
    insight_id = Column(Integer, ForeignKey("insight.id"))
    session_id = Column(Integer, ForeignKey("sessions.id"))
    
    # Citation metadata
    relevance_score = Column(Float)  # 0-100
    
    # Metadata
    created_by_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    document = relationship("CharterDocument", back_populates="citations")
    quote = relationship("Quote")
    insight = relationship("Insight")
    session = relationship("Session")
    created_by = relationship("User")