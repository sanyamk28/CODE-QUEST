from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.core.database import get_db
from app.api.v1.deps import get_current_user
from app.models import models
from app.schemas import schemas

router = APIRouter()

@router.get("/", response_model=List[schemas.RoadmapResponse])
def get_roadmaps(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    roadmaps = db.query(models.Roadmap).all()
    return roadmaps

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
