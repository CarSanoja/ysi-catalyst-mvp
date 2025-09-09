import logging
import json
import time
from datetime import datetime
from typing import Dict, Any, Optional
from functools import wraps
from contextlib import contextmanager
from sqlalchemy.orm import Session
from app.models.activity_log import ActivityLog
from app.db.session import get_db
from app.core.config import settings

# Configure structured logging
class StructuredLogger:
    """Structured logging service for YSI Catalyst"""
    
    def __init__(self, name: str):
        self.logger = logging.getLogger(name)
        self.setup_logger()
    
    def setup_logger(self):
        """Configure logger with structured formatting"""
        handler = logging.StreamHandler()
        formatter = logging.Formatter(
            '%(asctime)s | %(levelname)s | %(name)s | %(message)s'
        )
        handler.setFormatter(formatter)
        self.logger.addHandler(handler)
        self.logger.setLevel(logging.INFO)
    
    def info(self, message: str, **kwargs):
        extra_data = json.dumps(kwargs) if kwargs else ""
        self.logger.info(f"{message} | {extra_data}")
    
    def warning(self, message: str, **kwargs):
        extra_data = json.dumps(kwargs) if kwargs else ""
        self.logger.warning(f"{message} | {extra_data}")
    
    def error(self, message: str, **kwargs):
        extra_data = json.dumps(kwargs) if kwargs else ""
        self.logger.error(f"{message} | {extra_data}")

# Business Logic Loggers
class SessionActivityLogger:
    """Log all session-related activities with full context"""
    
    def __init__(self):
        self.logger = StructuredLogger("session_activity")
    
    def log_session_created(self, session_id: int, user_id: int, details: Dict[str, Any]):
        """Log session creation with context"""
        self.logger.info(
            "SESSION_CREATED",
            session_id=session_id,
            user_id=user_id,
            session_type=details.get("type"),
            participant_count=details.get("participant_count", 0),
            duration_planned=details.get("duration_minutes"),
            consent_settings=details.get("consent_settings"),
            pillars=details.get("pillars", []),
            timestamp=datetime.utcnow().isoformat()
        )
        
        # Also log to database
        self._log_to_database(
            user_id=user_id,
            session_id=session_id,
            action_type="SESSION_CREATED",
            entity_type="session",
            entity_id=session_id,
            details=details
        )
    
    def log_capture_entry(self, session_id: int, lane_id: str, entry_data: Dict[str, Any]):
        """Log capture entry addition"""
        self.logger.info(
            "CAPTURE_ENTRY_ADDED",
            session_id=session_id,
            lane_id=lane_id,
            entry_id=entry_data.get("id"),
            content_length=len(entry_data.get("content", "")),
            has_tags=len(entry_data.get("tags", [])) > 0,
            is_highlighted=entry_data.get("highlighted", False),
            has_tension=entry_data.get("has_tension", False),
            timestamp=entry_data.get("timestamp")
        )
    
    def log_ai_insight_generated(self, session_id: int, insight_data: Dict[str, Any]):
        """Log AI insight generation"""
        self.logger.info(
            "AI_INSIGHT_GENERATED",
            session_id=session_id,
            insight_type=insight_data.get("type"),
            confidence_score=insight_data.get("confidence"),
            processing_duration=insight_data.get("processing_time_ms"),
            source_entries_count=insight_data.get("source_count", 0)
        )
    
    def log_live_transcription(self, session_id: int, transcription_data: Dict[str, Any]):
        """Log live transcription events"""
        self.logger.info(
            "LIVE_TRANSCRIPTION",
            session_id=session_id,
            text_length=len(transcription_data.get("text", "")),
            confidence=transcription_data.get("confidence"),
            language=transcription_data.get("language", "EN"),
            processing_delay_ms=transcription_data.get("delay_ms", 0)
        )
    
    def _log_to_database(self, user_id: int, session_id: int, action_type: str, 
                        entity_type: str, entity_id: int, details: Dict[str, Any]):
        """Log activity to database for audit trail"""
        try:
            db = next(get_db())
            activity_log = ActivityLog(
                user_id=user_id,
                session_id=session_id,
                action_type=action_type,
                entity_type=entity_type,
                entity_id=entity_id,
                details=details,
                success=True
            )
            db.add(activity_log)
            db.commit()
        except Exception as e:
            self.logger.error(f"Failed to log to database: {str(e)}")

