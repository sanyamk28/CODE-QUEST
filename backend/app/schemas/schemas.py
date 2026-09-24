from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import List, Optional, Dict, Any
from uuid import UUID
from datetime import datetime

# --- AUTH SCHEMAS ---

class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, description="Password must be at least 8 characters long")
    name: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    is_admin: bool = False
    is_new_user: bool = False
    user_id: Optional[str] = None
    email: Optional[str] = None
    name: Optional[str] = None

class TokenRefresh(BaseModel):
    refresh_token: str

class GoogleLoginRequest(BaseModel):
    id_token: str
    email: Optional[str] = None
    name: Optional[str] = None

class UserResponse(BaseModel):
    id: UUID
    email: EmailStr
    is_active: bool
    is_admin: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# --- PROFILE SCHEMAS ---

class OnboardingRequest(BaseModel):
    name: str
    college: Optional[str] = None
    degree: Optional[str] = None
    graduation_year: Optional[int] = None
    target_role: Optional[str] = None
    experience_level: str = "beginner"  # beginner, intermediate, advanced
    target_companies: List[str] = []
    prep_duration: int = 3 # months
    daily_study_goal: int = 2 # hours
    skills: List[str] = []
    dsa_level: float = 0.0
    sql_level: float = 0.0
    aptitude_level: float = 0.0

class ProfileResponse(BaseModel):
    id: UUID
    user_id: UUID
    name: str
    college: Optional[str]
    degree: Optional[str]
    graduation_year: Optional[int]
    target_role: Optional[str]
    experience_level: Optional[str] = "beginner"
    target_companies: List[str]
    prep_duration: int
    daily_study_goal: int
    xp: int
    streak: int
    readiness_score: float
    skills: List[str]
    dsa_level: float
    sql_level: float
    aptitude_level: float
    cs_fundamentals_level: float
    communication_level: float

    model_config = ConfigDict(from_attributes=True)

# --- QUESTION / TOPIC SCHEMAS ---

class TopicResponse(BaseModel):
    id: UUID
    name: str
    description: Optional[str]

    model_config = ConfigDict(from_attributes=True)

class SubtopicResponse(BaseModel):
    id: UUID
    topic_id: UUID
    name: str
    description: Optional[str]

    model_config = ConfigDict(from_attributes=True)

class QuestionListResponse(BaseModel):
    id: UUID
    title: str
    difficulty: str
    type: str
    xp_reward: int
    company_tags: List[str] = []
    topic_name: Optional[str] = "DSA"
    subtopic_name: Optional[str] = "Algorithms"

    model_config = ConfigDict(from_attributes=True)

# MCQ Details
class MCQDetailResponse(BaseModel):
    option_a: str
    option_b: str
    option_c: str
    option_d: str
    time_limit: int

    model_config = ConfigDict(from_attributes=True)

# Coding Details
class CodingDetailResponse(BaseModel):
    constraints: Optional[str]
    input_format: Optional[str]
    output_format: Optional[str]
    time_limit: float
    memory_limit: int
    code_templates: Dict[str, str]
    hints: List[str]

    model_config = ConfigDict(from_attributes=True)

# SQL Details
class SQLDetailResponse(BaseModel):
    schema_description: str
    dataset_tables: Dict[str, Any]

    model_config = ConfigDict(from_attributes=True)

class QuestionDetailResponse(BaseModel):
    id: UUID
    title: str
    description: str
    difficulty: str
    type: str
    xp_reward: int
    company_tags: List[str]
    topic_id: UUID
    subtopic_id: UUID
    
    mcq_detail: Optional[MCQDetailResponse] = None
    coding_detail: Optional[CodingDetailResponse] = None
    sql_detail: Optional[SQLDetailResponse] = None

    model_config = ConfigDict(from_attributes=True)

# --- SUBMISSION SCHEMAS ---

class MCQAttemptRequest(BaseModel):
    selected_option: str  # 'A', 'B', 'C', 'D'

class SQLAttemptRequest(BaseModel):
    query: str

class CodingSubmitRequest(BaseModel):
    code: str
    language: str

class ExecutionResponse(BaseModel):
    status: str
    stdout: str
    stderr: str
    exit_code: Optional[int]
    execution_time: float

