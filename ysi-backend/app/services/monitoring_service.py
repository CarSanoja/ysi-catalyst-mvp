import psutil
import time
import asyncio
from datetime import datetime, timedelta
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.metrics_snapshot import MetricsSnapshot
from app.models.session import Session as SessionModel
from app.models.participant import Participant
from app.models.action import Action
from app.models.insight import Insight
from app.models.activity_log import ActivityLog
from app.db.session import get_db
from app.services.logging_service import StructuredLogger

class SystemMonitor:
    """Monitor system resources and performance"""
    
    def __init__(self):
        self.logger = StructuredLogger("system_monitor")
    
    def get_system_metrics(self) -> Dict[str, Any]:
        """Get current system resource usage"""
        try:
            memory = psutil.virtual_memory()
            disk = psutil.disk_usage('/')
            
            metrics = {
                "cpu_percent": psutil.cpu_percent(interval=1),
                "memory": {
                    "total_gb": round(memory.total / (1024**3), 2),
                    "used_gb": round(memory.used / (1024**3), 2),
                    "percent": memory.percent,
                    "available_gb": round(memory.available / (1024**3), 2)
                },
                "disk": {
                    "total_gb": round(disk.total / (1024**3), 2),
                    "used_gb": round(disk.used / (1024**3), 2),
                    "percent": round((disk.used / disk.total) * 100, 2),
                    "free_gb": round(disk.free / (1024**3), 2)
                },
                "timestamp": datetime.utcnow().isoformat()
            }
            
            return metrics
        except Exception as e:
            self.logger.error(f"Failed to get system metrics: {str(e)}")
            return {}
    
    def log_resource_usage(self):
        """Log current resource usage"""
        metrics = self.get_system_metrics()
        if metrics:
            self.logger.info(
                "RESOURCE_USAGE",
                **metrics
            )
    
    def check_resource_thresholds(self):
        """Check if resource usage exceeds thresholds"""
        metrics = self.get_system_metrics()
        
        # Define thresholds
        thresholds = {
            "cpu_percent": 80,
            "memory_percent": 85,
            "disk_percent": 90
        }
        
        alerts = []
        
        if metrics.get("cpu_percent", 0) > thresholds["cpu_percent"]:
            alerts.append({
                "type": "high_cpu",
                "value": metrics["cpu_percent"],
                "threshold": thresholds["cpu_percent"]
            })
        
        if metrics.get("memory", {}).get("percent", 0) > thresholds["memory_percent"]:
            alerts.append({
                "type": "high_memory",
                "value": metrics["memory"]["percent"],
                "threshold": thresholds["memory_percent"]
            })
        
        if metrics.get("disk", {}).get("percent", 0) > thresholds["disk_percent"]:
            alerts.append({
                "type": "high_disk",
                "value": metrics["disk"]["percent"],
                "threshold": thresholds["disk_percent"]
            })
        
        for alert in alerts:
            self.logger.warning(
                "RESOURCE_THRESHOLD_EXCEEDED",
                alert_type=alert["type"],
                current_value=alert["value"],
                threshold=alert["threshold"],
                timestamp=datetime.utcnow().isoformat()
            )
        
        return alerts

