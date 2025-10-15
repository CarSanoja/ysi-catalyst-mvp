"""
Shared enums for the YSI application
"""
import enum


class ProcessingStatus(enum.Enum):
    """Processing status enum for text processing jobs"""
    RECEIVED = "received"
    PROCESSING = "processing"
    CANCELLED = "cancelled"
    ERROR = "error"
    COMPLETED = "completed"