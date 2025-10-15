"""
Global Insights Aggregation Task
Processes pillar analysis and updates global insights database
"""

import logging
from typing import Dict, Any, Optional
from datetime import datetime
from sqlalchemy.orm import Session

from app.models.global_insight import GlobalInsight
from app.schemas.global_insights import NewInsightInput, Citation
from app.utils.langraph.global_insights_agent import create_global_insights_agent

logger = logging.getLogger(__name__)

# Pillar normalization map - ensures we only have 3 canonical pillars
PILLAR_NORMALIZATION_MAP = {
    "access_to_capital": "access_to_capital",
    "ecosystem_support": "ecosystem_support",
    "mental_health": "wellbeing_recognition",
    "recognition": "wellbeing_recognition",
    "wellbeing_recognition": "wellbeing_recognition",  # Already normalized
}


async def process_global_insights_aggregation(
    job_id: int,
    pillar_analysis: dict,
    doc_metadata: dict,
    db: Session
):
    """
    Process pillar analysis and aggregate insights into GlobalInsight table

    Args:
        job_id: The text processing job ID
        pillar_analysis: The pillar_analysis dict from the extraction result
        doc_metadata: Document metadata (title, date, uploader, etc.)
        db: Database session
    """

    if not pillar_analysis:
        logger.info(f"No pillar analysis found for job {job_id}, skipping aggregation")
        return

    agent = create_global_insights_agent()

    # Process each pillar
    for pillar_key, pillar_data in pillar_analysis.items():
        if not isinstance(pillar_data, dict):
            continue

        # Normalize pillar name to canonical form
        normalized_pillar = PILLAR_NORMALIZATION_MAP.get(pillar_key, pillar_key)

        logger.debug(f"Processing pillar: {pillar_key} -> {normalized_pillar}")

        # Process problems (now with evidence structure)
        problems = pillar_data.get("problems", [])
        for problem_item in problems:
            # Handle both old format (string) and new format (dict with evidence)
            if isinstance(problem_item, str):
                # Old format - just a string
                insight_text = problem_item
                supporting_quotes = []
            elif isinstance(problem_item, dict):
                # New format - dict with insight_text and supporting_quotes
                insight_text = problem_item.get("insight_text", "")
                supporting_quotes = problem_item.get("supporting_quotes", [])
            else:
                logger.warning(f"Unexpected problem format: {type(problem_item)}")
                continue

            if not insight_text or len(insight_text.strip()) < 10:
                continue

            await process_single_insight(
                agent=agent,
                insight_text=insight_text,
                supporting_quotes=supporting_quotes,
                insight_type="problem",
                pillar=normalized_pillar,
                doc_metadata=doc_metadata,
                job_id=job_id,
                db=db
            )

        # Process proposals (now with evidence structure)
        proposals = pillar_data.get("proposals", [])
        for proposal_item in proposals:
            # Handle both old format (string) and new format (dict with evidence)
            if isinstance(proposal_item, str):
                # Old format - just a string
                insight_text = proposal_item
                supporting_quotes = []
            elif isinstance(proposal_item, dict):
                # New format - dict with insight_text and supporting_quotes
                insight_text = proposal_item.get("insight_text", "")
                supporting_quotes = proposal_item.get("supporting_quotes", [])
            else:
                logger.warning(f"Unexpected proposal format: {type(proposal_item)}")
                continue

            if not insight_text or len(insight_text.strip()) < 10:
                continue

            await process_single_insight(
                agent=agent,
                insight_text=insight_text,
                supporting_quotes=supporting_quotes,
                insight_type="proposal",
                pillar=normalized_pillar,
                doc_metadata=doc_metadata,
                job_id=job_id,
                db=db
            )

    logger.info(f"Completed global insights aggregation for job {job_id}")


