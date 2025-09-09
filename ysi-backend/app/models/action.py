from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean, JSON, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base_class import Base

class Action(Base):
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("session.id"))
    
    # Action details
    title = Column(String, nullable=False)
    description = Column(Text)
    priority = Column(String, default="medium")  # low, medium, high, critical
    
    # Assignment
    owner_id = Column(Integer, ForeignKey("user.id"))
    due_date = Column(DateTime(timezone=True))
    
    # Status tracking
    status = Column(String, default="pending")  # pending, in_progress, completed, blocked
    is_completed = Column(Boolean, default=False)
    completed_at = Column(DateTime(timezone=True))
    
    # Enhanced connections
    interaction_id = Column(Integer, ForeignKey("interaction.id"))
    insight_id = Column(Integer, ForeignKey("insight.id"))  # Source insight
    stakeholder_id = Column(Integer, ForeignKey("participant.id"))
    
    # Enhanced action details
    action_type = Column(String(50), default="follow_up")  # follow_up, research, outreach, documentation, meeting, review
    estimated_hours = Column(Float)
    actual_hours = Column(Float)
    dependencies = Column(JSON, default=lambda: [])  # Array of dependent action IDs
    tags = Column(JSON, default=lambda: [])
    completion_notes = Column(Text)
    
    # Metadata
    created_by_id = Column(Integer, ForeignKey("user.id"))
    category = Column(String)  # follow_up, research, outreach, documentation
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    session = relationship("Session", back_populates="actions")
    owner = relationship("User", foreign_keys=[owner_id])
    created_by = relationship("User", foreign_keys=[created_by_id])
    
    # Enhanced relationships
    interaction = relationship("Interaction")
    insight = relationship("Insight")
    stakeholder = relationship("Participant")