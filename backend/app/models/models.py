import uuid
from datetime import datetime
from sqlalchemy import (
    Column, String, Boolean, DateTime, ForeignKey, Integer, Float, Text, JSON, Table, Index
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.core.database import Base

# Junction table for assessment questions
assessment_questions = Table(
    'assessment_questions',
    Base.metadata,
    Column('assessment_id', UUID(as_uuid=True), ForeignKey('assessments.id', ondelete='CASCADE'), primary_key=True),
    Column('question_id', UUID(as_uuid=True), ForeignKey('questions.id', ondelete='CASCADE'), primary_key=True)
)

# Junction table for contest questions
contest_questions = Table(
    'contest_questions',
    Base.metadata,
    Column('contest_id', UUID(as_uuid=True), ForeignKey('contests.id', ondelete='CASCADE'), primary_key=True),
    Column('question_id', UUID(as_uuid=True), ForeignKey('questions.id', ondelete='CASCADE'), primary_key=True)
)

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)
    auth_provider = Column(String, default="local")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    profile = relationship("Profile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    submissions = relationship("Submission", back_populates="user", cascade="all, delete-orphan")
    progress = relationship("UserProgress", back_populates="user", cascade="all, delete-orphan")
    interviews = relationship("Interview", back_populates="user", cascade="all, delete-orphan")
    resumes = relationship("Resume", back_populates="user", cascade="all, delete-orphan")
    contest_participations = relationship("ContestParticipant", back_populates="user", cascade="all, delete-orphan")
    discussions = relationship("Discussion", back_populates="user", cascade="all, delete-orphan")
    comments = relationship("Comment", back_populates="user", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
    login_histories = relationship("LoginHistory", back_populates="user", cascade="all, delete-orphan")


class Profile(Base):
    __tablename__ = "profiles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True)
    name = Column(String, nullable=False)
    college = Column(String, nullable=True)
    degree = Column(String, nullable=True)
    graduation_year = Column(Integer, nullable=True)
    target_role = Column(String, nullable=True)
    experience_level = Column(String, nullable=True) # beginner, intermediate, advanced
    target_companies = Column(JSON, default=list) # List of target company strings
    prep_duration = Column(Integer, default=3) # Preparation duration in months
    daily_study_goal = Column(Integer, default=2) # Study hours goal per day
    xp = Column(Integer, default=0)
    streak = Column(Integer, default=0)
    readiness_score = Column(Float, default=0.0)
    skills = Column(JSON, default=list) # List of currently possessed skills
    
    # Levels of specific domains (0 to 100)
    dsa_level = Column(Float, default=0.0)
    sql_level = Column(Float, default=0.0)
    aptitude_level = Column(Float, default=0.0)
    cs_fundamentals_level = Column(Float, default=0.0)
    communication_level = Column(Float, default=0.0)

    # Relationship
    user = relationship("User", back_populates="profile")


class Topic(Base):
    __tablename__ = "topics"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False, unique=True, index=True)
    description = Column(Text, nullable=True)

    # Relationships
    subtopics = relationship("Subtopic", back_populates="topic", cascade="all, delete-orphan")
    questions = relationship("Question", back_populates="topic")


class Subtopic(Base):
    __tablename__ = "subtopics"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    topic_id = Column(UUID(as_uuid=True), ForeignKey("topics.id", ondelete="CASCADE"), nullable=False)
    name = Column(String, nullable=False, index=True)
    description = Column(Text, nullable=True)

    # Relationships
    topic = relationship("Topic", back_populates="subtopics")
    questions = relationship("Question", back_populates="subtopic")
    user_progress = relationship("UserProgress", back_populates="subtopic", cascade="all, delete-orphan")


class Question(Base):
    __tablename__ = "questions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    title = Column(String, nullable=False, index=True)
    description = Column(Text, nullable=False)
    difficulty = Column(String, nullable=False) # Easy, Medium, Hard
    topic_id = Column(UUID(as_uuid=True), ForeignKey("topics.id", ondelete="CASCADE"), nullable=False)
    subtopic_id = Column(UUID(as_uuid=True), ForeignKey("subtopics.id", ondelete="CASCADE"), nullable=False)
    xp_reward = Column(Integer, default=10)
    type = Column(String, nullable=False) # coding, sql, mcq, aptitude, puzzle, scenario
    company_tags = Column(JSON, default=list) # List of company names
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    topic = relationship("Topic", back_populates="questions")
    subtopic = relationship("Subtopic", back_populates="questions")
    
    # Specific detail tables (1-to-1)
    mcq_detail = relationship("MCQQuestion", back_populates="question", uselist=False, cascade="all, delete-orphan")
    coding_detail = relationship("CodingProblem", back_populates="question", uselist=False, cascade="all, delete-orphan")
    sql_detail = relationship("SQLProblem", back_populates="question", uselist=False, cascade="all, delete-orphan")
    
    submissions = relationship("Submission", back_populates="question", cascade="all, delete-orphan")
    discussions = relationship("Discussion", back_populates="question", cascade="all, delete-orphan")


class MCQQuestion(Base):
    __tablename__ = "mcq_questions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    question_id = Column(UUID(as_uuid=True), ForeignKey("questions.id", ondelete="CASCADE"), nullable=False, unique=True)
    option_a = Column(String, nullable=False)
    option_b = Column(String, nullable=False)
    option_c = Column(String, nullable=False)
    option_d = Column(String, nullable=False)
    correct_option = Column(String, nullable=False) # 'A', 'B', 'C', 'D'
    explanation = Column(Text, nullable=True)
    time_limit = Column(Integer, default=60) # Seconds
    negative_marking = Column(Float, default=0.0)

    # Relationship
    question = relationship("Question", back_populates="mcq_detail")


class CodingProblem(Base):
    __tablename__ = "coding_problems"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    question_id = Column(UUID(as_uuid=True), ForeignKey("questions.id", ondelete="CASCADE"), nullable=False, unique=True)
    constraints = Column(Text, nullable=True)
    input_format = Column(Text, nullable=True)
    output_format = Column(Text, nullable=True)
    time_limit = Column(Float, default=2.0) # Seconds
    memory_limit = Column(Integer, default=256) # MB
    code_templates = Column(JSON, default=dict) # e.g. {"python": "def solve():", "cpp": "..."}
    optimal_solution = Column(Text, nullable=True)
    complexity_analysis = Column(Text, nullable=True)
    hints = Column(JSON, default=list) # List of hints

    # Relationships
    question = relationship("Question", back_populates="coding_detail")
    test_cases = relationship("CodingTestCase", back_populates="coding_problem", cascade="all, delete-orphan")


class CodingTestCase(Base):
    __tablename__ = "coding_test_cases"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    coding_problem_id = Column(UUID(as_uuid=True), ForeignKey("coding_problems.id", ondelete="CASCADE"), nullable=False)
    input_data = Column(Text, nullable=False)
    expected_output = Column(Text, nullable=False)
    is_public = Column(Boolean, default=True)

    # Relationship
    coding_problem = relationship("CodingProblem", back_populates="test_cases")


class SQLProblem(Base):
    __tablename__ = "sql_problems"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    question_id = Column(UUID(as_uuid=True), ForeignKey("questions.id", ondelete="CASCADE"), nullable=False, unique=True)
    schema_description = Column(Text, nullable=False)
    dataset_tables = Column(JSON, default=dict) # Table creation DDL & seed queries
    expected_query = Column(Text, nullable=False)
    expected_schema = Column(JSON, default=list) # Column names list expected
    explanation = Column(Text, nullable=True)

    # Relationship
    question = relationship("Question", back_populates="sql_detail")


class Assessment(Base):
    __tablename__ = "assessments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String, nullable=False, index=True)
    description = Column(Text, nullable=True)
    type = Column(String, nullable=False) # MCQ, Coding, SQL, Aptitude, Mixed, Company
    duration_minutes = Column(Integer, nullable=False, default=60)
    passing_score = Column(Integer, default=50)
    negative_marking = Column(Float, default=0.0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    questions = relationship("Question", secondary=assessment_questions)


class Submission(Base):
    __tablename__ = "submissions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    question_id = Column(UUID(as_uuid=True), ForeignKey("questions.id", ondelete="CASCADE"), nullable=False)
    score = Column(Integer, default=0)
    is_correct = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Specific detail tables (1-to-1)
    coding_submission = relationship("CodingSubmission", back_populates="submission", uselist=False, cascade="all, delete-orphan")
    attempt = relationship("Attempt", back_populates="submission", uselist=False, cascade="all, delete-orphan")

    # Relationships
    user = relationship("User", back_populates="submissions")
    question = relationship("Question", back_populates="submissions")


class CodingSubmission(Base):
    __tablename__ = "coding_submissions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    submission_id = Column(UUID(as_uuid=True), ForeignKey("submissions.id", ondelete="CASCADE"), nullable=False, unique=True)
    code_source = Column(Text, nullable=False)
    language = Column(String, nullable=False)
    execution_time = Column(Float, default=0.0)
    memory_usage = Column(Integer, default=0) # KB
    compile_status = Column(String, default="SUCCESS") # SUCCESS, COMPILE_ERROR, RUNTIME_ERROR, TIMEOUT
    compiler_output = Column(Text, nullable=True)
    test_cases_passed = Column(Integer, default=0)
    total_test_cases = Column(Integer, default=0)

    # Relationship
    submission = relationship("Submission", back_populates="coding_submission")


class Attempt(Base):
    __tablename__ = "attempts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    submission_id = Column(UUID(as_uuid=True), ForeignKey("submissions.id", ondelete="CASCADE"), nullable=False, unique=True)
    selected_option = Column(String, nullable=True) # For MCQs
    typed_sql = Column(Text, nullable=True) # For SQL problems
    sql_error = Column(Text, nullable=True)
    execution_output = Column(JSON, default=dict) # General output payload for testing scenarios

    # Relationship
    submission = relationship("Submission", back_populates="attempt")


class UserProgress(Base):
    __tablename__ = "user_progress"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    subtopic_id = Column(UUID(as_uuid=True), ForeignKey("subtopics.id", ondelete="CASCADE"), nullable=False)
    mastery_level = Column(Float, default=0.0) # 0 to 100
    attempts_count = Column(Integer, default=0)
    correct_count = Column(Integer, default=0)
    last_attempted_at = Column(DateTime, default=datetime.utcnow)
    revision_queue_date = Column(DateTime, default=datetime.utcnow) # Spaced repetition trigger

    # Relationships
    user = relationship("User", back_populates="progress")
    subtopic = relationship("Subtopic", back_populates="user_progress")

    __table_args__ = (
        Index('idx_user_subtopic', 'user_id', 'subtopic_id', unique=True),
    )


class Interview(Base):
    __tablename__ = "interviews"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    mode = Column(String, nullable=False) # technical, behavioral, resume_based, system_design
    status = Column(String, default="ongoing") # ongoing, completed
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="interviews")
    session = relationship("InterviewSession", back_populates="interview", uselist=False, cascade="all, delete-orphan")


class InterviewSession(Base):
    __tablename__ = "interview_sessions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    interview_id = Column(UUID(as_uuid=True), ForeignKey("interviews.id", ondelete="CASCADE"), nullable=False, unique=True)
    transcripts = Column(JSON, default=list) # List of dict: [{"speaker": "AI", "text": "..."}, {"speaker": "USER", "text": "..."}]
    overall_score = Column(Float, default=0.0)
    technical_score = Column(Float, default=0.0)
    communication_score = Column(Float, default=0.0)
    strengths = Column(JSON, default=list)
    weaknesses = Column(JSON, default=list)
    feedback = Column(Text, nullable=True)

    # Relationship
    interview = relationship("Interview", back_populates="session")


class Resume(Base):
    __tablename__ = "resumes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    file_name = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    uploaded_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="resumes")
    analysis = relationship("ResumeAnalysis", back_populates="resume", uselist=False, cascade="all, delete-orphan")


class ResumeAnalysis(Base):
    __tablename__ = "resume_analysis"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    resume_id = Column(UUID(as_uuid=True), ForeignKey("resumes.id", ondelete="CASCADE"), nullable=False, unique=True)
    ats_score = Column(Integer, default=0)
    matched_skills = Column(JSON, default=list)
    missing_skills = Column(JSON, default=list)
    formatting_feedback = Column(Text, nullable=True)
    role_alignment = Column(String, nullable=True)
    suggestions = Column(JSON, default=list)

    # Relationship
    resume = relationship("Resume", back_populates="analysis")


class Project(Base):
    __tablename__ = "projects"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String, nullable=False, unique=True)
    description = Column(Text, nullable=False)
    difficulty = Column(String, nullable=False) # Beginner, Intermediate, Advanced
    role_tag = Column(String, nullable=False) # Data Engineer, Software Engineer, etc.
    dataset_url = Column(String, nullable=True)
    architecture_steps = Column(JSON, default=list)
    interview_questions = Column(JSON, default=list)
    resume_bullet_suggestions = Column(JSON, default=list)


