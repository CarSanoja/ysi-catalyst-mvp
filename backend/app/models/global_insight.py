from sqlalchemy import Column, Integer, String, Text, DateTime, Float, JSON
from sqlalchemy.sql import func
from app.db.base_class import Base


class GlobalInsight(Base):
    """
    Aggregated insights (problems/proposals) across all documents
    Tracks canonical versions, aliases, and supporting evidence
    """
    __tablename__ = "global_insights"

    id = Column(Integer, primary_key=True, index=True)

    # Core fields
    canonical_text = Column(Text, nullable=False)  # The main/canonical version of this insight
    type = Column(String(50), nullable=False, index=True)  # 'problem' or 'proposal'
    pillar = Column(String(100), nullable=False, index=True)  # YSI pillar category

    # Metrics
    count = Column(Integer, default=1)  # Number of distinct documents mentioning this
    weighted_count = Column(Float, default=1.0)  # Time-decay weighted score (recent mentions weigh more)
    last_seen = Column(DateTime(timezone=True), server_default=func.now())  # Last time this was mentioned

    # Aliases and variations
    aliases_count = Column(Integer, default=0)  # Number of alternative phrasings found
    aliases = Column(JSON, default=list)  # Array of alternative phrasings

    # Supporting evidence (array of doc evidence objects)
    supporting_docs = Column(JSON, default=list)  # Array of {doc_id, doc_title, uploader, date, citations[]}

    # Breakdowns for analysis
    breakdowns = Column(JSON, default=dict)  # {by_region: [], by_year: [], by_stakeholder: []}

    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<GlobalInsight(id={self.id}, type={self.type}, pillar={self.pillar})>"

    def to_dict(self):
        """Convert to dictionary for API responses"""
        return {
            "id": str(self.id),
            "canonical_text": self.canonical_text,
            "type": self.type,
            "pillar": self.pillar,
            "count": self.count,
            "weighted_count": self.weighted_count,
            "last_seen": self.last_seen.isoformat() if self.last_seen else None,
            "aliases_count": self.aliases_count,
            "aliases": self.aliases or [],
            "supporting_docs": self.supporting_docs or [],
            "breakdowns": self.breakdowns or {
                "by_region": [],
                "by_year": [],
                "by_stakeholder": []
            },
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }
