from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.session import Session as SessionModel

router = APIRouter()

@router.get("/", response_model=List[dict])
def get_sessions(
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(SessionModel)
    if status:
        query = query.filter(SessionModel.status == status)
    sessions = query.offset(skip).limit(limit).all()
    return sessions

@router.get("/{session_id}")
def get_session(session_id: int, db: Session = Depends(get_db)):
    session = db.query(SessionModel).filter(SessionModel.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session

@router.post("/")
def create_session(
    title: str,
    description: str = None,
    session_type: str = None,
    facilitator_id: int = None,
    created_by_id: int = None,
    db: Session = Depends(get_db)
):
    session = SessionModel(
        title=title,
        description=description,
        session_type=session_type,
        facilitator_id=facilitator_id,
        created_by_id=created_by_id
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return session

@router.put("/{session_id}/status")
def update_session_status(
    session_id: int,
    status: str,
    db: Session = Depends(get_db)
):
    session = db.query(SessionModel).filter(SessionModel.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    session.status = status
    db.commit()
    db.refresh(session)
    return session