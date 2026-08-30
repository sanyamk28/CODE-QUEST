import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.core.database import Base, get_db
from app.models.models import User

# In-memory SQLite for rapid unit testing without polluting Postgres
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Override database session dependency
def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

def test_user_registration_and_login():
    # 1. Register User
    reg_response = client.post(
        "/api/v1/auth/register",
        json={"email": "teststudent@placementforge.com", "password": "securestudentpassword123"}
    )
    assert reg_response.status_code == 200
    tokens = reg_response.json()
    assert "access_token" in tokens
    assert "refresh_token" in tokens
    
    # 2. Login User
    login_response = client.post(
        "/api/v1/auth/login",
        json={"email": "teststudent@placementforge.com", "password": "securestudentpassword123"}
    )
    assert login_response.status_code == 200
    assert "access_token" in login_response.json()

def test_onboarding_and_readiness_score():
    # 1. Register and get token
    reg_res = client.post(
        "/api/v1/auth/register",
        json={"email": "onboardstudent@placementforge.com", "password": "password123"}
    )
    token = reg_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # 2. Send Onboarding request
    onboard_payload = {
        "name": "Alex Student",
        "college": "State Technical University",
        "degree": "B.S. Software Engineering",
        "graduation_year": 2027,
        "target_role": "Data Engineer",
        "experience_level": "beginner",
        "target_companies": ["Amazon", "Google"],
        "prep_duration": 6,
        "daily_study_goal": 3,
        "skills": ["Python", "SQL"],
        "dsa_level": 50.0,
        "sql_level": 40.0,
        "aptitude_level": 60.0
    }
    
    onboard_res = client.post(
        "/api/v1/auth/onboard",
        json=onboard_payload,
        headers=headers
    )
    
    assert onboard_res.status_code == 200
    profile = onboard_res.json()
    assert profile["name"] == "Alex Student"
    assert profile["target_role"] == "Data Engineer"
    
    # Verify starting readiness score calculations
    assert profile["readiness_score"] > 0
    assert profile["readiness_score"] == (50.0 + 40.0 + 60.0) / 3.0 + 5.0 # (Average + study bonus)

def test_google_login():
    response = client.post(
        "/api/v1/auth/google",
        json={"id_token": "mock-google-token-testgoogle@placementforge.com"}
    )
    assert response.status_code == 200
    tokens = response.json()
    assert "access_token" in tokens
    assert "refresh_token" in tokens
    
    login_response = client.post(
        "/api/v1/auth/google",
        json={"id_token": "mock-google-token-testgoogle@placementforge.com"}
    )
    assert login_response.status_code == 200
    assert "access_token" in login_response.json()
