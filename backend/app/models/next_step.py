from sqlalchemy import Column, Integer, String, Text, Date, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base_class import Base

class NextStep(Base):
    __tablename__ = "next_step"
    
    id = Column(Integer, primary_key=True, index=True)
    stakeholder_id = Column(Integer, ForeignKey("participant.id"))
    interaction_id = Column(Integer, ForeignKey("interaction.id"))
    
    # Task details
    title = Column(String(200), nullable=False)
    description = Column(Text)
    due_date = Column(Date)
    
    # Assignment and priority
    owner_id = Column(Integer, ForeignKey("users.id"))
    priority = Column(String(20), default="medium")  # low, medium, high, critical
    
    # Status tracking
    status = Column(String(20), default="pending")  # pending, in-progress, completed, cancelled
    completion_date = Column(DateTime(timezone=True))
    
    # Metadata
    created_by_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    stakeholder = relationship("Participant", back_populates="next_steps")
    interaction = relationship("Interaction", back_populates="next_steps")
    owner = relationship("User", foreign_keys=[owner_id])
    created_by = relationship("User", foreign_keys=[created_by_id])