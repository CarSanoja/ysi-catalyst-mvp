from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from datetime import datetime, timedelta
from app.db.session import get_db
from app.schemas.response import success_response, error_response
from app.models import (
    User, Session as SessionModel, Participant,
    Insight, Action, ProcessedFile, Organization
)

router = APIRouter()

@router.get("/overview")
def get_analytics_overview(db: Session = Depends(get_db)):
    """
    Get dashboard overview metrics
    Returns key metrics for the dashboard landing page
    """
    try:
        # Count total shapers (participants with role containing 'shaper')
        total_shapers = db.query(Participant).filter(
            Participant.role.ilike('%shaper%')
        ).count()

        # If no shapers, use all participants for demo
        if total_shapers == 0:
            total_shapers = db.query(Participant).count()
            # If still no participants, return demo data
            if total_shapers == 0:
                total_shapers = 24  # Demo value

        # Count total documents (processed files + sessions with notes)
        total_documents = db.query(ProcessedFile).count()
        sessions_with_notes = db.query(SessionModel).filter(
            SessionModel.notes.isnot(None)
        ).count()
        total_documents += sessions_with_notes
        if total_documents == 0:
            total_documents = 156  # Demo value

        # Count total insights
        total_insights = db.query(Insight).count()
        if total_insights == 0:
            total_insights = 89  # Demo value

        # Calculate average sentiment (from insights scores)
        avg_sentiment = db.query(
            func.avg(
                (Insight.novelty_score + Insight.impact_score + Insight.equity_score) / 3
            )
        ).scalar()

        if avg_sentiment is None:
            avg_sentiment = 0.73  # Demo value
        else:
            avg_sentiment = round(avg_sentiment / 100, 2)  # Convert to 0-1 scale

        # Count active regions
        active_regions = db.query(
            func.count(func.distinct(Participant.region))
        ).filter(Participant.region.isnot(None)).scalar()
        if active_regions == 0:
            active_regions = 5  # Demo value

        # Get recent activity (last 10 activities)
        recent_sessions = db.query(SessionModel).order_by(
            desc(SessionModel.created_at)
        ).limit(5).all()

        recent_insights = db.query(Insight).order_by(
            desc(Insight.created_at)
        ).limit(5).all()

        recent_activity = []
        for session in recent_sessions:
            recent_activity.append({
                "type": "session",
                "title": session.title,
                "date": session.created_at.isoformat() if session.created_at else None,
                "status": session.status
            })

        for insight in recent_insights:
            recent_activity.append({
                "type": "insight",
                "title": insight.title,
                "date": insight.created_at.isoformat() if insight.created_at else None,
                "pillar": insight.pillar
            })

        # Sort by date
        recent_activity.sort(
            key=lambda x: x.get('date', ''),
            reverse=True
        )

        # If no activity, add demo data
        if len(recent_activity) == 0:
            recent_activity = [
                {
                    "type": "session",
                    "title": "Impact Investment Workshop",
                    "date": datetime.now().isoformat(),
                    "status": "completed"
                },
                {
                    "type": "insight",
                    "title": "Need for accessible funding",
                    "date": (datetime.now() - timedelta(days=1)).isoformat(),
                    "pillar": "capital_access"
                }
            ]

        return success_response(
            data={
                "totalShapers": total_shapers,
                "totalDocuments": total_documents,
                "totalInsights": total_insights,
                "avgSentiment": avg_sentiment,
                "activeRegions": active_regions,
                "recentActivity": recent_activity[:10]
            }
        )
    except Exception as e:
        return error_response(str(e))

@router.get("/sentiment")
def get_sentiment_data(
    date_from: Optional[str] = Query(None),
    date_to: Optional[str] = Query(None),
    granularity: Optional[str] = Query("day", regex="^(day|week|month)$"),
    db: Session = Depends(get_db)
):
    """Get sentiment trend data over time"""
    try:
        # For now, return demo data
        # In production, aggregate sentiment from insights over time
        demo_data = []
        base_date = datetime.now()

        for i in range(30):
            date = base_date - timedelta(days=i)
            demo_data.append({
                "date": date.strftime("%Y-%m-%d"),
                "positive": 0.3 + (i % 3) * 0.1,
                "neutral": 0.4 - (i % 3) * 0.05,
                "negative": 0.3 - (i % 3) * 0.05
            })

        return success_response(data=demo_data)
    except Exception as e:
        return error_response(str(e))

@router.get("/topics")
def get_topics_data(
    pillar: Optional[str] = Query(None),
    limit: Optional[int] = Query(10),
    db: Session = Depends(get_db)
):
    """Get topic analysis data"""
    try:
        # Query insights grouped by theme/pillar
        query = db.query(
            Insight.pillar,
            func.count(Insight.id).label('count')
        ).group_by(Insight.pillar)

        if pillar:
            query = query.filter(Insight.pillar == pillar)

        topics = query.limit(limit).all()

        # Format response
        topic_data = []
        for topic in topics:
            if topic.pillar:
                topic_data.append({
                    "topic": topic.pillar,
                    "count": topic.count,
                    "percentage": 0  # Will calculate if needed
                })

        # Add demo data if no real data
        if len(topic_data) == 0:
            topic_data = [
                {"topic": "Capital Access", "count": 45, "percentage": 35},
                {"topic": "Recognition", "count": 38, "percentage": 30},
                {"topic": "Wellbeing", "count": 28, "percentage": 22},
                {"topic": "Policy", "count": 17, "percentage": 13}
            ]

        return success_response(data=topic_data)
    except Exception as e:
        return error_response(str(e))

@router.get("/network")
def get_network_data(db: Session = Depends(get_db)):
    """Get network graph data for stakeholder relationships"""
    try:
        # For now, return demo network data
        # In production, build from participant relationships
        demo_network = {
            "nodes": [
                {"id": "1", "name": "Hub Americas", "group": "hub"},
                {"id": "2", "name": "Hub Europe", "group": "hub"},
                {"id": "3", "name": "Hub Africa", "group": "hub"},
                {"id": "4", "name": "Shaper 1", "group": "shaper"},
                {"id": "5", "name": "Shaper 2", "group": "shaper"},
                {"id": "6", "name": "Partner Org", "group": "partner"}
            ],
            "links": [
                {"source": "1", "target": "4", "value": 1},
                {"source": "1", "target": "5", "value": 1},
                {"source": "2", "target": "6", "value": 2},
                {"source": "3", "target": "4", "value": 1}
            ]
        }

        return success_response(data=demo_network)
    except Exception as e:
        return error_response(str(e))

@router.get("/engagement")
def get_engagement_metrics(
    shaper_id: Optional[List[str]] = Query(None, alias="shaperId"),
    date_from: Optional[str] = Query(None, alias="dateFrom"),
    date_to: Optional[str] = Query(None, alias="dateTo"),
    db: Session = Depends(get_db)
):
    """Get engagement metrics for specific shapers"""
    try:
        # For now, return demo engagement data
        engagement_data = {
            "totalInteractions": 156,
            "averageResponseTime": "2.3 days",
            "participationRate": 0.78,
            "topContributors": [
                {"id": "1", "name": "John Doe", "contributions": 23},
                {"id": "2", "name": "Jane Smith", "contributions": 19}
            ],
            "engagementTrend": [
                {"month": "Jan", "value": 65},
                {"month": "Feb", "value": 72},
                {"month": "Mar", "value": 78}
            ]
        }

        return success_response(data=engagement_data)
    except Exception as e:
        return error_response(str(e))