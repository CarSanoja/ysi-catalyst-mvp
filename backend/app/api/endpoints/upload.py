from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, File, UploadFile, Form
from sqlalchemy.orm import Session
from datetime import datetime
import uuid
import os
from app.db.session import get_db
from app.schemas.response import success_response, error_response
from app.models import ProcessedFile, User
import mimetypes

router = APIRouter()

# Allowed file types
ALLOWED_DOCUMENT_TYPES = {
    'application/pdf': '.pdf',
    'application/msword': '.doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
    'text/plain': '.txt',
    'text/csv': '.csv',
    'application/vnd.ms-excel': '.xls',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx'
}

ALLOWED_IMAGE_TYPES = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/gif': '.gif',
    'image/webp': '.webp'
}

@router.post("/document")
async def upload_document(
    file: UploadFile = File(...),
    title: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    uploader: Optional[str] = Form(None),
    db: Session = Depends(get_db)
):
    """
    Upload document files to MinIO storage and create ProcessedFile record
    """
    try:
        # Validate file type
        if file.content_type not in ALLOWED_DOCUMENT_TYPES:
            return error_response(
                f"File type not allowed. Allowed types: {list(ALLOWED_DOCUMENT_TYPES.keys())}"
            )

        # Read file content
        content = await file.read()
        file_size = len(content)

        # Generate unique filename
        file_extension = ALLOWED_DOCUMENT_TYPES[file.content_type]
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        minio_key = f"documents/{datetime.now().strftime('%Y/%m')}/{unique_filename}"

        # For demo purposes, we'll simulate MinIO upload
        # In production, this would upload to MinIO storage
        # minio_client.put_object("ysi-documents", minio_key, io.BytesIO(content), file_size)

        # Create ProcessedFile record
        processed_file = ProcessedFile(
            original_filename=title or file.filename,
            file_type=file.content_type,
            file_size_bytes=file_size,
            minio_key=minio_key,
            processing_status="uploaded",
            extracted_content=description or f"Document uploaded: {file.filename}",
            confidence_overall=85.0  # Default confidence for uploaded files
        )

        # Find uploader user if provided
        if uploader:
            # For demo, we'll create a simple uploader reference
            # In production, this would be the authenticated user
            processed_file.extracted_content += f" | Uploaded by: {uploader}"

        db.add(processed_file)
        db.commit()
        db.refresh(processed_file)

        # Format response
        upload_response = {
            "id": processed_file.id,
            "original_filename": processed_file.original_filename,
            "file_type": processed_file.file_type,
            "file_size_bytes": processed_file.file_size_bytes,
            "minio_key": processed_file.minio_key,
            "processing_status": processed_file.processing_status,
            "upload_url": f"/api/v1/documents/{processed_file.id}",  # URL to access the document
            "created_at": processed_file.created_at.isoformat()
        }

        return success_response(
            data=upload_response,
            message=f"Document '{file.filename}' uploaded successfully"
        )

    except Exception as e:
        db.rollback()
        return error_response(f"Error uploading document: {str(e)}")

@router.post("/photo")
async def upload_photo(
    file: UploadFile = File(...),
    title: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    user_id: Optional[int] = Form(None),
    db: Session = Depends(get_db)
):
    """
    Upload profile photos to MinIO storage
    """
    try:
        # Validate file type
        if file.content_type not in ALLOWED_IMAGE_TYPES:
            return error_response(
                f"Image type not allowed. Allowed types: {list(ALLOWED_IMAGE_TYPES.keys())}"
            )

        # Read file content
        content = await file.read()
        file_size = len(content)

        # Validate file size (max 5MB)
        max_size = 5 * 1024 * 1024  # 5MB
        if file_size > max_size:
            return error_response("File size too large. Maximum allowed size is 5MB")

        # Generate unique filename
        file_extension = ALLOWED_IMAGE_TYPES[file.content_type]
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        minio_key = f"photos/{datetime.now().strftime('%Y/%m')}/{unique_filename}"

        # For demo purposes, we'll simulate MinIO upload
        # In production, this would upload to MinIO storage
        # minio_client.put_object("ysi-photos", minio_key, io.BytesIO(content), file_size)

        # Create a simple response for photo upload
        # In production, this might update a User or Participant record
        photo_response = {
            "id": str(uuid.uuid4()),
            "original_filename": file.filename,
            "title": title or file.filename,
            "description": description,
            "file_type": file.content_type,
            "file_size_bytes": file_size,
            "minio_key": minio_key,
            "photo_url": f"/api/v1/files/photos/{minio_key}",  # URL to access the photo
            "thumbnail_url": f"/api/v1/files/photos/thumbnails/{minio_key}",  # Thumbnail URL
            "uploaded_at": datetime.now().isoformat()
        }

        # If user_id provided, we could update the user's photo reference
        if user_id:
            photo_response["user_id"] = user_id
            # In production: Update user.photo field with minio_key

        return success_response(
            data=photo_response,
            message=f"Photo '{file.filename}' uploaded successfully"
        )

    except Exception as e:
        return error_response(f"Error uploading photo: {str(e)}")

@router.get("/status/{file_id}")
def get_upload_status(file_id: int, db: Session = Depends(get_db)):
    """
    Get upload and processing status of a file
    """
    try:
        processed_file = db.query(ProcessedFile).filter(ProcessedFile.id == file_id).first()

        if not processed_file:
            return error_response("File not found")

        status_response = {
            "id": processed_file.id,
            "original_filename": processed_file.original_filename,
            "processing_status": processed_file.processing_status,
            "file_size_bytes": processed_file.file_size_bytes,
            "confidence_overall": processed_file.confidence_overall,
            "processing_completed_at": processed_file.processing_completed_at.isoformat() if processed_file.processing_completed_at else None,
            "created_at": processed_file.created_at.isoformat()
        }

        return success_response(
            data=status_response,
            message="File status retrieved successfully"
        )

    except Exception as e:
        return error_response(f"Error retrieving file status: {str(e)}")