class StakeholderActivityLogger:
    """Track all stakeholder-related activities for CRM insights"""
    
    def __init__(self):
        self.logger = StructuredLogger("stakeholder_activity")
    
    def log_interaction_created(self, stakeholder_id: int, interaction_data: Dict[str, Any]):
        """Log stakeholder interaction creation"""
        self.logger.info(
            "STAKEHOLDER_INTERACTION",
            stakeholder_id=stakeholder_id,
            interaction_type=interaction_data.get("type"),
            duration_minutes=interaction_data.get("duration"),
            participant_count=len(interaction_data.get("participants", [])),
            consent_level=interaction_data.get("consent_level"),
            evidence_links_count=len(interaction_data.get("evidence_links", []))
        )
    
    def log_engagement_score_update(self, stakeholder_id: int, old_score: float, 
                                   new_score: float, factors: Dict[str, Any]):
        """Log engagement score updates"""
        self.logger.info(
            "ENGAGEMENT_SCORE_UPDATED",
            stakeholder_id=stakeholder_id,
            old_score=old_score,
            new_score=new_score,
            score_delta=new_score - old_score,
            update_factors=factors
        )
    
    def log_pipeline_status_change(self, stakeholder_id: int, old_status: str, 
                                  new_status: str, trigger: str):
        """Log pipeline status changes"""
        self.logger.info(
            "PIPELINE_STATUS_CHANGED",
            stakeholder_id=stakeholder_id,
            old_status=old_status,
            new_status=new_status,
            trigger=trigger,
            timestamp=datetime.utcnow().isoformat()
        )

class DocumentActivityLogger:
    """Track document creation, editing, and export activities"""
    
    def __init__(self):
        self.logger = StructuredLogger("document_activity")
    
    def log_charter_edit(self, document_id: int, user_id: int, edit_details: Dict[str, Any]):
        """Log charter document edits"""
        self.logger.info(
            "CHARTER_DOCUMENT_EDITED",
            document_id=document_id,
            user_id=user_id,
            section_edited=edit_details.get("section"),
            edit_type=edit_details.get("type"),  # content, citation, formatting
            characters_added=edit_details.get("chars_added", 0),
            characters_removed=edit_details.get("chars_removed", 0),
            citations_added=edit_details.get("citations_added", 0)
        )
    
    def log_export_generated(self, export_type: str, document_id: int, 
                            user_id: int, export_data: Dict[str, Any]):
        """Log document export generation"""
        self.logger.info(
            "DOCUMENT_EXPORT_GENERATED",
            export_type=export_type,
            document_id=document_id,
            user_id=user_id,
            format=export_data.get("format"),
            file_size_bytes=export_data.get("file_size"),
            generation_time_ms=export_data.get("generation_time"),
            s3_key=export_data.get("s3_key"),
            citation_count=export_data.get("citation_count", 0)
        )
    
    def log_citation_added(self, document_id: int, citation_data: Dict[str, Any]):
        """Log citation additions"""
        self.logger.info(
            "CITATION_ADDED",
            document_id=document_id,
            citation_type=citation_data.get("type"),
            source_id=citation_data.get("source_id"),
            section=citation_data.get("section"),
            relevance_score=citation_data.get("relevance_score"),
            consent_status=citation_data.get("consent_status")
        )

