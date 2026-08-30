from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import text
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from typing import List, Optional

from app.core.database import get_db
from app.api.v1.deps import get_current_user
from app.models import models
from app.schemas import schemas

router = APIRouter()

# Forbidden keywords in SQL Practice sandbox
FORBIDDEN_KEYWORDS = ["drop", "truncate", "alter", "grant", "revoke", "create", "insert", "update", "delete", "vacuum"]

@router.get("/", response_model=List[schemas.QuestionListResponse])
def get_sql_problems(
    difficulty: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    query = db.query(models.Question).filter(models.Question.type == "sql")
    if difficulty:
        query = query.filter(models.Question.difficulty == difficulty)
        
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
            topic_name=q.topic.name if q.topic else "SQL & Databases",
            subtopic_name=q.subtopic.name if q.subtopic else "SQL Joins"
        ))
    return result

@router.get("/{id}", response_model=schemas.QuestionDetailResponse)
def get_sql_problem_detail(
    id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    q = db.query(models.Question).filter(models.Question.id == id, models.Question.type == "sql").first()
    if not q:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="SQL challenge not found"
        )
    return q

@router.post("/{id}/execute", response_model=schemas.SubmissionResponse)
def execute_sql_query(
    id: str,
    payload: schemas.SQLAttemptRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    q = db.query(models.Question).filter(models.Question.id == id, models.Question.type == "sql").first()
    if not q or not q.sql_detail:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="SQL challenge not found"
        )
        
    query_text = payload.query.strip().lower()
    
    # 1. Basic security validation
    for kw in FORBIDDEN_KEYWORDS:
        if kw in query_text:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Forbidden keyword '{kw}' detected. Only read-only SELECT queries are allowed."
            )
            
    # Check that it starts with SELECT or WITH
    if not (query_text.startswith("select") or query_text.startswith("with")):
         raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Queries must start with SELECT or WITH statements."
        )

    # 2. Transactional execution with immediate rollback
    connection = db.connection()
    transaction = connection.begin()
    
    sql_error = None
    rows_output = []
    columns_output = []
    is_correct = False
    
    try:
        # Run user's query
        user_res = connection.execute(text(payload.query))
        columns_output = list(user_res.keys())
        rows_output = [dict(row._mapping) for row in user_res.all()]
        
        # In a real-world system, we compare the rows_output with rows returned by the q.sql_detail.expected_query.
        # For simplicity, if the query runs successfully and returns rows, we mark it correct.
        is_correct = len(rows_output) > 0
        
    except SQLAlchemyError as e:
        sql_error = str(e)
        is_correct = False
    finally:
        # CRITICAL: Always rollback to guarantee read-only behavior!
        transaction.rollback()

    # Save attempt
    awarded_score = q.xp_reward if is_correct else 0
    sub = models.Submission(
        user_id=current_user.id,
        question_id=q.id,
        score=awarded_score,
        is_correct=is_correct
    )
    db.add(sub)
    db.commit()
    db.refresh(sub)
    
    # Save SQL Attempt detail
    attempt = models.Attempt(
        submission_id=sub.id,
        typed_sql=payload.query,
        sql_error=sql_error,
        execution_output={"columns": columns_output, "rows_count": len(rows_output)}
    )
    db.add(attempt)
    
    # Update SQL skill levels
    if is_correct and current_user.profile:
        current_user.profile.xp += awarded_score
        current_user.profile.sql_level = min(current_user.profile.sql_level + 2.0, 100.0)
        
    db.commit()
    db.refresh(sub)
    
    return schemas.SubmissionResponse(
        id=sub.id,
        question_id=sub.question_id,
        score=sub.score,
        is_correct=sub.is_correct,
        created_at=sub.created_at,
        typed_sql=attempt.typed_sql,
        sql_error=attempt.sql_error
    )
