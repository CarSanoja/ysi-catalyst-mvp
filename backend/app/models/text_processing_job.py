from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON, Boolean, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base_class import Base
from app.enums import ProcessingStatus


class TextProcessingJob(Base):
    __tablename__ = "text_processing_jobs"

    id = Column(Integer, primary_key=True, index=True)

    # Input data
    input_text = Column(Text, nullable=False)
    context = Column(Text, nullable=True)

    # Processing status
    status = Column(Enum(ProcessingStatus, values_callable=lambda x: [e.value for e in x]), default=ProcessingStatus.RECEIVED, index=True)

    # Processing results
    result = Column(JSON, nullable=True)  # Stores the extracted insights as JSON
    error_message = Column(Text, nullable=True)

    # Processing metadata
    started_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    cancelled_at = Column(DateTime(timezone=True), nullable=True)

    # User tracking
    created_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # Can be anonymous
    session_id = Column(String(100), nullable=True)  # For anonymous users

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    created_by = relationship("User", back_populates="text_processing_jobs")

    def __repr__(self):
        return f"<TextProcessingJob(id={self.id}, status={self.status.value})>"

    def to_dict(self):
        """Convert to dictionary for API responses"""
        return {
            "id": self.id,
            "input_text": self.input_text,
            "context": self.context,
            "status": self.status.value,
            "result": self.result,
            "error_message": self.error_message,
            "started_at": self.started_at.isoformat() if self.started_at else None,
            "completed_at": self.completed_at.isoformat() if self.completed_at else None,
            "cancelled_at": self.cancelled_at.isoformat() if self.cancelled_at else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }