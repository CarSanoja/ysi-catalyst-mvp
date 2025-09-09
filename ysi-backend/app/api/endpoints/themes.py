from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.theme import Theme

router = APIRouter()

@router.get("/", response_model=List[dict])
def get_themes(
    skip: int = 0,
    limit: int = 100,
    pillar: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Theme)
    if pillar:
        query = query.filter(Theme.pillar == pillar)
    themes = query.offset(skip).limit(limit).all()
    return themes

@router.get("/{theme_id}")
def get_theme(theme_id: int, db: Session = Depends(get_db)):
    theme = db.query(Theme).filter(Theme.id == theme_id).first()
    if not theme:
        raise HTTPException(status_code=404, detail="Theme not found")
    return theme

@router.post("/")
def create_theme(
    name: str,
    description: Optional[str] = None,
    pillar: Optional[str] = None,
    color: Optional[str] = None,
    db: Session = Depends(get_db)
):
    existing_theme = db.query(Theme).filter(Theme.name == name).first()
    if existing_theme:
        raise HTTPException(status_code=400, detail="Theme already exists")
    
    theme = Theme(
        name=name,
        description=description,
        pillar=pillar,
        color=color
    )
    db.add(theme)
    db.commit()
    db.refresh(theme)
    return theme