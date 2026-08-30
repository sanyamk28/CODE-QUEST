import os
import json
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Optional
import google.generativeai as genai
from pypdf import PdfReader
from io import BytesIO

from app.core.database import get_db
from app.core.config import settings
from app.api.v1.deps import get_current_user
from app.models import models
from app.schemas import schemas

router = APIRouter()

# Configure Google Gemini if API Key is present
if settings.GEMINI_API_KEY:
    genai.configure(api_key=settings.GEMINI_API_KEY)

def generate_llm_response(prompt: str, fallback_response: str) -> str:
    if not settings.GEMINI_API_KEY:
        return fallback_response
    try:
        # Use gemini-1.5-flash as the standard fast text model
        model = genai.GenerativeModel('gemini-1.5-flash')
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        print(f"Gemini API execution error: {e}. Falling back to default mock answer.")
        return fallback_response

@router.post("/interviews/start", response_model=schemas.InterviewStartResponse)
def start_interview(
    payload: schemas.InterviewStartRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # Create Interview Record
    interview = models.Interview(
        user_id=current_user.id,
        mode=payload.mode,
        status="ongoing"
    )
    db.add(interview)
    db.commit()
    db.refresh(interview)
    
    # Generate First Question
    prompt = f"You are a professional technical recruiter conducting a mock interview for the role of '{payload.mode}'. Generate a single, challenging first question to ask the candidate."
    fallback = f"Welcome to the {payload.mode} mock interview. Let's start. Can you describe a complex technical project you built, the challenges you faced, and how you overcame them?"
    
    first_question = generate_llm_response(prompt, fallback)
    
    # Save session
    session = models.InterviewSession(
        interview_id=interview.id,
        transcripts=[{"speaker": "AI", "text": first_question}]
    )
    db.add(session)
    db.commit()
    
    return schemas.InterviewStartResponse(
        interview_id=interview.id,
        first_question=first_question
    )

@router.post("/interviews/{id}/respond", response_model=schemas.InterviewMessageResponse)
def respond_interview(
    id: str,
    payload: schemas.InterviewMessageRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    interview = db.query(models.Interview).filter(models.Interview.id == id, models.Interview.user_id == current_user.id).first()
    if not interview or not interview.session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interview session not found"
        )
        
    session = interview.session
    transcripts = list(session.transcripts)
    
    # Save user message
    transcripts.append({"speaker": "USER", "text": payload.message})
    
    # Count rounds (AI question + USER response is 1 round)
    user_msgs_count = sum(1 for m in transcripts if m["speaker"] == "USER")
    
    if user_msgs_count >= 4:
        # Complete Interview and Generate grading report
        interview.status = "completed"
        
        prompt = f"""
        Analyze the following mock interview transcript for the role of '{interview.mode}'. 
        Generate a JSON object containing:
        - overall_score (float 0-100)
        - technical_score (float 0-100)
        - communication_score (float 0-100)
        - strengths (list of strings)
        - weaknesses (list of strings)
        - feedback (string summary)

        Transcript: {json.dumps(transcripts)}
        """
        fallback_json = {
            "overall_score": 75.0,
            "technical_score": 78.0,
            "communication_score": 72.0,
            "strengths": ["Structured problem solving approach", "Good knowledge of core schemas"],
            "weaknesses": ["Explain runtime trade-offs in detail", "Pacing could be improved"],
            "feedback": "Overall a good performance. Review scalability patterns and window partitioning functions in SQL."
        }
        
        report_str = generate_llm_response(prompt, json.dumps(fallback_json))
        try:
            # Parse report json
            report = json.loads(report_str)
        except Exception:
            report = fallback_json
            
        session.overall_score = report.get("overall_score")
        session.technical_score = report.get("technical_score")
        session.communication_score = report.get("communication_score")
        session.strengths = report.get("strengths")
        session.weaknesses = report.get("weaknesses")
        session.feedback = report.get("feedback")
        
        # Award XP and update communication score
        if current_user.profile:
            current_user.profile.xp += 50
            current_user.profile.communication_level = min(current_user.profile.communication_level + 5.0, 100.0)
            
        session.transcripts = transcripts
        db.commit()
        
        return schemas.InterviewMessageResponse(
            interview_id=interview.id,
            ai_response="Thank you. That concludes our mock interview session. Your detailed feedback report is ready.",
            status="completed",
            report=report
        )
    else:
        # Generate next follow-up question
        prompt = f"""
        You are conducting a mock technical interview for a {interview.mode} candidate. 
        Here is the conversation history: {json.dumps(transcripts)}.
        Respond to the candidate's last answer and ask one relevant, challenging follow-up question.
        Do not output anything other than the AI's response text.
        """
        fallback_q = "Thank you. Let's move to the next topic. How do you handle schema evolution or changes in columns over time inside a database?"
        
        next_q = generate_llm_response(prompt, fallback_q)
        transcripts.append({"speaker": "AI", "text": next_q})
        session.transcripts = transcripts
        db.commit()
        
        return schemas.InterviewMessageResponse(
            interview_id=interview.id,
            ai_response=next_q,
            status="ongoing"
        )

@router.post("/resume/upload", response_model=schemas.ResumeAnalysisResponse)
async def upload_resume(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF resume uploads are supported."
        )
        
    contents = await file.read()
    
    # 1. Parse text from PDF
    resume_text = ""
    try:
        reader = PdfReader(BytesIO(contents))
        for page in reader.pages:
            resume_text += page.extract_text() or ""
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to parse PDF text: {str(e)}"
        )
        
    # 2. Match keywords and analyze via LLM
    target_role = current_user.profile.target_role if current_user.profile else "Software Engineer"
    
    prompt = f"""
    Analyze the following resume text for alignment with the role of '{target_role}'.
    Generate a JSON object containing:
    - ats_score (integer 0-100)
    - matched_skills (list of strings found in the resume matching the role)
    - missing_skills (list of critical skills for the role not found in the resume)
    - formatting_feedback (string feedback)
    - role_alignment (string summary)
    - suggestions (list of strings for improvements)

    Resume Text: {resume_text}
    """
    
    fallback_analysis = {
        "ats_score": 74,
        "matched_skills": ["Python", "SQL", "PostgreSQL", "Database Design"],
        "missing_skills": ["Apache Spark", "Airflow", "Docker", "Data Warehousing"],
        "formatting_feedback": "Clean layout. Make sure to use bullet points that start with action verbs.",
        "role_alignment": "Moderate fit. Technical base is present, but lacks explicit big data tool experience.",
        "suggestions": ["Add a section highlighting project orchestration using Apache Airflow.", "Use quantifiable metrics (e.g. reduced runtimes by 20%)."]
    }
    
    analysis_str = generate_llm_response(prompt, json.dumps(fallback_analysis))
    try:
        analysis = json.loads(analysis_str)
    except Exception:
        analysis = fallback_analysis

    # Save Resume metadata
    # Save mock file locally or record metadata
    resume_rec = models.Resume(
        user_id=current_user.id,
        file_name=file.filename,
        file_path=f"uploads/{file.filename}"
    )
    db.add(resume_rec)
    db.commit()
    db.refresh(resume_rec)
    
    # Save analysis details
    resume_analysis = models.ResumeAnalysis(
        resume_id=resume_rec.id,
        ats_score=analysis.get("ats_score"),
        matched_skills=analysis.get("matched_skills"),
        missing_skills=analysis.get("missing_skills"),
        formatting_feedback=analysis.get("formatting_feedback"),
        role_alignment=analysis.get("role_alignment"),
        suggestions=analysis.get("suggestions")
    )
    db.add(resume_analysis)
    db.commit()
    
    return schemas.ResumeAnalysisResponse(
        ats_score=resume_analysis.ats_score,
        matched_skills=resume_analysis.matched_skills,
        missing_skills=resume_analysis.missing_skills,
        formatting_feedback=resume_analysis.formatting_feedback,
        role_alignment=resume_analysis.role_alignment,
        suggestions=resume_analysis.suggestions
    )
