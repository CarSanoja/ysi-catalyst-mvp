from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base_class import Base

class ActivityLog(Base):
    __tablename__ = "activity_log"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # User and session context
    user_id = Column(Integer, ForeignKey("users.id"))
    session_id = Column(Integer, ForeignKey("sessions.id"))  # NULL for non-session activities
    
    # Action details
    action_type = Column(String(100), nullable=False)
    entity_type = Column(String(50))  # session, insight, quote, stakeholder, document
    entity_id = Column(Integer)
    
    # Action metadata
    details = Column(JSON, default=lambda: {})  # Action-specific metadata
    
    # Request tracking
    request_id = Column(String(100))  # For request tracing
    duration_ms = Column(Integer)  # Action duration
    
    # Network information
    ip_address = Column(String(45))  # IPv6 max length
    user_agent = Column(Text)
    
    # Status
    success = Column(Boolean, default=True)
    error_message = Column(Text)
    
    # Timestamp
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User")
    session = relationship("Session")