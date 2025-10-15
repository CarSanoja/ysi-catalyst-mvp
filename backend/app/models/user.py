from sqlalchemy import Column, Integer, String, Boolean, DateTime, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base_class import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255))
    role = Column(String(50), default="shaper")  # shaper, admin, viewer
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    
    # Enhanced user profile
    avatar_s3_key = Column(String(500))
    time_zone = Column(String(50), default="UTC")
    language_preference = Column(String(5), default="EN")
    
    # User preferences and configuration
    notification_preferences = Column(JSON, default=lambda: {})
    dashboard_config = Column(JSON, default=lambda: {})  # Custom dashboard settings
    
    # Activity tracking
    last_active = Column(DateTime(timezone=True), default=func.now())
    session_count = Column(Integer, default=0)
    insights_created = Column(Integer, default=0)
    documents_edited = Column(Integer, default=0)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    text_processing_jobs = relationship("TextProcessingJob", back_populates="created_by")
    