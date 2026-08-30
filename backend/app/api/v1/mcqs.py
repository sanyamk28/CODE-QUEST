from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID

from app.core.database import get_db
from app.api.v1.deps import get_current_user
from app.models import models
from app.schemas import schemas

router = APIRouter()

@router.get("/", response_model=List[schemas.QuestionListResponse])
def get_mcq_questions(
    type: Optional[str] = "mcq", # mcq, aptitude, puzzle, scenario
    difficulty: Optional[str] = None,
    subtopic_id: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    query = db.query(models.Question).filter(models.Question.type == type)
    if difficulty:
        query = query.filter(models.Question.difficulty == difficulty)
    if subtopic_id:
        query = query.filter(models.Question.subtopic_id == UUID(subtopic_id))
        
    questions = query.all()
    
    result = []
    for q in questions:
        result.append(schemas.QuestionListResponse(
            id=q.id,
            title=q.title,
            difficulty=q.difficulty,
            type=q.type,
            xp_reward=q.xp_reward,
            company_tags=q.company_tags or [],
            topic_name=q.topic.name if q.topic else "General Prep",
            subtopic_name=q.subtopic.name if q.subtopic else "Core Study"
        ))
    return result

@router.get("/{id}", response_model=schemas.QuestionDetailResponse)
def get_mcq_detail(
    id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    q = db.query(models.Question).filter(models.Question.id == id).first()
    if not q:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Question not found"
        )
    return q

@router.post("/{id}/attempt", response_model=schemas.SubmissionResponse)
def attempt_mcq_question(
    id: str,
    payload: schemas.MCQAttemptRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    q = db.query(models.Question).filter(models.Question.id == id).first()
    if not q or not q.mcq_detail:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="MCQ question details not found"
        )
        
    mcq_detail = q.mcq_detail
    is_correct = payload.selected_option.upper() == mcq_detail.correct_option.upper()
    
    score = q.xp_reward if is_correct else int(-mcq_detail.negative_marking * q.xp_reward)
    
    # Save submission
    sub = models.Submission(
        user_id=current_user.id,
        question_id=q.id,
        score=score,
        is_correct=is_correct
    )
    db.add(sub)
    db.commit()
    db.refresh(sub)
    
    # Save MCQ attempt details
    attempt = models.Attempt(
        submission_id=sub.id,
        selected_option=payload.selected_option
    )
    db.add(attempt)
    
    # Award XP if correct, and update skills
    if current_user.profile:
        current_user.profile.xp = max(current_user.profile.xp + score, 0)
        
        # Increment appropriate profile domain level
        if q.type == "mcq":
            current_user.profile.cs_fundamentals_level = min(current_user.profile.cs_fundamentals_level + 1.0, 100.0)
        elif q.type == "aptitude":
            current_user.profile.aptitude_level = min(current_user.profile.aptitude_level + 1.5, 100.0)
            
    db.commit()
    db.refresh(sub)
    
    return schemas.SubmissionResponse(
        id=sub.id,
        question_id=sub.question_id,
        score=sub.score,
        is_correct=sub.is_correct,
        created_at=sub.created_at,
        selected_option=attempt.selected_option
    )
