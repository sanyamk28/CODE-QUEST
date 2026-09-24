import pytest
import uuid
from app.models import models
from app.core.security import get_password_hash
from app.api.v1.problems import validate_code_security, run_single_testcase

def test_python_ast_security_scanner_blocks_dangerous_modules():
    # 1. Direct imports
    assert validate_code_security("import os\nos.system('dir')", "python") is not None
    assert validate_code_security("import subprocess\nsubprocess.run(['dir'])", "python") is not None
    assert validate_code_security("import shutil\nshutil.rmtree('.')", "python") is not None
    assert validate_code_security("import socket\ns = socket.socket()", "python") is not None
    assert validate_code_security("import requests", "python") is not None
    assert validate_code_security("import pty", "python") is not None

    # 2. From imports
    assert validate_code_security("from os import system\nsystem('echo 1')", "python") is not None
    assert validate_code_security("from subprocess import Popen", "python") is not None

    # 3. Dangerous calls
    assert validate_code_security("f = open('secret.txt')", "python") is not None
    assert validate_code_security("eval('1 + 1')", "python") is not None
    assert validate_code_security("exec('print(1)')", "python") is not None

    # 4. Reflection tricks
    assert validate_code_security("().__class__.__subclasses__()", "python") is not None

def test_python_ast_security_scanner_allows_standard_algorithms():
    # 1. Clean algorithmic code
    assert validate_code_security("def two_sum(nums, target):\n    return [0, 1]", "python") is None
    # 2. Standard sys import used in competitive programming
    assert validate_code_security("import sys\nline = sys.stdin.readline()", "python") is None
    # 3. Math and collections
    assert validate_code_security("import math, collections, heapq, itertools\nprint(math.sqrt(16))", "python") is None

def test_run_single_testcase_enforces_security():
    passed, status_exec, err_msg, exec_time = run_single_testcase(
        code="import os\nos.system('whoami')",
        language="python",
        input_data="",
        expected_output=""
    )
    assert passed is False
    assert status_exec == "SECURITY_VIOLATION"
    assert "Security Policy Violation" in err_msg

def test_sql_sandbox_isolation_blocks_production_users_table(client, db_session):
    # 1. Create a user
    user = models.User(email="sqltester@codequest.dev", hashed_password=get_password_hash("pass123"), is_active=True)
    db_session.add(user)
    db_session.commit()

    tok = client.post("/api/v1/auth/login", json={"email": "sqltester@codequest.dev", "password": "pass123"}).json()["access_token"]
    headers = {"Authorization": f"Bearer {tok}"}

    # 2. Seed an SQL problem
    top = models.Topic(name="SQL Topic", description="Desc")
    db_session.add(top)
    db_session.commit()
    sub = models.Subtopic(topic_id=top.id, name="SQL Sub", description="Desc")
    db_session.add(sub)
    db_session.commit()

    q = models.Question(
        title="Department Test Problem",
        description="Write a query to list departments",
        type="sql",
        difficulty="Easy",
        topic_id=top.id,
        subtopic_id=sub.id,
        xp_reward=10
    )
    db_session.add(q)
    db_session.commit()

    sql_p = models.SQLProblem(
        question_id=q.id,
        schema_description="Department (id, name)\nEmployee (id, name, departmentId)",
        dataset_tables={},
        expected_query="SELECT * FROM Department;",
        expected_schema=["id", "name"]
    )
    db_session.add(sql_p)
    db_session.commit()

    # 3. Candidate queries the problem's isolated mock schema (ALLOWED)
    res_valid = client.post(
        f"/api/v1/sql/problems/{q.id}/execute",
        json={"query": "SELECT id, name FROM Department;"},
        headers=headers
    )
    assert res_valid.status_code == 200
    assert res_valid.json()["is_correct"] is True
    assert res_valid.json()["sql_error"] is None

    # 4. Candidate attempts to query production 'users' table (BLOCKED by sandbox isolation)
    res_leak = client.post(
        f"/api/v1/sql/problems/{q.id}/execute",
        json={"query": "SELECT id, email, hashed_password FROM users;"},
        headers=headers
    )
    assert res_leak.status_code == 200
    data = res_leak.json()
    assert data["is_correct"] is False
    assert "no such table: users" in data["sql_error"].lower()

def test_battle_start_idempotency(client, db_session):
    u = models.User(email="host1@codequest.dev", hashed_password=get_password_hash("pass123"), is_active=True)
    db_session.add(u)
    db_session.commit()

    tok = client.post("/api/v1/auth/login", json={"email": "host1@codequest.dev", "password": "pass123"}).json()["access_token"]
    h = {"Authorization": f"Bearer {tok}"}

    create_res = client.post("/api/v1/battles/create", json={"difficulty": "Easy", "max_players": 2}, headers=h)
    assert create_res.status_code == 200
    code = create_res.json()["room_code"]

    # First start
    start1 = client.post(f"/api/v1/battles/{code}/start", headers=h)
    assert start1.status_code == 200
    assert "successfully" in start1.json()["message"]

    # Second start (idempotent, does not error or reset timer)
    start2 = client.post(f"/api/v1/battles/{code}/start", headers=h)
    assert start2.status_code == 200
    assert "already active" in start2.json()["message"]
