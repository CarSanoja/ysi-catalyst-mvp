from typing import Optional, List, Any, Dict
from pydantic import BaseModel
from datetime import datetime

class DocumentBase(BaseModel):
    """Base schema for Document"""
    title: str
    date: str  # ISO date string
    uploader: str
    main_theme: str
    sentiment: str  # positive, neutral, negative
    insights: Dict[str, Any] = {}
    related_shapers: List[str] = []

class DocumentCreate(DocumentBase):
    """Schema for creating a new Document"""
    pass

class DocumentUpdate(BaseModel):
    """Schema for updating a Document"""
    title: Optional[str] = None
    date: Optional[str] = None
    uploader: Optional[str] = None
    main_theme: Optional[str] = None
    sentiment: Optional[str] = None
    insights: Optional[Dict[str, Any]] = None
    related_shapers: Optional[List[str]] = None

class DocumentResponse(BaseModel):
    """Schema for Document response"""
    id: int
    title: str
    date: str
    uploader: str
    main_theme: str
    sentiment: str
    insights: Dict[str, Any]
    related_shapers: List[str]
    file_type: Optional[str] = None
    file_size_bytes: Optional[int] = None
    processing_status: Optional[str] = None
    extracted_content: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class DocumentSearchResponse(BaseModel):
    """Schema for document search results"""
    documents: List[DocumentResponse]
    total: int
    query: str