from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.insight import Insight

router = APIRouter()

@router.get("/", response_model=List[dict])
def get_insights(
    skip: int = 0,
    limit: int = 100,
    session_id: Optional[int] = None,
    pillar: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Insight)
    if session_id:
        query = query.filter(Insight.session_id == session_id)
    if pillar:
        query = query.filter(Insight.pillar == pillar)
    insights = query.offset(skip).limit(limit).all()
    return insights

@router.get("/{insight_id}")
def get_insight(insight_id: int, db: Session = Depends(get_db)):
    insight = db.query(Insight).filter(Insight.id == insight_id).first()
    if not insight:
        raise HTTPException(status_code=404, detail="Insight not found")
    return insight

@router.post("/")
def create_insight(
    session_id: int,
    title: str,
    content: str,
    pillar: Optional[str] = None,
    insight_type: Optional[str] = None,
    created_by_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    insight = Insight(
        session_id=session_id,
        title=title,
        content=content,
        pillar=pillar,
        insight_type=insight_type,
        created_by_id=created_by_id
    )
    db.add(insight)
    db.commit()
    db.refresh(insight)
    return insight