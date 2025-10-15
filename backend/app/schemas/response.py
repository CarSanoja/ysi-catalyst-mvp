from typing import TypeVar, Generic, Optional, Any
from pydantic import BaseModel

T = TypeVar('T')

class ApiResponse(BaseModel, Generic[T]):
    """
    Standardized API response format matching frontend expectations
    """
    success: bool
    data: Optional[T] = None
    error: Optional[str] = None
    message: Optional[str] = None

    class Config:
        schema_extra = {
            "example": {
                "success": True,
                "data": {},
                "error": None,
                "message": "Operation completed successfully"
            }
        }

def success_response(data: Any = None, message: str = None) -> dict:
    """Create a successful API response"""
    return {
        "success": True,
        "data": data,
        "error": None,
        "message": message
    }

def error_response(error: str, message: str = None) -> dict:
    """Create an error API response"""
    return {
        "success": False,
        "data": None,
        "error": error,
        "message": message or error
    }