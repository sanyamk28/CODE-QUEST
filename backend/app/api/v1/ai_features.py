import os
import json
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
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
from app.services.ats_scanner import calculate_ats_score

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

        from app.core.analytics import record_analytics_event
        record_analytics_event(
            db=db,
            event_type="mock_interview_completed",
            user_id=current_user.id,
            metadata={"mode": interview.mode, "overall_score": session.overall_score, "technical_score": session.technical_score}
        )
        
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

def extract_clean_json(text: str) -> Optional[dict]:
    clean = text.strip()
    if clean.startswith("```"):
        lines = clean.split("\n")
        if lines[0].startswith("```"):
            lines = lines[1:]
        if lines and lines[-1].strip() == "```":
            lines = lines[:-1]
        clean = "\n".join(lines).strip()
    try:
        return json.loads(clean)
    except Exception:
        start = clean.find("{")
        end = clean.rfind("}")
        if start != -1 and end != -1 and end > start:
            try:
                return json.loads(clean[start:end+1])
            except Exception:
                pass
    return None

@router.post("/resume/upload", response_model=schemas.ResumeAnalysisResponse)
async def upload_resume(
    file: UploadFile = File(...),
    target_role: Optional[str] = Form(None),
    job_description: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if not file.filename.lower().endswith(".pdf"):
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
            resume_text += (page.extract_text() or "") + "\n"
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to parse PDF text: {str(e)}"
        )
        
    # 2. Determine target role
    effective_role = target_role.strip() if target_role and target_role.strip() else (
        current_user.profile.target_role if (current_user.profile and current_user.profile.target_role) else "Software Engineer"
    )

    # 3. Calculate genuine ATS score and full breakdown
    ats_result = calculate_ats_score(
        resume_text=resume_text,
        target_role=effective_role,
        job_description=job_description
    )

    # 4. Optional Gemini enrichment if API key configured
    if settings.GEMINI_API_KEY:
        prompt = f"""
        You are an elite technical recruiter and ATS auditor.
        Review the candidate's resume for the role: '{effective_role}'.
        Computed ATS Score: {ats_result['ats_score']}/100.
        Matched Skills: {', '.join(ats_result['matched_skills'][:10])}.
        Missing Recommended Keywords: {', '.join(ats_result['missing_skills'][:8])}.

        Provide a concise JSON response with:
        - role_alignment: A concise 2-sentence executive recruiter summary.
        - formatting_feedback: 1-2 sentences highlighting layout, readability, and ATS parsing notes.
        - suggestions: List of 3-4 specific high-impact enhancements.

        Candidate Resume Content:
        {resume_text[:3500]}
        """
        llm_response_str = generate_llm_response(prompt, "")
        parsed_llm = extract_clean_json(llm_response_str)
        if parsed_llm:
            if parsed_llm.get("role_alignment"):
                ats_result["role_alignment"] = parsed_llm["role_alignment"]
            if parsed_llm.get("formatting_feedback"):
                ats_result["formatting_feedback"] = parsed_llm["formatting_feedback"]
            if parsed_llm.get("suggestions") and isinstance(parsed_llm["suggestions"], list) and len(parsed_llm["suggestions"]) >= 2:
                ats_result["suggestions"] = parsed_llm["suggestions"]

    # 5. Save Resume metadata
    resume_rec = models.Resume(
        user_id=current_user.id,
        file_name=file.filename,
        file_path=f"uploads/{file.filename}"
    )
    db.add(resume_rec)
    db.commit()
    db.refresh(resume_rec)
    
    # 6. Save analysis details
    resume_analysis = models.ResumeAnalysis(
        resume_id=resume_rec.id,
        ats_score=ats_result["ats_score"],
        matched_skills=ats_result["matched_skills"],
        missing_skills=ats_result["missing_skills"],
        formatting_feedback=ats_result["formatting_feedback"],
        role_alignment=ats_result["role_alignment"],
        suggestions=ats_result["suggestions"],
        score_breakdown=ats_result["score_breakdown"],
        metrics=ats_result["metrics"]
    )
    db.add(resume_analysis)
    db.commit()

    from app.core.analytics import record_analytics_event
    record_analytics_event(db, "resume_uploaded", current_user.id, {"filename": file.filename})
    record_analytics_event(db, "resume_scored", current_user.id, {"ats_score": resume_analysis.ats_score, "matched_skills": resume_analysis.matched_skills})
    
    return schemas.ResumeAnalysisResponse(
        ats_score=ats_result["ats_score"],
        target_role=effective_role,
        matched_skills=ats_result["matched_skills"],
        missing_skills=ats_result["missing_skills"],
        formatting_feedback=ats_result["formatting_feedback"],
        role_alignment=ats_result["role_alignment"],
        suggestions=ats_result["suggestions"],
        score_breakdown=schemas.ATSScoreBreakdown(**ats_result["score_breakdown"]),
        metrics=schemas.ATSMetrics(
            word_count=ats_result["metrics"]["word_count"],
            estimated_pages=ats_result["metrics"]["estimated_pages"],
            action_verbs_count=ats_result["metrics"]["action_verbs_count"],
            quantified_metrics_count=ats_result["metrics"]["quantified_metrics_count"],
            sections_found=ats_result["metrics"]["sections_found"],
            sections_missing=ats_result["metrics"]["sections_missing"],
            contact_info=schemas.ATSContactInfo(**ats_result["metrics"]["contact_info"])
        ),
        bullet_improvements=[
            schemas.ATSBulletImprovement(**b) for b in ats_result.get("bullet_improvements", [])
        ],
        jd_match_score=ats_result.get("jd_match_score")
    )

