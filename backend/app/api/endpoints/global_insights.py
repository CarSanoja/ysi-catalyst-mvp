"""
Global Insights API Endpoints
CRUD operations for aggregated insights
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from datetime import datetime

from app.db.session import get_db
from app.schemas.response import success_response, error_response
from app.schemas.global_insights import (
    GlobalInsightCreate,
    GlobalInsightUpdate,
    GlobalInsightResponse,
    GlobalInsightList,
    PillarInsights,
    PillarInsightsResponse,
    InsightType,
    PillarType
)
from app.models.global_insight import GlobalInsight

router = APIRouter()


@router.get("/", response_model=dict)
def get_global_insights(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    pillar: Optional[PillarType] = Query(None),
    type: Optional[InsightType] = Query(None),
    sort_by: str = Query("weighted_count", regex="^(weighted_count|count|last_seen)$"),
    db: Session = Depends(get_db)
):
    """
    Get list of global insights with optional filtering and sorting
    """
    try:
        # Build query
        query = db.query(GlobalInsight)

        # Filter by pillar if provided
        if pillar:
            query = query.filter(GlobalInsight.pillar == pillar)

        # Filter by type if provided
        if type:
            query = query.filter(GlobalInsight.type == type)

        # Get total count
        total = query.count()

        # Apply sorting
        if sort_by == "weighted_count":
            query = query.order_by(desc(GlobalInsight.weighted_count))
        elif sort_by == "count":
            query = query.order_by(desc(GlobalInsight.count))
        elif sort_by == "last_seen":
            query = query.order_by(desc(GlobalInsight.last_seen))

        # Get paginated results
        insights = query.offset(skip).limit(limit).all()

        # Convert to response format
        insight_responses = [GlobalInsightResponse(**insight.to_dict()) for insight in insights]

        # Create pagination info
        page = (skip // limit) + 1
        per_page = limit
        has_next = total > skip + limit
        has_prev = skip > 0

        result = GlobalInsightList(
            insights=insight_responses,
            total=total,
            page=page,
            per_page=per_page,
            has_next=has_next,
            has_prev=has_prev
        )

        return success_response(
            data=result.model_dump(),
            message=f"Retrieved {len(insight_responses)} global insights"
        )

    except Exception as e:
        return error_response(f"Error retrieving global insights: {str(e)}")


@router.get("/by-pillar", response_model=dict)
def get_insights_by_pillar(
    limit_per_type: int = Query(10, ge=1, le=50, description="Max insights per type (problems/proposals)"),
    db: Session = Depends(get_db)
):
    """
    Get insights grouped by pillar (for frontend GlobalInsights component)
    Returns top problems and proposals for each pillar
    """
    try:
        pillars_data = []

        # Define all pillars (canonical names only)
        all_pillars: List[PillarType] = ["access_to_capital", "ecosystem_support", "wellbeing_recognition"]

        for pillar in all_pillars:
            # Get top problems for this pillar
            problems = db.query(GlobalInsight).filter(
                GlobalInsight.pillar == pillar,
                GlobalInsight.type == "problem"
            ).order_by(desc(GlobalInsight.weighted_count)).limit(limit_per_type).all()

            # Get top proposals for this pillar
            proposals = db.query(GlobalInsight).filter(
                GlobalInsight.pillar == pillar,
                GlobalInsight.type == "proposal"
            ).order_by(desc(GlobalInsight.weighted_count)).limit(limit_per_type).all()

            # Convert to response format
            problem_responses = [GlobalInsightResponse(**p.to_dict()) for p in problems]
            proposal_responses = [GlobalInsightResponse(**p.to_dict()) for p in proposals]

            pillar_data = PillarInsights(
                pillar=pillar,
                problems=problem_responses,
                proposals=proposal_responses
            )

            pillars_data.append(pillar_data)

        response = PillarInsightsResponse(pillars=pillars_data)

        return success_response(
            data=response.model_dump(),
            message="Retrieved insights by pillar"
        )

    except Exception as e:
        return error_response(f"Error retrieving insights by pillar: {str(e)}")


@router.get("/{insight_id}", response_model=dict)
def get_global_insight(insight_id: int, db: Session = Depends(get_db)):
    """
    Get a specific global insight by ID
    """
    try:
        insight = db.query(GlobalInsight).filter(GlobalInsight.id == insight_id).first()

        if not insight:
            return error_response("Global insight not found")

        insight_response = GlobalInsightResponse(**insight.to_dict())

        return success_response(
            data=insight_response.model_dump(),
            message="Global insight retrieved successfully"
        )

    except Exception as e:
        return error_response(f"Error retrieving global insight: {str(e)}")


@router.post("/", response_model=dict)
def create_global_insight(
    insight_data: GlobalInsightCreate,
    db: Session = Depends(get_db)
):
    """
    Manually create a new global insight
    """
    try:
        # Create new insight
        new_insight = GlobalInsight(
            canonical_text=insight_data.canonical_text,
            type=insight_data.type,
            pillar=insight_data.pillar,
            count=insight_data.count,
            weighted_count=insight_data.weighted_count,
            last_seen=datetime.now(),
            aliases=insight_data.aliases,
            aliases_count=len(insight_data.aliases),
            supporting_docs=[doc.model_dump() for doc in insight_data.supporting_docs],
            breakdowns=insight_data.breakdowns.model_dump()
        )

        db.add(new_insight)
        db.commit()
        db.refresh(new_insight)

        insight_response = GlobalInsightResponse(**new_insight.to_dict())

        return success_response(
            data=insight_response.model_dump(),
            message="Global insight created successfully"
        )

    except Exception as e:
        db.rollback()
        return error_response(f"Error creating global insight: {str(e)}")


@router.put("/{insight_id}", response_model=dict)
def update_global_insight(
    insight_id: int,
    update_data: GlobalInsightUpdate,
    db: Session = Depends(get_db)
):
    """
    Update an existing global insight
    """
    try:
        insight = db.query(GlobalInsight).filter(GlobalInsight.id == insight_id).first()

        if not insight:
            return error_response("Global insight not found")

        # Update fields if provided
        if update_data.canonical_text is not None:
            insight.canonical_text = update_data.canonical_text

        if update_data.type is not None:
            insight.type = update_data.type

        if update_data.pillar is not None:
            insight.pillar = update_data.pillar

        if update_data.aliases is not None:
            insight.aliases = update_data.aliases
            insight.aliases_count = len(update_data.aliases)

        if update_data.supporting_docs is not None:
            insight.supporting_docs = [doc.model_dump() for doc in update_data.supporting_docs]
            insight.count = len(update_data.supporting_docs)

        if update_data.breakdowns is not None:
            insight.breakdowns = update_data.breakdowns.model_dump()

        # Update timestamp
        insight.updated_at = datetime.now()

        db.commit()
        db.refresh(insight)

        insight_response = GlobalInsightResponse(**insight.to_dict())

        return success_response(
            data=insight_response.model_dump(),
            message="Global insight updated successfully"
        )

    except Exception as e:
        db.rollback()
        return error_response(f"Error updating global insight: {str(e)}")


@router.delete("/{insight_id}", response_model=dict)
def delete_global_insight(insight_id: int, db: Session = Depends(get_db)):
    """
    Delete a global insight
    """
    try:
        insight = db.query(GlobalInsight).filter(GlobalInsight.id == insight_id).first()

        if not insight:
            return error_response("Global insight not found")

        db.delete(insight)
        db.commit()

        return success_response(
            data={"id": insight_id},
            message="Global insight deleted successfully"
        )

    except Exception as e:
        db.rollback()
        return error_response(f"Error deleting global insight: {str(e)}")


@router.get("/stats/summary", response_model=dict)
def get_insights_statistics(db: Session = Depends(get_db)):
    """
    Get summary statistics about global insights
    """
    try:
        # Total insights
        total_insights = db.query(func.count(GlobalInsight.id)).scalar()

        # Count by type
        problems_count = db.query(func.count(GlobalInsight.id)).filter(
            GlobalInsight.type == "problem"
        ).scalar()

        proposals_count = db.query(func.count(GlobalInsight.id)).filter(
            GlobalInsight.type == "proposal"
        ).scalar()

        # Count by pillar (canonical names only)
        pillar_counts = {}
        for pillar in ["access_to_capital", "ecosystem_support", "wellbeing_recognition"]:
            count = db.query(func.count(GlobalInsight.id)).filter(
                GlobalInsight.pillar == pillar
            ).scalar()
            pillar_counts[pillar] = count

        # Total documents referenced
        total_docs = db.query(func.sum(GlobalInsight.count)).scalar() or 0

        # Most recent update
        latest = db.query(GlobalInsight).order_by(desc(GlobalInsight.last_seen)).first()
        latest_update = latest.last_seen.isoformat() if latest else None

        stats = {
            "total_insights": total_insights,
            "problems_count": problems_count,
            "proposals_count": proposals_count,
            "by_pillar": pillar_counts,
            "total_documents_referenced": int(total_docs),
            "latest_update": latest_update
        }

        return success_response(
            data=stats,
            message="Statistics retrieved successfully"
        )

    except Exception as e:
        return error_response(f"Error retrieving statistics: {str(e)}")