class SubmissionResponse(BaseModel):
    id: UUID
    question_id: UUID
    score: int
    is_correct: bool
    created_at: datetime
    
    # Optional extensions
    selected_option: Optional[str] = None
    typed_sql: Optional[str] = None
    sql_error: Optional[str] = None
    
    language: Optional[str] = None
    execution_time: Optional[float] = None
    memory_usage: Optional[int] = None
    compile_status: Optional[str] = None
    compiler_output: Optional[str] = None
    test_cases_passed: Optional[int] = None
    total_test_cases: Optional[int] = None

    model_config = ConfigDict(from_attributes=True)

# --- ASSESSMENT SCHEMAS ---

class AssessmentListResponse(BaseModel):
    id: UUID
    title: str
    description: Optional[str]
    type: str
    duration_minutes: int
    passing_score: int
    negative_marking: float

    model_config = ConfigDict(from_attributes=True)

class AssessmentDetailResponse(BaseModel):
    id: UUID
    title: str
    description: Optional[str]
    type: str
    duration_minutes: int
    questions: List[QuestionListResponse]

    model_config = ConfigDict(from_attributes=True)

class AssessmentSubmitRequest(BaseModel):
    # Mapping of question_id (str) to attempt dictionary e.g. {"selected_option": "A"} or {"code": "...", "language": "python"}
    answers: Dict[str, Any]

class AssessmentResultResponse(BaseModel):
    assessment_id: UUID
    total_questions: int
    correct_answers: int
    score: int
    passed: bool
    answers_checked: Dict[str, Any]

# --- DASHBOARD & ANALYTICS SCHEMAS ---

class DashboardResponse(BaseModel):
    readiness_score: float
    streak: int
    xp: int
    skills_progress: Dict[str, float]  # e.g., {"dsa": 82.0, "sql": 91.0}
    daily_mission: Dict[str, Any]
    recent_activity: List[Dict[str, Any]]
    weak_topics: List[str]
    strong_topics: List[str]

# --- AI INTERVIEW SCHEMAS ---

class InterviewStartRequest(BaseModel):
    mode: str  # technical, behavioral, resume_based, system_design

class InterviewStartResponse(BaseModel):
    interview_id: UUID
    first_question: str

class InterviewMessageRequest(BaseModel):
    message: str

class InterviewMessageResponse(BaseModel):
    interview_id: UUID
    ai_response: str
    status: str # ongoing, completed
    report: Optional[Dict[str, Any]] = None

# --- RESUME ANALYSIS SCHEMAS ---

class ATSScoreBreakdown(BaseModel):
    skills_score: int
    impact_score: int
    completeness_score: int
    formatting_score: int

class ATSContactInfo(BaseModel):
    email: Optional[str] = None
    phone: Optional[str] = None
    linkedin: Optional[str] = None
    github: Optional[str] = None
    portfolio: Optional[str] = None

class ATSMetrics(BaseModel):
    word_count: int
    estimated_pages: int
    action_verbs_count: int
    quantified_metrics_count: int
    sections_found: List[str]
    sections_missing: List[str]
    contact_info: ATSContactInfo

class ATSBulletImprovement(BaseModel):
    original: str
    improved: str
    reason: str

class ResumeAnalysisResponse(BaseModel):
    ats_score: int
    target_role: Optional[str] = "Software Engineer"
    matched_skills: List[str]
    missing_skills: List[str]
    formatting_feedback: str
    role_alignment: str
    suggestions: List[str]
    score_breakdown: Optional[ATSScoreBreakdown] = None
    metrics: Optional[ATSMetrics] = None
    bullet_improvements: Optional[List[ATSBulletImprovement]] = None
    jd_match_score: Optional[int] = None

# --- ROADMAP & PROJECT SCHEMAS ---

class RoadmapResponse(BaseModel):
    id: UUID
    title: str
    role: str
    difficulty: str
    steps: List[Any]

    model_config = ConfigDict(from_attributes=True)

class ProjectResponse(BaseModel):
    id: UUID
    title: str
    description: str
    difficulty: str
    role_tag: str
    dataset_url: Optional[str]
    architecture_steps: List[str]
    interview_questions: List[Dict[str, Any]]
    resume_bullet_suggestions: List[str]

    model_config = ConfigDict(from_attributes=True)

class StudentAdminResponse(BaseModel):
    id: str
    email: str
    auth_provider: str
    created_at: datetime
    name: str
    college: Optional[str] = None
    degree: Optional[str] = None
    target_role: Optional[str] = None
    xp: int
    readiness_score: float

    model_config = ConfigDict(from_attributes=True)

class TopicCreate(BaseModel):
    name: str
    description: Optional[str] = None

