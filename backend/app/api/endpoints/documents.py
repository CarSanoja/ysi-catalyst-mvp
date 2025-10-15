from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, or_, desc
from datetime import datetime
from app.db.session import get_db
from app.schemas.response import success_response, error_response
from app.schemas.document import DocumentCreate, DocumentUpdate, DocumentResponse
from app.models import ProcessedFile, Session as SessionModel, Participant

router = APIRouter()

@router.get("/")
def get_documents(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    sentiment: Optional[str] = Query(None),
    date_from: Optional[str] = Query(None, alias="dateFrom"),
    date_to: Optional[str] = Query(None, alias="dateTo"),
    uploader: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """
    Get all documents with optional filtering
    Maps to ProcessedFile model + Session notes
    """
    try:
        # Query processed files
        query = db.query(ProcessedFile)

        # Apply filters
        if date_from:
            query = query.filter(ProcessedFile.created_at >= date_from)
        if date_to:
            query = query.filter(ProcessedFile.created_at <= date_to)

        # Get total count
        total = query.count()

        # Get paginated results
        documents = query.order_by(desc(ProcessedFile.created_at)).offset(skip).limit(limit).all()

        # Format response - combine ProcessedFile data with session information
        document_list = []
        for doc in documents:
            # Get related session info if available
            session_info = None
            if doc.session_id:
                session_info = db.query(SessionModel).filter(SessionModel.id == doc.session_id).first()

            # Determine sentiment (placeholder logic - could be enhanced with AI)
            sentiment_score = "neutral"
            if doc.confidence_overall:
                if doc.confidence_overall > 80:
                    sentiment_score = "positive"
                elif doc.confidence_overall < 50:
                    sentiment_score = "negative"

            # Get related shapers from session participants
            related_shapers = []
            if doc.session_id:
                participants = db.query(Participant).filter(
                    Participant.session_id == doc.session_id,
                    Participant.role.ilike('%shaper%')
                ).all()
                related_shapers = [p.name for p in participants]

            # Apply sentiment filter
            if sentiment and sentiment != sentiment_score:
                continue

            # Apply uploader filter
            uploader_name = doc.created_by.full_name if doc.created_by else "Unknown"
            if uploader and uploader.lower() not in uploader_name.lower():
                continue

            document_data = {
                "id": doc.id,
                "title": session_info.title if session_info else doc.original_filename,
                "date": doc.created_at.isoformat() if doc.created_at else None,
                "uploader": uploader_name,
                "main_theme": session_info.session_type if session_info else "document",
                "sentiment": sentiment_score,
                "insights": {
                    "speakers_identified": doc.speakers_identified or [],
                    "confidence_overall": doc.confidence_overall or 0,
                    "low_confidence_segments": doc.low_confidence_segments or [],
                    "processing_status": doc.processing_status
                },
                "related_shapers": related_shapers,
                "file_type": doc.file_type,
                "file_size_bytes": doc.file_size_bytes,
                "processing_status": doc.processing_status,
                "extracted_content": doc.extracted_content[:500] + "..." if doc.extracted_content and len(doc.extracted_content) > 500 else doc.extracted_content,
                "created_at": doc.created_at.isoformat() if doc.created_at else None
            }
            document_list.append(document_data)

        return success_response(
            data=document_list,
            message=f"Retrieved {len(document_list)} documents"
        )

    except Exception as e:
        return error_response(str(e))

@router.get("/search")
def search_documents(
    q: str = Query(..., description="Search query"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db)
):
    """
    Search documents by content, title, or metadata
    """
    try:
        # Search in multiple fields
        query = db.query(ProcessedFile).filter(
            or_(
                ProcessedFile.original_filename.ilike(f"%{q}%"),
                ProcessedFile.extracted_content.ilike(f"%{q}%"),
                ProcessedFile.speakers_identified.ilike(f"%{q}%")
            )
        )

        total = query.count()
        documents = query.order_by(desc(ProcessedFile.created_at)).offset(skip).limit(limit).all()

        # Format results (similar to get_documents)
        document_list = []
        for doc in documents:
            session_info = None
            if doc.session_id:
                session_info = db.query(SessionModel).filter(SessionModel.id == doc.session_id).first()

            sentiment_score = "neutral"
            if doc.confidence_overall:
                if doc.confidence_overall > 80:
                    sentiment_score = "positive"
                elif doc.confidence_overall < 50:
                    sentiment_score = "negative"

            related_shapers = []
            if doc.session_id:
                participants = db.query(Participant).filter(
                    Participant.session_id == doc.session_id,
                    Participant.role.ilike('%shaper%')
                ).all()
                related_shapers = [p.name for p in participants]

            document_data = {
                "id": doc.id,
                "title": session_info.title if session_info else doc.original_filename,
                "date": doc.created_at.isoformat() if doc.created_at else None,
                "uploader": doc.created_by.full_name if doc.created_by else "Unknown",
                "main_theme": session_info.session_type if session_info else "document",
                "sentiment": sentiment_score,
                "insights": {
                    "speakers_identified": doc.speakers_identified or [],
                    "confidence_overall": doc.confidence_overall or 0
                },
                "related_shapers": related_shapers,
                "file_type": doc.file_type,
                "processing_status": doc.processing_status,
                "created_at": doc.created_at.isoformat() if doc.created_at else None
            }
            document_list.append(document_data)

        return success_response(
            data=document_list,
            message=f"Found {len(document_list)} documents matching '{q}'"
        )

    except Exception as e:
        return error_response(str(e))

@router.get("/{document_id}")
def get_document(document_id: int, db: Session = Depends(get_db)):
    """
    Get a specific document by ID
    """
    try:
        doc = db.query(ProcessedFile).filter(ProcessedFile.id == document_id).first()

        if not doc:
            return error_response("Document not found")

        # Get related session info
        session_info = None
        if doc.session_id:
            session_info = db.query(SessionModel).filter(SessionModel.id == doc.session_id).first()

        # Get related shapers
        related_shapers = []
        if doc.session_id:
            participants = db.query(Participant).filter(
                Participant.session_id == doc.session_id,
                Participant.role.ilike('%shaper%')
            ).all()
            related_shapers = [p.name for p in participants]

        # Determine sentiment
        sentiment_score = "neutral"
        if doc.confidence_overall:
            if doc.confidence_overall > 80:
                sentiment_score = "positive"
            elif doc.confidence_overall < 50:
                sentiment_score = "negative"

        document_data = {
            "id": doc.id,
            "title": session_info.title if session_info else doc.original_filename,
            "date": doc.created_at.isoformat() if doc.created_at else None,
            "uploader": doc.created_by.full_name if doc.created_by else "Unknown",
            "main_theme": session_info.session_type if session_info else "document",
            "sentiment": sentiment_score,
            "insights": {
                "speakers_identified": doc.speakers_identified or [],
                "confidence_overall": doc.confidence_overall or 0,
                "low_confidence_segments": doc.low_confidence_segments or [],
                "processing_status": doc.processing_status,
                "extracted_content": doc.extracted_content
            },
            "related_shapers": related_shapers,
            "file_type": doc.file_type,
            "file_size_bytes": doc.file_size_bytes,
            "processing_status": doc.processing_status,
            "minio_key": doc.minio_key,
            "created_at": doc.created_at.isoformat() if doc.created_at else None
        }

        return success_response(data=document_data)

    except Exception as e:
        return error_response(str(e))

@router.post("/")
def create_document(document_data: DocumentCreate, db: Session = Depends(get_db)):
    """
    Create a new document record
    This creates a ProcessedFile entry with metadata
    """
    try:
        # Create new processed file entry
        new_document = ProcessedFile(
            original_filename=document_data.title,
            file_type="manual",
            file_size_bytes=0,
            minio_key=f"manual/{document_data.title.replace(' ', '_').lower()}",
            processing_status="completed",
            extracted_content=f"Document created manually on {document_data.date}",
            speakers_identified=document_data.related_shapers,
            confidence_overall=90.0 if document_data.sentiment == "positive" else 70.0 if document_data.sentiment == "neutral" else 40.0,
            processing_completed_at=datetime.now()
        )

        # Find uploader user (simplified - in production, use authenticated user)
        uploader_user = db.query(Participant).filter(
            Participant.name.ilike(f"%{document_data.uploader}%")
        ).first()

        if uploader_user and uploader_user.owner_id:
            new_document.created_by_id = uploader_user.owner_id

        db.add(new_document)
        db.commit()
        db.refresh(new_document)

        # Format response
        document_response = {
            "id": new_document.id,
            "title": document_data.title,
            "date": document_data.date,
            "uploader": document_data.uploader,
            "main_theme": document_data.main_theme,
            "sentiment": document_data.sentiment,
            "insights": document_data.insights,
            "related_shapers": document_data.related_shapers,
            "file_type": "manual",
            "processing_status": "completed",
            "created_at": new_document.created_at.isoformat()
        }

        return success_response(
            data=document_response,
            message="Document created successfully"
        )

    except Exception as e:
        db.rollback()
        return error_response(str(e))

@router.put("/{document_id}")
def update_document(
    document_id: int,
    document_data: DocumentUpdate,
    db: Session = Depends(get_db)
):
    """
    Update an existing document
    """
    try:
        doc = db.query(ProcessedFile).filter(ProcessedFile.id == document_id).first()

        if not doc:
            return error_response("Document not found")

        # Update fields if provided
        update_data = document_data.dict(exclude_unset=True)

        for field, value in update_data.items():
            if field == "title":
                doc.original_filename = value
            elif field == "related_shapers":
                doc.speakers_identified = value
            elif field == "sentiment":
                # Update confidence based on sentiment
                if value == "positive":
                    doc.confidence_overall = 90.0
                elif value == "negative":
                    doc.confidence_overall = 40.0
                else:
                    doc.confidence_overall = 70.0
            elif field == "insights" and value:
                # Update insights fields
                if "extracted_content" in value:
                    doc.extracted_content = value["extracted_content"]

        db.commit()
        db.refresh(doc)

        # Format response (similar to get_document)
        document_response = {
            "id": doc.id,
            "title": doc.original_filename,
            "date": doc.created_at.isoformat(),
            "uploader": doc.created_by.full_name if doc.created_by else "Unknown",
            "main_theme": "document",
            "sentiment": "positive" if doc.confidence_overall > 80 else "negative" if doc.confidence_overall < 50 else "neutral",
            "insights": {
                "speakers_identified": doc.speakers_identified or [],
                "confidence_overall": doc.confidence_overall or 0,
                "processing_status": doc.processing_status
            },
            "related_shapers": doc.speakers_identified or [],
            "file_type": doc.file_type,
            "processing_status": doc.processing_status,
            "created_at": doc.created_at.isoformat()
        }

        return success_response(
            data=document_response,
            message="Document updated successfully"
        )

    except Exception as e:
        db.rollback()
        return error_response(str(e))

@router.delete("/{document_id}")
def delete_document(document_id: int, db: Session = Depends(get_db)):
    """
    Delete a document
    """
    try:
        doc = db.query(ProcessedFile).filter(ProcessedFile.id == document_id).first()

        if not doc:
            return error_response("Document not found")

        db.delete(doc)
        db.commit()

        return success_response(
            data=None,
            message="Document deleted successfully"
        )

    except Exception as e:
        db.rollback()
        return error_response(str(e))