"""
MinIO Storage Service for YSI Backend

This service provides file storage functionality using MinIO (S3-compatible)
as a replacement for AWS S3, allowing for local development and deployment.
"""

import os
import logging
from typing import Optional, Dict, Any, BinaryIO
from datetime import datetime, timedelta
from urllib.parse import urlparse

from minio import Minio
from minio.error import S3Error
from app.core.config import settings

logger = logging.getLogger(__name__)


class MinIOStorageService:
    """
    MinIO storage service for file operations
    
    Provides S3-compatible API for file storage, upload, download,
    and presigned URL generation using MinIO.
    """
    
    def __init__(self):
        """Initialize MinIO client"""
        self.client = Minio(
            f"{settings.MINIO_HOST}:{settings.MINIO_PORT}",
            access_key=settings.MINIO_USER,
            secret_key=settings.MINIO_PASSWORD,
            secure=settings.MINIO_SECURE
        )
        self.bucket_name = settings.MINIO_BUCKET
        self._ensure_bucket_exists()
    
    def _ensure_bucket_exists(self):
        """Ensure the bucket exists, create if it doesn't"""
        try:
            if not self.client.bucket_exists(self.bucket_name):
                self.client.make_bucket(self.bucket_name)
                logger.info(f"Created bucket: {self.bucket_name}")
        except S3Error as e:
            logger.error(f"Error creating bucket {self.bucket_name}: {e}")
            raise
    
    def upload_file(self, file_path: str, object_name: str, 
                   content_type: Optional[str] = None) -> str:
        """
        Upload a file to MinIO
        
        Args:
            file_path: Local file path to upload
            object_name: Name for the object in MinIO
            content_type: MIME type of the file
            
        Returns:
            URL of the uploaded object
        """
        try:
            self.client.fput_object(
                self.bucket_name,
                object_name,
                file_path,
                content_type=content_type
            )
            
            # Return the object URL
            return f"http://{settings.MINIO_HOST}:{settings.MINIO_PORT}/{self.bucket_name}/{object_name}"
            
        except S3Error as e:
            logger.error(f"Error uploading file {file_path}: {e}")
            raise
    
    def upload_fileobj(self, file_obj: BinaryIO, object_name: str,
                      content_type: Optional[str] = None,
                      size: Optional[int] = None) -> str:
        """
        Upload a file object to MinIO
        
        Args:
            file_obj: File-like object to upload
            object_name: Name for the object in MinIO
            content_type: MIME type of the file
            size: Size of the file object
            
        Returns:
            URL of the uploaded object
        """
        try:
            self.client.put_object(
                self.bucket_name,
                object_name,
                file_obj,
                length=size,
                content_type=content_type
            )
            
            return f"http://{settings.MINIO_HOST}:{settings.MINIO_PORT}/{self.bucket_name}/{object_name}"
            
        except S3Error as e:
            logger.error(f"Error uploading file object: {e}")
            raise
    
    def download_file(self, object_name: str, file_path: str):
        """
        Download a file from MinIO
        
        Args:
            object_name: Name of the object in MinIO
            file_path: Local path to save the file
        """
        try:
            self.client.fget_object(self.bucket_name, object_name, file_path)
        except S3Error as e:
            logger.error(f"Error downloading file {object_name}: {e}")
            raise
    
    def get_presigned_url(self, object_name: str, expires: int = 3600) -> str:
        """
        Generate a presigned URL for an object
        
        Args:
            object_name: Name of the object in MinIO
            expires: Expiration time in seconds (default: 1 hour)
            
        Returns:
            Presigned URL
        """
        try:
            from datetime import timedelta
            
            url = self.client.presigned_get_object(
                self.bucket_name,
                object_name,
                expires=timedelta(seconds=expires)
            )
            return url
            
        except S3Error as e:
            logger.error(f"Error generating presigned URL for {object_name}: {e}")
            raise
    
    def delete_object(self, object_name: str) -> bool:
        """
        Delete an object from MinIO
        
        Args:
            object_name: Name of the object to delete
            
        Returns:
            True if successful, False otherwise
        """
        try:
            self.client.remove_object(self.bucket_name, object_name)
            return True
        except S3Error as e:
            logger.error(f"Error deleting object {object_name}: {e}")
            return False
    
    def get_object_info(self, object_name: str) -> Optional[Dict[str, Any]]:
        """
        Get information about an object
        
        Args:
            object_name: Name of the object
            
        Returns:
            Dictionary with object information or None if not found
        """
        try:
            stat = self.client.stat_object(self.bucket_name, object_name)
            return {
                'size': stat.size,
                'etag': stat.etag,
                'last_modified': stat.last_modified,
                'content_type': stat.content_type
            }
        except S3Error as e:
            logger.error(f"Error getting object info for {object_name}: {e}")
            return None
    
    def list_objects(self, prefix: str = "", recursive: bool = True) -> list:
        """
        List objects in the bucket
        
        Args:
            prefix: Prefix to filter objects
            recursive: Whether to list recursively
            
        Returns:
            List of object names
        """
        try:
            objects = self.client.list_objects(
                self.bucket_name,
                prefix=prefix,
                recursive=recursive
            )
            return [obj.object_name for obj in objects]
        except S3Error as e:
            logger.error(f"Error listing objects: {e}")
            return []
    
    def health_check(self) -> Dict[str, Any]:
        """
        Check MinIO service health
        
        Returns:
            Dictionary with health status
        """
        try:
            # Try to list buckets to check connectivity
            buckets = self.client.list_buckets()
            return {
                'status': 'healthy',
                'bucket_count': len(buckets),
                'bucket_name': self.bucket_name,
                'timestamp': datetime.utcnow().isoformat()
            }
        except Exception as e:
            return {
                'status': 'unhealthy',
                'error': str(e),
                'timestamp': datetime.utcnow().isoformat()
            }


# Global instance
minio_service = MinIOStorageService()