class SubtopicCreate(BaseModel):
    name: str
    description: Optional[str] = None

class SubtopicResponse(BaseModel):
    id: UUID
    name: str
    description: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class TopicDetailResponse(BaseModel):
    id: UUID
    name: str
    description: Optional[str] = None
    subtopics: List[SubtopicResponse] = []

    model_config = ConfigDict(from_attributes=True)

class StudentSubmissionDetail(BaseModel):
    id: UUID
    question_title: str
    type: str
    score: int
    is_correct: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class StudentProgressResponse(BaseModel):
    id: str
    email: str
    name: str
    college: Optional[str] = None
    degree: Optional[str] = None
    target_role: Optional[str] = None
    xp: int
    readiness_score: float
    is_active: bool
    dsa_level: float
    sql_level: float
    cs_fundamentals_level: float
    aptitude_level: float
    submissions: List[StudentSubmissionDetail] = []
    logins: List['LoginLogDetail'] = []

    model_config = ConfigDict(from_attributes=True)

class LoginLogDetail(BaseModel):
    id: UUID
    login_time: datetime
    ip_address: Optional[str] = None
    auth_provider: str
    device_info: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

# --- ANALYTICS SCHEMAS ---

class AnalyticsEventCreate(BaseModel):
    event_type: str
    metadata: Dict[str, Any] = {}

class AnalyticsEventResponse(BaseModel):
    id: UUID
    user_id: Optional[UUID] = None
    event_type: str
    metadata_json: Dict[str, Any] = {}
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class AnalyticsSummaryResponse(BaseModel):
    total_enrolled_users: int
    daily_active_users: int
    weekly_active_users: int
    average_readiness_score: float
    feature_adoption_rates: Dict[str, int]
    roadmap_dropoff_stats: Dict[str, int]
    recent_events: List[AnalyticsEventResponse] = []

# --- BATTLE ROOM SCHEMAS ---

class BattleRoomCreate(BaseModel):
    problem_id: Optional[str] = None
    difficulty: Optional[str] = "Easy"
    max_players: int = 4

class BattleRoomJoin(BaseModel):
    room_code: str

class BattleParticipantResponse(BaseModel):
    user_id: UUID
    user_name: str
    has_passed: bool
    score: int
    joined_at: datetime

class BattleProblemDetail(BaseModel):
    id: UUID
    title: str
    description: str
    difficulty: str
    type: str = "coding"
    xp_reward: int = 25
    company_tags: List[str] = []
    template_code: Optional[str] = None
    input_format: Optional[str] = None
    output_format: Optional[str] = None
    constraints: Optional[str] = None

class BattleRoomResponse(BaseModel):
    id: UUID
    room_code: str
    host_id: UUID
    problem_id: Optional[UUID] = None
    status: str
    winner_id: Optional[UUID] = None
    winner_name: Optional[str] = None
    max_players: int
    created_at: datetime
    started_at: Optional[datetime] = None
    ended_at: Optional[datetime] = None
    participants: List[BattleParticipantResponse] = []
    problem: Optional[QuestionListResponse] = None
    problem_detail: Optional[BattleProblemDetail] = None

class BattleSubmitRequest(BaseModel):
    code: str
    language: str = "python"

class BattleSubmitResponse(BaseModel):
    is_correct: bool
    test_cases_passed: int
    total_test_cases: int
    is_winner: bool
    execution_time: float
    compiler_output: Optional[str] = None

# --- PUZZLE SCHEMAS ---

class PuzzleListResponse(BaseModel):
    id: UUID
    title: str
    description: str
    difficulty: str
    category: str
    xp_reward: int

class PuzzleDetailResponse(BaseModel):
    id: UUID
    title: str
    description: str
    difficulty: str
    category: str
    xp_reward: int
    hints: List[str] = []
    has_solution: bool = True
    company_tags: List[str] = []

class PuzzleCheckRequest(BaseModel):
    solution_text: str

class PuzzleCheckResponse(BaseModel):
    is_correct: bool
    score: int
    explanation: Optional[str] = None

# --- RESUME ENHANCER SCHEMAS ---

class ResumeBulletRewriteRequest(BaseModel):
    bullet_text: str
    target_role: Optional[str] = "Software Engineer"

class ResumeBulletRewriteResponse(BaseModel):
    original: str
    improved: str
    framework: str = "Google X-Y-Z (Accomplished [X], measured by [Y], by doing [Z])"
    key_metrics_added: List[str] = []
    action_verb: str


