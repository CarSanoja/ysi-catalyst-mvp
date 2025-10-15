from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.db.session import get_db
from app.schemas.response import success_response, error_response
from app.schemas.shaper import ShaperCreate, ShaperUpdate, ShaperResponse
from app.models import Participant, Organization

router = APIRouter()

@router.get("/")
def get_shapers(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    region: Optional[str] = Query(None),
    focus_area: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """
    Get all Global Shapers with optional filtering
    """
    try:
        # Query participants with role containing 'shaper'
        query = db.query(Participant).filter(
            Participant.role.ilike('%shaper%')
        )

        # Apply filters
        if region:
            query = query.filter(Participant.region == region)
        if focus_area:
            query = query.filter(Participant.expertise == focus_area)

        # Get total count
        total = query.count()

        # Get paginated results
        shapers = query.offset(skip).limit(limit).all()

        # Format response
        shaper_list = []
        for shaper in shapers:
            shaper_data = {
                "id": shaper.id,
                "name": shaper.name,
                "email": shaper.email,
                "region": shaper.region,
                "focusArea": shaper.expertise,
                "bio": shaper.bio,
                "organization": shaper.organization.name if shaper.organization else None,
                "phone": shaper.phone,
                "position": shaper.position,
                "website": shaper.website,
                "linkedin_url": shaper.linkedin_url,
                "photo": shaper.avatar_s3_key,
                "engagement_score": shaper.engagement_score or 0.0,
                "interaction_count": shaper.interaction_count or 0,
                "created_at": shaper.created_at.isoformat() if shaper.created_at else None
            }
            shaper_list.append(shaper_data)

        return success_response(
            data=shaper_list,
            message=f"Retrieved {len(shaper_list)} shapers"
        )

    except Exception as e:
        return error_response(str(e))

@router.get("/{shaper_id}")
def get_shaper(shaper_id: int, db: Session = Depends(get_db)):
    """
    Get a specific Global Shaper by ID
    """
    try:
        shaper = db.query(Participant).filter(
            Participant.id == shaper_id,
            Participant.role.ilike('%shaper%')
        ).first()

        if not shaper:
            return error_response("Shaper not found")

        shaper_data = {
            "id": shaper.id,
            "name": shaper.name,
            "email": shaper.email,
            "region": shaper.region,
            "focusArea": shaper.expertise,
            "bio": shaper.bio,
            "organization": shaper.organization.name if shaper.organization else None,
            "phone": shaper.phone,
            "position": shaper.position,
            "website": shaper.website,
            "linkedin_url": shaper.linkedin_url,
            "photo": shaper.avatar_s3_key,
            "engagement_score": shaper.engagement_score or 0.0,
            "interaction_count": shaper.interaction_count or 0,
            "created_at": shaper.created_at.isoformat() if shaper.created_at else None
        }

        return success_response(data=shaper_data)

    except Exception as e:
        return error_response(str(e))

@router.post("/")
def create_shaper(shaper_data: ShaperCreate, db: Session = Depends(get_db)):
    """
    Create a new Global Shaper
    """
    try:
        # Check if organization exists or create it
        organization = None
        if shaper_data.organization:
            organization = db.query(Organization).filter(
                Organization.name == shaper_data.organization
            ).first()

            if not organization:
                organization = Organization(
                    name=shaper_data.organization,
                    organization_type="partner"
                )
                db.add(organization)
                db.flush()  # Get the ID

        # Create new participant with shaper role
        new_shaper = Participant(
            name=shaper_data.name,
            email=shaper_data.email,
            region=shaper_data.region,
            expertise=shaper_data.focus_area,
            bio=shaper_data.bio,
            organization_id=organization.id if organization else None,
            phone=shaper_data.phone,
            position=shaper_data.position,
            website=shaper_data.website,
            linkedin_url=shaper_data.linkedin_url,
            avatar_s3_key=shaper_data.photo,
            role="global_shaper",
            stakeholder_type="individual",
            pipeline_status="engaged",
            engagement_score=75.0  # Default for new shapers
        )

        db.add(new_shaper)
        db.commit()
        db.refresh(new_shaper)

        # Format response
        shaper_response = {
            "id": new_shaper.id,
            "name": new_shaper.name,
            "email": new_shaper.email,
            "region": new_shaper.region,
            "focusArea": new_shaper.expertise,
            "bio": new_shaper.bio,
            "organization": organization.name if organization else None,
            "phone": new_shaper.phone,
            "position": new_shaper.position,
            "website": new_shaper.website,
            "linkedin_url": new_shaper.linkedin_url,
            "photo": new_shaper.avatar_s3_key,
            "engagement_score": new_shaper.engagement_score,
            "interaction_count": 0,
            "created_at": new_shaper.created_at.isoformat()
        }

        return success_response(
            data=shaper_response,
            message="Shaper created successfully"
        )

    except Exception as e:
        db.rollback()
        return error_response(str(e))

@router.put("/{shaper_id}")
def update_shaper(
    shaper_id: int,
    shaper_data: ShaperUpdate,
    db: Session = Depends(get_db)
):
    """
    Update an existing Global Shaper
    """
    try:
        shaper = db.query(Participant).filter(
            Participant.id == shaper_id,
            Participant.role.ilike('%shaper%')
        ).first()

        if not shaper:
            return error_response("Shaper not found")

        # Update fields if provided
        update_data = shaper_data.dict(exclude_unset=True)

        for field, value in update_data.items():
            if field == "focus_area":
                setattr(shaper, "expertise", value)
            elif field == "photo":
                setattr(shaper, "avatar_s3_key", value)
            elif field == "organization" and value:
                # Handle organization
                organization = db.query(Organization).filter(
                    Organization.name == value
                ).first()
                if not organization:
                    organization = Organization(
                        name=value,
                        organization_type="partner"
                    )
                    db.add(organization)
                    db.flush()
                shaper.organization_id = organization.id
            elif hasattr(shaper, field):
                setattr(shaper, field, value)

        db.commit()
        db.refresh(shaper)

        # Format response
        shaper_response = {
            "id": shaper.id,
            "name": shaper.name,
            "email": shaper.email,
            "region": shaper.region,
            "focusArea": shaper.expertise,
            "bio": shaper.bio,
            "organization": shaper.organization.name if shaper.organization else None,
            "phone": shaper.phone,
            "position": shaper.position,
            "website": shaper.website,
            "linkedin_url": shaper.linkedin_url,
            "photo": shaper.avatar_s3_key,
            "engagement_score": shaper.engagement_score,
            "interaction_count": shaper.interaction_count,
            "created_at": shaper.created_at.isoformat()
        }

        return success_response(
            data=shaper_response,
            message="Shaper updated successfully"
        )

    except Exception as e:
        db.rollback()
        return error_response(str(e))

@router.delete("/{shaper_id}")
def delete_shaper(shaper_id: int, db: Session = Depends(get_db)):
    """
    Delete a Global Shaper
    """
    try:
        shaper = db.query(Participant).filter(
            Participant.id == shaper_id,
            Participant.role.ilike('%shaper%')
        ).first()

        if not shaper:
            return error_response("Shaper not found")

        db.delete(shaper)
        db.commit()

        return success_response(
            data=None,
            message="Shaper deleted successfully"
        )

    except Exception as e:
        db.rollback()
        return error_response(str(e))

@router.get("/region/{region}")
def get_shapers_by_region(
    region: str,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db)
):
    """
    Get Global Shapers filtered by region
    """
    try:
        query = db.query(Participant).filter(
            Participant.role.ilike('%shaper%'),
            Participant.region == region
        )

        total = query.count()
        shapers = query.offset(skip).limit(limit).all()

        # Format response
        shaper_list = []
        for shaper in shapers:
            shaper_data = {
                "id": shaper.id,
                "name": shaper.name,
                "email": shaper.email,
                "region": shaper.region,
                "focusArea": shaper.expertise,
                "bio": shaper.bio,
                "organization": shaper.organization.name if shaper.organization else None,
                "engagement_score": shaper.engagement_score or 0.0,
                "created_at": shaper.created_at.isoformat() if shaper.created_at else None
            }
            shaper_list.append(shaper_data)

        return success_response(
            data=shaper_list,
            message=f"Retrieved {len(shaper_list)} shapers from {region}"
        )

    except Exception as e:
        return error_response(str(e))

@router.get("/focus/{focus_area}")
def get_shapers_by_focus_area(
    focus_area: str,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db)
):
    """
    Get Global Shapers filtered by focus area
    """
    try:
        query = db.query(Participant).filter(
            Participant.role.ilike('%shaper%'),
            Participant.expertise == focus_area
        )

        total = query.count()
        shapers = query.offset(skip).limit(limit).all()

        # Format response
        shaper_list = []
        for shaper in shapers:
            shaper_data = {
                "id": shaper.id,
                "name": shaper.name,
                "email": shaper.email,
                "region": shaper.region,
                "focusArea": shaper.expertise,
                "bio": shaper.bio,
                "organization": shaper.organization.name if shaper.organization else None,
                "engagement_score": shaper.engagement_score or 0.0,
                "created_at": shaper.created_at.isoformat() if shaper.created_at else None
            }
            shaper_list.append(shaper_data)

        return success_response(
            data=shaper_list,
            message=f"Retrieved {len(shaper_list)} shapers with focus on {focus_area}"
        )

    except Exception as e:
        return error_response(str(e))