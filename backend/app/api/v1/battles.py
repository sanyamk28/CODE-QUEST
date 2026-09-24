import os
import json
import uuid
import random
import string
import asyncio
from datetime import datetime
from typing import Dict, List, Optional, Set
from fastapi import APIRouter, Depends, HTTPException, status, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session

from app.core.database import get_db, SessionLocal
from app.core.config import settings
from app.api.v1.deps import get_current_user
from app.models import models
from app.schemas import schemas
from app.core.analytics import record_analytics_event
from app.api.v1.problems import run_single_testcase

# Optional Redis connection with in-memory atomic lock fallback
try:
    import redis
    redis_client = redis.Redis.from_url(settings.REDIS_URL, decode_responses=True, socket_connect_timeout=1.0)
    redis_client.ping()
    HAS_REDIS = True
except Exception:
    HAS_REDIS = False
    redis_client = None

# In-memory battle winner atomic fallback lock
import threading
_battle_lock = threading.Lock()
_in_memory_winners: Dict[str, str] = {}

router = APIRouter()

def generate_room_code() -> str:
    chars = string.ascii_uppercase + string.digits
    return ''.join(random.choices(chars, k=6))

# WebSocket Connection Manager for Battle Rooms
class BattleConnectionManager:
    def __init__(self):
        # room_code -> dict of user_id -> WebSocket
        self.active_rooms: Dict[str, Dict[str, WebSocket]] = {}

    async def connect(self, room_code: str, user_id: str, websocket: WebSocket):
        await websocket.accept()
        if room_code not in self.active_rooms:
            self.active_rooms[room_code] = {}
        self.active_rooms[room_code][user_id] = websocket

    def disconnect(self, room_code: str, user_id: str):
        if room_code in self.active_rooms:
            self.active_rooms[room_code].pop(user_id, None)
            if not self.active_rooms[room_code]:
                del self.active_rooms[room_code]

    async def broadcast_to_room(self, room_code: str, event_type: str, data: dict, exclude_user_id: Optional[str] = None):
        if room_code in self.active_rooms:
            message = json.dumps({"event": event_type, "data": data})
            dead_sockets = []
            for uid, ws in list(self.active_rooms[room_code].items()):
                if exclude_user_id and str(uid) == str(exclude_user_id):
                    continue
                try:
                    await ws.send_text(message)
                except Exception:
                    dead_sockets.append(uid)
            for uid in dead_sockets:
                self.active_rooms[room_code].pop(uid, None)

battle_manager = BattleConnectionManager()

def acquire_battle_winner(room_id: str, user_id: str) -> bool:
    """
    Atomic winner lock. Uses Redis SETNX if available; otherwise uses thread-safe memory lock.
    """
    key = f"room:{room_id}:winner"
    if HAS_REDIS and redis_client:
        try:
            # SETNX key value: returns 1 if set, 0 if already exists
            acquired = redis_client.set(key, str(user_id), nx=True, ex=3600)
            return bool(acquired)
        except Exception:
            pass  # fallback
    
    with _battle_lock:
        if room_id not in _in_memory_winners:
            _in_memory_winners[room_id] = str(user_id)
            return True
        return False

def calculate_elo_delta(winner_rating: float, loser_rating: float, k: float = 32.0) -> float:
    """
    Standard Elo rating calculation:
    E_winner = 1 / (1 + 10 ** ((loser_rating - winner_rating) / 400))
    delta = K * (1 - E_winner)
    """
    expected_winner = 1.0 / (1.0 + 10.0 ** ((loser_rating - winner_rating) / 400.0))
    delta = k * (1.0 - expected_winner)
    return round(delta, 1)


def format_battle_problem_detail(problem: Optional[models.Question]) -> Optional[schemas.BattleProblemDetail]:
    if not problem:
        return None
    template_code = "import sys\n\ndef solve():\n    # Read input and solve\n    pass\n\nif __name__ == '__main__':\n    solve()\n"
    constraints = None
    input_format = None
    output_format = None
    if problem.coding_detail:
        cd = problem.coding_detail
        if cd.code_templates and isinstance(cd.code_templates, dict) and "python" in cd.code_templates:
            template_code = cd.code_templates["python"]
        constraints = cd.constraints
        input_format = cd.input_format
        output_format = cd.output_format

    return schemas.BattleProblemDetail(
        id=problem.id,
        title=problem.title,
        description=problem.description,
        difficulty=problem.difficulty,
        type=problem.type,
        xp_reward=problem.xp_reward or 25,
        company_tags=problem.company_tags or [],
        template_code=template_code,
        input_format=input_format,
        output_format=output_format,
        constraints=constraints
    )

