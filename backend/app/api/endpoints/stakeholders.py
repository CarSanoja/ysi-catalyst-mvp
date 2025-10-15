from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from app.db.session import get_db
from app.schemas.response import success_response, error_response
from app.schemas.stakeholder import (
    StakeholderCreate,
    StakeholderUpdate,
    StakeholderResponse,
    StakeholderWithNotesResponse,
    StakeholderNoteCreate,
    StakeholderNoteUpdate,
    StakeholderNoteResponse
)
from app.models.stakeholder import Stakeholder
from app.models.stakeholder_note import StakeholderNote

router = APIRouter()

# =============================================================================
# STAKEHOLDER CRUD OPERATIONS
# =============================================================================

@router.get("/", response_model=dict)
def get_stakeholders(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    type: Optional[str] = Query(None),
    region: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """
    List all stakeholders with optional filtering
    """
    try:
        # Query stakeholders
        query = db.query(Stakeholder)

        # Apply filters
        if type:
            query = query.filter(Stakeholder.type == type)

        if region:
            query = query.filter(Stakeholder.region.ilike(f"%{region}%"))

        if search:
            query = query.filter(
                (Stakeholder.name.ilike(f"%{search}%")) |
                (Stakeholder.organization.ilike(f"%{search}%")) |
                (Stakeholder.bio.ilike(f"%{search}%"))
            )

        # Get total count
        total = query.count()

        # Get paginated results
        stakeholders = query.order_by(desc(Stakeholder.created_at)).offset(skip).limit(limit).all()

        # Format response
        stakeholder_list = [StakeholderResponse.from_orm(s) for s in stakeholders]

        return success_response(
            data=stakeholder_list,
            message=f"Retrieved {len(stakeholder_list)} stakeholders"
        )

    except Exception as e:
        return error_response(f"Error retrieving stakeholders: {str(e)}")

@router.post("/", response_model=dict)
def create_stakeholder(
    stakeholder: StakeholderCreate,
    db: Session = Depends(get_db)
):
    """
    Create a new stakeholder
    """
    try:
        # Check if stakeholder with same email already exists
        existing = db.query(Stakeholder).filter(Stakeholder.email == stakeholder.email).first()
        if existing:
            return error_response("Stakeholder with this email already exists")

        # Create new stakeholder
        db_stakeholder = Stakeholder(
            name=stakeholder.name,
            role=stakeholder.role,
            organization=stakeholder.organization,
            type=stakeholder.type,
            region=stakeholder.region,
            email=stakeholder.email,
            phone=stakeholder.phone,
            bio=stakeholder.bio,
            tags=stakeholder.tags,
            links=[link.dict() for link in stakeholder.links],
            created_by=stakeholder.created_by
        )

        db.add(db_stakeholder)
        db.commit()
        db.refresh(db_stakeholder)

        return success_response(
            data=StakeholderResponse.from_orm(db_stakeholder),
            message="Stakeholder created successfully"
        )

    except Exception as e:
        db.rollback()
        return error_response(f"Error creating stakeholder: {str(e)}")

@router.get("/{stakeholder_id}", response_model=dict)
def get_stakeholder(stakeholder_id: int, db: Session = Depends(get_db)):
    """
    Get specific stakeholder by ID with notes
    """
    try:
        stakeholder = db.query(Stakeholder).filter(Stakeholder.id == stakeholder_id).first()

        if not stakeholder:
            return error_response("Stakeholder not found")

        return success_response(data=StakeholderWithNotesResponse.from_orm(stakeholder))

    except Exception as e:
        return error_response(f"Error retrieving stakeholder: {str(e)}")

@router.put("/{stakeholder_id}", response_model=dict)
def update_stakeholder(
    stakeholder_id: int,
    stakeholder_update: StakeholderUpdate,
    db: Session = Depends(get_db)
):
    """
    Update a stakeholder
    """
    try:
        stakeholder = db.query(Stakeholder).filter(Stakeholder.id == stakeholder_id).first()

        if not stakeholder:
            return error_response("Stakeholder not found")

        # Update fields if provided
        update_data = stakeholder_update.dict(exclude_unset=True)

        # Handle links conversion
        if 'links' in update_data and update_data['links'] is not None:
            update_data['links'] = [link.dict() if hasattr(link, 'dict') else link for link in update_data['links']]

        for field, value in update_data.items():
            setattr(stakeholder, field, value)

        db.commit()
        db.refresh(stakeholder)

        return success_response(
            data=StakeholderResponse.from_orm(stakeholder),
            message="Stakeholder updated successfully"
        )

    except Exception as e:
        db.rollback()
        return error_response(f"Error updating stakeholder: {str(e)}")

@router.delete("/{stakeholder_id}", response_model=dict)
def delete_stakeholder(stakeholder_id: int, db: Session = Depends(get_db)):
    """
    Delete a stakeholder
    """
    try:
        stakeholder = db.query(Stakeholder).filter(Stakeholder.id == stakeholder_id).first()

        if not stakeholder:
            return error_response("Stakeholder not found")

        db.delete(stakeholder)
        db.commit()

        return success_response(
            data={"deleted_id": stakeholder_id},
            message="Stakeholder deleted successfully"
        )

    except Exception as e:
        db.rollback()
        return error_response(f"Error deleting stakeholder: {str(e)}")

# =============================================================================
# STAKEHOLDER NOTES OPERATIONS
# =============================================================================

@router.get("/{stakeholder_id}/notes", response_model=dict)
def get_stakeholder_notes(
    stakeholder_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db)
):
    """
    Get notes for a specific stakeholder
    """
    try:
        # Check if stakeholder exists
        stakeholder = db.query(Stakeholder).filter(Stakeholder.id == stakeholder_id).first()
        if not stakeholder:
            return error_response("Stakeholder not found")

        # Get notes
        notes = db.query(StakeholderNote).filter(
            StakeholderNote.stakeholder_id == stakeholder_id
        ).order_by(desc(StakeholderNote.created_at)).offset(skip).limit(limit).all()

        note_list = [StakeholderNoteResponse.from_orm(note) for note in notes]

        return success_response(
            data=note_list,
            message=f"Retrieved {len(note_list)} notes for stakeholder"
        )

    except Exception as e:
        return error_response(f"Error retrieving stakeholder notes: {str(e)}")

