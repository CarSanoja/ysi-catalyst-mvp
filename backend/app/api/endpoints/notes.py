from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from datetime import datetime
from app.db.session import get_db
from app.schemas.response import success_response, error_response
from app.schemas.note import (
    NoteCreate, NoteUpdate, NoteResponse, NoteProcessRequest, NoteProcessResponse,
    TextProcessingJobCreate, TextProcessingJobResponse, TextProcessingJobUpdate,
    TextProcessingJobList, ProcessingStatusEnum, DocumentUpdate, DocumentInsightsUpdate,
    ChangeLogResponse, DocumentChangeHistoryResponse
)
from app.models import Session as SessionModel, ProcessedFile, TextProcessingJob, ChangeLog
from app.enums import ProcessingStatus
import json
import asyncio
import threading

router = APIRouter()

@router.post("/process", response_model=dict)
def create_processing_job(
    job_request: TextProcessingJobCreate,
    db: Session = Depends(get_db)
):
    """
    Create a new text processing job
    Returns job ID for tracking processing status
    """
    try:
        # Create new job record
        new_job = TextProcessingJob(
            input_text=job_request.text,
            context=job_request.context,
            status=ProcessingStatus.RECEIVED
        )

        db.add(new_job)
        db.commit()
        db.refresh(new_job)

        # Start background processing
        threading.Thread(target=process_job_async, args=(new_job.id,), daemon=True).start()

        # Return job info
        job_response = TextProcessingJobResponse.model_validate(new_job)

        return success_response(
            data=job_response.model_dump(),
            message="Text processing job created successfully"
        )

    except Exception as e:
        db.rollback()
        return error_response(f"Error creating processing job: {str(e)}")


def process_job_async(job_id: int):
    """
    Background function to process the text processing job using LangGraph
    """
    import asyncio
    import logging
    from app.db.session import SessionLocal
    from app.utils.langraph.extraction_task import extract_insights_task
    from app.utils.langraph.aggregation_task import process_global_insights_aggregation

    logger = logging.getLogger(__name__)

    async def async_process():
        db = SessionLocal()
        try:
            # Get the job
            job = db.query(TextProcessingJob).filter(TextProcessingJob.id == job_id).first()
            if not job:
                return

            # Update status to processing
            job.status = ProcessingStatus.PROCESSING
            job.started_at = datetime.now()
            db.commit()

            # Extract insights using LangGraph
            text = job.input_text
            context = job.context or ""

            # Use the new extraction task with fallback
            processed_insights = await extract_insights_task(
                text=text,
                context=context,
                job_id=job_id,
                use_fallback=True
            )

            # Update job with results
            job.result = processed_insights
            job.status = ProcessingStatus.COMPLETED
            job.completed_at = datetime.now()
            db.commit()

            # Trigger global insights aggregation if pillar analysis exists
            pillar_analysis = processed_insights.get("ysi_pillar_analysis", {})
            if pillar_analysis:
                logger.info(f"Triggering global insights aggregation for job {job_id}")

                # Prepare document metadata
                doc_metadata = {
                    "title": processed_insights.get("themes_identified", [None])[0] or f"Document {job_id}",
                    "date": job.completed_at.isoformat() if job.completed_at else datetime.now().isoformat(),
                    "uploader": "System",
                    "region": None,  # Could be extracted from context in the future
                    "stakeholder": None  # Could be extracted from key actors
                }

                # Run aggregation in background (don't wait for it)
                try:
                    await process_global_insights_aggregation(
                        job_id=job_id,
                        pillar_analysis=pillar_analysis,
                        doc_metadata=doc_metadata,
                        db=db
                    )
                    logger.info(f"Global insights aggregation completed for job {job_id}")
                except Exception as agg_error:
                    logger.error(f"Error during global insights aggregation for job {job_id}: {str(agg_error)}")
                    # Don't fail the whole job if aggregation fails

        except Exception as e:
            # Mark job as error
            job.status = ProcessingStatus.ERROR
            job.error_message = str(e)
            job.completed_at = datetime.now()
            db.commit()
        finally:
            db.close()

    # Run the async function
    try:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        loop.run_until_complete(async_process())
    finally:
        loop.close()