async def process_single_insight(
    agent,
    insight_text: str,
    supporting_quotes: list,
    insight_type: str,
    pillar: str,
    doc_metadata: dict,
    job_id: int,
    db: Session
):
    """
    Process a single insight (problem or proposal) with supporting evidence

    Args:
        supporting_quotes: List of exact quotes from the original document that support this insight
    """

    try:
        # Create citations from supporting quotes
        citations = []

        if supporting_quotes:
            # Use real quotes from the document
            for idx, quote in enumerate(supporting_quotes, 1):
                citations.append(
                    Citation(
                        cite_id=f"job_{job_id}_{insight_type}_{idx}",
                        quote=quote,  # Exact quote from original document
                        context=f"Supporting evidence from {pillar} {insight_type} analysis"
                    )
                )
        else:
            # Fallback for old format without quotes
            citations.append(
                Citation(
                    cite_id=f"job_{job_id}_{insight_type}",
                    quote=insight_text,
                    context=f"Extracted from {pillar} {insight_type} analysis (no original quote available)"
                )
            )

        # Create NewInsightInput
        new_insight = NewInsightInput(
            text=insight_text,
            type=insight_type,
            pillar=pillar,
            doc_id=str(job_id),
            doc_title=doc_metadata.get("title", f"Document {job_id}"),
            uploader=doc_metadata.get("uploader", "System"),
            date=doc_metadata.get("date", datetime.now().isoformat()),
            citations=citations,
            region=doc_metadata.get("region"),
            stakeholder=doc_metadata.get("stakeholder")
        )

        # Get existing insights for this pillar and type
        existing_insights = db.query(GlobalInsight).filter(
            GlobalInsight.pillar == pillar,
            GlobalInsight.type == insight_type
        ).all()

        # Convert to dicts
        existing_dicts = [insight.to_dict() for insight in existing_insights]

        # Find matching insight
        match_result = agent.find_matching_insight(
            new_insight=new_insight,
            existing_insights=existing_dicts,
            similarity_threshold=0.7
        )

        if match_result:
            # Update existing insight
            existing_insight_dict = match_result["insight"]
            decision = match_result["decision"]

            logger.info(
                f"Merging insight into existing ID {existing_insight_dict['id']}: "
                f"{decision.reasoning} (confidence: {decision.confidence})"
            )

            # Get the database record
            db_insight = db.query(GlobalInsight).filter(
                GlobalInsight.id == int(existing_insight_dict['id'])
            ).first()

            if db_insight:
                # Merge the insight
                updated_data = agent.merge_insight(
                    existing_insight=existing_insight_dict,
                    new_insight=new_insight,
                    decision=decision
                )

                # Update database record
                db_insight.canonical_text = updated_data["canonical_text"]
                db_insight.count = updated_data["count"]
                db_insight.weighted_count = updated_data["weighted_count"]
                db_insight.last_seen = datetime.fromisoformat(updated_data["last_seen"].replace("Z", "+00:00"))
                db_insight.aliases = updated_data["aliases"]
                db_insight.aliases_count = updated_data["aliases_count"]
                db_insight.supporting_docs = updated_data["supporting_docs"]
                db_insight.breakdowns = updated_data["breakdowns"]

                db.commit()

        else:
            # Create new insight
            logger.info(f"Creating new global insight: {insight_text[:50]}...")

            new_insight_data = agent.create_new_insight(new_insight)

            db_insight = GlobalInsight(
                canonical_text=new_insight_data["canonical_text"],
                type=new_insight_data["type"],
                pillar=new_insight_data["pillar"],
                count=new_insight_data["count"],
                weighted_count=new_insight_data["weighted_count"],
                last_seen=datetime.fromisoformat(new_insight_data["last_seen"].replace("Z", "+00:00")),
                aliases=new_insight_data["aliases"],
                aliases_count=new_insight_data["aliases_count"],
                supporting_docs=new_insight_data["supporting_docs"],
                breakdowns=new_insight_data["breakdowns"]
            )

            db.add(db_insight)
            db.commit()

    except Exception as e:
        logger.error(f"Error processing insight '{insight_text[:50]}...': {str(e)}")
        db.rollback()
        # Continue processing other insights