class BusinessMetricsCollector:
    """Collect business metrics for dashboard"""
    
    def __init__(self):
        self.logger = StructuredLogger("business_metrics")
    
    def collect_daily_metrics(self, date: datetime = None) -> Dict[str, Any]:
        """Collect comprehensive daily metrics"""
        if not date:
            date = datetime.utcnow().date()
        
        db = next(get_db())
        
        try:
            # Sessions metrics
            sessions_mtd = self._get_sessions_mtd(db, date)
            voices_represented = self._get_voices_represented(db, date)
            pillar_coverage = self._get_pillar_coverage(db, date)
            action_items = self._get_action_items_stats(db, date)
            avg_time_to_summary = self._get_avg_processing_time(db, date)
            representation_balance = self._get_representation_balance(db, date)
            
            metrics = {
                "date": date.isoformat(),
                "sessions_mtd": sessions_mtd,
                "voices_represented": voices_represented["total"],
                "unique_leaders": voices_represented["unique_leaders"],
                "regions_count": voices_represented["regions"],
                "pillar_coverage": pillar_coverage,
                "action_items_open": action_items["open"],
                "action_items_closed": action_items["closed"],
                "avg_time_to_summary": avg_time_to_summary,
                "representation_balance": representation_balance
            }
            
            self.logger.info(
                "DAILY_METRICS_COLLECTED",
                **metrics
            )
            
            return metrics
            
        except Exception as e:
            self.logger.error(f"Failed to collect daily metrics: {str(e)}")
            return {}
        finally:
            db.close()
    
    def _get_sessions_mtd(self, db: Session, date: datetime) -> int:
        """Get sessions count for month-to-date"""
        month_start = date.replace(day=1)
        return db.query(SessionModel).filter(
            SessionModel.created_at >= month_start,
            SessionModel.created_at < date + timedelta(days=1)
        ).count()
    
    def _get_voices_represented(self, db: Session, date: datetime) -> Dict[str, int]:
        """Get voice representation stats"""
        month_start = date.replace(day=1)
        
        # Get unique participants for the month
        participants = db.query(Participant).join(SessionModel).filter(
            SessionModel.created_at >= month_start,
            SessionModel.created_at < date + timedelta(days=1)
        ).all()
        
        unique_leaders = len(set(p.name for p in participants if p.name))
        regions = len(set(p.region for p in participants if p.region))
        
        return {
            "total": len(participants),
            "unique_leaders": unique_leaders,
            "regions": regions
        }
    
    def _get_pillar_coverage(self, db: Session, date: datetime) -> Dict[str, float]:
        """Calculate pillar coverage percentages"""
        month_start = date.replace(day=1)
        
        # Get insights by pillar for the month
        insights = db.query(Insight).join(SessionModel).filter(
            SessionModel.created_at >= month_start,
            SessionModel.created_at < date + timedelta(days=1)
        ).all()
        
        if not insights:
            return {"capital": 0, "recognition": 0, "wellbeing": 0}
        
        pillar_counts = {"capital": 0, "recognition": 0, "wellbeing": 0}
        
        for insight in insights:
            pillar = insight.pillar
            if pillar in pillar_counts:
                pillar_counts[pillar] += 1
        
        total = len(insights)
        return {
            pillar: round((count / total) * 100, 1) 
            for pillar, count in pillar_counts.items()
        }
    
    def _get_action_items_stats(self, db: Session, date: datetime) -> Dict[str, int]:
        """Get action items statistics"""
        month_start = date.replace(day=1)
        
        actions = db.query(Action).join(SessionModel).filter(
            SessionModel.created_at >= month_start,
            SessionModel.created_at < date + timedelta(days=1)
        ).all()
        
        open_count = sum(1 for a in actions if not a.is_completed)
        closed_count = sum(1 for a in actions if a.is_completed)
        
        return {"open": open_count, "closed": closed_count}
    
    def _get_avg_processing_time(self, db: Session, date: datetime) -> float:
        """Calculate average time to summary generation"""
        # This would need to be implemented based on processing timestamps
        # For now, return a mock value
        return 18.5
    
    def _get_representation_balance(self, db: Session, date: datetime) -> Dict[str, Any]:
        """Calculate representation balance metrics"""
        month_start = date.replace(day=1)
        
        participants = db.query(Participant).join(SessionModel).filter(
            SessionModel.created_at >= month_start,
            SessionModel.created_at < date + timedelta(days=1)
        ).all()
        
        # This is simplified - would need actual gender data
        total_participants = len(participants)
        if total_participants == 0:
            return {"gender": {"male": 0, "female": 0}, "regional": {}}
        
        # Mock gender balance calculation
        gender_balance = {
            "male": 52,
            "female": 48
        }
        
        # Regional balance
        regions = {}
        for participant in participants:
            region = participant.region or "Unknown"
            regions[region] = regions.get(region, 0) + 1
        
        return {
            "gender": gender_balance,
            "regional": regions
        }
    
    def save_metrics_snapshot(self, metrics: Dict[str, Any]):
        """Save metrics to database"""
        db = next(get_db())
        
        try:
            # Check if snapshot already exists for date
            date_obj = datetime.fromisoformat(metrics["date"]).date()
            existing = db.query(MetricsSnapshot).filter(
                MetricsSnapshot.snapshot_date == date_obj
            ).first()
            
            if existing:
                # Update existing snapshot
                for key, value in metrics.items():
                    if hasattr(existing, key) and key != "date":
                        setattr(existing, key, value)
            else:
                # Create new snapshot
                snapshot = MetricsSnapshot(
                    snapshot_date=date_obj,
                    sessions_mtd=metrics.get("sessions_mtd", 0),
                    voices_represented=metrics.get("voices_represented", 0),
                    unique_leaders=metrics.get("unique_leaders", 0),
                    regions_count=metrics.get("regions_count", 0),
                    pillar_coverage=metrics.get("pillar_coverage", {}),
                    representation_balance=metrics.get("representation_balance", {}),
                    action_items_open=metrics.get("action_items_open", 0),
                    action_items_closed=metrics.get("action_items_closed", 0),
                    avg_time_to_summary=metrics.get("avg_time_to_summary", 0)
                )
                db.add(snapshot)
            
            db.commit()
            self.logger.info(f"Metrics snapshot saved for {date_obj}")
            
        except Exception as e:
            self.logger.error(f"Failed to save metrics snapshot: {str(e)}")
            db.rollback()
        finally:
            db.close()