@router.post("/save")
def save_notes(
    note_data: NoteCreate,
    db: Session = Depends(get_db)
):
    """
    Save raw notes to the database
    """
    try:
        # Create a new session record to store the note
        new_session = SessionModel(
            title=note_data.title,
            session_type="notes",
            processing_status="completed",
            notes=note_data.text,
            scheduled_at=datetime.fromisoformat(note_data.date.replace('Z', '+00:00')) if 'T' in note_data.date else datetime.now()
        )

        db.add(new_session)
        db.commit()
        db.refresh(new_session)

        # Format response
        note_response = {
            "id": new_session.id,
            "title": note_data.title,
            "text": note_data.text,
            "date": note_data.date,
            "author": note_data.author,
            "processed_insights": None,
            "created_at": new_session.created_at.isoformat(),
            "updated_at": None
        }

        return success_response(
            data=note_response,
            message="Notes saved successfully"
        )

    except Exception as e:
        db.rollback()
        return error_response(f"Error saving notes: {str(e)}")

@router.get("/")
def get_notes(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    author: Optional[str] = Query(None),
    date_from: Optional[str] = Query(None, alias="dateFrom"),
    date_to: Optional[str] = Query(None, alias="dateTo"),
    db: Session = Depends(get_db)
):
    """
    List all saved notes with optional filtering
    """
    try:
        # Query sessions with type="notes"
        query = db.query(SessionModel).filter(SessionModel.session_type == "notes")

        # Apply filters
        if date_from:
            try:
                from_date = datetime.fromisoformat(date_from.replace('Z', '+00:00'))
                query = query.filter(SessionModel.created_at >= from_date)
            except:
                pass

        if date_to:
            try:
                to_date = datetime.fromisoformat(date_to.replace('Z', '+00:00'))
                query = query.filter(SessionModel.created_at <= to_date)
            except:
                pass

        if author:
            # For now, we'll search in notes content for author name
            query = query.filter(SessionModel.notes.ilike(f"%{author}%"))

        # Get total count
        total = query.count()

        # Get paginated results
        notes = query.order_by(desc(SessionModel.created_at)).offset(skip).limit(limit).all()

        # Format response
        notes_list = []
        for note in notes:
            note_data = {
                "id": note.id,
                "title": note.title or "Untitled Note",
                "text": note.notes or "",
                "date": note.scheduled_at.isoformat() if note.scheduled_at else note.created_at.isoformat(),
                "author": "Unknown",  # We don't have author field in Session model
                "processed_insights": None,
                "created_at": note.created_at.isoformat(),
                "updated_at": note.updated_at.isoformat() if note.updated_at else None
            }
            notes_list.append(note_data)

        return success_response(
            data=notes_list,
            message=f"Retrieved {len(notes_list)} notes"
        )

    except Exception as e:
        return error_response(f"Error retrieving notes: {str(e)}")

# =============================================================================
# TEXT PROCESSING JOB ENDPOINTS
# =============================================================================

