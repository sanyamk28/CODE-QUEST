# System Workflows & Event Lifecycles

## 1. Live Code Battle Flow

```
Host                      Server / Redis                  Player 2
 │                              │                            │
 ├─── POST /battles/create ────►│                            │
 │◄── Returns Room Code (e.g. AB12CD)                        │
 │                              │◄── POST /battles/join ─────┤
 │                              │    (Broadcasts to WS)      │
 │◄── WS: player_joined ────────┤                            │
 │                              │                            │
 ├─── POST /battles/{code}/start ───────────────────────────►│
 │    (Broadcasts to WS: battle_started)                     │
 │                              │                            │
 │                              │◄── POST /submit ───────────┤
 │                              │    - Executes test cases   │
 │                              │    - All Passed = True     │
 │                              │    - SETNX room:{id}:winner│
 │                              │      (Acquires lock)       │
 │◄── WS: room_winner ──────────┼─── WS: room_winner ───────►│
 │    (Winner: Player 2)        │    (Status: Winner!)       │
```

1. **Room Creation**: Host specifies difficulty or problem. A unique 6-character room code is generated and saved with status `waiting`.
2. **Player Lobby**: Players join with the code. WebSocket connections to `/api/v1/battles/ws/{room_code}` broadcast `player_joined` and player list updates.
3. **Battle Start**: Host triggers `start`. Server sets status `active` and broadcasts `battle_started` along with the question ID.
4. **Live Submissions**: Each player submits code. Submissions are judged against test cases.
5. **Atomic Winner Determination**: The first player passing all test cases executes atomic Redis `SETNX room:{id}:winner <user_id>`.
6. **Room Closure**: Server marks room `completed`, awards +100 XP to winner, broadcasts `room_winner` event, and offers rematch.

---

## 2. Non-Blocking AI Resume ATS Scoring Flow

1. **Upload**: Candidate uploads PDF resume via `/api/v1/ai/resume/upload`.
2. **Extraction**: `pypdf` extracts raw text from PDF binary.
3. **LLM Evaluation**: Text is evaluated against candidate's target role using Google Gemini 1.5 Flash.
4. **Scoring & Suggestions**: Returns an ATS score (0-100), matched skills, missing skills, formatting advice, and bullet enhancement tips.
5. **Telemetry**: Fires `resume_uploaded` and `resume_scored` analytics events.

---

## 3. Safe SQL Execution Flow

1. **Inspection**: Incoming query is trimmed and checked against destructive SQL keywords (`DROP`, `TRUNCATE`, `ALTER`, `DELETE`, `UPDATE`, `INSERT`).
2. **Validation**: Query must start with `SELECT` or `WITH`.
3. **Execution**: Query is executed on the PostgreSQL engine inside a database transaction block.
4. **Rollback**: `transaction.rollback()` is unconditionally executed in a `finally` block to guarantee 100% read-only integrity.
5. **Grading**: Output rows and columns are returned to the candidate.
