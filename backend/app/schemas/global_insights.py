"""
Schemas for Global Insights API
"""

from typing import List, Literal, Optional
from pydantic import BaseModel, Field
from datetime import datetime


# Enums
InsightType = Literal["problem", "proposal"]
PillarType = Literal["access_to_capital", "ecosystem_support", "wellbeing_recognition"]


# Supporting structures
class RegionBreakdown(BaseModel):
    region: str
    count: int


class YearBreakdown(BaseModel):
    year: int
    count: int


class StakeholderBreakdown(BaseModel):
    name: str
    count: int


class Breakdowns(BaseModel):
    by_region: List[RegionBreakdown] = []
    by_year: List[YearBreakdown] = []
    by_stakeholder: List[StakeholderBreakdown] = []


class Citation(BaseModel):
    cite_id: str
    quote: str
    speaker: Optional[str] = None
    timestamp: Optional[str] = None
    context: str


class DocEvidence(BaseModel):
    doc_id: str
    doc_title: str
    uploader: str
    date: str
    citations: List[Citation] = []


# LLM Structured Output for Comparison
class ComparisonDecision(BaseModel):
    """
    Structured output from LLM when comparing a new insight against an existing one
    """
    is_similar: bool = Field(
        description="True if the new insight is semantically similar to the existing one (same core meaning)"
    )
    confidence: float = Field(
        description="Confidence score between 0.0 and 1.0",
        ge=0.0,
        le=1.0
    )
    reasoning: str = Field(
        description="Brief explanation of why they are similar or different"
    )
    suggested_canonical: Optional[str] = Field(
        default=None,
        description="If similar, suggest the best canonical text (can be existing, new, or a merge)"
    )


# CRUD Schemas
class GlobalInsightCreate(BaseModel):
    canonical_text: str = Field(min_length=10, max_length=500)
    type: InsightType
    pillar: PillarType
    count: int = 1
    weighted_count: float = 1.0
    aliases: List[str] = []
    supporting_docs: List[DocEvidence] = []
    breakdowns: Breakdowns = Breakdowns()


class GlobalInsightUpdate(BaseModel):
    canonical_text: Optional[str] = None
    type: Optional[InsightType] = None
    pillar: Optional[PillarType] = None
    aliases: Optional[List[str]] = None
    supporting_docs: Optional[List[DocEvidence]] = None
    breakdowns: Optional[Breakdowns] = None


class GlobalInsightResponse(BaseModel):
    id: str
    canonical_text: str
    type: InsightType
    pillar: PillarType
    count: int
    weighted_count: float
    last_seen: str
    aliases_count: int
    aliases: List[str]
    supporting_docs: List[DocEvidence]
    breakdowns: Breakdowns
    created_at: str
    updated_at: Optional[str] = None

    class Config:
        from_attributes = True


class GlobalInsightList(BaseModel):
    insights: List[GlobalInsightResponse]
    total: int
    page: int
    per_page: int
    has_next: bool
    has_prev: bool


# Pillar-grouped response for frontend
class PillarInsights(BaseModel):
    pillar: PillarType
    problems: List[GlobalInsightResponse]
    proposals: List[GlobalInsightResponse]


class PillarInsightsResponse(BaseModel):
    pillars: List[PillarInsights]


# Internal processing schemas
class NewInsightInput(BaseModel):
    """Input for processing a new insight from a document"""
    text: str
    type: InsightType
    pillar: PillarType
    doc_id: str
    doc_title: str
    uploader: str
    date: str
    citations: List[Citation] = []
    region: Optional[str] = None
    stakeholder: Optional[str] = None