class Roadmap(Base):
    __tablename__ = "roadmaps"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String, nullable=False, unique=True)
    role = Column(String, nullable=False)
    difficulty = Column(String, nullable=False) # Beginner, Intermediate, Advanced
    steps = Column(JSON, default=list) # Steps list mapping required subtopics and resources


class UserAchievement(Base):
    __tablename__ = "user_achievements"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    achievement_name = Column(String, nullable=False)
    unlocked_at = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        Index('idx_user_achievement', 'user_id', 'achievement_name', unique=True),
    )


class Contest(Base):
    __tablename__ = "contests"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String, nullable=False)
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    questions = relationship("Question", secondary=contest_questions)
    participants = relationship("ContestParticipant", back_populates="contest", cascade="all, delete-orphan")


class ContestParticipant(Base):
    __tablename__ = "contest_participants"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    contest_id = Column(UUID(as_uuid=True), ForeignKey("contests.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    score = Column(Integer, default=0)
    rank = Column(Integer, nullable=True)
    total_time_taken = Column(Integer, default=0) # Seconds

    # Relationships
    contest = relationship("Contest", back_populates="participants")
    user = relationship("User", back_populates="contest_participations")


class Discussion(Base):
    __tablename__ = "discussions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    question_id = Column(UUID(as_uuid=True), ForeignKey("questions.id", ondelete="CASCADE"), nullable=True)
    upvotes = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="discussions")
    question = relationship("Question", back_populates="discussions")
    comments = relationship("Comment", back_populates="discussion", cascade="all, delete-orphan")


class Comment(Base):
    __tablename__ = "comments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    discussion_id = Column(UUID(as_uuid=True), ForeignKey("discussions.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    content = Column(Text, nullable=False)
    upvotes = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    discussion = relationship("Discussion", back_populates="comments")
    user = relationship("User", back_populates="comments")


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="notifications")


class LoginHistory(Base):
    __tablename__ = "login_histories"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    login_time = Column(DateTime, default=datetime.utcnow)
    ip_address = Column(String, nullable=True)
    auth_provider = Column(String, default="local")
    device_info = Column(String, nullable=True)

    # Relationship
    user = relationship("User", back_populates="login_histories")
