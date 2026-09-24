# Code Quest — Comprehensive Enhancements, Bug Fixes & Architecture Roadmap

This document serves as the master implementation reference for all architectural upgrades, bug fixes, execution engine improvements, AI enhancements, and frontend modularization for the **Code Quest** platform.

---

## Table of Contents
1. [Identified Bugs & Direct Fixes](#1-identified-bugs--direct-fixes)
2. [Frontend Architecture Modularization](#2-frontend-architecture-modularization)
3. [Execution Engine & Sandbox Hardening](#3-execution-engine--sandbox-hardening)
4. [Asynchronous Background Queue (Celery + Redis)](#4-asynchronous-background-queue-celery--redis)
5. [AI Placement & Interview Enhancements](#5-ai-placement--interview-enhancements)
6. [Real-Time Live Code Battles & Multiplayer](#6-real-time-live-code-battles--multiplayer)
7. [Security, Auth & Repository Hygiene](#7-security-auth--repository-hygiene)
8. [Phased Implementation Schedule](#8-phased-implementation-schedule)

---

## 1. Identified Bugs & Direct Fixes

### 1.1 Bug: SQL Sandbox Evaluation Logic Flaw
* **Location**: `backend/app/api/v1/sql_playground.py:140-150`
* **Root Cause**: The route handler currently marks any query that produces column headers (`cur.description`) as `is_correct = True`. A simple `SELECT 1;` is marked as correct and awards XP.
* **Solution**:
  1. Execute candidate's query inside the isolated in-memory SQLite sandbox.
  2. Execute `question.sql_detail.expected_query` inside an identical sandbox replica.
  3. Compare column definitions, row counts, and ordered tuple values.
  4. Only mark `is_correct = True` if the candidate result strictly matches the expected query result.
  5. Populate mock tables with actual seed records defined in `dataset_tables` instead of arbitrary dummy values (`Sample_col_1`).

### 1.2 Bug: Sandbox Unix-Only `import pwd` on Windows
* **Location**: `sandbox/main.py:7`
* **Root Cause**: `import pwd` is Unix-specific. Running the sandbox service directly on Windows during local development throws an immediate unhandled `ImportError: No module named 'pwd'`.
* **Solution**:
  ```python
  import os
  if os.name != 'nt':
      import pwd
      try:
          user_info = pwd.getpwnam("sandbox_user")
          SANDBOX_UID, SANDBOX_GID = user_info.pw_uid, user_info.pw_gid
      except KeyError:
          SANDBOX_UID = os.getuid() if hasattr(os, "getuid") else 0
          SANDBOX_GID = os.getgid() if hasattr(os, "getgid") else 0
  else:
      SANDBOX_UID, SANDBOX_GID = 0, 0
  ```

### 1.3 Bug: Subprocess Fallback Blocking FastAPI Event Loop
* **Location**: `backend/app/api/v1/problems.py:164-228`
* **Root Cause**: When the Docker sandbox is offline or unavailable, the fallback runner executes `subprocess.run` directly on the request thread. Compilation (up to 8s) and multi-test execution block FastAPI from handling concurrent requests.
* **Solution**:
  Wrap all synchronous compilation and subprocess execution with `asyncio.to_thread` or offload to the Celery worker queue.

### 1.4 Bug: Root SQLite Database Leakage
* **Location**: Repository root (`placementforge.db`, `test.db`, `test_admin_dash.db`, etc.)
* **Root Cause**: Database files generated during testing and local development are being committed to the repo.
* **Solution**:
  1. Add `*.db`, `*.sqlite`, and `*.sqlite3` to `.gitignore`.
  2. Update `backend/tests/conftest.py` to use in-memory SQLite (`sqlite:///:memory:`) or remove temporary test databases upon fixture teardown.

---

## 2. Frontend Architecture Modularization

### 2.1 The Problem
`frontend/src/App.tsx` is currently **4,366 lines (229 KB)** in a single file with over 50 state variables, lack of client-side routing, and plain `<textarea>` code inputs.

### 2.2 Target Component Structure
Deconstruct `App.tsx` into a modular domain-driven directory layout:

```
frontend/src/
├── components/
│   ├── common/
│   │   ├── Navbar.tsx             # Profile, XP counter, streak badges, auth buttons
│   │   ├── Sidebar.tsx            # Navigation tabs (Arena, SQL, Battles, etc.)
│   │   ├── Modal.tsx              # Generic modal dialog
│   │   └── Badge.tsx              # Difficulty and tags
│   └── editor/
│       └── MonacoEditorWrapper.tsx# Professional Monaco Editor with dark mode & autocomplete
├── features/
│   ├── arena/
│   │   ├── CodingArena.tsx        # Problem description, language picker, code layout
│   │   ├── TestCasePanel.tsx      # Test inputs, custom test cases, sample runs
│   │   └── OutputConsole.tsx      # Compiler errors, runtime diffs, execution metrics
│   ├── sql/
│   │   ├── SqlPlayground.tsx      # SQL Query editor with run/submit buttons
│   │   ├── SchemaViewer.tsx       # Interactive schema browser with table structures
│   │   └── QueryResultTable.tsx   # Paginated tabular display for query output
│   ├── battles/
│   │   ├── BattleLobby.tsx        # Room code generator, join input, participant list
│   │   ├── LiveBattleArena.tsx    # Split-screen editor + real-time opponent telemetry
│   │   └── WinnerModal.tsx        # Winner banner, time taken, score diff
│   ├── ai-interview/
│   │   ├── InterviewChat.tsx      # Conversational transcript
│   │   ├── VoiceController.tsx    # Speech recognition & speech synthesis buttons
│   │   └── InterviewReport.tsx    # Strengths, weaknesses, communication rating
│   ├── resume-ats/
│   │   ├── ResumeUploader.tsx     # PDF drag-and-drop with size checks
│   │   ├── AtsScoreGauge.tsx      # Circular percentage score display
│   │   └── SkillBreakdown.tsx     # Keyword comparison & bullet improvement tips
│   ├── roadmaps/
│   │   └── RoadmapView.tsx        # Step-by-step curriculum with progress ticks
│   └── dashboard/
│       └── DashboardOverview.tsx  # Readiness score, activity breakdown, recent attempts
├── hooks/
│   ├── useAuth.ts                 # JWT authentication state and refresh logic
│   ├── useBattleSocket.ts         # WebSocket connection & event dispatcher
│   └── useSpeechRecognition.ts   # Web Speech API listener hook
├── services/
│   └── api.ts                     # Axios client with bearer token interceptors
└── App.tsx                        # Application shell with React Router routing
```

---

## 3. Execution Engine & Sandbox Hardening

1. **Docker cgroups Resource Limits**:
   Enforce dynamic CPU and memory limits per container in `docker-compose.yml`:
   ```yaml
   sandbox-executor:
     deploy:
       resources:
         limits:
           cpus: '1.0'
           memory: 512M
   ```
2. **Security Sandbox Restrictions**:
   * Block network access inside the execution sandbox container (`network_mode: none`).
   * Mount code directories as `read-only` whenever compilation is completed.
   * Enforce a hard process limit (`pids-limit: 64`) to prevent fork bombs.

---

## 4. Asynchronous Background Queue (Celery + Redis)

1. **Offload Resume ATS Scoring**:
   * In `backend/app/worker.py`, define task `process_resume_ats_task`:
     - Reads raw PDF stream.
     - Runs ATS keyword parsing and regex matching.
     - Calls Google Gemini API for executive summary.
     - Writes score breakdown to `ResumeAnalysis`.
2. **Asynchronous Resume Upload Flow**:
   * `POST /api/v1/ai/resume/upload-async`: Instantly returns `{ "task_id": "...", "status": "queued" }`.
   * `GET /api/v1/ai/resume/task/{task_id}`: Frontend polls or checks status until status is `ready`.

---

## 5. AI Placement & Interview Enhancements

1. **Speech-Driven Mock Interviews (Web Speech API)**:
   * **Candidate Voice Input**: Uses `webkitSpeechRecognition` to transcribe answers in real-time.
   * **AI Recruiter Voice Output**: Uses `window.speechSynthesis` to speak questions aloud with natural pacing.
   * **Speech Telemetry**: Track candidate speaking pace (WPM), hesitation pause length, and filler words count (`um`, `uh`, `basically`).
2. **Google X-Y-Z Resume Bullet Enhancer**:
   * Implement `POST /api/v1/ai/resume/rewrite-bullet`:
   * Transforms raw resume statements into impactful, metric-driven bullet points using Google's formula: *"Accomplished [X] as measured by [Y], by doing [Z]"*.

---

## 6. Real-Time Live Code Battles & Multiplayer

1. **Competitive ELO Rating System**:
   * Default starting ELO: 1200.
   * When a battle concludes, calculate new ratings using:
     $$E_A = \frac{1}{1 + 10^{(R_B - R_A)/400}}$$
     $$R'_A = R_A + 32 \times (S_A - E_A)$$
   * Store `elo_rating` in `Profile` table and display ranking badges (Bronze, Silver, Gold, Diamond, Grandmaster).
2. **Matchmaking Queue**:
   * Candidates join a Redis-backed queue (`matchmaking:queue:{difficulty}`).
   * A background worker pairs waiting users within a $\pm 150$ ELO window and spawns a battle room.
3. **Spectator Mode**:
   * Read-only WebSocket listeners allowed to spectate ongoing battles with live code telemetry.

---

## 7. Security, Auth & Repository Hygiene

1. **API Rate Limiting (`slowapi`)**:
   * `POST /api/v1/auth/login`: Limit to 5 attempts/minute per IP.
   * `POST /api/v1/problems/{id}/submit`: Limit to 10 submissions/minute.
   * `POST /api/v1/ai/*`: Limit to 5 requests/minute.
2. **Password Complexity Validation**:
   * Enforce minimum 8 characters, at least 1 uppercase letter, 1 number, and 1 special symbol in `schemas.py:UserRegister`.
3. **Database Hygiene**:
   * Add SQLite and temp database patterns to `.gitignore`.
   * Refactor tests to run on fresh temporary databases.

---

## 8. Phased Implementation Schedule

| Phase | Core Objective | Primary Deliverables |
|---|---|---|
| **Phase 1: Core Bug & Logic Fixes** | Correctness & Portability | Fix SQL evaluation in `sql_playground.py`, fix `pwd` import in `sandbox/main.py`, make subprocess runner non-blocking. |
| **Phase 2: Frontend Modularization** | Code Quality & UX | Decompose `App.tsx` into feature folders, install Monaco Editor, set up client routing. |
| **Phase 3: Celery Background Queue** | Concurrency & Reliability | Move PDF parsing and Gemini calls to Celery tasks with async upload endpoint. |
| **Phase 4: AI & Multiplayer Upgrades** | Product Differentiation | Voice-enabled mock interviews, ELO battle ranking, bullet point rewriter. |
| **Phase 5: Security & Production Hardening** | Enterprise Readiness | Rate limiting, password complexity enforcement, container cgroups sandbox limits. |
