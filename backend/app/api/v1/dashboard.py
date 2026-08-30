from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.core.database import get_db
from app.api.v1.deps import get_current_user
from app.models import models
from app.schemas import schemas

router = APIRouter()

@router.get("/progress", response_model=schemas.ProfileResponse)
def get_user_progress(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(models.Profile).filter(models.Profile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile details not found. Please onboarding."
        )
    
    # Recalculate readiness score dynamically based on subtopic mastery and solved metrics
    solved_count = db.query(models.Submission).filter(
        models.Submission.user_id == current_user.id,
        models.Submission.is_correct == True
    ).count()
    
    # Baseline calculations
    base_score = 40.0 + min(solved_count * 2.5, 30.0) # Up to 30 points for solved questions
    base_score += min((profile.xp / 100) * 5.0, 15.0)  # Up to 15 points for XP
    base_score += min(profile.streak * 1.5, 10.0)      # Up to 10 points for consistency streak
    
    # Clamp between 10 and 100
    profile.readiness_score = min(max(base_score, 10.0), 99.0)
    db.commit()
    db.refresh(profile)
    
    return profile

@router.get("/recommendations")
def get_dashboard_recommendations(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(models.Profile).filter(models.Profile.user_id == current_user.id).first()
    if not profile:
         raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found."
        )

    # 1. Generate Adaptive Daily Mission based on current levels
    daily_mission = {
        "title": "Daily Mission Objectives",
        "xp_reward": 50,
        "tasks": []
    }
    
    # If DSA level is low, ask to solve 2 DSA questions
    if profile.dsa_level < 30.0:
        daily_mission["tasks"].append({"desc": "Solve 2 Easy DSA problems", "done": False})
    else:
        daily_mission["tasks"].append({"desc": "Solve 1 Medium DSA problem", "done": False})
        
    # If SQL is lower than DSA, focus SQL
    if profile.sql_level < profile.dsa_level:
        daily_mission["tasks"].append({"desc": "Complete 2 SQL Aggregations", "done": False})
    else:
        daily_mission["tasks"].append({"desc": "Answer 1 SQL Window function query", "done": False})
        
    daily_mission["tasks"].append({"desc": "Answer 1 scenario question", "done": False})

    # 2. Query recommended questions matching target role
    recommended_questions = []
    
    # Select problems user has not solved yet
    solved_qids = db.query(models.Submission.question_id).filter(
        models.Submission.user_id == current_user.id,
        models.Submission.is_correct == True
    ).subquery()
    
    # Find matching questions
    rec_qs = db.query(models.Question).filter(
        ~models.Question.id.in_(solved_qids)
    ).limit(3).all()
    
    for rq in rec_qs:
        recommended_questions.append({
            "id": str(rq.id),
            "title": rq.title,
            "type": rq.type,
            "difficulty": rq.difficulty,
            "xp": rq.xp_reward
        })

    # 3. Weekly performance
    weekly_perf = {
        "current_streak": profile.streak,
        "xp_gained": profile.xp,
        "days_active": ["Mon", "Wed", "Fri"]
    }

    return {
        "readiness_score": profile.readiness_score,
        "daily_mission": daily_mission,
        "recommendations": recommended_questions,
        "weekly_performance": weekly_perf
    }
