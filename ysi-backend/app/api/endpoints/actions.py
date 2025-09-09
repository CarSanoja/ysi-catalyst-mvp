from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.action import Action

router = APIRouter()

@router.get("/", response_model=List[dict])
def get_actions(
    skip: int = 0,
    limit: int = 100,
    session_id: Optional[int] = None,
    owner_id: Optional[int] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Action)
    if session_id:
        query = query.filter(Action.session_id == session_id)
    if owner_id:
        query = query.filter(Action.owner_id == owner_id)
    if status:
        query = query.filter(Action.status == status)
    actions = query.offset(skip).limit(limit).all()
    return actions

@router.get("/{action_id}")
def get_action(action_id: int, db: Session = Depends(get_db)):
    action = db.query(Action).filter(Action.id == action_id).first()
    if not action:
        raise HTTPException(status_code=404, detail="Action not found")
    return action

@router.post("/")
def create_action(
    session_id: int,
    title: str,
    description: Optional[str] = None,
    owner_id: Optional[int] = None,
    priority: str = "medium",
    created_by_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    action = Action(
        session_id=session_id,
        title=title,
        description=description,
        owner_id=owner_id,
        priority=priority,
        created_by_id=created_by_id
    )
    db.add(action)
    db.commit()
    db.refresh(action)
    return action

@router.put("/{action_id}/status")
def update_action_status(
    action_id: int,
    status: str,
    db: Session = Depends(get_db)
):
    action = db.query(Action).filter(Action.id == action_id).first()
    if not action:
        raise HTTPException(status_code=404, detail="Action not found")
    
    action.status = status
    if status == "completed":
        action.is_completed = True
    db.commit()
    db.refresh(action)
    return action