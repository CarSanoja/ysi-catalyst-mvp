from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base_class import Base

class Stakeholder(Base):
    """
    Dedicated Stakeholder model for stakeholder management
    """
    id = Column(Integer, primary_key=True, index=True)

    # Basic info
    name = Column(String(255), nullable=False, index=True)
    role = Column(String(255), nullable=False)  # Title/Position
    organization = Column(String(255), nullable=False)
    type = Column(String(50), nullable=False)  # funder, implementer, mentor, policymaker, researcher, community_leader
    region = Column(String(255), nullable=False)  # Country/Region
    email = Column(String(255), nullable=False, index=True)
    phone = Column(String(50))
    bio = Column(Text, nullable=False)

    # Extended fields
    tags = Column(JSON, default=lambda: [])  # List of tags
    links = Column(JSON, default=lambda: [])  # List of {label, url} objects

    # Metadata
    created_by = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    notes = relationship("StakeholderNote", back_populates="stakeholder", cascade="all, delete-orphan")