@router.get("/jobs", response_model=dict)
def get_processing_jobs(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    status: Optional[ProcessingStatusEnum] = Query(None),
    db: Session = Depends(get_db)
):
    """
    Get list of text processing jobs with optional filtering
    """
    try:
        # Build query
        query = db.query(TextProcessingJob)

        # Filter by status if provided
        if status:
            query = query.filter(TextProcessingJob.status == status.value)

        # Get total count
        total = query.count()

        # Get paginated results
        jobs = query.order_by(desc(TextProcessingJob.created_at)).offset(skip).limit(limit).all()

        # Convert to response format
        job_responses = [TextProcessingJobResponse.model_validate(job) for job in jobs]

        # Create pagination info
        page = (skip // limit) + 1
        per_page = limit
        has_next = total > skip + limit
        has_prev = skip > 0

        result = TextProcessingJobList(
            jobs=job_responses,
            total=total,
            page=page,
            per_page=per_page,
            has_next=has_next,
            has_prev=has_prev
        )

        return success_response(
            data=result.model_dump(),
            message=f"Retrieved {len(job_responses)} processing jobs"
        )

    except Exception as e:
        return error_response(f"Error retrieving processing jobs: {str(e)}")


@router.get("/jobs/documents", response_model=dict)
def get_processing_jobs_as_documents(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    sentiment: Optional[str] = Query(None),
    date_from: Optional[str] = Query(None, alias="dateFrom"),
    date_to: Optional[str] = Query(None, alias="dateTo"),
    uploader: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """
    Get completed text processing jobs formatted as ProcessedDocument objects
    This unifies the Notes and Documents systems
    """
    try:
        # Query only completed jobs with results
        query = db.query(TextProcessingJob).filter(
            TextProcessingJob.status == ProcessingStatus.COMPLETED,
            TextProcessingJob.result.isnot(None)
        )

        # Apply date filters
        if date_from:
            try:
                from_date = datetime.fromisoformat(date_from.replace('Z', '+00:00'))
                query = query.filter(TextProcessingJob.created_at >= from_date)
            except:
                pass

        if date_to:
            try:
                to_date = datetime.fromisoformat(date_to.replace('Z', '+00:00'))
                query = query.filter(TextProcessingJob.created_at <= to_date)
            except:
                pass

        # Get total count
        total = query.count()

        # Get paginated results
        jobs = query.order_by(desc(TextProcessingJob.completed_at)).offset(skip).limit(limit).all()

        # Convert jobs to ProcessedDocument format
        document_list = []
        for job in jobs:
            if not job.result:
                continue

            result = job.result

            # Extract sentiment from LangGraph result
            job_sentiment = "neutral"
            if "sentiment_analysis" in result:
                job_sentiment = result["sentiment_analysis"].get("overall_sentiment", "neutral")

            # Apply sentiment filter
            if sentiment and sentiment != job_sentiment:
                continue

            # Extract main theme
            main_theme = "text_analysis"
            if "themes_identified" in result and result["themes_identified"]:
                main_theme = result["themes_identified"][0]

            # Extract related shapers
            related_shapers = []
            if "participants_mentioned" in result:
                related_shapers = result["participants_mentioned"]

            # Create ExtractedInsight object
            insights = {
                "id": str(job.id),
                "mainTheme": main_theme,
                "subthemes": result.get("themes_identified", [])[1:] if "themes_identified" in result and len(result["themes_identified"]) > 1 else [],
                "keyActors": result.get("participants_mentioned", []),
                "generalPerception": job_sentiment,
                "proposedActions": result.get("action_items", []),
                "challenges": result.get("challenges", []),
                "opportunities": result.get("opportunities", []),
                "rawText": job.input_text,
                "extractedAt": job.completed_at.isoformat() if job.completed_at else job.created_at.isoformat(),
                # Enhanced YSI pillar analysis
                "pillarAnalysis": result.get("ysi_pillar_analysis", {}),
                "ysiPillarAnalysis": result.get("ysi_pillar_analysis", {}),
                "structuredInsights": result.get("structured_insights", {}),
                # Network analysis from specialized agent
                "networkAnalysis": result.get("network_analysis", {})
            }

            # Create ProcessedDocument
            document_data = {
                "id": str(job.id),
                "title": main_theme,
                "date": job.completed_at.isoformat() if job.completed_at else job.created_at.isoformat(),
                "uploader": "System",  # Could be enhanced with user tracking
                "mainTheme": main_theme,
                "sentiment": job_sentiment,
                "insights": insights,
                "relatedShapers": related_shapers
            }

            # Apply uploader filter (though currently all are "System")
            if uploader and uploader.lower() not in document_data["uploader"].lower():
                continue

            document_list.append(document_data)

        return success_response(
            data=document_list,
            message=f"Retrieved {len(document_list)} processed documents"
        )

    except Exception as e:
        return error_response(f"Error retrieving processed documents: {str(e)}")


@router.get("/jobs/{job_id}", response_model=dict)
def get_processing_job(job_id: int, db: Session = Depends(get_db)):
    """
    Get a specific text processing job by ID
    """
    try:
        job = db.query(TextProcessingJob).filter(TextProcessingJob.id == job_id).first()

        if not job:
            return error_response("Processing job not found")

        job_response = TextProcessingJobResponse.model_validate(job)

        return success_response(
            data=job_response.model_dump(),
            message="Processing job retrieved successfully"
        )

    except Exception as e:
        return error_response(f"Error retrieving processing job: {str(e)}")


@router.put("/jobs/{job_id}/cancel", response_model=dict)
def cancel_processing_job(job_id: int, db: Session = Depends(get_db)):
    """
    Cancel a text processing job (only if status is RECEIVED or PROCESSING)
    """
    try:
        job = db.query(TextProcessingJob).filter(TextProcessingJob.id == job_id).first()

        if not job:
            return error_response("Processing job not found")

        # Check if job can be cancelled
        if job.status in [ProcessingStatus.COMPLETED, ProcessingStatus.ERROR, ProcessingStatus.CANCELLED]:
            return error_response(f"Cannot cancel job with status: {job.status.value}")

        # Update job status
        job.status = ProcessingStatus.CANCELLED
        job.cancelled_at = datetime.now()
        db.commit()

        job_response = TextProcessingJobResponse.model_validate(job)

        return success_response(
            data=job_response.model_dump(),
            message="Processing job cancelled successfully"
        )

    except Exception as e:
        db.rollback()
        return error_response(f"Error cancelling processing job: {str(e)}")


@router.get("/{note_id}")
def get_note(note_id: int, db: Session = Depends(get_db)):
    """
    Get a specific note by ID
    """
    try:
        note = db.query(SessionModel).filter(
            SessionModel.id == note_id,
            SessionModel.session_type == "notes"
        ).first()

        if not note:
            return error_response("Note not found")

        note_data = {
            "id": note.id,
            "title": note.title or "Untitled Note",
            "text": note.notes or "",
            "date": note.scheduled_at.isoformat() if note.scheduled_at else note.created_at.isoformat(),
            "author": "Unknown",  # We don't have author field in Session model
            "processed_insights": None,
            "created_at": note.created_at.isoformat(),
            "updated_at": note.updated_at.isoformat() if note.updated_at else None
        }

        return success_response(data=note_data)

    except Exception as e:
        return error_response(f"Error retrieving note: {str(e)}")


# =============================================================================
# DOCUMENT EDITING AND CHANGE LOG ENDPOINTS
# =============================================================================

def log_change(db: Session, document_type: str, document_id: int, field_name: str,
               old_value: str, new_value: str, changed_by: str = "system",
               change_reason: str = None):
    """Helper function to log document changes"""
    try:
        change_log = ChangeLog(
            document_type=document_type,
            document_id=document_id,
            field_name=field_name,
            old_value=old_value,
            new_value=new_value,
            change_type="update",
            changed_by=changed_by,
            change_reason=change_reason
        )
        db.add(change_log)
        db.commit()
        return change_log
    except Exception as e:
        db.rollback()
        raise e


@router.put("/jobs/documents/{job_id}")
def update_document_insights(
    job_id: int,
    update_data: DocumentUpdate,
    db: Session = Depends(get_db)
):
    """
    Update document insights with change logging
    """
    try:
        # Get the text processing job
        job = db.query(TextProcessingJob).filter(TextProcessingJob.id == job_id).first()

        if not job:
            return error_response("Document not found")

        if not job.result:
            return error_response("Document has no insights to update")

        changes_made = []
        insights_updates = update_data.insights

        if insights_updates:
            current_result = job.result.copy()

            # Update title
            if insights_updates.title is not None:
                old_theme = current_result.get("themes_identified", [""])[0] if current_result.get("themes_identified") else ""
                if old_theme != insights_updates.title:
                    log_change(db, "text_processing_job", job_id, "title",
                             old_theme, insights_updates.title,
                             update_data.changed_by, update_data.change_reason)
                    if "themes_identified" in current_result:
                        current_result["themes_identified"][0] = insights_updates.title
                    else:
                        current_result["themes_identified"] = [insights_updates.title]

                    # Also update structured_insights.main_theme for consistency
                    if "structured_insights" not in current_result:
                        current_result["structured_insights"] = {}
                    current_result["structured_insights"]["main_theme"] = insights_updates.title

                    changes_made.append("title")

            # Update mainTheme
            if insights_updates.mainTheme is not None:
                old_theme = current_result.get("themes_identified", [""])[0] if current_result.get("themes_identified") else ""
                if old_theme != insights_updates.mainTheme:
                    log_change(db, "text_processing_job", job_id, "mainTheme",
                             old_theme, insights_updates.mainTheme,
                             update_data.changed_by, update_data.change_reason)
                    if "themes_identified" in current_result:
                        current_result["themes_identified"][0] = insights_updates.mainTheme
                    else:
                        current_result["themes_identified"] = [insights_updates.mainTheme]
                    changes_made.append("mainTheme")

            # Update keyActors
            if insights_updates.keyActors is not None:
                old_actors = json.dumps(current_result.get("participants_mentioned", []))
                new_actors = json.dumps(insights_updates.keyActors)
                if old_actors != new_actors:
                    log_change(db, "text_processing_job", job_id, "keyActors",
                             old_actors, new_actors,
                             update_data.changed_by, update_data.change_reason)
                    current_result["participants_mentioned"] = insights_updates.keyActors
                    changes_made.append("keyActors")

            # Update proposedActions
            if insights_updates.proposedActions is not None:
                old_actions = json.dumps(current_result.get("action_items", []))
                new_actions = json.dumps(insights_updates.proposedActions)
                if old_actions != new_actions:
                    log_change(db, "text_processing_job", job_id, "proposedActions",
                             old_actions, new_actions,
                             update_data.changed_by, update_data.change_reason)
                    current_result["action_items"] = insights_updates.proposedActions
                    changes_made.append("proposedActions")

            # Update challenges
            if insights_updates.challenges is not None:
                old_challenges = json.dumps(current_result.get("challenges", []))
                new_challenges = json.dumps(insights_updates.challenges)
                if old_challenges != new_challenges:
                    log_change(db, "text_processing_job", job_id, "challenges",
                             old_challenges, new_challenges,
                             update_data.changed_by, update_data.change_reason)
                    current_result["challenges"] = insights_updates.challenges
                    changes_made.append("challenges")

            # Update opportunities
            if insights_updates.opportunities is not None:
                old_opportunities = json.dumps(current_result.get("opportunities", []))
                new_opportunities = json.dumps(insights_updates.opportunities)
                if old_opportunities != new_opportunities:
                    log_change(db, "text_processing_job", job_id, "opportunities",
                             old_opportunities, new_opportunities,
                             update_data.changed_by, update_data.change_reason)
                    current_result["opportunities"] = insights_updates.opportunities
                    changes_made.append("opportunities")

            # Update meeting date
            if insights_updates.meetingDate is not None:
                old_meeting_date = current_result.get("meeting_date", "")
                if old_meeting_date != insights_updates.meetingDate:
                    log_change(db, "text_processing_job", job_id, "meetingDate",
                             old_meeting_date, insights_updates.meetingDate,
                             update_data.changed_by, update_data.change_reason)
                    current_result["meeting_date"] = insights_updates.meetingDate
                    changes_made.append("meetingDate")

            # Update attending shapers
            if insights_updates.attendingShapers is not None:
                old_shapers = json.dumps(current_result.get("attending_shapers", []))
                new_shapers = json.dumps(insights_updates.attendingShapers)
                if old_shapers != new_shapers:
                    log_change(db, "text_processing_job", job_id, "attendingShapers",
                             old_shapers, new_shapers,
                             update_data.changed_by, update_data.change_reason)
                    current_result["attending_shapers"] = insights_updates.attendingShapers
                    changes_made.append("attendingShapers")

            # Update Google Docs link
            if insights_updates.googleDocsLink is not None:
                old_link = current_result.get("google_docs_link", "")
                if old_link != insights_updates.googleDocsLink:
                    log_change(db, "text_processing_job", job_id, "googleDocsLink",
                             old_link, insights_updates.googleDocsLink,
                             update_data.changed_by, update_data.change_reason)
                    current_result["google_docs_link"] = insights_updates.googleDocsLink
                    changes_made.append("googleDocsLink")

        # Update the job result and timestamp
        if changes_made:
                # Also update structured_insights for frontend compatibility
                if "structured_insights" not in current_result:
                    current_result["structured_insights"] = {}

                structured = current_result["structured_insights"]
                if "themes_identified" in current_result:
                    structured["main_theme"] = current_result["themes_identified"][0]
                if "participants_mentioned" in current_result:
                    structured["key_actors"] = current_result["participants_mentioned"]
                if "action_items" in current_result:
                    structured["proposed_actions"] = current_result["action_items"]
                if "challenges" in current_result:
                    structured["challenges"] = current_result["challenges"]
                if "opportunities" in current_result:
                    structured["opportunities"] = current_result["opportunities"]

                # Add new fields to structured_insights
                if "meeting_date" in current_result:
                    structured["meeting_date"] = current_result["meeting_date"]
                if "attending_shapers" in current_result:
                    structured["attending_shapers"] = current_result["attending_shapers"]
                if "google_docs_link" in current_result:
                    structured["google_docs_link"] = current_result["google_docs_link"]

                job.result = current_result
                job.updated_at = datetime.now()
                db.commit()
                db.refresh(job)

        if not changes_made:
            return success_response(
                data={"message": "No changes were made", "job_id": job_id},
                message="Document unchanged"
            )

        return success_response(
            data={
                "job_id": job_id,
                "changes_made": changes_made,
                "updated_result": job.result
            },
            message=f"Document updated successfully. Fields changed: {', '.join(changes_made)}"
        )

    except Exception as e:
        db.rollback()
        return error_response(f"Error updating document: {str(e)}")


@router.get("/jobs/documents/{job_id}/changes")
def get_document_change_history(
    job_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """
    Get change history for a document
    """
    try:
        # Verify the document exists
        job = db.query(TextProcessingJob).filter(TextProcessingJob.id == job_id).first()
        if not job:
            return error_response("Document not found")

        # Get change logs for this document
        query = db.query(ChangeLog).filter(
            ChangeLog.document_type == "text_processing_job",
            ChangeLog.document_id == job_id
        ).order_by(desc(ChangeLog.created_at))

        total_changes = query.count()
        changes = query.offset(skip).limit(limit).all()

        # Convert to response format
        change_responses = [ChangeLogResponse.model_validate(change) for change in changes]

        response_data = DocumentChangeHistoryResponse(
            document_id=job_id,
            document_type="text_processing_job",
            changes=change_responses,
            total_changes=total_changes
        )

        return success_response(
            data=response_data.model_dump(),
            message=f"Retrieved {len(change_responses)} changes for document {job_id}"
        )

    except Exception as e:
        return error_response(f"Error retrieving change history: {str(e)}")


# Also add endpoints for session-based documents
@router.put("/{note_id}")
def update_note_document(
    note_id: int,
    update_data: DocumentUpdate,
    db: Session = Depends(get_db)
):
    """
    Update note document with change logging
    """
    try:
        # Get the session/note
        note = db.query(SessionModel).filter(
            SessionModel.id == note_id,
            SessionModel.session_type == "notes"
        ).first()

        if not note:
            return error_response("Note not found")

        changes_made = []
        insights_updates = update_data.insights

        if insights_updates:
            # Update title
            if insights_updates.title is not None:
                old_title = note.title or ""
                if old_title != insights_updates.title:
                    log_change(db, "session", note_id, "title",
                             old_title, insights_updates.title,
                             update_data.changed_by, update_data.change_reason)
                    note.title = insights_updates.title
                    changes_made.append("title")

            # Update the note and timestamp
            if changes_made:
                note.updated_at = datetime.now()
                db.commit()
                db.refresh(note)

        if not changes_made:
            return success_response(
                data={"message": "No changes were made", "note_id": note_id},
                message="Note unchanged"
            )

        return success_response(
            data={
                "note_id": note_id,
                "changes_made": changes_made,
                "title": note.title
            },
            message=f"Note updated successfully. Fields changed: {', '.join(changes_made)}"
        )

    except Exception as e:
        db.rollback()
        return error_response(f"Error updating note: {str(e)}")


@router.get("/{note_id}/changes")
def get_note_change_history(
    note_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """
    Get change history for a note document
    """
    try:
        # Verify the document exists
        note = db.query(SessionModel).filter(
            SessionModel.id == note_id,
            SessionModel.session_type == "notes"
        ).first()
        if not note:
            return error_response("Note not found")

        # Get change logs for this document
        query = db.query(ChangeLog).filter(
            ChangeLog.document_type == "session",
            ChangeLog.document_id == note_id
        ).order_by(desc(ChangeLog.created_at))

        total_changes = query.count()
        changes = query.offset(skip).limit(limit).all()

        # Convert to response format
        change_responses = [ChangeLogResponse.model_validate(change) for change in changes]

        response_data = DocumentChangeHistoryResponse(
            document_id=note_id,
            document_type="session",
            changes=change_responses,
            total_changes=total_changes
        )

        return success_response(
            data=response_data.model_dump(),
            message=f"Retrieved {len(change_responses)} changes for note {note_id}"
        )

    except Exception as e:
        return error_response(f"Error retrieving change history: {str(e)}")