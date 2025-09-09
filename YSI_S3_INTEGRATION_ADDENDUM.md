# YSI Catalyst: S3 Integration Addendum

**Document Version**: 1.1  
**Date**: 2025-09-09  
**Addendum to**: Frontend to Database Analysis  

## Existing S3 Implementation Analysis

### Current S3 Service (`/ysi-backend/app/utils/aws/s3.py`)

The YSI backend already contains a robust S3 service implementation with the following capabilities:

#### Existing Features
```python
class AWS_S3_Service:
    - Automatic production/development environment detection
    - Multipart upload configuration (150MB threshold, 10MB chunks)
    - File upload/download methods
    - Presigned URL generation  
    - S3 URL parsing capabilities
    - CloudFront signed URL generation with RSA keys
```

#### Current Configuration
```python
transfer_config = TransferConfig(
    multipart_threshold=150 * 1024 * 1024,  # 150MB
    multipart_chunksize=10 * 1024 * 1024    # 10MB chunks
)
```

### Integration Requirements for YSI Catalyst

#### 1. Framework Migration (Django → FastAPI)

The existing implementation uses Django settings. We need to adapt it for FastAPI:

```python
# Current (Django-based)
from django.conf import settings

# Required (FastAPI-based)
from app.core.config import settings

# Updated initialization
def __init__(self):
    if settings.ENVIRONMENT == "production":
        self.client = boto3.client('s3')
    else:
        self.client = boto3.client(
            's3',
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            region_name=settings.AWS_REGION
        )
```

#### 2. Enhanced S3 Service for YSI Catalyst

