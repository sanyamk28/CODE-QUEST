import pytest
from app.models.models import User

def test_user_registration_and_login(client):
    # 1. Register User
    reg_response = client.post(
        "/api/v1/auth/register",
        json={"email": "teststudent@placementforge.com", "password": "securestudentpassword123"}
    )
    assert reg_response.status_code == 200
    tokens = reg_response.json()
    assert "access_token" in tokens
    assert "refresh_token" in tokens

    # 2. Duplicate registration should fail
    dup_response = client.post(
        "/api/v1/auth/register",
        json={"email": "teststudent@placementforge.com", "password": "securestudentpassword123"}
    )
    assert dup_response.status_code == 400

    # 3. Login with correct password
    login_response = client.post(
        "/api/v1/auth/login",
        json={"email": "teststudent@placementforge.com", "password": "securestudentpassword123"}
    )
    assert login_response.status_code == 200
    login_tokens = login_response.json()
    assert "access_token" in login_tokens

    # 4. Login with incorrect password
    bad_login = client.post(
        "/api/v1/auth/login",
        json={"email": "teststudent@placementforge.com", "password": "wrongpassword"}
    )
    assert bad_login.status_code == 400

def test_onboarding_and_readiness_score(client):
    # Register & Login
    client.post(
        "/api/v1/auth/register",
        json={"email": "readiness_student@placementforge.com", "password": "studentpassword123"}
    )
    login_res = client.post(
        "/api/v1/auth/login",
        json={"email": "readiness_student@placementforge.com", "password": "studentpassword123"}
    )
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Complete onboarding
    onboard_payload = {
        "name": "Jane Doe",
        "college": "Stanford University",
        "degree": "B.S. Computer Science",
        "graduation_year": 2025,
        "target_role": "Backend Engineer",
        "experience_level": "intermediate",
        "target_companies": ["Google", "Amazon", "Microsoft"],
        "prep_duration": 4,
        "daily_study_goal": 3,
        "skills": ["Python", "SQL", "Docker"],
        "dsa_level": 50.0,
        "sql_level": 40.0,
        "aptitude_level": 60.0
    }

    onboard_res = client.post("/api/v1/auth/onboard", json=onboard_payload, headers=headers)
    assert onboard_res.status_code == 200
    profile = onboard_res.json()
    assert profile["name"] == "Jane Doe"
    assert profile["target_role"] == "Backend Engineer"
    # Readiness score should have been calculated
    assert profile["readiness_score"] > 0

    # Retrieve profile
    get_profile = client.get("/api/v1/auth/profile", headers=headers)
    assert get_profile.status_code == 200
    assert get_profile.json()["name"] == "Jane Doe"
    assert get_profile.json()["college"] == "Stanford University"

def test_google_login(client):
    google_res = client.post(
        "/api/v1/auth/google",
        json={"id_token": "mock-google-token-john.doe@gmail.com"}
    )
    assert google_res.status_code == 200
    res_data = google_res.json()
    assert "access_token" in res_data
    assert "refresh_token" in res_data
    assert res_data["is_admin"] is False
    assert res_data["is_new_user"] is True
    assert res_data["email"] == "john.doe@gmail.com"

def test_user_data_isolation_and_admin_gate(client):
    # 1. Register student A via Google
    res_a = client.post(
        "/api/v1/auth/google",
        json={"id_token": "google-user-student.alpha@gmail.com", "name": "Student Alpha"}
    )
    assert res_a.status_code == 200
    token_a = res_a.json()["access_token"]
    assert res_a.json()["is_admin"] is False

    # 2. Update Student A profile
    client.post(
        "/api/v1/auth/onboard",
        headers={"Authorization": f"Bearer {token_a}"},
        json={
            "name": "Student Alpha",
            "college": "IIT Delhi",
            "degree": "B.Tech CSE",
            "graduation_year": 2026,
            "target_role": "Backend Engineer",
            "experience_level": "intermediate",
            "target_companies": ["Google", "Amazon"],
            "prep_duration": 3,
            "daily_study_goal": 3,
            "skills": ["Python", "FastAPI"],
            "dsa_level": 80,
            "sql_level": 75,
            "aptitude_level": 70
        }
    )

    # 3. Register student B via Google
    res_b = client.post(
        "/api/v1/auth/google",
        json={"id_token": "google-user-student.beta@gmail.com", "name": "Student Beta"}
    )
    assert res_b.status_code == 200
    token_b = res_b.json()["access_token"]

    # 4. Verify Student B has their own distinct profile, completely isolated from Student A
    prof_b = client.get("/api/v1/auth/profile", headers={"Authorization": f"Bearer {token_b}"})
    assert prof_b.status_code == 200
    assert prof_b.json()["name"] == "Student Beta"
    assert prof_b.json()["college"] is None or prof_b.json()["college"] != "IIT Delhi"

    # 5. Verify Student A's data remains intact when re-fetching
    prof_a = client.get("/api/v1/auth/profile", headers={"Authorization": f"Bearer {token_a}"})
    assert prof_a.status_code == 200
    assert prof_a.json()["name"] == "Student Alpha"
    assert prof_a.json()["college"] == "IIT Delhi"

    # 6. Verify Students CANNOT access Admin portal endpoints (strictly forbidden)
    admin_check = client.get("/api/v1/auth/students", headers={"Authorization": f"Bearer {token_a}"})
    assert admin_check.status_code == 403
