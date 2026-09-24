import pytest
import uuid
from app.models import models
from app.core.security import get_password_hash

def test_puzzles_workflow(client, db_session):
    # Register student
    reg = client.post("/api/v1/auth/register", json={"email": "puzzle_student@codequest.dev", "password": "pass123student"})
    token = reg.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Seed puzzle
    topic = models.Topic(name="Puzzles & Logic", description="Puzzles")
    db_session.add(topic)
    db_session.commit()
    db_session.refresh(topic)

    subtopic = models.Subtopic(topic_id=topic.id, name="Logical Riddles", description="Riddles")
    db_session.add(subtopic)
    db_session.commit()
    db_session.refresh(subtopic)

    q = models.Question(
        title="3 Light Bulbs",
        description="How to determine which switch controls which bulb with only one trip upstairs?",
        type="puzzle",
        difficulty="Medium",
        topic_id=topic.id,
        subtopic_id=subtopic.id,
        xp_reward=15,
        company_tags=["Google"]
    )
    db_session.add(q)
    db_session.commit()
    db_session.refresh(q)

    mcq = models.MCQQuestion(
        question_id=q.id,
        option_a="Hint 1: Turn one switch on for 10 minutes to generate heat.",
        option_b="Hint 2: Feel the temperature of the bulbs upstairs.",
        option_c="",
        option_d="",
        correct_option="A",
        explanation="Turn on switch 1 for 10 minutes, turn it off, and turn switch 2 on. Go upstairs: lit is 2, warm is 1, cold is 3."
    )
    db_session.add(mcq)
    db_session.commit()

    # 1. Get puzzles list
    res = client.get("/api/v1/puzzles/", headers=headers)
    assert res.status_code == 200
    puzzles = res.json()
    assert len(puzzles) >= 1

    # 2. Get puzzle detail
    det_res = client.get(f"/api/v1/puzzles/{q.id}", headers=headers)
    assert det_res.status_code == 200
    p_det = det_res.json()
    assert p_det["title"] == "3 Light Bulbs"
    assert len(p_det["hints"]) >= 1

    # 3. Check solution
    chk_res = client.post(
        f"/api/v1/puzzles/{q.id}/check",
        json={"solution_text": "Turn on switch 1 for 10 minutes, turn it off, and turn on switch 2. The warm bulb is switch 1."},
        headers=headers
    )
    assert chk_res.status_code == 200
    chk_data = chk_res.json()
    assert chk_data["is_correct"] is True
    assert chk_data["score"] == 15

def test_code_battle_lifecycle_and_winner_lock(client, db_session):
    # Register Host & Player 2
    reg1 = client.post("/api/v1/auth/register", json={"email": "battle_host@codequest.dev", "password": "pass123host"})
    token1 = reg1.json()["access_token"]
    headers1 = {"Authorization": f"Bearer {token1}"}

    reg2 = client.post("/api/v1/auth/register", json={"email": "battle_p2@codequest.dev", "password": "pass123p2"})
    token2 = reg2.json()["access_token"]
    headers2 = {"Authorization": f"Bearer {token2}"}

    # Seed problem for battle
    topic = models.Topic(name="DSA Core", description="DSA")
    db_session.add(topic)
    db_session.commit()
    db_session.refresh(topic)

    subtopic = models.Subtopic(topic_id=topic.id, name="Math Problems", description="Math")
    db_session.add(subtopic)
    db_session.commit()
    db_session.refresh(subtopic)

    q = models.Question(
        title="Battle Addition",
        description="Read two ints from stdin and print sum",
        type="coding",
        difficulty="Easy",
        topic_id=topic.id,
        subtopic_id=subtopic.id,
        xp_reward=25
    )
    db_session.add(q)
    db_session.commit()
    db_session.refresh(q)

    cd = models.CodingProblem(question_id=q.id, time_limit=5.0, memory_limit=256)
    db_session.add(cd)
    db_session.commit()
    db_session.refresh(cd)

    tc = models.CodingTestCase(coding_problem_id=cd.id, input_data="4 6\n", expected_output="10", is_public=True)
    db_session.add(tc)
    db_session.commit()

    # 1. Host creates battle room
    create_res = client.post(
        "/api/v1/battles/create",
        json={"problem_id": str(q.id), "difficulty": "Easy", "max_players": 4},
        headers=headers1
    )
    assert create_res.status_code == 200
    room_data = create_res.json()
    room_code = room_data["room_code"]
    assert room_data["status"] == "waiting"

    # 2. Player 2 joins room
    join_res = client.post("/api/v1/battles/join", json={"room_code": room_code}, headers=headers2)
    assert join_res.status_code == 200
    assert len(join_res.json()["participants"]) == 2

    # 3. Host starts battle
    start_res = client.post(f"/api/v1/battles/{room_code}/start", headers=headers1)
    assert start_res.status_code == 200

    # 4. Player 2 submits correct code and wins
    code_sol = "import sys\nvals = sys.stdin.read().split()\nprint(int(vals[0]) + int(vals[1]))\n"
    sub_res = client.post(
        f"/api/v1/battles/{room_code}/submit",
        json={"code": code_sol, "language": "python"},
        headers=headers2
    )
    assert sub_res.status_code == 200
    sub_data = sub_res.json()
    assert sub_data["is_correct"] is True
    assert sub_data["is_winner"] is True

    # 5. Verify room status is completed
    get_res = client.get(f"/api/v1/battles/{room_code}", headers=headers1)
    assert get_res.status_code == 200
    assert get_res.json()["status"] == "completed"