@router.post("/{stakeholder_id}/notes", response_model=dict)
def create_stakeholder_note(
    stakeholder_id: int,
    note: StakeholderNoteCreate,
    db: Session = Depends(get_db)
):
    """
    Create a new note for a stakeholder
    """
    try:
        # Check if stakeholder exists
        stakeholder = db.query(Stakeholder).filter(Stakeholder.id == stakeholder_id).first()
        if not stakeholder:
            return error_response("Stakeholder not found")

        # Create new note
        db_note = StakeholderNote(
            stakeholder_id=stakeholder_id,
            content=note.content,
            created_by=note.created_by
        )

        db.add(db_note)
        db.commit()
        db.refresh(db_note)

        return success_response(
            data=StakeholderNoteResponse.from_orm(db_note),
            message="Note created successfully"
        )

    except Exception as e:
        db.rollback()
        return error_response(f"Error creating note: {str(e)}")

@router.put("/{stakeholder_id}/notes/{note_id}", response_model=dict)
def update_stakeholder_note(
    stakeholder_id: int,
    note_id: int,
    note_update: StakeholderNoteUpdate,
    db: Session = Depends(get_db)
):
    """
    Update a stakeholder note
    """
    try:
        # Check if note exists and belongs to stakeholder
        note = db.query(StakeholderNote).filter(
            StakeholderNote.id == note_id,
            StakeholderNote.stakeholder_id == stakeholder_id
        ).first()

        if not note:
            return error_response("Note not found")

        # Update fields if provided
        update_data = note_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(note, field, value)

        db.commit()
        db.refresh(note)

        return success_response(
            data=StakeholderNoteResponse.from_orm(note),
            message="Note updated successfully"
        )

    except Exception as e:
        db.rollback()
        return error_response(f"Error updating note: {str(e)}")

@router.delete("/{stakeholder_id}/notes/{note_id}", response_model=dict)
def delete_stakeholder_note(
    stakeholder_id: int,
    note_id: int,
    db: Session = Depends(get_db)
):
    """
    Delete a stakeholder note
    """
    try:
        # Check if note exists and belongs to stakeholder
        note = db.query(StakeholderNote).filter(
            StakeholderNote.id == note_id,
            StakeholderNote.stakeholder_id == stakeholder_id
        ).first()

        if not note:
            return error_response("Note not found")

        db.delete(note)
        db.commit()

        return success_response(
            data={"deleted_id": note_id},
            message="Note deleted successfully"
        )

    except Exception as e:
        db.rollback()
        return error_response(f"Error deleting note: {str(e)}")

# =============================================================================
# ADDITIONAL ENDPOINTS FOR COMPATIBILITY
# =============================================================================

@router.get("/{stakeholder_id}/relationships", response_model=dict)
def get_stakeholder_relationships(stakeholder_id: int, db: Session = Depends(get_db)):
    """
    Get stakeholder relationships (placeholder for future implementation)
    """
    try:
        stakeholder = db.query(Stakeholder).filter(Stakeholder.id == stakeholder_id).first()

        if not stakeholder:
            return error_response("Stakeholder not found")

        # For now, return basic relationship data
        # This can be expanded later with actual relationship logic
        relationship_data = {
            "stakeholder_id": stakeholder_id,
            "stakeholder_name": stakeholder.name,
            "total_connections": 0,
            "network_strength": "low",
            "relationships": {
                "session_connections": [],
                "organizational_connections": [],
                "focus_area_peers": []
            },
            "network_metrics": {
                "session_connections": 0,
                "organizational_connections": 0,
                "focus_area_peers": 0,
                "influence_score": 0
            }
        }

        return success_response(
            data=relationship_data,
            message=f"Retrieved relationship network for {stakeholder.name}"
        )

    except Exception as e:
        return error_response(f"Error retrieving stakeholder relationships: {str(e)}")