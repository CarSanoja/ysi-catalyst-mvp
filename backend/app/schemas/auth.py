"""
Authentication Schemas
"""
from pydantic import BaseModel, EmailStr


class LoginRequest(BaseModel):
    """Login request schema"""
    email: EmailStr
    password: str


class LoginResponse(BaseModel):
    """Login response schema"""
    email: str
    role: str
    full_name: str | None = None

    class Config:
        from_attributes = True
