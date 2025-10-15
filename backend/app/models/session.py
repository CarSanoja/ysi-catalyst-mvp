from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base_class import Base

class Session(Base):
    __tablename__ = "sessions"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    session_type = Column(String(255))  # interview, workshop, panel, etc
    scheduled_at = Column(DateTime(timezone=True))
    duration_minutes = Column(Integer)
    
    # Session settings
    is_chatham_house = Column(Boolean, default=False)
    recording_consent = Column(Boolean, default=False)
    language = Column(String(255), default="en")
    
    # Session data
    agenda = Column(JSON)
    notes = Column(JSON)  # Multi-lane notes structure
    transcript = Column(Text)
    ai_summary = Column(Text)
    
    # Live capture features
    live_captions = Column(Text)
    capture_lanes_config = Column(JSON, default=lambda: {})
    processing_status = Column(String(50), default="pending")  # pending, processing, completed, failed
    recording_started_at = Column(DateTime(timezone=True))
    recording_ended_at = Column(DateTime(timezone=True))
    
    # Export and consent
    export_configs = Column(JSON, default=lambda: {})  # Export preferences
    consent_summary = Column(JSON, default=lambda: {})  # Consent status summary
    
    # Metadata
    facilitator_id = Column(Integer, ForeignKey("users.id"))
    created_by_id = Column(Integer, ForeignKey("users.id"))
    status = Column(String(255), default="scheduled")  # scheduled, in_progress, completed, cancelled
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    facilitator = relationship("User", foreign_keys=[facilitator_id])
    created_by = relationship("User", foreign_keys=[created_by_id])
    participants = relationship("Participant", back_populates="session")
    insights = relationship("Insight", back_populates="session")
    actions = relationship("Action", back_populates="session")
    
    # New relationships
    quotes = relationship("Quote", back_populates="session")
    capture_lanes = relationship("CaptureLane", back_populates="session")
    processed_files = relationship("ProcessedFile", back_populates="session")
    citations = relationship("Citation", back_populates="session")
    