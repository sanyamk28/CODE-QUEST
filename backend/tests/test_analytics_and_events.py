import pytest
from app.models import models
from app.core.security import get_password_hash

def test_analytics_logging_and_summary(client, db_session):
    # 1. Create Admin & Student
    admin = models.User(
        email="analytics_admin@codequest.dev",
        hashed_password=get_password_hash("adminpass123"),
        is_active=True,
        is_admin=True
    )
    student = models.User(
        email="analytics_student@codequest.dev",
        hashed_password=get_password_hash("studentpass123"),
        is_active=True,
        is_admin=False
    )
    db_session.add(admin)
    db_session.add(student)
    db_session.commit()

    admin_login = client.post("/api/v1/auth/login", json={"email": "analytics_admin@codequest.dev", "password": "adminpass123"})
    student_login = client.post("/api/v1/auth/login", json={"email": "analytics_student@codequest.dev", "password": "studentpass123"})
    admin_headers = {"Authorization": f"Bearer {admin_login.json()['access_token']}"}
    student_headers = {"Authorization": f"Bearer {student_login.json()['access_token']}"}

    # 2. Ingest a client analytics event
    ev_res = client.post(
        "/api/v1/analytics/events",
        json={"event_type": "mcq_completed", "metadata": {"domain": "OS", "score": 10}},
        headers=student_headers
    )
    assert ev_res.status_code == 200
    ev_data = ev_res.json()
    assert ev_data["event_type"] == "mcq_completed"

    # 3. Non-admin cannot view summary
    unauth_sum = client.get("/api/v1/analytics/summary", headers=student_headers)
    assert unauth_sum.status_code == 403

    # 4. Admin views summary
    sum_res = client.get("/api/v1/analytics/summary", headers=admin_headers)
    assert sum_res.status_code == 200
    sum_data = sum_res.json()
    assert sum_data["total_enrolled_users"] >= 1
    assert "mcq_completed" in sum_data["feature_adoption_rates"]

    # 5. Admin views recent events feed
    events_res = client.get("/api/v1/analytics/events?limit=10", headers=admin_headers)
    assert events_res.status_code == 200
    assert len(events_res.json()) >= 1
