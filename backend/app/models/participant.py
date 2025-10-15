from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean, JSON, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base_class import Base

class Participant(Base):
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("sessions.id"))
    
    # Participant info
    name = Column(String(255), nullable=False)
    email = Column(String(255))
    organization_id = Column(Integer, ForeignKey("organizations.id"))
    role = Column(String(255))  # guest, shaper, observer, etc
    
    # Bio and context
    bio = Column(Text)
    expertise = Column(String(255))
    region = Column(String(255))
    
    # Consent and preferences
    consent_given = Column(Boolean, default=False)
    can_be_quoted = Column(Boolean, default=True)
    preferred_language = Column(String(255), default="en")
    
    # CRM Enhancement fields
    stakeholder_type = Column(String(20), default="individual")  # individual, organization
    pipeline_status = Column(String(20), default="prospect")  # prospect, engaged, committed, inactive
    engagement_score = Column(Float, default=0.0)  # 0-100
    
    # Extended contact info
    phone = Column(String(50))
    position = Column(String(200))
    website = Column(String(500))
    linkedin_url = Column(String(500))
    avatar_s3_key = Column(String(500))
    
    # CRM metadata
    tags = Column(JSON, default=lambda: [])
    pillars_involved = Column(JSON, default=lambda: [])  # ['capital', 'recognition', 'wellbeing']
    notes = Column(Text)
    owner_id = Column(Integer, ForeignKey("users.id"))  # Account owner
    
    # Interaction tracking
    last_interaction_date = Column(DateTime(timezone=True))
    interaction_count = Column(Integer, default=0)
    
    # Preferences
    time_zone = Column(String(50))
    communication_preferences = Column(JSON, default=lambda: {})
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    session = relationship("Session", back_populates="participants")
    organization = relationship("Organization")
    owner = relationship("User", foreign_keys=[owner_id])
    
    # CRM relationships
    interactions = relationship("Interaction", back_populates="stakeholder")
    next_steps = relationship("NextStep", back_populates="stakeholder")