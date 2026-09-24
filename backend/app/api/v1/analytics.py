from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.database import get_db
from app.api.v1.deps import get_current_user, get_current_admin
from app.models import models
from app.schemas import schemas
from app.core.analytics import record_analytics_event

router = APIRouter()

@router.post("/events", response_model=schemas.AnalyticsEventResponse)
def record_event(
    payload: schemas.AnalyticsEventCreate,
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(get_current_user)
):
    """
    Client-side telemetry ingestion endpoint.
    """
    event = record_analytics_event(
        db=db,
        event_type=payload.event_type,
        user_id=current_user.id if current_user else None,
        metadata=payload.metadata
    )
    if not event:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to log event")
    return event

@router.get("/events", response_model=List[schemas.AnalyticsEventResponse])
def get_recent_events(
    limit: int = Query(50, ge=1, le=200),
    event_type: Optional[str] = None,
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(get_current_admin)
):
    """
    Admin telemetry event stream explorer.
    """
    query = db.query(models.AnalyticsEvent)
    if event_type:
        query = query.filter(models.AnalyticsEvent.event_type == event_type)
    events = query.order_by(models.AnalyticsEvent.created_at.desc()).limit(limit).all()
    return events

@router.get("/summary", response_model=schemas.AnalyticsSummaryResponse)
def get_analytics_summary(
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(get_current_admin)
):
    """
    Admin dashboard aggregation for total enrolled students, DAU/WAU active metrics,
    feature adoption rates, average readiness score, and roadmap step drop-offs.
    """
    now = datetime.utcnow()
    one_day_ago = now - timedelta(days=1)
    seven_days_ago = now - timedelta(days=7)

    # 1. Total enrolled users (excluding admin)
    total_enrolled = db.query(models.User).filter(models.User.is_admin == False).count()

    # 2. Daily Active Users (distinct users with login history or analytics events in last 24h)
    dau_logins = db.query(models.LoginHistory.user_id).filter(models.LoginHistory.login_time >= one_day_ago).distinct().all()
    dau_events = db.query(models.AnalyticsEvent.user_id).filter(
        models.AnalyticsEvent.created_at >= one_day_ago,
        models.AnalyticsEvent.user_id.isnot(None)
    ).distinct().all()
    dau_set = {uid[0] for uid in dau_logins if uid[0]} | {uid[0] for uid in dau_events if uid[0]}
    daily_active_users = max(len(dau_set), 1 if total_enrolled > 0 else 0)

    # 3. Weekly Active Users (last 7 days)
    wau_logins = db.query(models.LoginHistory.user_id).filter(models.LoginHistory.login_time >= seven_days_ago).distinct().all()
    wau_events = db.query(models.AnalyticsEvent.user_id).filter(
        models.AnalyticsEvent.created_at >= seven_days_ago,
        models.AnalyticsEvent.user_id.isnot(None)
    ).distinct().all()
    wau_set = {uid[0] for uid in wau_logins if uid[0]} | {uid[0] for uid in wau_events if uid[0]}
    weekly_active_users = max(len(wau_set), daily_active_users)

    # 4. Average readiness score
    avg_readiness = db.query(func.avg(models.Profile.readiness_score)).scalar() or 0.0

    # 5. Feature adoption rates (count of distinct users utilizing each key feature)
    feature_counts = {}
    key_event_types = [
        "mcq_completed",
        "puzzle_completed",
        "code_submission",
        "code_battle_joined",
        "resume_uploaded",
        "assessment_completed",
        "mock_interview_completed"
    ]
    for ev in key_event_types:
        cnt = db.query(models.AnalyticsEvent.user_id).filter(
            models.AnalyticsEvent.event_type == ev,
            models.AnalyticsEvent.user_id.isnot(None)
        ).distinct().count()
        feature_counts[ev] = cnt

    # 6. Roadmap drop-off points
    step_events = db.query(models.AnalyticsEvent).filter(
        models.AnalyticsEvent.event_type == "roadmap_step_completed"
    ).all()
    dropoff_stats = {"Step 1 - Foundations": 0, "Step 2 - Core DSA": 0, "Step 3 - Advanced System Design": 0}
    for se in step_events:
        step_name = (se.metadata_json or {}).get("step_name", "Step 1 - Foundations")
        dropoff_stats[step_name] = dropoff_stats.get(step_name, 0) + 1

    # 7. Recent events
    recent_events = db.query(models.AnalyticsEvent).order_by(models.AnalyticsEvent.created_at.desc()).limit(20).all()

    return schemas.AnalyticsSummaryResponse(
        total_enrolled_users=total_enrolled,
        daily_active_users=daily_active_users,
        weekly_active_users=weekly_active_users,
        average_readiness_score=round(float(avg_readiness), 1),
        feature_adoption_rates=feature_counts,
        roadmap_dropoff_stats=dropoff_stats,
        recent_events=recent_events
    )