```python
# app/utils/aws/s3_enhanced.py
import boto3
import logging
import mimetypes
import uuid
from datetime import datetime, timedelta
from typing import Optional, Dict, List
from app.core.config import settings
from app.utils.aws.s3 import AWS_S3_Service  # Inherit existing functionality

class YSICatalystS3Service(AWS_S3_Service):
    """Enhanced S3 service for YSI Catalyst platform"""
    
    def __init__(self):
        super().__init__()
        self.bucket_name = settings.S3_BUCKET_NAME or "ysi-catalyst-storage"
        
    # Session-specific file operations
    def upload_session_file(self, 
                           file_obj, 
                           session_id: str, 
                           filename: str,
                           file_type: str = "audio") -> Dict:
        """Upload session-related files with organized structure"""
        
        # Generate unique filename to prevent conflicts
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        unique_filename = f"{timestamp}_{filename}"
        
        # Organize by file type and session
        s3_key = f"{file_type}-files/sessions/{session_id}/original/{unique_filename}"
        
        # Detect MIME type
        mime_type = mimetypes.guess_type(filename)[0] or 'application/octet-stream'
        
        try:
            # Upload with metadata
            uploaded_url = self.upload_fileobj(
                file_obj, 
                self.bucket_name, 
                s3_key,
                mimetype=mime_type
            )
            
            # Log upload activity
            logger.info(
                "SESSION_FILE_UPLOADED",
                extra={
                    "session_id": session_id,
                    "s3_key": s3_key,
                    "file_type": file_type,
                    "mime_type": mime_type,
                    "uploaded_url": uploaded_url
                }
            )
            
            return {
                "success": True,
                "s3_key": s3_key,
                "uploaded_url": uploaded_url,
                "mime_type": mime_type,
                "bucket": self.bucket_name
            }
            
        except Exception as e:
            logger.error(f"Failed to upload session file: {str(e)}")
            return {"success": False, "error": str(e)}
    
    def upload_user_avatar(self, file_obj, user_id: int, filename: str) -> Dict:
        """Upload user avatar with automatic resizing"""
        
        s3_key = f"media/avatars/users/{user_id}/profile.jpg"
        
        try:
            uploaded_url = self.upload_fileobj(
                file_obj,
                self.bucket_name,
                s3_key,
                mimetype="image/jpeg"
            )
            
            return {
                "success": True,
                "s3_key": s3_key,
                "uploaded_url": uploaded_url
            }
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def upload_document_export(self, 
                             file_obj,
                             document_id: str,
                             export_type: str,
                             format: str = "pdf") -> Dict:
        """Upload generated document exports"""
        
        date_path = datetime.now().strftime("%Y/%m/%d")
        s3_key = f"documents/exports/{export_type}/{date_path}/{document_id}.{format}"
        
        mime_types = {
            "pdf": "application/pdf",
            "docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation"
        }
        
        try:
            uploaded_url = self.upload_fileobj(
                file_obj,
                self.bucket_name,
                s3_key,
                mimetype=mime_types.get(format, "application/octet-stream")
            )
            
            return {
                "success": True,
                "s3_key": s3_key,
                "uploaded_url": uploaded_url,
                "export_type": export_type,
                "format": format
            }
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def create_processing_workspace(self, session_id: str) -> Dict:
        """Create organized workspace for session processing"""
        
        workspace_structure = {
            "original": f"audio-files/sessions/{session_id}/original/",
            "processed": f"audio-files/sessions/{session_id}/processed/",
            "clips": f"audio-files/sessions/{session_id}/clips/",
            "transcripts": f"audio-files/sessions/{session_id}/transcripts/"
        }
        
        return workspace_structure
    
    def store_processing_result(self,
                              session_id: str,
                              result_type: str,
                              content: str,
                              filename: str = None) -> Dict:
        """Store AI processing results"""
        
        if not filename:
            filename = f"{result_type}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        
        s3_key = f"audio-files/sessions/{session_id}/processed/{filename}"
        
        try:
            # Convert string content to file-like object
            from io import BytesIO
            content_bytes = content.encode('utf-8')
            file_obj = BytesIO(content_bytes)
            
            uploaded_url = self.upload_fileobj(
                file_obj,
                self.bucket_name,
                s3_key,
                mimetype="application/json"
            )
            
            return {
                "success": True,
                "s3_key": s3_key,
                "uploaded_url": uploaded_url,
                "result_type": result_type
            }
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def get_file_metadata(self, s3_key: str) -> Optional[Dict]:
        """Get detailed file metadata"""
        try:
            response = self.client.head_object(Bucket=self.bucket_name, Key=s3_key)
            return {
                "size_bytes": response.get('ContentLength'),
                "last_modified": response.get('LastModified'),
                "content_type": response.get('ContentType'),
                "etag": response.get('ETag'),
                "metadata": response.get('Metadata', {})
            }
        except Exception as e:
            logger.error(f"Failed to get file metadata for {s3_key}: {str(e)}")
            return None
    
    def generate_temporary_access_url(self, s3_key: str, expires_in: int = 3600) -> Optional[str]:
        """Generate temporary access URL with logging"""
        try:
            url = self.generate_presigned_url(
                f"https://{self.bucket_name}.s3.amazonaws.com/{s3_key}",
                expires_in=expires_in
            )
            
            # Log URL generation for security audit
            logger.info(
                "TEMP_URL_GENERATED",
                extra={
                    "s3_key": s3_key,
                    "expires_in": expires_in,
                    "timestamp": datetime.now().isoformat()
                }
            )
            
            return url
        except Exception as e:
            logger.error(f"Failed to generate temporary URL: {str(e)}")
            return None
    
    def cleanup_old_files(self, days_old: int = 90) -> Dict:
        """Clean up files older than specified days"""
        try:
            cutoff_date = datetime.now() - timedelta(days=days_old)
            
            # List objects to delete
            response = self.client.list_objects_v2(
                Bucket=self.bucket_name,
                Prefix="temp/"  # Only cleanup temp files
            )
            
            objects_to_delete = []
            if 'Contents' in response:
                for obj in response['Contents']:
                    if obj['LastModified'].replace(tzinfo=None) < cutoff_date:
                        objects_to_delete.append({'Key': obj['Key']})
            
            if objects_to_delete:
                delete_response = self.client.delete_objects(
                    Bucket=self.bucket_name,
                    Delete={'Objects': objects_to_delete}
                )
                
                deleted_count = len(delete_response.get('Deleted', []))
                logger.info(f"Cleaned up {deleted_count} old files")
                
                return {"success": True, "deleted_count": deleted_count}
            else:
                return {"success": True, "deleted_count": 0}
                
        except Exception as e:
            logger.error(f"Failed to cleanup old files: {str(e)}")
            return {"success": False, "error": str(e)}

# Singleton instance
s3_service = YSICatalystS3Service()
```

#### 3. Configuration Updates for FastAPI

```python
# app/core/config.py additions
class Settings(BaseSettings):
    # ... existing settings ...
    
    # S3 Configuration  
    S3_BUCKET_NAME: str = "ysi-catalyst-storage"
    AWS_ACCESS_KEY_ID: str = ""
    AWS_SECRET_ACCESS_KEY: str = ""
    AWS_REGION: str = "us-east-1"
    
    # CloudFront Configuration (for signed URLs)
    CLOUDFRONT_DOMAIN: str = ""
    CLOUDFRONT_KEY_PAIR_ID: str = ""
    CLOUDFRONT_PRIVATE_KEY_PATH: str = ""
    
    # File Processing Configuration
    MAX_FILE_SIZE_MB: int = 500
    ALLOWED_AUDIO_FORMATS: List[str] = [".wav", ".mp3", ".m4a", ".flac"]
    ALLOWED_DOCUMENT_FORMATS: List[str] = [".pdf", ".docx", ".txt", ".md"]
    ALLOWED_IMAGE_FORMATS: List[str] = [".jpg", ".jpeg", ".png", ".gif", ".webp"]
```

