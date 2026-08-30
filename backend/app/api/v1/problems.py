import httpx
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.core.database import get_db
from app.core.config import settings
from app.api.v1.deps import get_current_user, get_current_admin
from app.models import models
from app.schemas import schemas

router = APIRouter()

@router.get("/", response_model=List[schemas.QuestionListResponse])
def get_coding_problems(
    difficulty: Optional[str] = None,
    tag: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    query = db.query(models.Question).filter(models.Question.type == "coding")
    
    if difficulty:
        query = query.filter(models.Question.difficulty == difficulty)
    if tag:
        # Search JSON tags array
        query = query.filter(models.Question.company_tags.contains([tag]))
        
    questions = query.all()
    
    # Map to schema response
    result = []
    for q in questions:
        result.append(schemas.QuestionListResponse(
            id=q.id,
            title=q.title,
            difficulty=q.difficulty,
            type=q.type,
            xp_reward=q.xp_reward,
            company_tags=q.company_tags or [],
            topic_name=q.topic.name if q.topic else "DSA",
            subtopic_name=q.subtopic.name if q.subtopic else "Arrays"
        ))
    return result

@router.get("/{id}", response_model=schemas.QuestionDetailResponse)
def get_coding_problem_detail(
    id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    q = db.query(models.Question).filter(models.Question.id == id, models.Question.type == "coding").first()
    if not q:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Coding problem not found"
        )
    return q

@router.post("/{id}/submit", response_model=schemas.SubmissionResponse)
async def submit_coding_solution(
    id: str,
    payload: schemas.CodingSubmitRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    q = db.query(models.Question).filter(models.Question.id == id, models.Question.type == "coding").first()
    if not q or not q.coding_detail:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Coding problem not found"
        )
        
    coding_problem = q.coding_detail
    test_cases = db.query(models.CodingTestCase).filter(models.CodingTestCase.coding_problem_id == coding_problem.id).all()
    
    if not test_cases:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Test cases not configured for this problem."
        )

    passed_count = 0
    total_time = 0.0
    compile_status = "SUCCESS"
    compiler_output = ""
    sandbox_error_encountered = False

    # Send requests to our sandbox executor service container
    async with httpx.AsyncClient() as client:
        for tc in test_cases:
            try:
                headers = {"Authorization": f"Bearer {settings.SANDBOX_SECRET_TOKEN}"}
                response = await client.post(
                    f"{settings.SANDBOX_URL}/execute",
                    json={
                        "code": payload.code,
                        "language": payload.language,
                        "input_data": tc.input_data,
                        "timeout": coding_problem.time_limit or 5.0
                    },
                    headers=headers,
                    timeout=15.0
                )
                
                if response.status_code != 200:
                    compile_status = "SYSTEM_ERROR"
                    compiler_output = "Sandbox service returned status code " + str(response.status_code)
                    sandbox_error_encountered = True
                    break
                
                res_data = response.json()
                status_exec = res_data.get("status")
                
                # Check for errors
                if status_exec in ["COMPILE_ERROR", "RUNTIME_ERROR", "TIMEOUT", "SYSTEM_ERROR"]:
                    compile_status = status_exec
                    compiler_output = res_data.get("stderr")
                    break
                
                total_time += res_data.get("execution_time", 0.0)
                
                # Compare stdout (trim whitespace)
                run_stdout = res_data.get("stdout", "").strip()
                expected = tc.expected_output.strip()
                
                if run_stdout == expected:
                    passed_count += 1
                else:
                    # Output mismatch: fail submission
                    compile_status = "WRONG_ANSWER"
                    compiler_output = f"Output Mismatch.\nInput:\n{tc.input_data}\nExpected:\n{expected}\nGot:\n{run_stdout}"
                    break
                    
            except Exception as e:
                compile_status = "SYSTEM_ERROR"
                compiler_output = f"Failed to connect to executor sandbox: {str(e)}"
                sandbox_error_encountered = True
                break

    is_correct = (passed_count == len(test_cases)) and not sandbox_error_encountered
    awarded_score = q.xp_reward if is_correct else 0
    
    # Save base submission
    sub = models.Submission(
        user_id=current_user.id,
        question_id=q.id,
        score=awarded_score,
        is_correct=is_correct
    )
    db.add(sub)
    db.commit()
    db.refresh(sub)
    
    # Save coding detail
    coding_sub = models.CodingSubmission(
        submission_id=sub.id,
        code_source=payload.code,
        language=payload.language,
        execution_time=total_time,
        memory_usage=24576, # Mock memory (24MB)
        compile_status=compile_status,
        compiler_output=compiler_output,
        test_cases_passed=passed_count,
        total_test_cases=len(test_cases)
    )
    db.add(coding_sub)
    
    # Award XP to user if correct
    if is_correct and current_user.profile:
        current_user.profile.xp += awarded_score
        # Increment DSA skill mastery level
        current_user.profile.dsa_level = min(current_user.profile.dsa_level + 1.5, 100.0)
        
    db.commit()
    db.refresh(sub)
    
    return schemas.SubmissionResponse(
        id=sub.id,
        question_id=sub.question_id,
        score=sub.score,
        is_correct=sub.is_correct,
        created_at=sub.created_at,
        language=coding_sub.language,
        execution_time=coding_sub.execution_time,
        memory_usage=coding_sub.memory_usage,
        compile_status=coding_sub.compile_status,
        compiler_output=coding_sub.compiler_output,
        test_cases_passed=coding_sub.test_cases_passed,
        total_test_cases=coding_sub.total_test_cases
    )

