from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base_class import Base

class CharterDocument(Base):
    __tablename__ = "charter_document"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text)
    
    # Document structure
    sections = Column(JSON, default=lambda: {})  # Document sections with content
    version = Column(Integer, default=1)
    status = Column(String(50), default="draft")  # draft, review, approved, published
    
    # Collaboration
    created_by_id = Column(Integer, ForeignKey("users.id"))
    current_editor_id = Column(Integer, ForeignKey("users.id"))
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    created_by = relationship("User", foreign_keys=[created_by_id])
    current_editor = relationship("User", foreign_keys=[current_editor_id])
    citations = relationship("Citation", back_populates="document")