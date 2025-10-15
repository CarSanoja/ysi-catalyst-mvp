"""
Schemas for insight extraction using LangGraph
"""

from typing import List, Literal, Dict
from pydantic import BaseModel, Field


class ExtractedInsightSchema(BaseModel):
    """
    Structured output schema for LangGraph insight extraction
    This matches the frontend ExtractedInsight interface
    """

    main_theme: str = Field(
        description="The primary theme or topic discussed in the text. Should be concise and descriptive.",
        min_length=3,
        max_length=200
    )

    subthemes: List[str] = Field(
        description="Secondary themes, subtopics, or categories found in the text. Maximum 10 items.",
        max_items=10,
        default=[]
    )

    key_actors: List[str] = Field(
        description="People, organizations, or entities mentioned as important actors. Include names and organizations.",
        max_items=15,
        default=[]
    )

    general_perception: Literal["positive", "neutral", "negative"] = Field(
        description="Overall sentiment or perception expressed in the text"
    )

    proposed_actions: List[str] = Field(
        description="Concrete actions, solutions, or recommendations mentioned or implied in the text.",
        max_items=10,
        default=[]
    )

    challenges: List[str] = Field(
        description="Problems, obstacles, or challenges identified in the text.",
        max_items=10,
        default=[]
    )

    opportunities: List[str] = Field(
        description="Opportunities, possibilities, or positive aspects mentioned in the text.",
        max_items=10,
        default=[]
    )


class PillarInsightWithEvidence(BaseModel):
    """
    A single insight (problem or proposal) with supporting evidence from the source document
    """
    insight_text: str = Field(
        description="The problem or proposal statement (10-40 words)",
        min_length=10,
        max_length=300
    )

    supporting_quotes: List[str] = Field(
        description="1-3 exact quotes (verbatim) from the source document that support this insight. Must be word-for-word from the original text.",
        min_items=1,
        max_items=3,
        default=[]
    )

    context: str = Field(
        description="Optional brief context about where/how this insight emerged in the document",
        default="",
        max_length=200
    )


class YSIPillarAnalysis(BaseModel):
    """Analysis structure for each YSI pillar with evidence-backed insights"""

    problems: List[PillarInsightWithEvidence] = Field(
        description="Detailed problems and challenges specific to this pillar, each with supporting quotes from the source text.",
        max_items=8,
        default=[]
    )

    proposals: List[PillarInsightWithEvidence] = Field(
        description="Specific, actionable solutions and recommendations for this pillar, each with supporting quotes from the source text.",
        max_items=8,
        default=[]
    )