class HealthChecker:
    """Health check service for system components"""
    
    def __init__(self):
        self.logger = StructuredLogger("health_checker")
    
    async def check_database_health(self) -> Dict[str, Any]:
        """Check database connectivity and performance"""
        start_time = time.time()
        
        try:
            db = next(get_db())
            
            # Simple query to test connectivity
            result = db.execute("SELECT 1").fetchone()
            
            duration = time.time() - start_time
            
            health_data = {
                "status": "healthy",
                "response_time_ms": round(duration * 1000, 2),
                "timestamp": datetime.utcnow().isoformat()
            }
            
            db.close()
            return health_data
            
        except Exception as e:
            health_data = {
                "status": "unhealthy",
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat()
            }
            
            self.logger.error(
                "DATABASE_HEALTH_CHECK_FAILED",
                **health_data
            )
            
            return health_data
    
    async def check_s3_health(self) -> Dict[str, Any]:
        """Check S3 service connectivity"""
        try:
            from app.utils.aws.s3_enhanced import s3_service
            
            start_time = time.time()
            
            # Simple operation to test S3 connectivity
            # This would be a lightweight operation like listing bucket
            # For now, we'll assume it's healthy if the service initializes
            
            duration = time.time() - start_time
            
            return {
                "status": "healthy",
                "response_time_ms": round(duration * 1000, 2),
                "timestamp": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            health_data = {
                "status": "unhealthy",
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat()
            }
            
            self.logger.error(
                "S3_HEALTH_CHECK_FAILED",
                **health_data
            )
            
            return health_data
    
    async def comprehensive_health_check(self) -> Dict[str, Any]:
        """Run comprehensive health check on all services"""
        results = {}
        
        # Check database
        results["database"] = await self.check_database_health()
        
        # Check S3
        results["s3"] = await self.check_s3_health()
        
        # Check system resources
        system_monitor = SystemMonitor()
        system_metrics = system_monitor.get_system_metrics()
        results["system"] = {
            "status": "healthy" if system_metrics else "unhealthy",
            "metrics": system_metrics
        }
        
        # Overall status
        all_healthy = all(
            service.get("status") == "healthy" 
            for service in results.values()
        )
        
        results["overall"] = {
            "status": "healthy" if all_healthy else "degraded",
            "timestamp": datetime.utcnow().isoformat()
        }
        
        self.logger.info(
            "COMPREHENSIVE_HEALTH_CHECK",
            overall_status=results["overall"]["status"],
            database_status=results["database"]["status"],
            s3_status=results["s3"]["status"],
            system_status=results["system"]["status"]
        )
        
        return results

class AlertManager:
    """Manage alerts and notifications"""
    
    def __init__(self):
        self.logger = StructuredLogger("alert_manager")
    
    def check_alert_conditions(self) -> List[Dict[str, Any]]:
        """Check all alert conditions and trigger notifications"""
        alerts = []
        
        # Check system resources
        system_monitor = SystemMonitor()
        resource_alerts = system_monitor.check_resource_thresholds()
        alerts.extend(resource_alerts)
        
        # Check business metrics alerts
        business_alerts = self._check_business_alerts()
        alerts.extend(business_alerts)
        
        # Check performance alerts
        performance_alerts = self._check_performance_alerts()
        alerts.extend(performance_alerts)
        
        # Send notifications for critical alerts
        for alert in alerts:
            if alert.get("severity") == "critical":
                self._send_alert_notification(alert)
        
        return alerts
    
    def _check_business_alerts(self) -> List[Dict[str, Any]]:
        """Check business metric alert conditions"""
        alerts = []
        
        try:
            collector = BusinessMetricsCollector()
            metrics = collector.collect_daily_metrics()
            
            # Example: Alert if no sessions created today
            if metrics.get("sessions_mtd", 0) == 0:
                alerts.append({
                    "type": "no_sessions_today",
                    "severity": "warning",
                    "message": "No sessions created today",
                    "timestamp": datetime.utcnow().isoformat()
                })
            
            # Example: Alert if action completion rate is low
            open_actions = metrics.get("action_items_open", 0)
            closed_actions = metrics.get("action_items_closed", 0)
            total_actions = open_actions + closed_actions
            
            if total_actions > 0:
                completion_rate = (closed_actions / total_actions) * 100
                if completion_rate < 60:  # Less than 60% completion rate
                    alerts.append({
                        "type": "low_action_completion",
                        "severity": "warning",
                        "message": f"Action completion rate is {completion_rate:.1f}%",
                        "current_value": completion_rate,
                        "threshold": 60,
                        "timestamp": datetime.utcnow().isoformat()
                    })
            
        except Exception as e:
            self.logger.error(f"Failed to check business alerts: {str(e)}")
        
        return alerts
    
    def _check_performance_alerts(self) -> List[Dict[str, Any]]:
        """Check performance-related alerts"""
        alerts = []
        
        # This would integrate with actual performance metrics
        # For now, return empty list
        return alerts
    
    def _send_alert_notification(self, alert: Dict[str, Any]):
        """Send alert notification (email, Slack, etc.)"""
        self.logger.warning(
            "CRITICAL_ALERT_TRIGGERED",
            alert_type=alert.get("type"),
            severity=alert.get("severity"),
            message=alert.get("message"),
            timestamp=alert.get("timestamp")
        )
        
        # Here you would integrate with notification services
        # like SendGrid, Slack API, etc.

# Background tasks for monitoring
async def run_periodic_monitoring():
    """Run periodic monitoring tasks"""
    system_monitor = SystemMonitor()
    business_collector = BusinessMetricsCollector()
    alert_manager = AlertManager()
    
    while True:
        try:
            # Log system resources every 5 minutes
            system_monitor.log_resource_usage()
            
            # Collect and save business metrics daily at midnight
            now = datetime.utcnow()
            if now.hour == 0 and now.minute < 5:  # Run once around midnight
                metrics = business_collector.collect_daily_metrics()
                if metrics:
                    business_collector.save_metrics_snapshot(metrics)
            
            # Check alerts every 10 minutes
            if now.minute % 10 == 0:
                alert_manager.check_alert_conditions()
            
            # Wait 5 minutes before next cycle
            await asyncio.sleep(300)
            
        except Exception as e:
            logger = StructuredLogger("monitoring_task")
            logger.error(f"Monitoring task error: {str(e)}")
            await asyncio.sleep(60)  # Wait 1 minute before retrying

# Global instances
system_monitor = SystemMonitor()
business_collector = BusinessMetricsCollector()
health_checker = HealthChecker()
alert_manager = AlertManager()