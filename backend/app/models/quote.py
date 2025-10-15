from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Float, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base_class import Base

class Quote(Base):
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("sessions.id"), nullable=False)
    
    # Quote content
    content = Column(Text, nullable=False)
    speaker = Column(String(200))
    timestamp = Column(String(20))  # "14:23:45"
    
    # Categorization
    pillar = Column(String(50))  # capital, recognition, wellbeing
    theme_id = Column(Integer, ForeignKey("theme.id"))
    
    # Status and metadata
    consent_status = Column(String(20), default="public")  # public, chatham-house, private
    highlighted = Column(Boolean, default=False)
    has_tension = Column(Boolean, default=False)
    confidence_score = Column(Float)  # 0-100
    
    # Source information
    language = Column(String(5), default="EN")
    source_type = Column(String(20), default="live")  # live, manual, ai
    lane_id = Column(Integer, ForeignKey("capturelane.id"))
    
    # Metadata
    created_by_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    session = relationship("Session", back_populates="quotes")
    theme = relationship("Theme")
    created_by = relationship("User")
    lane = relationship("CaptureLane")