import httpx
import asyncio
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.core.database import get_db
from app.core.config import settings
from app.api.v1.deps import get_current_user, get_current_admin
from app.models import models
from app.schemas import schemas

router = APIRouter()

@router.get("/", response_model=List[schemas.QuestionListResponse])
def get_coding_problems(
    difficulty: Optional[str] = None,
    tag: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    query = db.query(models.Question).filter(models.Question.type == "coding")
    
    if difficulty:
        query = query.filter(models.Question.difficulty == difficulty)
    if tag:
        # Search JSON tags array
        query = query.filter(models.Question.company_tags.contains([tag]))
        
    questions = query.all()
    
    # Map to schema response
    result = []
    for q in questions:
        result.append(schemas.QuestionListResponse(
            id=q.id,
            title=q.title,
            difficulty=q.difficulty,
            type=q.type,
            xp_reward=q.xp_reward,
            company_tags=q.company_tags or [],
            topic_name=q.topic.name if q.topic else "DSA",
            subtopic_name=q.subtopic.name if q.subtopic else "Arrays"
        ))
    return result

import uuid

@router.get("/{id}", response_model=schemas.QuestionDetailResponse)
def get_coding_problem_detail(
    id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    try:
        qid = uuid.UUID(id)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid problem ID")

    q = db.query(models.Question).filter(models.Question.id == qid, models.Question.type == "coding").first()
    if not q:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Coding problem not found"
        )
    return q

from app.core.analytics import record_analytics_event

import ast

FORBIDDEN_PYTHON_MODULES = {
    "os", "subprocess", "shutil", "socket", "http", "urllib", "requests",
    "pty", "commands", "ctypes", "winreg", "signal", "multiprocessing", "threading",
    "posix", "nt", "importlib", "pickle", "shelve", "webbrowser"
}
FORBIDDEN_CALLS = {"eval", "exec", "compile", "__import__", "open"}

def validate_code_security(code: str, language: str) -> Optional[str]:
    """
    Statically analyzes code to ensure candidate solutions do not attempt
    to perform file I/O, network operations, process spawning, or malicious reflections.
    """
    lang = language.lower()
    if lang == "python":
        try:
            tree = ast.parse(code)
            for node in ast.walk(tree):
                # Check direct imports: import os, import subprocess
                if isinstance(node, ast.Import):
                    for alias in node.names:
                        base_mod = alias.name.split('.')[0]
                        if base_mod in FORBIDDEN_PYTHON_MODULES:
                            return f"Security Policy Violation: Import of module '{base_mod}' is strictly prohibited."
                # Check from imports: from os import system
                elif isinstance(node, ast.ImportFrom):
                    if node.module:
                        base_mod = node.module.split('.')[0]
                        if base_mod in FORBIDDEN_PYTHON_MODULES:
                            return f"Security Policy Violation: Import from module '{base_mod}' is strictly prohibited."
                # Check dangerous function calls: open(), eval(), exec()
                elif isinstance(node, ast.Call):
                    if isinstance(node.func, ast.Name) and node.func.id in FORBIDDEN_CALLS:
                        return f"Security Policy Violation: Invocation of '{node.func.id}()' is strictly prohibited."
                # Check reflection access: __subclasses__, __globals__
                elif isinstance(node, ast.Attribute):
                    if node.attr in ["__subclasses__", "__globals__", "__builtins__"]:
                        return f"Security Policy Violation: Reflection property '{node.attr}' is prohibited."
        except SyntaxError:
            # Let normal compiler/interpreter report exact syntax error
            pass
    elif lang in ["javascript", "js"]:
        lower = code.lower()
        if any(bad in lower for bad in ["child_process", "fs.read", "fs.write", "fs.unlink", "process.env", "process.exit"]):
            return "Security Policy Violation: Filesystem or process operations are prohibited."
    elif lang in ["cpp", "c++"]:
        lower = code.lower()
        if any(bad in lower for bad in ["system(", "popen(", "execve(", "fork()", "remove(", "unlink("]):
            return "Security Policy Violation: Native system/process execution is prohibited."

    return None

def run_single_testcase(code: str, language: str, input_data: str, expected_output: str, timeout: float = 5.0):
    """
    Executes a single test case using the sandbox container if available,
    or falls back safely to a local subprocess runner.
    """
    lang = language.lower()
    
    # 0. Pre-execution Security Static Analysis
    sec_err = validate_code_security(code, lang)
    if sec_err:
        return False, "SECURITY_VIOLATION", sec_err, 0.0

    sandbox_used = False
    
    # 1. Try Sandbox Service
    try:
        with httpx.Client(timeout=timeout + 2.0) as client:
            resp = client.post(
                f"{settings.SANDBOX_URL}/execute",
                json={
                    "code": code,
                    "language": lang,
                    "input_data": input_data,
                    "timeout": timeout
                },
                headers={"Authorization": f"Bearer {settings.SANDBOX_SECRET_TOKEN}"}
            )
            if resp.status_code == 200:
                res_data = resp.json()
                sandbox_used = True
                status_exec = res_data.get("status", "SUCCESS")
                if status_exec in ["COMPILE_ERROR", "RUNTIME_ERROR", "TIMEOUT", "SYSTEM_ERROR"]:
                    return False, status_exec, res_data.get("stderr", ""), res_data.get("execution_time", 0.0)
                
                run_stdout = res_data.get("stdout", "").strip()
                passed = (run_stdout == expected_output.strip())
                err_msg = "" if passed else f"Output Mismatch.\nInput:\n{input_data}\nExpected:\n{expected_output}\nGot:\n{run_stdout}"
                return passed, "SUCCESS" if passed else "WRONG_ANSWER", err_msg, res_data.get("execution_time", 0.0)
    except Exception:
        pass  # Fall through to local runner
        
    # 2. Local Fallback Execution Runner
    import subprocess, sys, time, tempfile, os, shutil
    start_time = time.time()
    temp_dir = tempfile.mkdtemp(prefix="cq_run_")
    try:
        if lang == "python":
            proc = subprocess.run(
                [sys.executable, "-c", code],
                input=input_data,
                text=True,
                capture_output=True,
                timeout=timeout
            )
            exec_time = time.time() - start_time
            if proc.returncode != 0:
                return False, "RUNTIME_ERROR", proc.stderr, exec_time
            out = proc.stdout.strip()
            passed = (out == expected_output.strip())
            err = "" if passed else f"Output Mismatch.\nInput:\n{input_data}\nExpected:\n{expected_output}\nGot:\n{out}"
            return passed, "SUCCESS" if passed else "WRONG_ANSWER", err, exec_time

        elif lang in ["javascript", "js"]:
            js_file = os.path.join(temp_dir, "solution.js")
            with open(js_file, "w", encoding="utf-8") as f:
                f.write(code)
            proc = subprocess.run(
                ["node", js_file],
                input=input_data,
                text=True,
                capture_output=True,
                timeout=timeout
            )
            exec_time = time.time() - start_time
            if proc.returncode != 0:
                return False, "RUNTIME_ERROR", proc.stderr, exec_time
            out = proc.stdout.strip()
            passed = (out == expected_output.strip())
            err = "" if passed else f"Output Mismatch.\nInput:\n{input_data}\nExpected:\n{expected_output}\nGot:\n{out}"
            return passed, "SUCCESS" if passed else "WRONG_ANSWER", err, exec_time

        elif lang in ["cpp", "c++"]:
            cpp_file = os.path.join(temp_dir, "solution.cpp")
            out_file = os.path.join(temp_dir, "solution.exe" if os.name == "nt" else "solution.out")
            with open(cpp_file, "w", encoding="utf-8") as f:
                f.write(code)
            comp = subprocess.run(["g++", "-O2", cpp_file, "-o", out_file], capture_output=True, text=True, timeout=8.0)
            if comp.returncode != 0:
                return False, "COMPILE_ERROR", comp.stderr, time.time() - start_time
            proc = subprocess.run([out_file], input=input_data, text=True, capture_output=True, timeout=timeout)
            exec_time = time.time() - start_time
            if proc.returncode != 0:
                return False, "RUNTIME_ERROR", proc.stderr, exec_time
            out = proc.stdout.strip()
            passed = (out == expected_output.strip())
            err = "" if passed else f"Output Mismatch.\nInput:\n{input_data}\nExpected:\n{expected_output}\nGot:\n{out}"
            return passed, "SUCCESS" if passed else "WRONG_ANSWER", err, exec_time

        else:
            return False, "SYSTEM_ERROR", f"Unsupported language '{language}' in local environment", 0.0

    except subprocess.TimeoutExpired:
        return False, "TIMEOUT", f"Execution timed out after {timeout} seconds", timeout
    except Exception as e:
        return False, "SYSTEM_ERROR", str(e), time.time() - start_time
    finally:
        shutil.rmtree(temp_dir, ignore_errors=True)

@router.post("/{id}/submit", response_model=schemas.SubmissionResponse)
async def submit_coding_solution(
    id: str,
    payload: schemas.CodingSubmitRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    try:
        qid = uuid.UUID(id)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid problem ID")

    q = db.query(models.Question).filter(models.Question.id == qid, models.Question.type == "coding").first()
    if not q or not q.coding_detail:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Coding problem not found"
        )
        
    coding_problem = q.coding_detail
    test_cases = db.query(models.CodingTestCase).filter(models.CodingTestCase.coding_problem_id == coding_problem.id).all()
    
    if not test_cases:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Test cases not configured for this problem."
        )

    passed_count = 0
    total_time = 0.0
    compile_status = "SUCCESS"
    compiler_output = ""

    for tc in test_cases:
        passed, status_exec, err_msg, exec_time = await asyncio.to_thread(
            run_single_testcase,
            code=payload.code,
            language=payload.language,
            input_data=tc.input_data,
            expected_output=tc.expected_output,
            timeout=coding_problem.time_limit or 5.0
        )
        total_time += exec_time
        if passed:
            passed_count += 1
        else:
            compile_status = status_exec
            compiler_output = err_msg
            break

    is_correct = (passed_count == len(test_cases))
    awarded_score = q.xp_reward if is_correct else 0
    
    # Save base submission
    sub = models.Submission(
        user_id=current_user.id,
        question_id=q.id,
        score=awarded_score,
        is_correct=is_correct
    )
    db.add(sub)
    db.commit()
    db.refresh(sub)
    
    # Save coding detail
    coding_sub = models.CodingSubmission(
        submission_id=sub.id,
        code_source=payload.code,
        language=payload.language,
        execution_time=total_time,
        memory_usage=24576,
        compile_status=compile_status,
        compiler_output=compiler_output,
        test_cases_passed=passed_count,
        total_test_cases=len(test_cases)
    )
    db.add(coding_sub)
    
    # Award XP to user if correct
    if is_correct and current_user.profile:
        current_user.profile.xp += awarded_score
        current_user.profile.dsa_level = min(current_user.profile.dsa_level + 1.5, 100.0)
        
    db.commit()
    db.refresh(sub)

    # Emit analytics event
    record_analytics_event(
        db=db,
        event_type="code_submission",
        user_id=current_user.id,
        metadata={
            "question_id": str(q.id),
            "question_title": q.title,
            "language": payload.language,
            "is_correct": is_correct,
            "score": awarded_score
        }
    )
    
    return schemas.SubmissionResponse(
        id=sub.id,
        question_id=sub.question_id,
        score=sub.score,
        is_correct=sub.is_correct,
        created_at=sub.created_at,
        language=coding_sub.language,
        execution_time=coding_sub.execution_time,
        memory_usage=coding_sub.memory_usage,
        compile_status=coding_sub.compile_status,
        compiler_output=coding_sub.compiler_output,
        test_cases_passed=coding_sub.test_cases_passed,
        total_test_cases=coding_sub.total_test_cases
    )

