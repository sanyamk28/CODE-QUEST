from sqlalchemy.orm import Session
from app.models.models import AnalyticsEvent
from typing import Optional, Dict, Any
from uuid import UUID

def record_analytics_event(
    db: Session,
    event_type: str,
    user_id: Optional[UUID] = None,
    metadata: Optional[Dict[str, Any]] = None
) -> Optional[AnalyticsEvent]:
    """
    Inserts a standardized telemetry event into the analytics_events table.
    """
    try:
        event = AnalyticsEvent(
            user_id=user_id,
            event_type=event_type,
            metadata_json=metadata or {}
        )
        db.add(event)
        db.commit()
        db.refresh(event)
        return event
    except Exception as e:
        db.rollback()
        print(f"Warning: Failed to record analytics event '{event_type}': {e}")
        return None
