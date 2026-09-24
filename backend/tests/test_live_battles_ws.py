import pytest
import json
from app.models import models
from app.core.security import get_password_hash

def test_battle_quick_match_and_problem_detail(client, db_session):
    # 1. Create two users
    u1 = models.User(email="quick1@codequest.dev", hashed_password=get_password_hash("pass123"), is_active=True)
    u2 = models.User(email="quick2@codequest.dev", hashed_password=get_password_hash("pass123"), is_active=True)
    db_session.add(u1)
    db_session.add(u2)
    db_session.commit()

    tok1 = client.post("/api/v1/auth/login", json={"email": "quick1@codequest.dev", "password": "pass123"}).json()["access_token"]
    tok2 = client.post("/api/v1/auth/login", json={"email": "quick2@codequest.dev", "password": "pass123"}).json()["access_token"]
    h1 = {"Authorization": f"Bearer {tok1}"}
    h2 = {"Authorization": f"Bearer {tok2}"}

    # 2. Seed a coding problem
    top = models.Topic(name="Live Battle DSA", description="Topic")
    db_session.add(top)
    db_session.commit()
    sub = models.Subtopic(topic_id=top.id, name="Battle Array", description="Sub")
    db_session.add(sub)
    db_session.commit()

    q = models.Question(
        title="Array Multiplier",
        description="Multiply all elements in array",
        type="coding",
        difficulty="Easy",
        topic_id=top.id,
        subtopic_id=sub.id,
        xp_reward=30
    )
    db_session.add(q)
    db_session.commit()

    cd = models.CodingProblem(
        question_id=q.id,
        time_limit=3.0,
        memory_limit=256,
        code_templates={"python": "def multiply(nums):\n    pass\n"}
    )
    db_session.add(cd)
    db_session.commit()

    # 3. User 1 does quick-match (creates room)
    res1 = client.post("/api/v1/battles/quick-match", json={"difficulty": "Easy", "max_players": 2}, headers=h1)
    assert res1.status_code == 200
    room_data1 = res1.json()
    room_code = room_data1["room_code"]
    assert room_data1["status"] == "waiting"
    assert "problem_detail" in room_data1
    if room_data1["problem_detail"]:
        assert "title" in room_data1["problem_detail"]
        assert "template_code" in room_data1["problem_detail"]

    # 4. User 2 does quick-match (joins the same room)
    res2 = client.post("/api/v1/battles/quick-match", json={"difficulty": "Easy", "max_players": 2}, headers=h2)
    assert res2.status_code == 200
    room_data2 = res2.json()
    assert room_data2["room_code"] == room_code
    assert len(room_data2["participants"]) == 2

    # 5. Test WebSocket live connection & event broadcasting
    with client.websocket_connect(f"/api/v1/battles/ws/{room_code}?user_id={str(u1.id)}&user_name=QuickHost") as ws1:
        msg1 = json.loads(ws1.receive_text())
        assert msg1["event"] == "player_connected"
        assert msg1["data"]["user_name"] == "QuickHost"

        ws1.send_text(json.dumps({"action": "ping"}))
        pong = json.loads(ws1.receive_text())
        assert pong["event"] == "pong"

        with client.websocket_connect(f"/api/v1/battles/ws/{room_code}?user_id={str(u2.id)}&user_name=QuickChallenger") as ws2:
            ev = json.loads(ws1.receive_text())
            assert ev["event"] == "player_connected"
            assert ev["data"]["user_name"] == "QuickChallenger"

            ws2.send_text(json.dumps({
                "action": "code_progress",
                "data": {"lines": 8, "char_count": 140, "typing": True}
            }))
            
            prog_ev = json.loads(ws1.receive_text())
            assert prog_ev["event"] == "code_progress"
            assert prog_ev["data"]["lines"] == 8
            assert prog_ev["data"]["typing"] is True

            self_ev = json.loads(ws2.receive_text())
            assert self_ev["event"] == "player_connected"

            ws1.send_text(json.dumps({
                "action": "taunt",
                "data": {"emoji": "🔥", "phrase": "Speed demon!"}
            }))
            taunt_ev = json.loads(ws2.receive_text())
            assert taunt_ev["event"] == "taunt"
            assert taunt_ev["data"]["emoji"] == "🔥"