@router.get("/topics/all", response_model=List[schemas.TopicDetailResponse])
def get_all_topics(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    topics = db.query(models.Topic).all()
    return topics

@router.post("/topics", response_model=schemas.TopicDetailResponse)
def create_topic(
    topic_in: schemas.TopicCreate,
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(get_current_admin)
):
    topic = db.query(models.Topic).filter(models.Topic.name == topic_in.name).first()
    if topic:
        raise HTTPException(status_code=400, detail="Topic already exists")
    
    new_topic = models.Topic(
        name=topic_in.name,
        description=topic_in.description
    )
    db.add(new_topic)
    db.commit()
    db.refresh(new_topic)
    return new_topic

@router.delete("/topics/{topic_id}")
def delete_topic(
    topic_id: str,
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(get_current_admin)
):
    import uuid
    try:
        topic_uuid = uuid.UUID(topic_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid topic ID")
        
    topic = db.query(models.Topic).filter(models.Topic.id == topic_uuid).first()
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")
        
    db.delete(topic)
    db.commit()
    return {"message": "Topic successfully deleted"}

@router.post("/topics/{topic_id}/subtopics", response_model=schemas.SubtopicResponse)
def create_subtopic(
    topic_id: str,
    subtopic_in: schemas.SubtopicCreate,
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(get_current_admin)
):
    import uuid
    try:
        topic_uuid = uuid.UUID(topic_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid topic ID")
        
    topic = db.query(models.Topic).filter(models.Topic.id == topic_uuid).first()
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")
        
    new_subtopic = models.Subtopic(
        topic_id=topic_uuid,
        name=subtopic_in.name,
        description=subtopic_in.description
    )
    db.add(new_subtopic)
    db.commit()
    db.refresh(new_subtopic)
    return new_subtopic

@router.delete("/subtopics/{subtopic_id}")
def delete_subtopic(
    subtopic_id: str,
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(get_current_admin)
):
    import uuid
    try:
        subtopic_uuid = uuid.UUID(subtopic_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid subtopic ID")
        
    subtopic = db.query(models.Subtopic).filter(models.Subtopic.id == subtopic_uuid).first()
    if not subtopic:
        raise HTTPException(status_code=404, detail="Subtopic not found")
        
    db.delete(subtopic)
    db.commit()
    return {"message": "Subtopic successfully deleted"}
