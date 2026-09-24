from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.core.database import get_db
from app.api.v1.deps import get_current_user
from app.models import models
from app.schemas import schemas

from app.core.analytics import record_analytics_event

router = APIRouter()

@router.get("/", response_model=List[schemas.RoadmapResponse])
def get_roadmaps(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    roadmaps = db.query(models.Roadmap).all()
    record_analytics_event(
        db=db,
        event_type="roadmap_viewed",
        user_id=current_user.id,
        metadata={"count": len(roadmaps)}
    )
    return roadmaps

@router.post("/steps/{step_name}/complete")
def complete_roadmap_step(
    step_name: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.profile:
        current_user.profile.xp += 25
        db.commit()

    record_analytics_event(
        db=db,
        event_type="roadmap_step_completed",
        user_id=current_user.id,
        metadata={"step_name": step_name}
    )
    return {"message": f"Step '{step_name}' marked complete", "awarded_xp": 25}

@router.get("/projects", response_model=List[schemas.ProjectResponse])
def get_projects(
    role: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    query = db.query(models.Project)
    if role:
        query = query.filter(models.Project.role_tag == role)
        
    projects = query.all()
    return projects