def format_battle_problem_list(problem: Optional[models.Question]) -> Optional[schemas.QuestionListResponse]:
    if not problem:
        return None
    return schemas.QuestionListResponse(
        id=problem.id,
        title=problem.title,
        difficulty=problem.difficulty,
        type=problem.type,
        xp_reward=problem.xp_reward or 25,
        company_tags=problem.company_tags or [],
        topic_name=problem.topic.name if problem.topic else "DSA",
        subtopic_name=problem.subtopic.name if problem.subtopic else "Algorithms"
    )

# --- REST ENDPOINTS ---

@router.post("/create", response_model=schemas.BattleRoomResponse)
def create_battle_room(
    payload: schemas.BattleRoomCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # Select problem for battle
    problem = None
    if payload.problem_id:
        try:
            problem = db.query(models.Question).filter(models.Question.id == uuid.UUID(payload.problem_id)).first()
        except ValueError:
            pass
            
    if not problem:
        # Pick random coding problem matching difficulty
        query = db.query(models.Question).filter(models.Question.type == "coding")
        if payload.difficulty:
            query = query.filter(models.Question.difficulty == payload.difficulty)
        problem = query.first()

    room_code = generate_room_code()
    attempts = 0
    while db.query(models.BattleRoom).filter(models.BattleRoom.room_code == room_code).first() and attempts < 10:
        room_code = generate_room_code()
        attempts += 1
    if attempts >= 10:
        room_code = uuid.uuid4().hex[:6].upper()

    room = models.BattleRoom(
        room_code=room_code,
        host_id=current_user.id,
        problem_id=problem.id if problem else None,
        status="waiting",
        max_players=payload.max_players or 4
    )
    db.add(room)
    db.commit()
    db.refresh(room)

    # Add host as first participant
    participant = models.BattleParticipant(
        room_id=room.id,
        user_id=current_user.id,
        score=0,
        has_passed=False
    )
    db.add(participant)
    db.commit()
    db.refresh(room)

    # Record analytics
    record_analytics_event(
        db=db,
        event_type="code_battle_created",
        user_id=current_user.id,
        metadata={"room_code": room_code, "room_id": str(room.id)}
    )

    participants_res = [
        schemas.BattleParticipantResponse(
            user_id=current_user.id,
            user_name=current_user.profile.name if current_user.profile else current_user.email.split('@')[0],
            has_passed=False,
            score=0,
            joined_at=participant.joined_at
        )
    ]

    return schemas.BattleRoomResponse(
        id=room.id,
        room_code=room.room_code,
        host_id=room.host_id,
        problem_id=room.problem_id,
        status=room.status,
        max_players=room.max_players,
        created_at=room.created_at,
        participants=participants_res,
        problem=format_battle_problem_list(room.problem),
        problem_detail=format_battle_problem_detail(room.problem)
    )

@router.post("/join", response_model=schemas.BattleRoomResponse)
async def join_battle_room(
    payload: schemas.BattleRoomJoin,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    room_code = payload.room_code.strip().upper()
    room = db.query(models.BattleRoom).filter(models.BattleRoom.room_code == room_code).first()
    if not room:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Battle room not found")

    if room.status in ["completed", "closed"]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Battle has already ended")

    # Check capacity
    existing_participant = db.query(models.BattleParticipant).filter(
        models.BattleParticipant.room_id == room.id,
        models.BattleParticipant.user_id == current_user.id
    ).first()

    if not existing_participant:
        current_count = db.query(models.BattleParticipant).filter(models.BattleParticipant.room_id == room.id).count()
        if current_count >= room.max_players:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Room is already at max capacity")

        participant = models.BattleParticipant(
            room_id=room.id,
            user_id=current_user.id,
            score=0,
            has_passed=False
        )
        db.add(participant)
        db.commit()

    db.refresh(room)

    user_name = current_user.profile.name if current_user.profile else current_user.email.split('@')[0]
    
    # Broadcast player_joined event to WebSocket room
    await battle_manager.broadcast_to_room(
        room_code=room.room_code,
        event_type="player_joined",
        data={"user_id": str(current_user.id), "user_name": user_name}
    )

    # Record analytics
    record_analytics_event(
        db=db,
        event_type="code_battle_joined",
        user_id=current_user.id,
        metadata={"room_code": room_code, "room_id": str(room.id)}
    )

    participants_res = []
    for p in room.participants:
        p_user = p.user
        p_name = p_user.profile.name if p_user and p_user.profile else (p_user.email.split('@')[0] if p_user else "Player")
        participants_res.append(schemas.BattleParticipantResponse(
            user_id=p.user_id,
            user_name=p_name,
            has_passed=p.has_passed,
            score=p.score,
            joined_at=p.joined_at
        ))

    return schemas.BattleRoomResponse(
        id=room.id,
        room_code=room.room_code,
        host_id=room.host_id,
        problem_id=room.problem_id,
        status=room.status,
        winner_id=room.winner_id,
        max_players=room.max_players,
        created_at=room.created_at,
        started_at=room.started_at,
        ended_at=room.ended_at,
        participants=participants_res,
        problem=format_battle_problem_list(room.problem),
        problem_detail=format_battle_problem_detail(room.problem)
    )

@router.post("/quick-match", response_model=schemas.BattleRoomResponse)
async def quick_match(
    payload: Optional[schemas.BattleRoomCreate] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Finds an open waiting 1v1 room to join immediately, or creates a new duel room.
    """
    open_rooms = db.query(models.BattleRoom).filter(
        models.BattleRoom.status == "waiting",
        models.BattleRoom.host_id != current_user.id
    ).all()
    
    for r in open_rooms:
        if len(r.participants) < (r.max_players or 2):
            return await join_battle_room(schemas.BattleRoomJoin(room_code=r.room_code), db=db, current_user=current_user)
            
    diff = payload.difficulty if payload else "Easy"
    return create_battle_room(schemas.BattleRoomCreate(difficulty=diff, max_players=2), db=db, current_user=current_user)

@router.post("/{room_code}/start")
async def start_battle(
    room_code: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    room = db.query(models.BattleRoom).filter(models.BattleRoom.room_code == room_code.upper()).first()
    if not room:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Room not found")
    if room.host_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only the host can start the battle")

    if room.status == "active":
        return {"message": "Battle already active", "room_code": room.room_code}
    if room.status in ["completed", "closed"]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Battle has already concluded")

    room.status = "active"
    room.started_at = datetime.utcnow()
    db.commit()

    # Broadcast battle_started to all players with full problem details
    problem_detail = format_battle_problem_detail(room.problem)
    problem_dict = problem_detail.model_dump(mode="json") if problem_detail else None
    await battle_manager.broadcast_to_room(
        room_code=room.room_code,
        event_type="battle_started",
        data={
            "room_code": room.room_code,
            "problem_id": str(room.problem_id) if room.problem_id else None,
            "problem": problem_dict,
            "problem_detail": problem_dict,
            "started_at": room.started_at.isoformat()
        }
    )

    return {"message": "Battle started successfully", "room_code": room.room_code}

@router.get("/{room_code}", response_model=schemas.BattleRoomResponse)
def get_battle_room(
    room_code: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    room = db.query(models.BattleRoom).filter(models.BattleRoom.room_code == room_code.upper()).first()
    if not room:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Room not found")

    winner_name = None
    if room.winner:
        winner_name = room.winner.profile.name if room.winner.profile else room.winner.email.split('@')[0]

    participants_res = []
    for p in room.participants:
        p_user = p.user
        p_name = p_user.profile.name if p_user and p_user.profile else (p_user.email.split('@')[0] if p_user else "Player")
        participants_res.append(schemas.BattleParticipantResponse(
            user_id=p.user_id,
            user_name=p_name,
            has_passed=p.has_passed,
            score=p.score,
            joined_at=p.joined_at
        ))

    return schemas.BattleRoomResponse(
        id=room.id,
        room_code=room.room_code,
        host_id=room.host_id,
        problem_id=room.problem_id,
        status=room.status,
        winner_id=room.winner_id,
        winner_name=winner_name,
        max_players=room.max_players,
        created_at=room.created_at,
        started_at=room.started_at,
        ended_at=room.ended_at,
        participants=participants_res,
        problem=format_battle_problem_list(room.problem),
        problem_detail=format_battle_problem_detail(room.problem)
    )

@router.post("/{room_code}/submit", response_model=schemas.BattleSubmitResponse)
async def submit_battle_solution(
    room_code: str,
    payload: schemas.BattleSubmitRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    room = db.query(models.BattleRoom).filter(models.BattleRoom.room_code == room_code.upper()).first()
    if not room:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Room not found")
    if room.status != "active":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Battle is not currently active")

    if not room.problem or not room.problem.coding_detail:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Problem details not configured")

    coding_problem = room.problem.coding_detail
    test_cases = db.query(models.CodingTestCase).filter(
        models.CodingTestCase.coding_problem_id == coding_problem.id
    ).all()

    if not test_cases:
        test_cases = [models.CodingTestCase(input_data="3 5\n", expected_output="8", is_public=True)]

    passed_count = 0
    total_time = 0.0
    compiler_output = ""

    for tc in test_cases:
        passed, status_exec, err_msg, exec_time = run_single_testcase(
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
            compiler_output = err_msg
            break

    is_correct = (passed_count == len(test_cases))
    is_winner = False

    # Save battle submission record
    battle_sub = models.BattleSubmission(
        room_id=room.id,
        user_id=current_user.id,
        code=payload.code,
        language=payload.language,
        is_correct=is_correct,
        test_cases_passed=passed_count,
        total_test_cases=len(test_cases),
        execution_time=total_time,
        compiler_output=compiler_output
    )
    db.add(battle_sub)

    user_name = current_user.profile.name if current_user.profile else current_user.email.split('@')[0]

    # If all test cases passed, attempt atomic winner acquisition
    if is_correct and room.status == "active":
        acquired = acquire_battle_winner(str(room.id), str(current_user.id))
        if acquired:
            is_winner = True
            room.winner_id = current_user.id
            room.status = "completed"
            room.ended_at = datetime.utcnow()

            # Award winner XP and calculate Elo delta
            elo_delta = 32.0
            if current_user.profile:
                current_user.profile.xp += 100
                current_user.profile.readiness_score = min(current_user.profile.readiness_score + 2.0, 100.0)

            # Record battle won analytics
            record_analytics_event(
                db=db,
                event_type="code_battle_won",
                user_id=current_user.id,
                metadata={"room_code": room_code, "room_id": str(room.id), "elo_delta": elo_delta}
            )

            # Broadcast room_winner event with Elo delta
            await battle_manager.broadcast_to_room(
                room_code=room.room_code,
                event_type="room_winner",
                data={
                    "winner_id": str(current_user.id),
                    "winner_name": user_name,
                    "execution_time": total_time,
                    "elo_delta": elo_delta
                }
            )

    # Broadcast submission result
    await battle_manager.broadcast_to_room(
        room_code=room.room_code,
        event_type="submission_result",
        data={
            "user_id": str(current_user.id),
            "user_name": user_name,
            "is_correct": is_correct,
            "passed_count": passed_count,
            "total_test_cases": len(test_cases)
        }
    )

    db.commit()

    # Record submission analytics
    record_analytics_event(
        db=db,
        event_type="code_battle_submission",
        user_id=current_user.id,
        metadata={
            "room_code": room_code,
            "is_correct": is_correct,
            "is_winner": is_winner,
            "language": payload.language
        }
    )

    return schemas.BattleSubmitResponse(
        is_correct=is_correct,
        test_cases_passed=passed_count,
        total_test_cases=len(test_cases),
        is_winner=is_winner,
        execution_time=total_time,
        compiler_output=compiler_output
    )

# --- WEBSOCKET ENDPOINT ---

import html

@router.websocket("/ws/{room_code}")
async def battle_websocket_endpoint(websocket: WebSocket, room_code: str):
    room_code = "".join([c for c in room_code.upper() if c.isalnum()])[:8]
    raw_uid = websocket.query_params.get("user_id", str(uuid.uuid4()))
    user_id = "".join([c for c in raw_uid if c.isalnum() or c in "-_"])[:64]
    user_name = html.escape(websocket.query_params.get("user_name", "Player"))[:32]
    
    await battle_manager.connect(room_code, user_id, websocket)
    await battle_manager.broadcast_to_room(
        room_code=room_code,
        event_type="player_connected",
        data={"user_id": user_id, "user_name": user_name}
    )
    try:
        while True:
            data = await websocket.receive_text()
            # Enforce 64KB message size limit to protect server memory
            if len(data) > 65536:
                continue
            try:
                payload = json.loads(data)
                action = payload.get("action")
                if action == "ping":
                    await websocket.send_text(json.dumps({"event": "pong"}))
                elif action in ["code_progress", "test_update", "chat_message", "player_ready", "taunt", "surrender"]:
                    event_data = payload.get("data", {})
                    event_data["user_id"] = user_id
                    event_data["user_name"] = user_name
                    exclude_sender = user_id if action in ["code_progress", "test_update", "taunt"] else None
                    await battle_manager.broadcast_to_room(
                        room_code=room_code,
                        event_type=action,
                        data=event_data,
                        exclude_user_id=exclude_sender
                    )
            except Exception:
                pass
    except WebSocketDisconnect:
        battle_manager.disconnect(room_code, user_id)
        await battle_manager.broadcast_to_room(
            room_code=room_code,
            event_type="player_left",
            data={"user_id": user_id, "user_name": user_name}
        )
