import io
import pytest
from pypdf import PdfWriter
from app.services.ats_scanner import (
    calculate_ats_score,
    extract_contact_info,
    detect_sections,
    match_skills,
    analyze_quantifiable_impact
)
from app.models import models
from app.core.security import get_password_hash

SAMPLE_STRONG_RESUME = """
Alex Chen
Email: alex.chen@example.com | Phone: +1 (555) 234-5678
LinkedIn: https://linkedin.com/in/alexchen-dev | GitHub: https://github.com/alexchen-dev
Portfolio: alexchen.dev

Professional Summary
Senior Software Engineer with 5+ years of experience designing high-throughput distributed systems and cloud microservices.

Technical Skills
Languages: Python, Java, C++, TypeScript, SQL, Go
Frameworks & Tools: FastAPI, Docker, Kubernetes, PostgreSQL, Redis, Git, Linux, Microservices, CI/CD, System Design, Unit Testing

Professional Experience
Lead Backend Engineer - Nexus Technologies (2022 - Present)
• Architected and deployed 16 microservices in Python and FastAPI, handling 350k+ daily API requests with sub-40ms response latency.
• Engineered and optimized PostgreSQL database queries and indexing strategies, reducing query execution times by 42%.
• Spearheaded automated CI/CD pipeline using GitHub Actions and Docker, accelerating release frequency by 3x and eliminating manual deployment errors.
• Mentored a team of 6 junior engineers and standardized code review practices across the backend team.

Software Developer - DataFlow Systems (2019 - 2022)
• Developed scalable REST APIs using Python and PostgreSQL serving 100k+ monthly active users.
• Implemented Redis caching layers, decreasing server CPU utilization by 25% during peak traffic hours.
• Designed and executed comprehensive unit test suites achieving 94% test coverage across core payment modules.

Education
Bachelor of Science in Computer Science
University of California, Berkeley (2015 - 2019)

Projects
Cloud Distributed Key-Value Store
• Built a distributed Raft consensus key-value store in Go and Docker supporting 10k QPS with zero data loss.
"""

SAMPLE_WEAK_RESUME = """
Jane
Contact: jane@test.com
I like coding and computers.
Worked on some websites and python scripts.
Did some work in team.
"""

def test_extract_contact_info():
    info = extract_contact_info(SAMPLE_STRONG_RESUME)
    assert info["email"] == "alex.chen@example.com"
    assert info["phone"] is not None and "555" in info["phone"]
    assert "alexchen-dev" in info["linkedin"]
    assert "alexchen-dev" in info["github"]
    assert info["portfolio"] == "alexchen.dev"

def test_detect_sections():
    found, missing = detect_sections(SAMPLE_STRONG_RESUME)
    assert "Summary" in found or "Experience" in found
    assert "Skills" in found
    assert "Education" in found
    assert "Projects" in found

def test_analyze_quantifiable_impact():
    impact = analyze_quantifiable_impact(SAMPLE_STRONG_RESUME)
    assert impact["action_verbs_count"] >= 5
    assert impact["metrics_count"] >= 4
    assert len(impact["sample_metrics"]) >= 1

def test_match_skills_for_software_engineer():
    skills = match_skills(SAMPLE_STRONG_RESUME, target_role="Software Engineer")
    assert "Python" in skills["matched_skills"]
    assert "PostgreSQL" in skills["matched_skills"]
    assert "Docker" in skills["matched_skills"]
    assert skills["core_matched_count"] >= 5

def test_match_skills_with_job_description():
    jd = "We are seeking a Backend Developer experienced with Python, Docker, Redis, Kubernetes, and Kafka."
    skills = match_skills(SAMPLE_STRONG_RESUME, target_role="Backend Developer", job_description=jd)
    assert skills["jd_match_score"] is not None
    assert skills["jd_match_score"] >= 60

def test_real_ats_score_differentiation():
    strong_result = calculate_ats_score(SAMPLE_STRONG_RESUME, target_role="Software Engineer")
    weak_result = calculate_ats_score(SAMPLE_WEAK_RESUME, target_role="Software Engineer")
    
    # Strong resume should score significantly higher than weak resume
    assert strong_result["ats_score"] >= 80
    assert weak_result["ats_score"] <= 45
    assert strong_result["ats_score"] > weak_result["ats_score"]
    
    # Check sub-score breakdowns exist and are realistic
    assert strong_result["score_breakdown"]["skills_score"] > weak_result["score_breakdown"]["skills_score"]
    assert strong_result["score_breakdown"]["impact_score"] > weak_result["score_breakdown"]["impact_score"]
    assert strong_result["score_breakdown"]["completeness_score"] > weak_result["score_breakdown"]["completeness_score"]

def test_resume_upload_endpoint(client, db_session):
    # 1. Create student user
    student = models.User(
        email="resumeteser@codequest.dev",
        hashed_password=get_password_hash("testpass123"),
        is_active=True,
        is_admin=False
    )
    db_session.add(student)
    db_session.commit()

    login = client.post("/api/v1/auth/login", json={"email": "resumeteser@codequest.dev", "password": "testpass123"})
    token = login.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Build a valid in-memory PDF
    writer = PdfWriter()
    writer.add_blank_page(width=612, height=792)
    pdf_bytes = io.BytesIO()
    writer.write(pdf_bytes)
    pdf_bytes.seek(0)

    # 3. Upload PDF
    files = {"file": ("Alex_Resume.pdf", pdf_bytes, "application/pdf")}
    data = {"target_role": "Software Engineer"}
    res = client.post("/api/v1/ai/resume/upload", files=files, data=data, headers=headers)
    assert res.status_code == 200
    res_data = res.json()
    
    assert "ats_score" in res_data
    assert "score_breakdown" in res_data
    assert "metrics" in res_data
    assert "matched_skills" in res_data
    assert "missing_skills" in res_data
    assert "bullet_improvements" in res_data
    assert res_data["target_role"] == "Software Engineer"
