from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON, Boolean, Float, BigInteger
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base_class import Base

class ProcessedFile(Base):
    __tablename__ = "processed_file"
    
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("session.id"))
    
    # File information
    original_filename = Column(String(300), nullable=False)
    file_type = Column(String(50), nullable=False)  # text, audio, pdf, doc, video
    file_size_bytes = Column(BigInteger)
    
    # S3 storage
    s3_key = Column(String(500), nullable=False)
    s3_bucket = Column(String(100), default="ysi-catalyst-storage")
    s3_etag = Column(String(100))  # For integrity checking
    
    # Processing status
    processing_status = Column(String(50), default="pending")  # pending, processing, completed, failed, queued
    processing_progress = Column(Integer, default=0)  # 0-100
    
    # Processing results
    extracted_content = Column(Text)
    speakers_identified = Column(JSON, default=lambda: [])
    confidence_overall = Column(Float)  # 0-100
    low_confidence_segments = Column(JSON, default=lambda: [])
    
    # Processing metadata
    processing_error = Column(Text)
    processing_started_at = Column(DateTime(timezone=True))
    processing_completed_at = Column(DateTime(timezone=True))
    
    # User tracking
    created_by_id = Column(Integer, ForeignKey("user.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    session = relationship("Session", back_populates="processed_files")
    created_by = relationship("User")
    
    def get_presigned_url(self, expires_in: int = 3600) -> str:
        """Get temporary access URL"""
        from app.utils.aws.s3_enhanced import s3_service
        return s3_service.generate_temporary_access_url(self.s3_key, expires_in)
    
    def get_file_metadata(self) -> dict:
        """Get current file metadata from S3"""
        from app.utils.aws.s3_enhanced import s3_service
        return s3_service.get_file_metadata(self.s3_key)