import pytest
from app.models import models
from app.core.security import get_password_hash

def test_topic_and_subtopic_crud(client, db_session):
    admin = models.User(
        email="topic_admin@placementforge.com",
        hashed_password=get_password_hash("adminpass123"),
        is_active=True,
        is_admin=True
    )
    user = models.User(
        email="topic_student@placementforge.com",
        hashed_password=get_password_hash("studentpass123"),
        is_active=True,
        is_admin=False
    )
    db_session.add(admin)
    db_session.add(user)
    db_session.commit()

    admin_login = client.post("/api/v1/auth/login", json={"email": "topic_admin@placementforge.com", "password": "adminpass123"})
    user_login = client.post("/api/v1/auth/login", json={"email": "topic_student@placementforge.com", "password": "studentpass123"})
    admin_token = admin_login.json()["access_token"]
    user_token = user_login.json()["access_token"]

    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    user_headers = {"Authorization": f"Bearer {user_token}"}

    # 1. Create a Topic (Admin)
    topic_res = client.post(
        "/api/v1/problems/topics",
        json={"name": "System Architecture", "description": "Microservices & Distributed Systems"},
        headers=admin_headers
    )
    assert topic_res.status_code == 200
    topic_data = topic_res.json()
    topic_id = topic_data["id"]
    assert topic_data["name"] == "System Architecture"

    # 2. Add Subtopic (Admin)
    subtopic_res = client.post(
        f"/api/v1/problems/topics/{topic_id}/subtopics",
        json={"name": "Load Balancing", "description": "Round Robin and Consistent Hashing"},
        headers=admin_headers
    )
    assert subtopic_res.status_code == 200
    subtopic_data = subtopic_res.json()
    subtopic_id = subtopic_data["id"]
    assert subtopic_data["name"] == "Load Balancing"

    # 3. Retrieve All Topics (User)
    all_res = client.get("/api/v1/problems/topics/all", headers=user_headers)
    assert all_res.status_code == 200
    topics = all_res.json()
    assert len(topics) >= 1
    found = any(t["name"] == "System Architecture" for t in topics)
    assert found

    # 4. Delete Subtopic (Admin)
    del_sub_res = client.delete(f"/api/v1/problems/subtopics/{subtopic_id}", headers=admin_headers)
    assert del_sub_res.status_code == 200

    # 5. Delete Topic (Admin)
    del_topic_res = client.delete(f"/api/v1/problems/topics/{topic_id}", headers=admin_headers)
    assert del_topic_res.status_code == 200

def test_problem_listing_and_submission_fallback(client, db_session):
    client.post("/api/v1/auth/register", json={"email": "code_student@placementforge.com", "password": "pass123student"})
    user_login = client.post("/api/v1/auth/login", json={"email": "code_student@placementforge.com", "password": "pass123student"})
    user_token = user_login.json()["access_token"]
    user_headers = {"Authorization": f"Bearer {user_token}"}

    # Seed a coding problem directly into db
    topic = models.Topic(name="Algorithms", description="Algo practice")
    db_session.add(topic)
    db_session.commit()
    db_session.refresh(topic)

    subtopic = models.Subtopic(topic_id=topic.id, name="Math & Array", description="Basic Math")
    db_session.add(subtopic)
    db_session.commit()
    db_session.refresh(subtopic)

    q = models.Question(
        title="Sum of Two Numbers",
        description="Print the sum of two integers a and b from stdin",
        type="coding",
        difficulty="Easy",
        topic_id=topic.id,
        subtopic_id=subtopic.id,
        xp_reward=25,
        company_tags=["Meta", "Google"]
    )
    db_session.add(q)
    db_session.commit()
    db_session.refresh(q)

    cd = models.CodingProblem(
        question_id=q.id,
        time_limit=5.0,
        memory_limit=256
    )
    db_session.add(cd)
    db_session.commit()
    db_session.refresh(cd)

    tc = models.CodingTestCase(
        coding_problem_id=cd.id,
        input_data="3 5\n",
        expected_output="8",
        is_public=True
    )
    db_session.add(tc)
    db_session.commit()
    q_id = str(q.id)

    # 1. Get coding problems list
    problems_res = client.get("/api/v1/problems/", headers=user_headers)
    assert problems_res.status_code == 200
    p_list = problems_res.json()
    assert len(p_list) >= 1
    found_problem = next((p for p in p_list if p["id"] == q_id), None)
    assert found_problem is not None
    assert found_problem["title"] == "Sum of Two Numbers"

    # 2. Get problem detail
    detail_res = client.get(f"/api/v1/problems/{q_id}", headers=user_headers)
    assert detail_res.status_code == 200
    assert detail_res.json()["xp_reward"] == 25

    # 3. Submit python code with local fallback runner
    python_code = "import sys\nnums = sys.stdin.read().split()\nprint(int(nums[0]) + int(nums[1]))\n"
    submit_res = client.post(
        f"/api/v1/problems/{q_id}/submit",
        json={"code": python_code, "language": "python"},
        headers=user_headers
    )
    assert submit_res.status_code == 200
    sub_data = submit_res.json()
    assert sub_data["is_correct"] == True
    assert sub_data["score"] == 25
