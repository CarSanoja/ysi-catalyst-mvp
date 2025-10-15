#!/usr/bin/env python3
"""Create all database tables for YSI Backend"""

from sqlalchemy import create_engine
from app.db.base_class import Base
from app.core.config import settings

# Import all models to register them
from app.models import (
    User, Organization, Session, Participant,
    Insight, Action, Theme, ActivityLog,
    CaptureLane, CharterDocument, Citation,
    Interaction, KnowledgeQuery, MetricsSnapshot,
    NextStep, ProcessedFile, Quote, TextEmbedding,
    GlobalInsight, TextProcessingJob, Stakeholder,
    StakeholderNote, ChangeLog
)

def create_tables():
    """Create all tables in the database"""
    print(f"Creating tables using: {settings.DATABASE_URL}")

    # Create engine
    engine = create_engine(settings.DATABASE_URL, echo=True)

    # Create all tables
    try:
        Base.metadata.create_all(bind=engine)
        print("✅ All tables created successfully!")
    except Exception as e:
        print(f"❌ Error creating tables: {e}")
        raise

if __name__ == "__main__":
    create_tables()