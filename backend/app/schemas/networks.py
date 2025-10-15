"""
Schemas for network analysis using LangGraph
Specialized for stakeholder and relationship extraction
"""

from typing import List, Literal, Optional
from pydantic import BaseModel, Field


class StakeholderSchema(BaseModel):
    """Individual stakeholder in the network"""

    name: str = Field(
        description="Full name of the person or organization",
        min_length=2,
        max_length=100
    )

    type: Literal[
        "funder", "mentor", "implementer", "beneficiary",
        "policymaker", "organization", "researcher", "community_leader"
    ] = Field(
        description="Type of stakeholder based on their role in the YSI ecosystem"
    )

    location: Optional[str] = Field(
        description="Geographic location if mentioned in the text",
        max_length=100,
        default=None
    )

    context: str = Field(
        description="Brief context about this stakeholder from the text",
        max_length=200
    )

    mentioned_frequency: int = Field(
        description="Number of times this stakeholder is mentioned",
        ge=1,
        default=1
    )


class RelationshipSchema(BaseModel):
    """Relationship between two stakeholders"""

    from_stakeholder: str = Field(
        description="Name of the source stakeholder in the relationship"
    )

    to_stakeholder: str = Field(
        description="Name of the target stakeholder in the relationship"
    )

    type: Literal[
        "collaboration", "funding", "mentorship", "policy",
        "conflict", "partnership", "advisory", "support"
    ] = Field(
        description="Type of relationship between stakeholders"
    )

    strength: Literal["weak", "moderate", "strong"] = Field(
        description="Strength of the relationship based on evidence in text"
    )

    description: str = Field(
        description="Description of the relationship",
        max_length=150
    )

    evidence: str = Field(
        description="Direct quote or reference from the text supporting this relationship",
        max_length=300
    )


class TopicNetworkSchema(BaseModel):
    """Network connections around specific topics"""

    topic: str = Field(
        description="Main topic or theme",
        max_length=100
    )

    connected_stakeholders: List[str] = Field(
        description="Stakeholders connected to this topic",
        max_items=10,
        default=[]
    )

    pillar_alignment: Literal[
        "access_to_capital", "ecosystem_support", "mental_health",
        "recognition", "general"
    ] = Field(
        description="YSI pillar this topic network aligns with"
    )

    centrality: Literal["high", "medium", "low"] = Field(
        description="How central this topic is to the overall discussion"
    )


class GeographicClusterSchema(BaseModel):
    """Geographic clustering of stakeholders and topics"""

    region: str = Field(
        description="Geographic region or location",
        max_length=100
    )

    stakeholders: List[str] = Field(
        description="Stakeholders associated with this region",
        max_items=15,
        default=[]
    )

    topics: List[str] = Field(
        description="Topics discussed in relation to this region",
        max_items=10,
        default=[]
    )


class NetworkAnalysisSchema(BaseModel):
    """
    Complete network analysis output schema
    Specialized for extracting stakeholder networks and relationships
    """

    stakeholders: List[StakeholderSchema] = Field(
        description="List of all stakeholders identified in the text",
        max_items=20,
        default=[]
    )

    relationships: List[RelationshipSchema] = Field(
        description="List of relationships between stakeholders explicitly mentioned",
        max_items=25,
        default=[]
    )

    topic_networks: List[TopicNetworkSchema] = Field(
        description="Networks formed around specific topics or themes",
        max_items=10,
        default=[]
    )

    geographic_clusters: List[GeographicClusterSchema] = Field(
        description="Geographic clustering of stakeholders and activities",
        max_items=8,
        default=[]
    )

    network_density: Literal["sparse", "moderate", "dense"] = Field(
        description="Overall density of the network based on connections mentioned",
        default="sparse"
    )

    primary_connectors: List[str] = Field(
        description="Stakeholders that appear to be central connectors in the network",
        max_items=5,
        default=[]
    )

    class Config:
        json_schema_extra = {
            "example": {
                "stakeholders": [
                    {
                        "name": "Amara Chen",
                        "type": "implementer",
                        "location": "Singapore",
                        "context": "Young entrepreneur working on climate solutions",
                        "mentioned_frequency": 2
                    },
                    {
                        "name": "Global Climate Fund",
                        "type": "funder",
                        "location": None,
                        "context": "International funding organization for climate initiatives",
                        "mentioned_frequency": 1
                    }
                ],
                "relationships": [
                    {
                        "from_stakeholder": "Amara Chen",
                        "to_stakeholder": "Global Climate Fund",
                        "type": "funding",
                        "strength": "moderate",
                        "description": "Received seed funding for climate project",
                        "evidence": "Amara Chen received initial funding from Global Climate Fund for her renewable energy startup"
                    }
                ],
                "topic_networks": [
                    {
                        "topic": "Climate Innovation",
                        "connected_stakeholders": ["Amara Chen", "Global Climate Fund"],
                        "pillar_alignment": "access_to_capital",
                        "centrality": "high"
                    }
                ],
                "geographic_clusters": [
                    {
                        "region": "Southeast Asia",
                        "stakeholders": ["Amara Chen"],
                        "topics": ["Climate Innovation", "Renewable Energy"]
                    }
                ],
                "network_density": "sparse",
                "primary_connectors": ["Amara Chen"]
            }
        }


class NetworkExtractionRequest(BaseModel):
    """Request schema for network extraction"""

    text: str = Field(
        description="The text content to analyze for network relationships",
        min_length=10,
        max_length=50000
    )

    context: str = Field(
        description="Additional context about the text source",
        default="",
        max_length=1000
    )


class NetworkExtractionResponse(BaseModel):
    """Response schema for network extraction"""

    network_analysis: NetworkAnalysisSchema
    processing_metadata: dict = Field(
        description="Metadata about the network processing",
        default={}
    )