class SecurityLogger:
    """Security-focused logging for audit compliance"""
    
    def __init__(self):
        self.logger = StructuredLogger("security")
    
    def log_login_attempt(self, email: str, success: bool, ip_address: str, 
                         details: Dict[str, Any]):
        """Log authentication attempts"""
        log_level = "info" if success else "warning"
        getattr(self.logger, log_level)(
            "LOGIN_ATTEMPT",
            email=email,
            success=success,
            ip_address=ip_address,
            user_agent=details.get("user_agent"),
            timestamp=datetime.utcnow().isoformat(),
            session_id=details.get("session_id"),
            failure_reason=details.get("failure_reason") if not success else None
        )
    
    def log_permission_check(self, user_id: int, resource: str, action: str, granted: bool):
        """Log authorization checks"""
        self.logger.info(
            "PERMISSION_CHECK",
            user_id=user_id,
            resource=resource,
            action=action,
            granted=granted,
            timestamp=datetime.utcnow().isoformat()
        )
    
    def log_data_access(self, user_id: int, entity_type: str, entity_id: int, 
                       consent_level: str):
        """Log sensitive data access"""
        self.logger.info(
            "DATA_ACCESS",
            user_id=user_id,
            entity_type=entity_type,
            entity_id=entity_id,
            consent_level=consent_level,
            access_granted=True,  # Only log if access granted
            timestamp=datetime.utcnow().isoformat()
        )
    
    def log_sensitive_operation(self, user_id: int, operation: str, 
                               target_data: Dict[str, Any]):
        """Log sensitive operations like data export, deletion"""
        self.logger.warning(
            "SENSITIVE_OPERATION",
            user_id=user_id,
            operation=operation,
            target_type=target_data.get("type"),
            target_id=target_data.get("id"),
            consent_verified=target_data.get("consent_verified", False),
            approval_required=target_data.get("approval_required", False),
            timestamp=datetime.utcnow().isoformat()
        )

class FileSecurityLogger:
    """Log file operations for security monitoring"""
    
    def __init__(self):
        self.logger = StructuredLogger("file_security")
    
    def log_file_upload(self, user_id: int, filename: str, file_details: Dict[str, Any]):
        """Log file uploads with security context"""
        self.logger.info(
            "FILE_UPLOAD",
            user_id=user_id,
            filename=filename,
            file_size=file_details.get("size"),
            file_type=file_details.get("type"),
            virus_scan_result=file_details.get("virus_scan"),
            s3_key=file_details.get("s3_key"),
            upload_duration_ms=file_details.get("upload_time")
        )
    
    def log_file_processing(self, file_id: int, processing_data: Dict[str, Any]):
        """Log file processing activities"""
        self.logger.info(
            "FILE_PROCESSING",
            file_id=file_id,
            processing_type=processing_data.get("type"),
            status=processing_data.get("status"),
            confidence_score=processing_data.get("confidence"),
            processing_duration_ms=processing_data.get("duration"),
            extracted_entities=processing_data.get("entities_count", 0)
        )
    
    def log_sensitive_data_access(self, user_id: int, data_type: str, 
                                 access_details: Dict[str, Any]):
        """Log access to sensitive file data"""
        self.logger.warning(
            "SENSITIVE_DATA_ACCESS",
            user_id=user_id,
            data_type=data_type,  # PII, financial, etc.
            access_reason=access_details.get("reason"),
            consent_verified=access_details.get("consent_verified", False),
            redaction_applied=access_details.get("redaction_applied", False)
        )

# Performance Monitoring
class PerformanceMonitor:
    """Monitor performance of key operations"""
    
    def __init__(self):
        self.logger = StructuredLogger("performance")
    
    def monitor_operation(self, operation_name: str):
        """Decorator to monitor performance of operations"""
        def decorator(func):
            @wraps(func)
            async def wrapper(*args, **kwargs):
                start_time = time.time()
                
                try:
                    result = await func(*args, **kwargs)
                    success = True
                    error = None
                except Exception as e:
                    result = None
                    success = False
                    error = str(e)
                    raise
                finally:
                    duration = time.time() - start_time
                    
                    self.logger.info(
                        "PERFORMANCE_METRIC",
                        operation=operation_name,
                        duration_ms=round(duration * 1000, 2),
                        success=success,
                        error=error,
                        timestamp=datetime.utcnow().isoformat()
                    )
                
                return result
            return wrapper
        return decorator