@router.get("/topics/all", response_model=List[schemas.TopicDetailResponse])
def get_all_topics(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    topics = db.query(models.Topic).all()
    return topics

@router.post("/topics", response_model=schemas.TopicDetailResponse)
def create_topic(
    topic_in: schemas.TopicCreate,
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(get_current_admin)
):
    topic = db.query(models.Topic).filter(models.Topic.name == topic_in.name).first()
    if topic:
        raise HTTPException(status_code=400, detail="Topic already exists")
    
    new_topic = models.Topic(
        name=topic_in.name,
        description=topic_in.description
    )
    db.add(new_topic)
    db.commit()
    db.refresh(new_topic)
    return new_topic

@router.delete("/topics/{topic_id}")
def delete_topic(
    topic_id: str,
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(get_current_admin)
):
    import uuid
    try:
        topic_uuid = uuid.UUID(topic_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid topic ID")
        
    topic = db.query(models.Topic).filter(models.Topic.id == topic_uuid).first()
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")
        
    db.delete(topic)
    db.commit()
    return {"message": "Topic successfully deleted"}

@router.post("/topics/{topic_id}/subtopics", response_model=schemas.SubtopicResponse)
def create_subtopic(
    topic_id: str,
    subtopic_in: schemas.SubtopicCreate,
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(get_current_admin)
):
    import uuid
    try:
        topic_uuid = uuid.UUID(topic_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid topic ID")
        
    topic = db.query(models.Topic).filter(models.Topic.id == topic_uuid).first()
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")
        
    new_subtopic = models.Subtopic(
        topic_id=topic_uuid,
        name=subtopic_in.name,
        description=subtopic_in.description
    )
    db.add(new_subtopic)
    db.commit()
    db.refresh(new_subtopic)
    return new_subtopic

@router.delete("/subtopics/{subtopic_id}")
def delete_subtopic(
    subtopic_id: str,
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(get_current_admin)
):
    import uuid
    try:
        subtopic_uuid = uuid.UUID(subtopic_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid subtopic ID")
        
    subtopic = db.query(models.Subtopic).filter(models.Subtopic.id == subtopic_uuid).first()
    if not subtopic:
        raise HTTPException(status_code=404, detail="Subtopic not found")
        
    db.delete(subtopic)
    db.commit()
    return {"message": "Subtopic successfully deleted"}
