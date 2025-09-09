from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base_class import Base

class Interaction(Base):
    id = Column(Integer, primary_key=True, index=True)
    stakeholder_id = Column(Integer, ForeignKey("participant.id"), nullable=False)
    
    # Interaction details
    interaction_type = Column(String(50), nullable=False)  # meeting, email, session, call, document
    title = Column(String(200), nullable=False)
    summary = Column(Text)
    interaction_date = Column(DateTime(timezone=True), nullable=False)
    duration_minutes = Column(Integer)
    
    # Evidence and participants
    evidence_links = Column(JSON, default=lambda: [])  # Array of evidence IDs/URLs
    participants_involved = Column(JSON, default=lambda: [])  # Array of participant names/IDs
    
    # Privacy and consent
    consent_level = Column(String(20), default="public")  # public, chatham-house, private
    
    # Metadata
    created_by_id = Column(Integer, ForeignKey("user.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    stakeholder = relationship("Participant", back_populates="interactions")
    created_by = relationship("User")
    next_steps = relationship("NextStep", back_populates="interaction")