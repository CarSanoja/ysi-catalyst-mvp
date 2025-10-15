from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base_class import Base

class ChangeLog(Base):
    __tablename__ = "change_logs"

    id = Column(Integer, primary_key=True, index=True)

    # Document reference - can reference different types of documents
    document_type = Column(String(50), nullable=False)  # "session", "text_processing_job", etc.
    document_id = Column(Integer, nullable=False, index=True)

    # Change details
    field_name = Column(String(255), nullable=False)  # "title", "mainTheme", "keyActors", etc.
    old_value = Column(Text)  # JSON string for complex fields like arrays
    new_value = Column(Text)  # JSON string for complex fields like arrays
    change_type = Column(String(50), default="update")  # "update", "create", "delete"

    # Change metadata
    changed_by = Column(String(255), default="system")  # User identifier
    change_reason = Column(Text)  # Optional reason for the change

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    def __repr__(self):
        return f"<ChangeLog(document={self.document_type}:{self.document_id}, field={self.field_name})>"