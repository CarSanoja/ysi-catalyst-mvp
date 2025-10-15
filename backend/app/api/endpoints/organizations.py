from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.organization import Organization

router = APIRouter()

@router.get("/", response_model=List[dict])
def get_organizations(
    skip: int = 0,
    limit: int = 100,
    region: Optional[str] = None,
    sector: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Organization)
    if region:
        query = query.filter(Organization.region == region)
    if sector:
        query = query.filter(Organization.sector == sector)
    organizations = query.offset(skip).limit(limit).all()
    return organizations

@router.get("/{org_id}")
def get_organization(org_id: int, db: Session = Depends(get_db)):
    organization = db.query(Organization).filter(Organization.id == org_id).first()
    if not organization:
        raise HTTPException(status_code=404, detail="Organization not found")
    return organization

@router.post("/")
def create_organization(
    name: str,
    description: Optional[str] = None,
    website: Optional[str] = None,
    sector: Optional[str] = None,
    region: Optional[str] = None,
    organization_type: Optional[str] = None,
    db: Session = Depends(get_db)
):
    existing_org = db.query(Organization).filter(Organization.name == name).first()
    if existing_org:
        raise HTTPException(status_code=400, detail="Organization already exists")
    
    organization = Organization(
        name=name,
        description=description,
        website=website,
        sector=sector,
        region=region,
        organization_type=organization_type
    )
    db.add(organization)
    db.commit()
    db.refresh(organization)
    return organization