#### 4. File Processing Integration

```python
# app/services/file_processing.py
from app.utils.aws.s3_enhanced import s3_service
from app.models.processed_files import ProcessedFile

class FileProcessingService:
    
    async def process_uploaded_file(self, 
                                  file_obj, 
                                  session_id: str,
                                  filename: str,
                                  file_type: str) -> ProcessedFile:
        """Process uploaded file with S3 integration"""
        
        # 1. Upload to S3
        upload_result = s3_service.upload_session_file(
            file_obj, session_id, filename, file_type
        )
        
        if not upload_result["success"]:
            raise Exception(f"Failed to upload file: {upload_result['error']}")
        
        # 2. Create database record
        processed_file = ProcessedFile(
            session_id=session_id,
            original_filename=filename,
            file_type=file_type,
            s3_key=upload_result["s3_key"],
            s3_bucket=upload_result["bucket"],
            processing_status="queued"
        )
        
        # 3. Queue for processing (if audio file)
        if file_type == "audio":
            await self.queue_audio_processing(processed_file)
        
        return processed_file
    
    async def queue_audio_processing(self, processed_file: ProcessedFile):
        """Queue audio file for AI processing"""
        # Implementation would integrate with background task queue
        pass
```

### Updated Storage Architecture

#### S3 Bucket Structure (Enhanced)
```
ysi-catalyst-storage/
├── audio-files/
│   ├── sessions/
│   │   └── session-{id}/
│   │       ├── original/           # Raw uploaded files
│   │       │   └── {timestamp}_{filename}
│   │       ├── processed/          # AI processing results
│   │       │   ├── transcript.json
│   │       │   ├── speakers.json
│   │       │   └── insights.json
│   │       ├── clips/              # Extracted audio clips for quotes
│   │       │   └── {quote-id}_{timestamp}.wav
│   │       └── transcripts/        # Formatted transcripts
│   │           ├── full_transcript.txt
│   │           └── speakers_separated.json
│   └── manual-uploads/
│       └── {upload-id}/
│           └── {filename}
├── documents/
│   ├── exports/
│   │   ├── executive-summaries/
│   │   │   └── {date}/
│   │   │       ├── {document-id}_EN.pdf
│   │   │       └── {document-id}_ES.pdf
│   │   ├── slide-decks/
│   │   │   └── {date}/
│   │   │       └── {document-id}_slides.pptx
│   │   └── one-pagers/
│   │       └── {date}/
│   │           └── {document-id}_onepager.pdf
│   ├── charters/
│   │   ├── drafts/
│   │   │   └── {document-id}/
│   │   │       └── v{version}/
│   │   │           ├── charter.docx
│   │   │           └── citations.json
│   │   └── published/
│   │       └── youth-social-innovation-charter-final.pdf
│   └── templates/
│       ├── export-templates/
│       │   ├── executive-summary.docx
│       │   ├── slide-deck.pptx
│       │   └── one-pager.docx
│       └── charter-templates/
│           └── charter-base.docx
├── media/
│   ├── avatars/
│   │   ├── users/
│   │   │   └── {user-id}/
│   │   │       ├── profile.jpg
│   │   │       └── thumbnail.jpg  # Auto-generated
│   │   └── stakeholders/
│   │       └── {stakeholder-id}/
│   │           ├── avatar.jpg
│   │           └── thumbnail.jpg
│   ├── session-assets/
│   │   └── {session-id}/
│   │       ├── presentation-materials/
│   │       ├── shared-documents/
│   │       └── screenshots/
│   └── organization-logos/
│       └── {org-id}/
│           ├── logo.png
│           └── logo_thumbnail.png
├── temp/                          # Temporary files (auto-cleanup)
│   ├── uploads/
│   ├── processing/
│   └── exports/
├── backups/
│   ├── database/
│   │   └── {date}/
│   │       ├── full-backup.sql
│   │       └── incremental-{timestamp}.sql
│   ├── files/
│   │   └── {date}/
│   │       └── critical-files-backup.tar.gz
│   └── configurations/
│       └── {date}/
│           └── system-config.json
└── logs/                         # CloudWatch Logs backup
    ├── application/
    │   └── {date}/
    │       └── app-logs-{timestamp}.json
    ├── processing/
    │   └── {date}/
    │       └── processing-logs-{timestamp}.json
    └── security/
        └── {date}/
            └── security-logs-{timestamp}.json
```

