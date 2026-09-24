import pytest
from app.models import models

def test_mcq_attempt_correct_and_incorrect(client, db_session):
    topic = models.Topic(name="CS Core", description="CS fundamentals")
    db_session.add(topic)
    db_session.commit()
    db_session.refresh(topic)

    subtopic = models.Subtopic(topic_id=topic.id, name="Networks", description="Networking")
    db_session.add(subtopic)
    db_session.commit()
    db_session.refresh(subtopic)

    q = models.Question(
        title="OSI Model Layers",
        description="How many layers are in the OSI model?",
        type="mcq",
        difficulty="Easy",
        topic_id=topic.id,
        subtopic_id=subtopic.id,
        xp_reward=20
    )
    db_session.add(q)
    db_session.commit()
    db_session.refresh(q)

    mcq = models.MCQQuestion(
        question_id=q.id,
        option_a="5",
        option_b="6",
        option_c="7",
        option_d="8",
        correct_option="C",
        explanation="The OSI model has 7 layers.",
        negative_marking=0.25
    )
    db_session.add(mcq)
    db_session.commit()
    q_id = str(q.id)

    # Register learner
    client.post("/api/v1/auth/register", json={"email": "mcq_learner@placementforge.com", "password": "pass123learner"})
    login_res = client.post("/api/v1/auth/login", json={"email": "mcq_learner@placementforge.com", "password": "pass123learner"})
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Fetch MCQs list
    list_res = client.get("/api/v1/mcqs/?type=mcq", headers=headers)
    assert list_res.status_code == 200
    assert len(list_res.json()) >= 1

    # 2. Fetch MCQ detail
    detail_res = client.get(f"/api/v1/mcqs/{q_id}", headers=headers)
    assert detail_res.status_code == 200
    assert detail_res.json()["title"] == "OSI Model Layers"

    # 3. Attempt MCQ with correct option 'C'
    attempt_res = client.post(
        f"/api/v1/mcqs/{q_id}/attempt",
        json={"selected_option": "C"},
        headers=headers
    )
    assert attempt_res.status_code == 200
    assert attempt_res.json()["is_correct"] == True
    assert attempt_res.json()["score"] == 20

    # 4. Attempt MCQ with incorrect option 'A'
    fail_res = client.post(
        f"/api/v1/mcqs/{q_id}/attempt",
        json={"selected_option": "A"},
        headers=headers
    )
    assert fail_res.status_code == 200
    assert fail_res.json()["is_correct"] == False
    assert fail_res.json()["score"] == -5 # 20 * -0.25

def test_sql_forbidden_keywords_and_execution(client, db_session):
    topic = models.Topic(name="Databases", description="DB Practice")
    db_session.add(topic)
    db_session.commit()
    db_session.refresh(topic)

    subtopic = models.Subtopic(topic_id=topic.id, name="Joins", description="SQL Joins")
    db_session.add(subtopic)
    db_session.commit()
    db_session.refresh(subtopic)

    q = models.Question(
        title="Find Users",
        description="Select all active users",
        type="sql",
        difficulty="Easy",
        topic_id=topic.id,
        subtopic_id=subtopic.id,
        xp_reward=30
    )
    db_session.add(q)
    db_session.commit()
    db_session.refresh(q)

    sql_detail = models.SQLProblem(
        question_id=q.id,
        schema_description="CREATE TABLE test_users (id INT, name VARCHAR); INSERT INTO test_users VALUES (1, 'Alice');",
        expected_query="SELECT * FROM test_users;",
        expected_schema=["id", "name"]
    )
    db_session.add(sql_detail)
    db_session.commit()
    q_id = str(q.id)

    client.post("/api/v1/auth/register", json={"email": "sql_learner@placementforge.com", "password": "pass123learner"})
    login_res = client.post("/api/v1/auth/login", json={"email": "sql_learner@placementforge.com", "password": "pass123learner"})
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Test forbidden keyword rejection (e.g. DROP)
    forbidden_res = client.post(
        f"/api/v1/sql/problems/{q_id}/execute",
        json={"query": "DROP TABLE test_users;"},
        headers=headers
    )
    assert forbidden_res.status_code == 400
    assert "Forbidden keyword" in forbidden_res.json()["detail"]

    # 2. Test non-select rejection
    non_select_res = client.post(
        f"/api/v1/sql/problems/{q_id}/execute",
        json={"query": "ALTER TABLE test_users ADD COLUMN age INT;"},
        headers=headers
    )
    assert non_select_res.status_code == 400
