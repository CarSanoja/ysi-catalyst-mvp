from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, JSON, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base_class import Base

class CaptureLane(Base):
    __tablename__ = "capturelane"
    
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("sessions.id"), nullable=False)
    
    # Lane configuration
    lane_type = Column(String(20), nullable=False)  # shaper, ai
    lane_identifier = Column(String(50), nullable=False)  # shaper-1, ai-lane
    lane_name = Column(String(100))  # Sarah Chen, AI Insights
    lane_color = Column(String(50))  # blue, gradient
    
    # Lane data
    entries = Column(JSON, default=lambda: [])  # Array of capture entries
    recording_state = Column(String(20), default="active")  # active, paused, completed
    
    # Configuration
    user_id = Column(Integer, ForeignKey("users.id"))  # Assigned user for shaper lanes
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    session = relationship("Session", back_populates="capture_lanes")
    user = relationship("User")
    quotes = relationship("Quote", back_populates="lane")