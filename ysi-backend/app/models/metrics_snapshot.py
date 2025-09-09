from sqlalchemy import Column, Integer, Date, DateTime, JSON, Float
from sqlalchemy.sql import func
from app.db.base_class import Base

class MetricsSnapshot(Base):
    __tablename__ = "metrics_snapshot"
    
    id = Column(Integer, primary_key=True, index=True)
    snapshot_date = Column(Date, nullable=False, unique=True)
    
    # Core metrics
    sessions_mtd = Column(Integer, default=0)
    voices_represented = Column(Integer, default=0)
    unique_leaders = Column(Integer, default=0)
    regions_count = Column(Integer, default=0)
    
    # Pillar coverage (stored as percentages)
    pillar_coverage = Column(JSON, default=lambda: {"capital": 0, "recognition": 0, "wellbeing": 0})
    
    # Representation balance
    representation_balance = Column(JSON, default=lambda: {
        "gender": {"male": 0, "female": 0},
        "regional": {}
    })
    
    # Action items tracking
    action_items_open = Column(Integer, default=0)
    action_items_closed = Column(Integer, default=0)
    
    # Performance metrics
    avg_time_to_summary = Column(Float)  # in minutes
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    @property
    def completion_rate(self) -> float:
        """Calculate action items completion rate"""
        total = self.action_items_open + self.action_items_closed
        if total == 0:
            return 0.0
        return (self.action_items_closed / total) * 100