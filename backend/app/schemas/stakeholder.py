from typing import Optional, List, Dict, Any
from pydantic import BaseModel, EmailStr
from datetime import datetime

# Stakeholder Link type
class StakeholderLink(BaseModel):
    label: str
    url: str

# Stakeholder schemas
class StakeholderBase(BaseModel):
    """Base schema for Stakeholder"""
    name: str
    role: str
    organization: str
    type: str  # funder, implementer, mentor, policymaker, researcher, community_leader
    region: str
    email: EmailStr
    phone: Optional[str] = None
    bio: str
    tags: List[str] = []
    links: List[StakeholderLink] = []

class StakeholderCreate(StakeholderBase):
    """Schema for creating a new Stakeholder"""
    created_by: str

class StakeholderUpdate(BaseModel):
    """Schema for updating a Stakeholder"""
    name: Optional[str] = None
    role: Optional[str] = None
    organization: Optional[str] = None
    type: Optional[str] = None
    region: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    bio: Optional[str] = None
    tags: Optional[List[str]] = None
    links: Optional[List[StakeholderLink]] = None

class StakeholderResponse(BaseModel):
    """Schema for Stakeholder response"""
    id: int
    name: str
    role: str
    organization: str
    type: str
    region: str
    email: str
    phone: Optional[str] = None
    bio: str
    tags: List[str] = []
    links: List[StakeholderLink] = []
    created_by: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# StakeholderNote schemas
class StakeholderNoteBase(BaseModel):
    """Base schema for StakeholderNote"""
    content: str

class StakeholderNoteCreate(StakeholderNoteBase):
    """Schema for creating a new StakeholderNote"""
    created_by: str

class StakeholderNoteUpdate(BaseModel):
    """Schema for updating a StakeholderNote"""
    content: Optional[str] = None

class StakeholderNoteResponse(BaseModel):
    """Schema for StakeholderNote response"""
    id: int
    stakeholder_id: int
    content: str
    created_by: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Extended stakeholder response with notes
class StakeholderWithNotesResponse(StakeholderResponse):
    """Schema for Stakeholder response with notes"""
    notes: List[StakeholderNoteResponse] = []