@router.post("/resume/rewrite-bullet", response_model=schemas.ResumeBulletRewriteResponse)
def rewrite_resume_bullet(
    payload: schemas.ResumeBulletRewriteRequest,
    current_user: models.User = Depends(get_current_user)
):
    """
    Transforms a raw resume achievement bullet into the industry gold-standard
    Google X-Y-Z formula: Accomplished [X] as measured by [Y], by doing [Z].
    """
    raw = payload.bullet_text.strip()
    role = payload.target_role or "Software Engineer"

    prompt = f"""
    You are an executive resume coach and tech recruiter specializing in the Google X-Y-Z formula:
    'Accomplished [X] as measured by [Y], by doing [Z]'.

    Candidate Target Role: {role}
    Raw Bullet Point: "{raw}"

    Rewrite this bullet point to demonstrate exceptional engineering impact with:
    1. Strong active verb at the start (e.g. Engineered, Architected, Accelerated, Reduced).
    2. Quantifiable business/performance metric (e.g. 42% latency reduction, $120k savings, 250k DAU).
    3. Technical tools/methods utilized (e.g. Python, PostgreSQL indexing, Redis caching).

    Respond in raw JSON:
    {{
        "improved": "Rewritten X-Y-Z bullet text",
        "action_verb": "Primary action verb used",
        "key_metrics_added": ["Metric 1", "Metric 2"]
    }}
    """
    fallback_improved = f"Architected scalable backend services using Python and PostgreSQL, reducing query latency by 38% and supporting 100K+ daily active users."
    fallback_json = {
        "improved": fallback_improved,
        "action_verb": "Architected",
        "key_metrics_added": ["38% query latency reduction", "100K+ daily active users"]
    }

    resp_str = generate_llm_response(prompt, json.dumps(fallback_json))
    parsed = extract_clean_json(resp_str) or fallback_json

    return schemas.ResumeBulletRewriteResponse(
        original=raw,
        improved=parsed.get("improved", fallback_improved),
        action_verb=parsed.get("action_verb", "Architected"),
        key_metrics_added=parsed.get("key_metrics_added", ["38% query latency reduction", "100K+ users"])
    )