# Database Performance Logger
class DatabaseLogger:
    """Monitor database performance and operations"""
    
    def __init__(self):
        self.logger = StructuredLogger("database")
    
    def log_slow_query(self, query: str, duration_ms: float, params: Dict[str, Any]):
        """Log slow database queries"""
        self.logger.warning(
            "SLOW_QUERY",
            query=query[:200] + "..." if len(query) > 200 else query,
            duration_ms=duration_ms,
            params_count=len(params),
            timestamp=datetime.utcnow().isoformat()
        )
    
    def log_connection_issue(self, error: str, connection_details: Dict[str, Any]):
        """Log database connection issues"""
        self.logger.error(
            "DATABASE_CONNECTION_ERROR",
            error=error,
            host=connection_details.get("host"),
            database=connection_details.get("database"),
            timestamp=datetime.utcnow().isoformat()
        )

# Cost Monitoring
class CostMonitor:
    """Monitor AWS service usage for cost optimization"""
    
    def __init__(self):
        self.logger = StructuredLogger("cost_monitoring")
    
    def log_s3_operation(self, operation: str, bucket: str, key: str, 
                        size_bytes: Optional[int] = None):
        """Log S3 operations for cost tracking"""
        self.logger.info(
            "S3_OPERATION",
            operation=operation,  # PUT, GET, DELETE
            bucket=bucket,
            key=key,
            size_bytes=size_bytes,
            estimated_cost_usd=self._calculate_s3_cost(operation, size_bytes),
            timestamp=datetime.utcnow().isoformat()
        )
    
    def log_database_query_cost(self, query_type: str, execution_time_ms: float, 
                               rows_affected: int):
        """Log database operations for cost estimation"""
        self.logger.info(
            "DATABASE_COST",
            query_type=query_type,
            execution_time_ms=execution_time_ms,
            rows_affected=rows_affected,
            estimated_rcu=self._calculate_rds_cost(execution_time_ms),
            timestamp=datetime.utcnow().isoformat()
        )
    
    def _calculate_s3_cost(self, operation: str, size_bytes: Optional[int]) -> float:
        """Simplified cost calculation for S3"""
        costs = {
            "PUT": 0.0005,  # per 1000 requests
            "GET": 0.0004,  # per 1000 requests
            "storage": 0.023  # per GB per month
        }
        if operation in costs:
            return costs[operation] / 1000  # Per request
        elif operation == "storage" and size_bytes:
            return (size_bytes / (1024**3)) * costs["storage"] / (30*24)  # Per hour
        return 0.0
    
    def _calculate_rds_cost(self, execution_time_ms: float) -> float:
        """Simplified RDS cost calculation"""
        base_cost_per_hour = 0.02  # t3.micro pricing
        return (execution_time_ms / (1000 * 60 * 60)) * base_cost_per_hour

# Global logger instances
session_logger = SessionActivityLogger()
stakeholder_logger = StakeholderActivityLogger()
document_logger = DocumentActivityLogger()
security_logger = SecurityLogger()
file_logger = FileSecurityLogger()
performance_monitor = PerformanceMonitor()
database_logger = DatabaseLogger()
cost_monitor = CostMonitor()

# Context manager for request tracking
@contextmanager
def request_context(request_id: str, user_id: int, session_id: Optional[int] = None):
    """Context manager for tracking request lifecycle"""
    start_time = time.time()
    
    try:
        yield {
            "request_id": request_id,
            "user_id": user_id,
            "session_id": session_id,
            "start_time": start_time
        }
    finally:
        duration = time.time() - start_time
        
        # Log request completion
        logger = StructuredLogger("request_tracking")
        logger.info(
            "REQUEST_COMPLETED",
            request_id=request_id,
            user_id=user_id,
            session_id=session_id,
            duration_ms=round(duration * 1000, 2),
            timestamp=datetime.utcnow().isoformat()
        )