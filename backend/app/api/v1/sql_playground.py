from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import text
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from typing import List, Optional

from app.core.database import get_db
from app.api.v1.deps import get_current_user
from app.models import models
from app.schemas import schemas

router = APIRouter()

# Forbidden keywords in SQL Practice sandbox
FORBIDDEN_KEYWORDS = ["drop", "truncate", "alter", "grant", "revoke", "create", "insert", "update", "delete", "vacuum"]

@router.get("/", response_model=List[schemas.QuestionListResponse])
def get_sql_problems(
    difficulty: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    query = db.query(models.Question).filter(models.Question.type == "sql")
    if difficulty:
        query = query.filter(models.Question.difficulty == difficulty)
        
    questions = query.all()
    
    result = []
    for q in questions:
        result.append(schemas.QuestionListResponse(
            id=q.id,
            title=q.title,
            difficulty=q.difficulty,
            type=q.type,
            xp_reward=q.xp_reward,
            company_tags=q.company_tags or [],
            topic_name=q.topic.name if q.topic else "SQL & Databases",
            subtopic_name=q.subtopic.name if q.subtopic else "SQL Joins"
        ))
    return result

import uuid

@router.get("/{id}", response_model=schemas.QuestionDetailResponse)
def get_sql_problem_detail(
    id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    try:
        qid = uuid.UUID(id)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid problem ID")

    q = db.query(models.Question).filter(models.Question.id == qid, models.Question.type == "sql").first()
    if not q:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="SQL challenge not found"
        )
    return q

import sqlite3

def create_isolated_sql_sandbox(schema_desc: str, dataset_tables: Optional[dict] = None) -> sqlite3.Connection:
    """
    Creates an isolated in-memory SQLite database populated ONLY with the problem's
    mock schema tables. This completely eliminates access to production user tables.
    """
    conn = sqlite3.connect(":memory:")
    cur = conn.cursor()

    # 1. Execute explicit DDL/DML from dataset_tables if provided
    if dataset_tables and isinstance(dataset_tables, dict):
        for k, v in dataset_tables.items():
            if isinstance(v, str) and ("create" in v.lower() or "insert" in v.lower()):
                try:
                    cur.executescript(v)
                except Exception:
                    pass

    # 2. Parse schema_description (raw DDL script or text schema notation)
    if schema_desc:
        upper_desc = schema_desc.upper()
        if "CREATE TABLE" in upper_desc or "INSERT INTO" in upper_desc:
            try:
                cur.executescript(schema_desc)
            except Exception:
                pass
        else:
            for line in schema_desc.split("\n"):
                line = line.strip()
                if "(" in line and ")" in line:
                    table_name = line.split("(")[0].strip()
                    cols_part = line[line.find("(") + 1:line.rfind(")")].strip()
                    cols = [c.strip().split()[0] for c in cols_part.split(",") if c.strip()]
                    if table_name and cols:
                        col_defs = ", ".join([f'"{c}" TEXT' for c in cols])
                        try:
                            cur.execute(f'CREATE TABLE IF NOT EXISTS "{table_name}" ({col_defs});')
                            placeholders = ", ".join(["?" for _ in cols])
                            sample_row1 = [f"Sample_{c}_1" if "id" not in c.lower() else "1" for c in cols]
                            sample_row2 = [f"Sample_{c}_2" if "id" not in c.lower() else "2" for c in cols]
                            cur.execute(f'INSERT INTO "{table_name}" VALUES ({placeholders})', sample_row1)
                            cur.execute(f'INSERT INTO "{table_name}" VALUES ({placeholders})', sample_row2)
                        except Exception:
                            pass
    conn.commit()
    return conn

@router.post("/{id}/execute", response_model=schemas.SubmissionResponse)
def execute_sql_query(
    id: str,
    payload: schemas.SQLAttemptRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    try:
        qid = uuid.UUID(id)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid problem ID")

    q = db.query(models.Question).filter(models.Question.id == qid, models.Question.type == "sql").first()
    if not q or not q.sql_detail:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="SQL challenge not found"
        )
        
    query_text = payload.query.strip().lower()
    
    # 1. Security validation: block modification commands
    for kw in FORBIDDEN_KEYWORDS:
        if kw in query_text:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Forbidden keyword '{kw}' detected. Only read-only SELECT queries are allowed."
            )
            
    # Check that query starts with SELECT or WITH
    if not (query_text.startswith("select") or query_text.startswith("with")):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Queries must start with SELECT or WITH statements."
        )

    # 2. Execute strictly inside an isolated in-memory SQLite sandbox
    sql_error = None
    rows_output = []
    columns_output = []
    is_correct = False

    sandbox_conn = create_isolated_sql_sandbox(
        q.sql_detail.schema_description or "",
        q.sql_detail.dataset_tables
    )
    try:
        cur = sandbox_conn.cursor()
        cur.execute(payload.query)
        if cur.description:
            columns_output = [col[0] for col in cur.description]
            fetched = cur.fetchmany(50)
            rows_output = [dict(zip(columns_output, row)) for row in fetched]
            candidate_rows = [tuple(str(val) for val in row) for row in fetched]

            # Compare against expected_query if defined
            expected_query = (q.sql_detail.expected_query or "").strip()
            if expected_query:
                expected_conn = create_isolated_sql_sandbox(
                    q.sql_detail.schema_description or "",
                    q.sql_detail.dataset_tables
                )
                try:
                    exp_cur = expected_conn.cursor()
                    exp_cur.execute(expected_query)
                    if exp_cur.description:
                        exp_cols = [c[0].lower() for c in exp_cur.description]
                        exp_fetched = exp_cur.fetchmany(50)
                        exp_rows = [tuple(str(val) for val in row) for row in exp_fetched]
                        cand_cols_lower = [c.lower() for c in columns_output]
                        
                        # Match columns count and row data
                        if len(cand_cols_lower) == len(exp_cols):
                            if "order by" in expected_query.lower() or "order by" in payload.query.lower():
                                is_correct = (candidate_rows == exp_rows)
                            else:
                                is_correct = (sorted(candidate_rows) == sorted(exp_rows))
                        else:
                            is_correct = False
                    else:
                        is_correct = False
                except Exception:
                    is_correct = False
                finally:
                    expected_conn.close()
            else:
                is_correct = True
        else:
            is_correct = False
    except Exception as e:
        sql_error = str(e)
        is_correct = False
    finally:
        sandbox_conn.close()

    # Save attempt
    awarded_score = q.xp_reward if is_correct else 0
    sub = models.Submission(
        user_id=current_user.id,
        question_id=q.id,
        score=awarded_score,
        is_correct=is_correct
    )
    db.add(sub)
    db.commit()
    db.refresh(sub)
    
    # Save SQL Attempt detail
    attempt = models.Attempt(
        submission_id=sub.id,
        typed_sql=payload.query,
        sql_error=sql_error,
        execution_output={"columns": columns_output, "rows_count": len(rows_output)}
    )
    db.add(attempt)
    
    # Update SQL skill levels
    if is_correct and current_user.profile:
        current_user.profile.xp += awarded_score
        current_user.profile.sql_level = min(current_user.profile.sql_level + 2.0, 100.0)
        
    db.commit()
    db.refresh(sub)
    
    return schemas.SubmissionResponse(
        id=sub.id,
        question_id=sub.question_id,
        score=sub.score,
        is_correct=sub.is_correct,
        created_at=sub.created_at,
        typed_sql=attempt.typed_sql,
        sql_error=attempt.sql_error
    )
