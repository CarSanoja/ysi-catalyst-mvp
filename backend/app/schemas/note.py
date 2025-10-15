from typing import Optional, List, Dict, Any
from pydantic import BaseModel
from datetime import datetime
from app.enums import ProcessingStatus

class NoteBase(BaseModel):
    """Base schema for Note"""
    title: str
    text: str
    date: str  # ISO date string
    author: str

class NoteProcessRequest(BaseModel):
    """Schema for processing notes with AI"""
    text: str
    context: Optional[str] = None

class NoteCreate(NoteBase):
    """Schema for creating a new Note"""
    pass

class NoteUpdate(BaseModel):
    """Schema for updating a Note"""
    title: Optional[str] = None
    text: Optional[str] = None
    date: Optional[str] = None
    author: Optional[str] = None

class NoteResponse(BaseModel):
    """Schema for Note response"""
    id: int
    title: str
    text: str
    date: str
    author: str
    processed_insights: Optional[Dict[str, Any]] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class NoteProcessResponse(BaseModel):
    """Schema for AI processing response"""
    original_text: str
    processed_insights: Dict[str, Any]
    themes: List[str] = []
    sentiment: str = "neutral"
    key_points: List[str] = []
    action_items: List[str] = []
    participants_mentioned: List[str] = []
    confidence_score: float = 0.0

# =============================================================================
# TEXT PROCESSING JOB SCHEMAS
# =============================================================================

# Use the shared enum for consistency
ProcessingStatusEnum = ProcessingStatus

class TextProcessingJobCreate(BaseModel):
    """Schema for creating a new text processing job"""
    text: str
    context: Optional[str] = None

class TextProcessingJobUpdate(BaseModel):
    """Schema for updating a text processing job (mainly for cancellation)"""
    status: Optional[ProcessingStatusEnum] = None

class TextProcessingJobResponse(BaseModel):
    """Schema for text processing job response"""
    id: int
    input_text: str
    context: Optional[str] = None
    status: ProcessingStatusEnum
    result: Optional[Dict[str, Any]] = None
    error_message: Optional[str] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    cancelled_at: Optional[datetime] = None
    created_by_id: Optional[int] = None
    session_id: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}

class TextProcessingJobList(BaseModel):
    """Schema for paginated list of text processing jobs"""
    jobs: List[TextProcessingJobResponse]
    total: int
    page: int
    per_page: int
    has_next: bool
    has_prev: bool

# =============================================================================
# DOCUMENT EDITING SCHEMAS
# =============================================================================

class DocumentInsightsUpdate(BaseModel):
    """Schema for updating document insights fields"""
    title: Optional[str] = None
    mainTheme: Optional[str] = None
    keyActors: Optional[List[str]] = None
    proposedActions: Optional[List[str]] = None
    challenges: Optional[List[str]] = None
    opportunities: Optional[List[str]] = None
    meetingDate: Optional[str] = None
    attendingShapers: Optional[List[str]] = None
    googleDocsLink: Optional[str] = None

class DocumentUpdate(BaseModel):
    """Schema for updating a processed document"""
    insights: Optional[DocumentInsightsUpdate] = None
    changed_by: Optional[str] = "system"
    change_reason: Optional[str] = None

class ChangeLogResponse(BaseModel):
    """Schema for change log response"""
    id: int
    document_type: str
    document_id: int
    field_name: str
    old_value: Optional[str] = None
    new_value: Optional[str] = None
    change_type: str
    changed_by: str
    change_reason: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}

class DocumentChangeHistoryResponse(BaseModel):
    """Schema for document change history response"""
    document_id: int
    document_type: str
    changes: List[ChangeLogResponse]
    total_changes: int