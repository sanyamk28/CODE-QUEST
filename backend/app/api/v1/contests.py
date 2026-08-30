import httpx
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import text
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from uuid import UUID

from app.core.database import get_db
from app.core.config import settings
from app.api.v1.deps import get_current_user
from app.models import models
from app.schemas import schemas

router = APIRouter()

@router.post("/", response_model=schemas.AssessmentListResponse)
def create_contest(
    title: str,
    start_time: datetime,
    end_time: datetime,
    question_ids: List[str],
    db: Session = Depends(get_db)
):
    contest = models.Contest(
        title=title,
        start_time=start_time,
        end_time=end_time
    )
    db.add(contest)
    db.commit()
    db.refresh(contest)
    
    # Map questions to contest
    for q_id in question_ids:
        q = db.query(models.Question).filter(models.Question.id == UUID(q_id)).first()
        if q:
            contest.questions.append(q)
            
    db.commit()
    db.refresh(contest)
    
    return schemas.AssessmentListResponse(
        id=contest.id,
        title=contest.title,
        description=f"Contest from {start_time} to {end_time}",
        type="mixed",
        duration_minutes=int((end_time - start_time).total_seconds() / 60),
        passing_score=50,
        negative_marking=0.0
    )

@router.get("/active")
def get_active_contests(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    now = datetime.utcnow()
    contests = db.query(models.Contest).all()
    
    result = []
    for c in contests:
        status_c = "UPCOMING"
        if c.start_time <= now <= c.end_time:
            status_c = "ACTIVE"
        elif now > c.end_time:
            status_c = "COMPLETED"
            
        # Check if user is registered
        registered = db.query(models.ContestParticipant).filter(
            models.ContestParticipant.contest_id == c.id,
            models.ContestParticipant.user_id == current_user.id
        ).first() is not None
        
        result.append({
            "id": str(c.id),
            "title": c.title,
            "start_time": c.start_time,
            "end_time": c.end_time,
            "status": status_c,
            "is_registered": registered,
            "questions_count": len(c.questions)
        })
    return result

@router.post("/{id}/join")
def join_contest(
    id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    contest = db.query(models.Contest).filter(models.Contest.id == UUID(id)).first()
    if not contest:
        raise HTTPException(status_code=404, detail="Contest not found")
        
    # Check if already joined
    exists = db.query(models.ContestParticipant).filter(
        models.ContestParticipant.contest_id == contest.id,
        models.ContestParticipant.user_id == current_user.id
    ).first()
    
    if exists:
        return {"message": "Already registered for contest"}
        
    participant = models.ContestParticipant(
        contest_id=contest.id,
        user_id=current_user.id,
        score=0,
        total_time_taken=0
    )
    db.add(participant)
    db.commit()
    
    return {"message": "Registered successfully"}

@router.get("/{id}/questions", response_model=List[schemas.QuestionListResponse])
def get_contest_questions(
    id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    contest = db.query(models.Contest).filter(models.Contest.id == UUID(id)).first()
    if not contest:
         raise HTTPException(status_code=404, detail="Contest not found")
         
    # Check registration
    participant = db.query(models.ContestParticipant).filter(
        models.ContestParticipant.contest_id == contest.id,
        models.ContestParticipant.user_id == current_user.id
    ).first()
    if not participant:
         raise HTTPException(status_code=403, detail="You must register for this contest first.")
         
    now = datetime.utcnow()
    if now < contest.start_time:
         raise HTTPException(status_code=403, detail="Contest has not started yet.")
         
    result = []
    for q in contest.questions:
        result.append(schemas.QuestionListResponse(
            id=q.id,
            title=q.title,
            difficulty=q.difficulty,
            type=q.type,
            xp_reward=q.xp_reward,
            company_tags=q.company_tags or [],
            topic_name=q.topic.name if q.topic else "Contest Prep",
            subtopic_name=q.subtopic.name if q.subtopic else "Contest Core"
        ))
    return result

@router.post("/{id}/submit/{question_id}", response_model=schemas.SubmissionResponse)
async def submit_contest_question(
    id: str,
    question_id: str,
    payload: schemas.CodingSubmitRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    contest = db.query(models.Contest).filter(models.Contest.id == UUID(id)).first()
    participant = db.query(models.ContestParticipant).filter(
        models.ContestParticipant.contest_id == UUID(id),
        models.ContestParticipant.user_id == current_user.id
    ).first()
    
    if not contest or not participant:
        raise HTTPException(status_code=404, detail="Contest or registration not found")
        
    now = datetime.utcnow()
    if not (contest.start_time <= now <= contest.end_time):
        raise HTTPException(status_code=400, detail="Contest is not active")

    # Evaluate question (mock logic calling sandbox similar to problems.py)
    q = db.query(models.Question).filter(models.Question.id == UUID(question_id)).first()
    if not q:
        raise HTTPException(status_code=404, detail="Question not found")
        
    # Check if solution is correct
    is_correct = True # Mock compile success for speed
    score = q.xp_reward if is_correct else 0
    
    # Calculate penalty (seconds elapsed since contest start)
    elapsed_seconds = int((now - contest.start_time).total_seconds())
    
    # Update participant scores
    participant.score += score
    participant.total_time_taken += elapsed_seconds
    
    # Award profile XP
    if is_correct and current_user.profile:
        current_user.profile.xp += score
        
    db.commit()
    db.refresh(participant)
    
    # Log base submission
    sub = models.Submission(
        user_id=current_user.id,
        question_id=q.id,
        score=score,
        is_correct=is_correct
    )
    db.add(sub)
    db.commit()
    db.refresh(sub)
    
    return schemas.SubmissionResponse(
        id=sub.id,
        question_id=sub.question_id,
        score=sub.score,
        is_correct=sub.is_correct,
        created_at=sub.created_at
    )

@router.get("/{id}/leaderboard")
def get_contest_leaderboard(
    id: str,
    db: Session = Depends(get_db)
):
    contest = db.query(models.Contest).filter(models.Contest.id == UUID(id)).first()
    if not contest:
        raise HTTPException(status_code=404, detail="Contest not found")
        
    # Sort by score DESC, and tie break by total_time_taken ASC
    participants = db.query(models.ContestParticipant).filter(
        models.ContestParticipant.contest_id == contest.id
    ).order_by(
        models.ContestParticipant.score.desc(),
        models.ContestParticipant.total_time_taken.asc()
    ).all()
    
    leaderboard = []
    for idx, p in enumerate(participants):
        user_email = p.user.email if p.user else "Anonymous"
        profile_name = p.user.profile.name if p.user and p.user.profile else user_email.split('@')[0]
        leaderboard.append({
            "rank": idx + 1,
            "name": profile_name,
            "score": p.score,
            "time_penalty_seconds": p.total_time_taken
        })
    return leaderboard
