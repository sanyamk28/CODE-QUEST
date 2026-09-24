import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.v1.deps import get_current_user
from app.models import models
from app.schemas import schemas
from app.core.analytics import record_analytics_event

router = APIRouter()

@router.get("/", response_model=List[schemas.PuzzleListResponse])
def get_puzzles(
    difficulty: Optional[str] = None,
    category: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    query = db.query(models.Question).filter(models.Question.type.in_(["puzzle", "scenario"]))
    if difficulty:
        query = query.filter(models.Question.difficulty == difficulty)
    
    questions = query.all()
    results = []
    for q in questions:
        cat = q.subtopic.name if q.subtopic else "Logic & Reasoning"
        results.append(schemas.PuzzleListResponse(
            id=q.id,
            title=q.title,
            description=q.description[:140] + "..." if len(q.description) > 140 else q.description,
            difficulty=q.difficulty,
            category=cat,
            xp_reward=q.xp_reward or 15
        ))
    return results

@router.get("/{id}", response_model=schemas.PuzzleDetailResponse)
def get_puzzle_detail(
    id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    try:
        qid = uuid.UUID(id)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid puzzle ID")

    q = db.query(models.Question).filter(models.Question.id == qid).first()
    if not q or q.type not in ["puzzle", "scenario"]:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Puzzle not found")

    hints = []
    if q.mcq_detail:
        if q.mcq_detail.option_a and q.mcq_detail.option_a.startswith("Hint"):
            hints.append(q.mcq_detail.option_a)
        if q.mcq_detail.option_b and q.mcq_detail.option_b.startswith("Hint"):
            hints.append(q.mcq_detail.option_b)
    if not hints:
        hints = ["Focus on the constraint boundaries and edge conditions.", "Break down the problem into smaller discrete states."]

    # Emit analytics
    record_analytics_event(
        db=db,
        event_type="puzzle_attempted",
        user_id=current_user.id,
        metadata={"puzzle_id": str(q.id), "puzzle_title": q.title}
    )

    return schemas.PuzzleDetailResponse(
        id=q.id,
        title=q.title,
        description=q.description,
        difficulty=q.difficulty,
        category=q.subtopic.name if q.subtopic else "Logical Puzzle",
        xp_reward=q.xp_reward or 15,
        hints=hints,
        has_solution=True,
        company_tags=q.company_tags or []
    )

@router.post("/{id}/check", response_model=schemas.PuzzleCheckResponse)
def check_puzzle_solution(
    id: str,
    payload: schemas.PuzzleCheckRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    try:
        qid = uuid.UUID(id)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid puzzle ID")

    q = db.query(models.Question).filter(models.Question.id == qid).first()
    if not q or q.type not in ["puzzle", "scenario"]:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Puzzle not found")

    user_text = payload.solution_text.strip().lower()
    is_valid_attempt = len(user_text) > 10
    
    explanation = "Good analytical thinking. Review the complete formal logic walkthrough."
    if q.mcq_detail and q.mcq_detail.explanation:
        explanation = q.mcq_detail.explanation

    score = q.xp_reward if is_valid_attempt else 5

    # Save submission
    sub = models.Submission(
        user_id=current_user.id,
        question_id=q.id,
        score=score,
        is_correct=is_valid_attempt
    )
    db.add(sub)

    # Award profile score
    if current_user.profile and is_valid_attempt:
        current_user.profile.xp += score
        current_user.profile.aptitude_level = min(current_user.profile.aptitude_level + 2.0, 100.0)

    db.commit()

    # Emit analytics
    record_analytics_event(
        db=db,
        event_type="puzzle_completed",
        user_id=current_user.id,
        metadata={
            "puzzle_id": str(q.id),
            "puzzle_title": q.title,
            "score": score,
            "is_correct": is_valid_attempt
        }
    )

    return schemas.PuzzleCheckResponse(
        is_correct=is_valid_attempt,
        score=score,
        explanation=explanation
    )
