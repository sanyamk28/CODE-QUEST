import httpx
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import text
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from typing import List, Optional
import json

from app.core.database import get_db
from app.core.config import settings
from app.api.v1.deps import get_current_user
from app.models import models
from app.schemas import schemas

router = APIRouter()

@router.get("/", response_model=List[schemas.AssessmentListResponse])
def get_assessments(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    assessments = db.query(models.Assessment).filter(models.Assessment.is_active == True).all()
    return assessments

@router.get("/{id}", response_model=schemas.AssessmentDetailResponse)
def get_assessment_detail(
    id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    assessment = db.query(models.Assessment).filter(models.Assessment.id == id).first()
    if not assessment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assessment not found"
        )
    return assessment

@router.post("/{id}/submit", response_model=schemas.AssessmentResultResponse)
async def submit_assessment(
    id: str,
    payload: schemas.AssessmentSubmitRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    assessment = db.query(models.Assessment).filter(models.Assessment.id == id).first()
    if not assessment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assessment not found"
        )

    correct_answers = 0
    total_score = 0
    checked_outputs = {}

    for question in assessment.questions:
        q_id_str = str(question.id)
        user_answer = payload.answers.get(q_id_str)
        
        if not user_answer:
            # Unanswered: score 0
            checked_outputs[q_id_str] = {"status": "UNANSWERED", "correct": False, "score": 0}
            continue

        # Evaluate based on question type
        if question.type == "mcq" or question.type == "aptitude" or question.type == "puzzle":
            selected = user_answer.get("selected_option")
            mcq = question.mcq_detail
            if selected and mcq:
                is_correct = selected.upper() == mcq.correct_option.upper()
                score = question.xp_reward if is_correct else int(-mcq.negative_marking * question.xp_reward)
                if is_correct:
                    correct_answers += 1
                total_score += score
                checked_outputs[q_id_str] = {"status": "ANSWERED", "correct": is_correct, "score": score, "explanation": mcq.explanation}
                
        elif question.type == "sql":
            typed_query = user_answer.get("query")
            sql_det = question.sql_detail
            if typed_query and sql_det:
                # Basic security validation
                is_forbidden = any(kw in typed_query.lower() for kw in ["drop", "truncate", "alter", "delete", "insert"])
                if is_forbidden:
                    checked_outputs[q_id_str] = {"status": "ERROR", "correct": False, "score": 0, "error": "Query blocked by sandbox."}
                    continue
                
                # Execute on Postgres with automatic transaction rollback
                connection = db.connection()
                transaction = connection.begin()
                try:
                    res = connection.execute(text(typed_query))
                    rows = res.all()
                    is_correct = len(rows) > 0 # Mock check: query compiled and returned rows
                    score = question.xp_reward if is_correct else 0
                    if is_correct:
                        correct_answers += 1
                    total_score += score
                    checked_outputs[q_id_str] = {"status": "SUCCESS", "correct": is_correct, "score": score}
                except Exception as e:
                    checked_outputs[q_id_str] = {"status": "SQL_ERROR", "correct": False, "score": 0, "error": str(e)}
                finally:
                    transaction.rollback()
                    
        elif question.type == "coding":
            code = user_answer.get("code")
            lang = user_answer.get("language")
            coding_det = question.coding_detail
            if code and lang and coding_det:
                tc = db.query(models.CodingTestCase).filter(models.CodingTestCase.coding_problem_id == coding_det.id).first()
                if not tc:
                    checked_outputs[q_id_str] = {"status": "NO_TEST_CASES", "correct": False, "score": 0}
                    continue
                
                # Call Sandbox executor container
                try:
                    async with httpx.AsyncClient() as client:
                        response = await client.post(
                            f"{settings.SANDBOX_URL}/execute",
                            json={
                                "code": code,
                                "language": lang,
                                "input_data": tc.input_data,
                                "timeout": coding_det.time_limit or 5.0
                            },
                            headers={"Authorization": f"Bearer {settings.SANDBOX_SECRET_TOKEN}"},
                            timeout=10.0
                        )
                        if response.status_code == 200:
                            res_data = response.json()
                            is_correct = res_data.get("status") == "SUCCESS" and res_data.get("stdout", "").strip() == tc.expected_output.strip()
                            score = question.xp_reward if is_correct else 0
                            if is_correct:
                                correct_answers += 1
                            total_score += score
                            checked_outputs[q_id_str] = {"status": res_data.get("status"), "correct": is_correct, "score": score, "stderr": res_data.get("stderr")}
                        else:
                            checked_outputs[q_id_str] = {"status": "SANDBOX_SERVICE_ERROR", "correct": False, "score": 0}
                except Exception as e:
                    checked_outputs[q_id_str] = {"status": "SANDBOX_CONNECT_ERROR", "correct": False, "score": 0, "error": str(e)}

    # Determine if passed
    passed = total_score >= assessment.passing_score
    
    # Save student assessment scores in XP profile
    if passed and current_user.profile:
        current_user.profile.xp += total_score
        current_user.profile.readiness_score = min(current_user.profile.readiness_score + 3.5, 100.0)
        db.commit()

    return schemas.AssessmentResultResponse(
        assessment_id=assessment.id,
        total_questions=len(assessment.questions),
        correct_answers=correct_answers,
        score=max(total_score, 0),
        passed=passed,
        answers_checked=checked_outputs
    )
