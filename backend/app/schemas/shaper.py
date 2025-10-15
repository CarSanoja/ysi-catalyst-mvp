from typing import Optional, List
from pydantic import BaseModel, EmailStr
from datetime import datetime

class ShaperBase(BaseModel):
    """Base schema for Global Shaper"""
    name: str
    email: Optional[EmailStr] = None
    region: Optional[str] = None
    focus_area: Optional[str] = None
    bio: Optional[str] = None
    organization: Optional[str] = None
    phone: Optional[str] = None
    position: Optional[str] = None
    website: Optional[str] = None
    linkedin_url: Optional[str] = None
    photo: Optional[str] = None  # S3 key for avatar

class ShaperCreate(ShaperBase):
    """Schema for creating a new Global Shaper"""
    pass

class ShaperUpdate(BaseModel):
    """Schema for updating a Global Shaper"""
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    region: Optional[str] = None
    focus_area: Optional[str] = None
    bio: Optional[str] = None
    organization: Optional[str] = None
    phone: Optional[str] = None
    position: Optional[str] = None
    website: Optional[str] = None
    linkedin_url: Optional[str] = None
    photo: Optional[str] = None

class ShaperResponse(ShaperBase):
    """Schema for Global Shaper response"""
    id: int
    engagement_score: float = 0.0
    interaction_count: int = 0
    created_at: datetime

    class Config:
        orm_mode = True
        from_attributes = True

class ShaperListResponse(BaseModel):
    """Schema for list of Global Shapers"""
    shapers: List[ShaperResponse]
    total: int
    skip: int = 0
    limit: int = 100