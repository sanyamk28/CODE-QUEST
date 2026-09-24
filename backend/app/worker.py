import os
import time
from celery import Celery
from app.core.config import settings

# Initialize Celery app
celery_app = Celery(
    "placementforge_worker",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL
)

# Configuration overrides
celery_app.conf.update(
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
    timezone="UTC",
    enable_utc=True,
)

@celery_app.task(name="app.worker.test_task")
def test_task(x: int, y: int) -> int:
    time.sleep(1)
    return x + y

@celery_app.task(name="app.worker.send_push_notification_task")
def send_push_notification_task(user_id: str, title: str, message: str) -> bool:
    print(f"[FCM Notification] Sending to User: {user_id} - Title: {title} | Message: {message}")
    return True

@celery_app.task(name="app.worker.process_resume_ats_task")
def process_resume_ats_task(resume_id: str, resume_text: str, target_role: str, job_description: str = None) -> dict:
    """
    Asynchronously computes ATS score, keyword alignment, and formatting diagnosis,
    persisting results to the database without blocking the HTTP request thread.
    """
    import uuid
    from app.core.database import SessionLocal
    from app.models import models
    from app.services.ats_scanner import calculate_ats_score

    ats_result = calculate_ats_score(
        resume_text=resume_text,
        target_role=target_role,
        job_description=job_description
    )

    db = SessionLocal()
    try:
        resume_uuid = uuid.UUID(resume_id)
        existing_analysis = db.query(models.ResumeAnalysis).filter(models.ResumeAnalysis.resume_id == resume_uuid).first()
        if existing_analysis:
            existing_analysis.ats_score = ats_result["ats_score"]
            existing_analysis.matched_skills = ats_result["matched_skills"]
            existing_analysis.missing_skills = ats_result["missing_skills"]
            existing_analysis.formatting_feedback = ats_result["formatting_feedback"]
            existing_analysis.role_alignment = ats_result["role_alignment"]
            existing_analysis.suggestions = ats_result["suggestions"]
            existing_analysis.score_breakdown = ats_result["score_breakdown"]
            existing_analysis.metrics = ats_result["metrics"]
        else:
            new_analysis = models.ResumeAnalysis(
                resume_id=resume_uuid,
                ats_score=ats_result["ats_score"],
                matched_skills=ats_result["matched_skills"],
                missing_skills=ats_result["missing_skills"],
                formatting_feedback=ats_result["formatting_feedback"],
                role_alignment=ats_result["role_alignment"],
                suggestions=ats_result["suggestions"],
                score_breakdown=ats_result["score_breakdown"],
                metrics=ats_result["metrics"]
            )
            db.add(new_analysis)
        db.commit()
    except Exception as e:
        db.rollback()
        print(f"[Celery Worker] Error saving ATS analysis for {resume_id}: {e}")
    finally:
        db.close()

    return ats_result