### Cost-Optimized S3 Lifecycle Policies

```python
# Enhanced lifecycle configuration
lifecycle_config = {
    "Rules": [
        {
            "ID": "audio-files-intelligent-tiering",
            "Status": "Enabled",
            "Filter": {"Prefix": "audio-files/"},
            "Transitions": [
                {"Days": 7, "StorageClass": "STANDARD_IA"},
                {"Days": 30, "StorageClass": "GLACIER"},
                {"Days": 365, "StorageClass": "DEEP_ARCHIVE"}
            ]
        },
        {
            "ID": "documents-optimize",
            "Status": "Enabled",
            "Filter": {"Prefix": "documents/drafts/"},
            "Transitions": [
                {"Days": 30, "StorageClass": "STANDARD_IA"},
                {"Days": 90, "StorageClass": "GLACIER"}
            ]
        },
        {
            "ID": "temp-files-cleanup",
            "Status": "Enabled",
            "Filter": {"Prefix": "temp/"},
            "Expiration": {"Days": 7}  # Auto-delete temp files after 7 days
        },
        {
            "ID": "logs-retention",
            "Status": "Enabled",
            "Filter": {"Prefix": "logs/"},
            "Transitions": [
                {"Days": 1, "StorageClass": "STANDARD_IA"},
                {"Days": 30, "StorageClass": "GLACIER"}
            ],
            "Expiration": {"Days": 2555}  # 7 years retention
        }
    ]
}
```

### Integration with Existing Models

#### Updated ProcessedFile Model
```python
# app/models/processed_files.py (enhanced)
from sqlalchemy import Column, Integer, String, DateTime, Float, Text, Boolean
from app.db.base_class import Base
from app.utils.aws.s3_enhanced import s3_service

class ProcessedFile(Base):
    id = Column(Integer, primary_key=True, index=True)
    # ... existing columns ...
    
    # S3-specific fields
    s3_key = Column(String(500), nullable=False, index=True)
    s3_bucket = Column(String(100), default="ysi-catalyst-storage")
    s3_etag = Column(String(100))  # For integrity checking
    cloudfront_url = Column(String(600))  # If using CloudFront
    
    # Processing workspace
    workspace_created = Column(Boolean, default=False)
    temp_files_cleanup = Column(Boolean, default=False)
    
    def get_presigned_url(self, expires_in: int = 3600) -> str:
        """Get temporary access URL"""
        return s3_service.generate_temporary_access_url(self.s3_key, expires_in)
    
    def get_file_metadata(self) -> dict:
        """Get current file metadata from S3"""
        return s3_service.get_file_metadata(self.s3_key)
    
    def cleanup_temp_files(self):
        """Mark temp files for cleanup"""
        # Implementation for cleaning up processing artifacts
        self.temp_files_cleanup = True
```

### CloudFront Integration (Optional)

For better performance and security, especially for audio/video files:

```python
# app/utils/aws/cloudfront.py
from app.utils.aws.s3 import generate_canned_policy_signed_url
from app.core.config import settings

class CloudFrontService:
    
    def generate_secure_url(self, s3_key: str, expires_in: int = 3600) -> str:
        """Generate CloudFront signed URL for secure access"""
        
        if not settings.CLOUDFRONT_DOMAIN:
            # Fallback to S3 presigned URL
            return s3_service.generate_temporary_access_url(s3_key, expires_in)
        
        resource_url = f"https://{settings.CLOUDFRONT_DOMAIN}/{s3_key}"
        
        return generate_canned_policy_signed_url(
            resource_url=resource_url,
            private_key_path=settings.CLOUDFRONT_PRIVATE_KEY_PATH,
            key_pair_id=settings.CLOUDFRONT_KEY_PAIR_ID,
            expire_seconds=expires_in
        )

cloudfront_service = CloudFrontService()
```

### Next Steps for Implementation

1. **Migrate existing S3 service** to FastAPI configuration
2. **Implement enhanced S3 service** with YSI-specific methods
3. **Update database models** to include S3 integration fields
4. **Create file processing pipelines** using the enhanced S3 service
5. **Set up lifecycle policies** for cost optimization
6. **Implement CloudFront integration** for better performance (optional)
7. **Create monitoring and alerting** for S3 operations

This addendum ensures that the existing S3 infrastructure is preserved and enhanced rather than replaced, maintaining continuity while adding the comprehensive functionality needed for the YSI Catalyst platform.