class ExtractedInsightSchemaExpanded(BaseModel):
    """
    Extended schema that includes detailed YSI pillar analysis
    while maintaining backward compatibility with existing structure
    """

    # Existing fields for backward compatibility
    main_theme: str = Field(
        description="The primary theme or topic discussed in the text. Should be concise and descriptive.",
        min_length=3,
        max_length=200
    )

    subthemes: List[str] = Field(
        description="Secondary themes, subtopics, or categories found in the text. Maximum 10 items.",
        max_items=10,
        default=[]
    )

    key_actors: List[str] = Field(
        description="People, organizations, or entities mentioned as important actors. Include names and organizations.",
        max_items=15,
        default=[]
    )

    general_perception: Literal["positive", "neutral", "negative"] = Field(
        description="Overall sentiment or perception expressed in the text"
    )

    proposed_actions: List[str] = Field(
        description="Concrete actions, solutions, or recommendations mentioned or implied in the text.",
        max_items=10,
        default=[]
    )

    challenges: List[str] = Field(
        description="Problems, obstacles, or challenges identified in the text.",
        max_items=10,
        default=[]
    )

    opportunities: List[str] = Field(
        description="Opportunities, possibilities, or positive aspects mentioned in the text.",
        max_items=10,
        default=[]
    )

    # New expanded analysis by YSI pillars with evidence-backed insights
    pillar_analysis: Dict[str, YSIPillarAnalysis] = Field(
        description="Detailed analysis categorized by YSI pillars: access_to_capital, ecosystem_support, mental_health, recognition. Each pillar contains problems and proposals with supporting quotes from the source text.",
        default={}
    )

    # Network analysis from specialized agent
    network_analysis: dict = Field(
        description="Stakeholder network analysis including relationships and topic networks",
        default={}
    )

    class Config:
        json_schema_extra = {
            "example": {
                "main_theme": "Youth Innovation Funding Accessibility",
                "subthemes": [
                    "Grant application complexity",
                    "Mentorship gaps",
                    "Regional disparities"
                ],
                "key_actors": [
                    "Amara Chen",
                    "Priya Sharma",
                    "Global Shapers Hub"
                ],
                "general_perception": "positive",
                "proposed_actions": [
                    "Simplify grant processes with standardized templates",
                    "Create regional mentorship networks",
                    "Develop multilingual application resources"
                ],
                "challenges": [
                    "Language barriers in funding applications",
                    "Limited access to experienced mentors",
                    "Inconsistent eligibility criteria across regions"
                ],
                "opportunities": [
                    "Digital platform for centralized funding information",
                    "Cross-regional knowledge sharing",
                    "Partnership with educational institutions"
                ],
                "pillar_analysis": {
                    "access_to_capital": {
                        "problems": [
                            {
                                "insight_text": "Gap in early, flexible startup capital; access shaped by geography and socioeconomic background.",
                                "supporting_quotes": [
                                    "Many young entrepreneurs in rural areas struggle to access even basic seed funding",
                                    "Geographic location and family wealth remain the strongest predictors of funding access"
                                ],
                                "context": "Mentioned by multiple participants from emerging markets"
                            },
                            {
                                "insight_text": "Inequitable pre-seed landscapes (EU/UK/US) and insider know-how/network effects that exclude younger founders.",
                                "supporting_quotes": [
                                    "You need to know someone who knows someone to even get a meeting with investors",
                                    "The pre-seed ecosystem is heavily concentrated in major tech hubs"
                                ],
                                "context": "Discussed in context of systemic barriers"
                            }
                        ],
                        "proposals": [
                            {
                                "insight_text": "Create risk-tolerant 'first cheque' instruments (micro-grants, recoverable grants, revenue-based advances, living stipends).",
                                "supporting_quotes": [
                                    "We need financial instruments that don't require traditional collateral or credit history"
                                ],
                                "context": "Proposed as solution to access barriers"
                            },
                            {
                                "insight_text": "Pair capital with non-financial support (coaching, navigation, connections) as a default bundle.",
                                "supporting_quotes": [
                                    "Money alone isn't enough - we need mentorship and networks too"
                                ],
                                "context": "Holistic support approach"
                            }
                        ]
                    },
                    "ecosystem_support": {
                        "problems": [
                            {
                                "insight_text": "Fragmented landscape with overlapping mandates and gaps—high navigation burden on founders.",
                                "supporting_quotes": [
                                    "There are dozens of support programs but no clear way to find the right one",
                                    "Many organizations offer similar services without coordinating"
                                ],
                                "context": "Systemic fragmentation"
                            }
                        ],
                        "proposals": [
                            {
                                "insight_text": "Map the ecosystem and maintain a public 'who does what' directory to reduce duplication.",
                                "supporting_quotes": [
                                    "We need a centralized directory of all support organizations and what they offer"
                                ],
                                "context": "Proposed ecosystem mapping solution"
                            }
                        ]
                    },
                    "mental_health": {
                        "problems": [
                            {
                                "insight_text": "Acute burnout ('Don't die' theme), compounded by loneliness and isolation.",
                                "supporting_quotes": [
                                    "I'm exhausted and feel completely alone in this journey",
                                    "The pressure to succeed is overwhelming and there's no one to talk to"
                                ],
                                "context": "Mental health crisis among founders"
                            }
                        ],
                        "proposals": [
                            {
                                "insight_text": "Embed wellbeing by default: coaching, counseling vouchers, peer circles, protected time.",
                                "supporting_quotes": [
                                    "Mental health support should be included in every funding package"
                                ],
                                "context": "Integrated wellbeing approach"
                            }
                        ]
                    },
                    "recognition": {
                        "problems": [
                            {
                                "insight_text": "Tokenistic visibility; legitimacy gaps for young leaders; hard to gain traction.",
                                "supporting_quotes": [
                                    "We get invited to speak but rarely given real decision-making power"
                                ],
                                "context": "Superficial recognition without empowerment"
                            }
                        ],
                        "proposals": [
                            {
                                "insight_text": "Shift to power-transferring recognition (decision-table access, procurement links, mentors, and capital pathways).",
                                "supporting_quotes": [
                                    "Recognition should come with actual seats at decision-making tables"
                                ],
                                "context": "Meaningful recognition proposal"
                            }
                        ]
                    }
                }
            }
        }


class InsightExtractionRequest(BaseModel):
    """Request schema for insight extraction"""

    text: str = Field(
        description="The text content to analyze and extract insights from",
        min_length=10,
        max_length=50000
    )

    context: str = Field(
        description="Additional context about the text (meeting type, source, etc.)",
        default="",
        max_length=1000
    )


class InsightExtractionResponse(BaseModel):
    """Response schema for insight extraction"""

    insights: ExtractedInsightSchema
    processing_metadata: dict = Field(
        description="Metadata about the processing (model used, tokens, etc.)",
        default={}
    )