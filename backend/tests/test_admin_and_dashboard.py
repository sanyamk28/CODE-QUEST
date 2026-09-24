import pytest
from app.models import models
from app.core.security import get_password_hash

def test_admin_student_moderation_and_progress_inspector(client, db_session):
    admin = models.User(
        email="superadmin@placementforge.com",
        hashed_password=get_password_hash("adminpass123"),
        is_active=True,
        is_admin=True
    )
    student = models.User(
        email="marcus@placementforge.com",
        hashed_password=get_password_hash("studentpass123"),
        is_active=True,
        is_admin=False
    )
    db_session.add(admin)
    db_session.add(student)
    db_session.commit()
    db_session.refresh(student)

    profile = models.Profile(
        user_id=student.id,
        name="Marcus Vance",
        college="Tech Institute",
        degree="B.Tech CS",
        target_role="Software Engineer",
        xp=150,
        streak=4,
        readiness_score=65.0,
        dsa_level=45.0,
        sql_level=30.0,
        aptitude_level=50.0,
        cs_fundamentals_level=60.0
    )
    db_session.add(profile)
    db_session.commit()

    admin_login = client.post("/api/v1/auth/login", json={"email": "superadmin@placementforge.com", "password": "adminpass123"})
    admin_token = admin_login.json()["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    # 1. Admin gets all students
    students_res = client.get("/api/v1/auth/students", headers=admin_headers)
    assert students_res.status_code == 200
    students_list = students_res.json()
    assert len(students_list) >= 1
    target_student = next((s for s in students_list if s["email"] == "marcus@placementforge.com"), None)
    assert target_student is not None
    student_id = target_student["id"]

    # 2. Inspect Student Progress
    progress_res = client.get(f"/api/v1/auth/students/{student_id}/progress", headers=admin_headers)
    assert progress_res.status_code == 200
    prog_data = progress_res.json()
    assert prog_data["name"] == "Marcus Vance"
    assert prog_data["target_role"] == "Software Engineer"
    assert prog_data["dsa_level"] == 45.0
    assert prog_data["sql_level"] == 30.0
    assert "submissions" in prog_data

    # 3. Toggle Active status (Suspend)
    toggle_res = client.post(f"/api/v1/auth/students/{student_id}/toggle-active", headers=admin_headers)
    assert toggle_res.status_code == 200
    assert toggle_res.json()["is_active"] == False

    # Suspended user cannot login
    bad_login = client.post("/api/v1/auth/login", json={"email": "marcus@placementforge.com", "password": "studentpass123"})
    assert bad_login.status_code == 400
    assert "Inactive user" in bad_login.json()["detail"]

    # Re-activate user
    reactivate_res = client.post(f"/api/v1/auth/students/{student_id}/toggle-active", headers=admin_headers)
    assert reactivate_res.status_code == 200
    assert reactivate_res.json()["is_active"] == True

    # 4. Delete Student
    del_res = client.delete(f"/api/v1/auth/students/{student_id}", headers=admin_headers)
    assert del_res.status_code == 200
    assert "successfully deleted" in del_res.json()["message"]

def test_dashboard_progress_and_recommendations(client, db_session):
    student2 = models.User(
        email="elena@placementforge.com",
        hashed_password=get_password_hash("elenapass123"),
        is_active=True,
        is_admin=False
    )
    db_session.add(student2)
    db_session.commit()
    db_session.refresh(student2)

    profile = models.Profile(
        user_id=student2.id,
        name="Elena Rostova",
        college="Global Tech",
        degree="B.S. CS",
        target_role="Full Stack Developer",
        xp=200,
        streak=5,
        readiness_score=72.0,
        dsa_level=50.0,
        sql_level=40.0,
        aptitude_level=60.0,
        cs_fundamentals_level=70.0
    )
    db_session.add(profile)
    db_session.commit()

    login = client.post("/api/v1/auth/login", json={"email": "elena@placementforge.com", "password": "elenapass123"})
    student_token = login.json()["access_token"]
    student_headers = {"Authorization": f"Bearer {student_token}"}

    # 1. Get Progress calculation
    prog_res = client.get("/api/v1/dashboard/progress", headers=student_headers)
    assert prog_res.status_code == 200
    profile_data = prog_res.json()
    assert profile_data["readiness_score"] >= 10.0

    # 2. Get Recommendations and Adaptive Daily Mission
    rec_res = client.get("/api/v1/dashboard/recommendations", headers=student_headers)
    assert rec_res.status_code == 200
    rec_data = rec_res.json()
    assert "daily_mission" in rec_data
    assert len(rec_data["daily_mission"]["tasks"]) >= 1
    assert "weekly_performance" in rec_data
