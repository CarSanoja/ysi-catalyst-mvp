"""
Global Insights Aggregation Agent
Uses LLM prompts with structured outputs to compare and aggregate insights
"""

import os
import logging
from typing import List, Optional
from datetime import datetime
from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, HumanMessage
from langchain_core.output_parsers import PydanticOutputParser
from app.schemas.global_insights import (
    ComparisonDecision, NewInsightInput, DocEvidence, Citation,
    RegionBreakdown, YearBreakdown, StakeholderBreakdown, Breakdowns
)

logger = logging.getLogger(__name__)


class GlobalInsightsAggregationAgent:
    """
    Agent that compares new insights against existing ones and decides whether to merge or create new
    """

    def __init__(self):
        self.model = ChatOpenAI(
            model="gpt-4o-mini",
            temperature=0.1,
            api_key=os.getenv("OPENAI_API_KEY")
        )
        self.parser = PydanticOutputParser(pydantic_object=ComparisonDecision)

    def compare_insights(self, new_text: str, existing_text: str, insight_type: str) -> ComparisonDecision:
        """
        Use LLM to compare two insights and determine if they are semantically similar

        Args:
            new_text: The newly extracted insight text
            existing_text: An existing canonical insight text
            insight_type: 'problem' or 'proposal'

        Returns:
            ComparisonDecision with similarity verdict
        """

        system_prompt = f"""You are an expert analyst comparing insights from Global Shapers community discussions.

Your task is to determine if two {insight_type}s are semantically similar - meaning they refer to the SAME core issue or solution, even if worded differently.

IMPORTANT GUIDELINES:
1. Focus on the CORE MEANING, not exact wording
2. Two {insight_type}s are similar if they describe the same fundamental concept
3. Minor wording differences, synonyms, or phrasing variations should be considered SIMILAR
4. Only mark as DIFFERENT if they address truly distinct issues/solutions
5. When similar, suggest the clearest, most comprehensive canonical text

Examples of SIMILAR {insight_type}s:
- "Youth lack seed funding" vs "Young entrepreneurs cannot access early-stage capital"
- "Grant applications too complex" vs "Application processes overwhelming for first-timers"

Examples of DIFFERENT {insight_type}s:
- "Lack of mentorship" vs "Insufficient funding" (different core issues)
- "Create micro-grants" vs "Simplify application forms" (different solutions)

{self.parser.get_format_instructions()}"""

        human_prompt = f"""Compare these two {insight_type}s:

EXISTING {insight_type.upper()}: "{existing_text}"

NEW {insight_type.upper()}: "{new_text}"

Are these semantically similar (same core meaning)?"""

        messages = [
            SystemMessage(content=system_prompt),
            HumanMessage(content=human_prompt)
        ]

        try:
            response = self.model.invoke(messages)
            decision = self.parser.parse(response.content)
            return decision
        except Exception as e:
            logger.error(f"Error comparing insights: {str(e)}")
            # Fallback: assume not similar
            return ComparisonDecision(
                is_similar=False,
                confidence=0.5,
                reasoning=f"Error during comparison: {str(e)}",
                suggested_canonical=new_text
            )

    def find_matching_insight(
        self,
        new_insight: NewInsightInput,
        existing_insights: List[dict],
        similarity_threshold: float = 0.7
    ) -> Optional[dict]:
        """
        Find if the new insight matches any existing insight

        Args:
            new_insight: The new insight to match
            existing_insights: List of existing GlobalInsight records (as dicts)
            similarity_threshold: Minimum confidence to consider a match

        Returns:
            Matching insight dict or None
        """

        best_match = None
        best_confidence = 0.0

        for existing in existing_insights:
            # Compare against canonical text
            decision = self.compare_insights(
                new_text=new_insight.text,
                existing_text=existing["canonical_text"],
                insight_type=new_insight.type
            )

            if decision.is_similar and decision.confidence > best_confidence:
                best_confidence = decision.confidence
                best_match = {
                    "insight": existing,
                    "decision": decision
                }

        # Return match only if confidence exceeds threshold
        if best_match and best_confidence >= similarity_threshold:
            return best_match

        return None

    def extract_citations_from_pillar_analysis(
        self,
        pillar_analysis: dict,
        pillar: str,
        insight_type: str,
        insight_text: str
    ) -> List[Citation]:
        """
        Extract citation information from the pillar analysis
        Since we don't have direct citations in pillar analysis, we create a summary citation
        """

        # For now, create a general citation referencing the pillar analysis
        # In future iterations, we could extract more detailed citations
        return [
            Citation(
                cite_id=f"pillar_{pillar}_{insight_type}",
                quote=insight_text,
                context=f"Extracted from {pillar} {insight_type} analysis"
            )
        ]

    def calculate_time_decay_weight(
        self,
        base_count: int,
        last_seen: datetime,
        new_date: datetime
    ) -> float:
        """
        Calculate time-decay weighted count
        Recent mentions contribute more weight

        Formula: base_count + (1.0 if within 30 days, 0.7 if within 90 days, 0.5 if within 365 days, 0.3 otherwise)
        """

        days_diff = (new_date - last_seen).days

        if days_diff <= 30:
            weight = 1.0
        elif days_diff <= 90:
            weight = 0.7
        elif days_diff <= 365:
            weight = 0.5
        else:
            weight = 0.3

        return base_count + weight

    def update_breakdowns(
        self,
        current_breakdowns: dict,
        region: Optional[str],
        year: int,
        stakeholder: Optional[str]
    ) -> Breakdowns:
        """
        Update breakdown statistics with new data
        """

        breakdowns = Breakdowns(**current_breakdowns) if current_breakdowns else Breakdowns()

        # Update region breakdown
        if region:
            region_found = False
            for rb in breakdowns.by_region:
                if rb.region == region:
                    rb.count += 1
                    region_found = True
                    break
            if not region_found:
                breakdowns.by_region.append(RegionBreakdown(region=region, count=1))

        # Update year breakdown
        year_found = False
        for yb in breakdowns.by_year:
            if yb.year == year:
                yb.count += 1
                year_found = True
                break
        if not year_found:
            breakdowns.by_year.append(YearBreakdown(year=year, count=1))

        # Update stakeholder breakdown
        if stakeholder:
            stakeholder_found = False
            for sb in breakdowns.by_stakeholder:
                if sb.name == stakeholder:
                    sb.count += 1
                    stakeholder_found = True
                    break
            if not stakeholder_found:
                breakdowns.by_stakeholder.append(StakeholderBreakdown(name=stakeholder, count=1))

        return breakdowns

    def merge_insight(
        self,
        existing_insight: dict,
        new_insight: NewInsightInput,
        decision: ComparisonDecision
    ) -> dict:
        """
        Merge a new insight into an existing one

        Returns:
            Updated insight data
        """

        # Prepare document evidence
        new_doc_evidence = DocEvidence(
            doc_id=new_insight.doc_id,
            doc_title=new_insight.doc_title,
            uploader=new_insight.uploader,
            date=new_insight.date,
            citations=new_insight.citations
        )

        # Check if this document is already in supporting docs
        existing_doc_ids = [doc["doc_id"] for doc in existing_insight.get("supporting_docs", [])]

        if new_insight.doc_id not in existing_doc_ids:
            # Add to supporting docs
            supporting_docs = existing_insight.get("supporting_docs", [])
            supporting_docs.append(new_doc_evidence.model_dump())

            # Increment count
            new_count = existing_insight.get("count", 0) + 1

            # Update weighted count
            last_seen = datetime.fromisoformat(existing_insight["last_seen"].replace("Z", "+00:00"))
            new_date = datetime.fromisoformat(new_insight.date.replace("Z", "+00:00"))
            new_weighted_count = self.calculate_time_decay_weight(
                base_count=new_count,
                last_seen=last_seen,
                new_date=new_date
            )
        else:
            # Document already exists, just update the existing entry
            supporting_docs = existing_insight.get("supporting_docs", [])
            new_count = existing_insight.get("count", 1)
            new_weighted_count = existing_insight.get("weighted_count", 1.0)

        # Add as alias if it's a new phrasing
        aliases = existing_insight.get("aliases", [])
        if new_insight.text not in aliases and new_insight.text != existing_insight["canonical_text"]:
            aliases.append(new_insight.text)

        # Update canonical text if suggested
        canonical_text = decision.suggested_canonical or existing_insight["canonical_text"]

        # Update breakdowns
        year = datetime.fromisoformat(new_insight.date.replace("Z", "+00:00")).year
        updated_breakdowns = self.update_breakdowns(
            current_breakdowns=existing_insight.get("breakdowns", {}),
            region=new_insight.region,
            year=year,
            stakeholder=new_insight.stakeholder
        )

        return {
            "canonical_text": canonical_text,
            "count": new_count,
            "weighted_count": new_weighted_count,
            "last_seen": new_insight.date,
            "aliases": aliases,
            "aliases_count": len(aliases),
            "supporting_docs": supporting_docs,
            "breakdowns": updated_breakdowns.model_dump()
        }

    def create_new_insight(self, new_insight: NewInsightInput) -> dict:
        """
        Create a new global insight from scratch

        Returns:
            New insight data
        """

        # Prepare document evidence
        doc_evidence = DocEvidence(
            doc_id=new_insight.doc_id,
            doc_title=new_insight.doc_title,
            uploader=new_insight.uploader,
            date=new_insight.date,
            citations=new_insight.citations
        )

        # Initialize breakdowns
        year = datetime.fromisoformat(new_insight.date.replace("Z", "+00:00")).year
        breakdowns = self.update_breakdowns(
            current_breakdowns={},
            region=new_insight.region,
            year=year,
            stakeholder=new_insight.stakeholder
        )

        return {
            "canonical_text": new_insight.text,
            "type": new_insight.type,
            "pillar": new_insight.pillar,
            "count": 1,
            "weighted_count": 1.0,
            "last_seen": new_insight.date,
            "aliases": [],
            "aliases_count": 0,
            "supporting_docs": [doc_evidence.model_dump()],
            "breakdowns": breakdowns.model_dump()
        }


# Factory function
def create_global_insights_agent() -> GlobalInsightsAggregationAgent:
    """Create an instance of the global insights aggregation agent"""
    return GlobalInsightsAggregationAgent()
