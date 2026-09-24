# System Design Diagrams: Data Flow Diagrams (DFD) & UML Use Case Diagrams
## Project: **Code Quest (Placement Preparation & Assessment Platform)**

---

## Table of Contents
1. [Executive Overview](#1-executive-overview)
2. [UML Use Case Diagrams](#2-uml-use-case-diagrams)
   - [2.1 Actor Catalog](#21-actor-catalog)
   - [2.2 System-Wide High-Level Use Case Diagram](#22-system-wide-high-level-use-case-diagram)
   - [2.3 Subsystem Use Case Diagrams](#23-subsystem-use-case-diagrams)
     - [2.3.1 DSA Arena & Code Execution](#231-dsa-arena--code-execution)
     - [2.3.2 Safe SQL Playground](#232-safe-sql-playground)
     - [2.3.3 Real-Time Multiplayer Code Battles](#233-real-time-multiplayer-code-battles)
     - [2.3.4 AI Mock Recruiter & ATS Resume Scanner](#234-ai-mock-recruiter--ats-resume-scanner)
     - [2.3.5 Institutional Admin & TPO Telemetry](#235-institutional-admin--tpo-telemetry)
   - [2.4 Tabular Use Case Specifications](#24-tabular-use-case-specifications)
3. [Data Flow Diagrams (DFD)](#3-data-flow-diagrams-dfd)
   - [3.1 Data Flow Notation & Conventions](#31-data-flow-notation--conventions)
   - [3.2 DFD Level 0 — Context Diagram](#32-dfd-level-0--context-diagram)
   - [3.3 DFD Level 1 — System Decomposition Diagram](#33-dfd-level-1--system-decomposition-diagram)
   - [3.4 DFD Level 2 — Micro-Process Pipelines](#34-dfd-level-2--micro-process-pipelines)
     - [3.4.1 DFD Level 2.1: DSA Code Compilation & Sandboxed Execution](#341-dfd-level-21-dsa-code-compilation--sandboxed-execution)
     - [3.4.2 DFD Level 2.2: Safe SQL Transactional Execution Engine](#342-dfd-level-22-safe-sql-transactional-execution-engine)
     - [3.4.3 DFD Level 2.3: Real-Time Battle Matchmaking & Redis SETNX Settlement](#343-dfd-level-23-real-time-battle-matchmaking--redis-setnx-settlement)
     - [3.4.4 DFD Level 2.4: AI Mock Interview & Resume ATS Parsing Flow](#344-dfd-level-24-ai-mock-interview--resume-ats-parsing-flow)
4. [Data Dictionary](#4-data-dictionary)

---

## 1. Executive Overview

This document presents the complete formal behavioral and architectural modeling diagrams for **Code Quest**. 
It encompasses:
1. **UML Use Case Diagrams**: Modeling human actors, system actors, external services, and use case dependencies (`<<include>>`, `<<extend>>`).
2. **Data Flow Diagrams (DFD)**: Multi-level process decompositions conforming to Gane & Sarson / Yourdon conventions:
   - **Level 0 (Context Diagram)**: Outlines external system entities and overarching data boundaries.
   - **Level 1 (System Decomposition)**: Maps core system processes (1.0 to 8.0) and primary data stores (D1 to D6).
   - **Level 2 (Process Logic Pipelines)**: Explodes mission-critical sub-systems (Code Sandbox, Safe SQL Engine, Atomic Battle Engine, and AI Services) into fine-grained procedural steps.

---

## 2. UML Use Case Diagrams

### 2.1 Actor Catalog

| Actor | Category | Role & Capabilities |
|---|---|---|
| **Student / Candidate** | Human (Primary) | Engineering candidate practicing DSA, SQL, CS fundamentals, participating in code battles, taking AI interviews, auditing resumes, and tracking personal readiness. |
| **Admin / TPO** | Human (Primary) | Training and Placement Officer / College Administrator monitoring cohort activity, analyzing drop-off funnels, inspecting individual student logs, and managing curriculum. |
| **Battle Host** | Human (Specialized) | Candidate or organizer initiating a private or public 1v1 battle room and distributing the contest code. |
| **Code Judge Sandbox** | System / External Actor | Docker container daemon or cgroup-constrained host subprocess evaluating untrusted code in Python, C++, Java, and JavaScript. |
| **Google Gemini AI API** | External Cloud Service | LLM service providing multi-turn conversational mock technical interviews and ATS semantic resume evaluations. |
| **PostgreSQL Database** | Storage System | Relational data persistence providing transactional execution with explicit rollback guarantees for student SQL queries. |
| **Redis In-Memory Engine** | Distributed System | High-throughput broker managing WebSocket pub/sub rooms and atomic distributed locks via `SETNX`. |

---

### 2.2 System-Wide High-Level Use Case Diagram

*High-Resolution Image: [images/use_case_diagram.jpg](./images/use_case_diagram.jpg)*

![Code Quest UML Use Case Diagram](./images/use_case_diagram.jpg)

```mermaid
flowchart LR
    %% Actors
    student["👤 Student Candidate"]
    admin["👔 Admin / TPO"]
    gemini["🤖 Google Gemini AI"]
    sandbox["📦 Execution Sandbox"]
    redis["⚡ Redis (Lock Engine)"]

    %% System Boundary
    subgraph CodeQuest["System Boundary: Code Quest Platform"]
        %% Student Use Cases
        uc_auth["([UC-01: Authenticate / OAuth SSO])"]
        uc_profile["([UC-02: View Profile & Readiness Index])"]
        uc_dsa["([UC-03: Practice DSA Problems])"]
        uc_submit["([UC-04: Submit Code Solution])"]
        uc_sql["([UC-05: Execute SQL Practice Query])"]
        uc_mcq["([UC-06: Take CS MCQ Assessment])"]
        uc_puzzle["([UC-07: Solve Logic Puzzles])"]
        uc_hint["([UC-08: Request Progressive Hint])"]
        uc_battle["([UC-09: Compete in 1v1 Code Battle])"]
        uc_winner["([UC-10: Settle Atomic Battle Winner])"]
        uc_interview["([UC-11: Take AI Mock Technical Interview])"]
        uc_resume["([UC-12: Scan Resume for ATS Score])"]
        
        %% Admin Use Cases
        uc_telemetry["([UC-13: View Placement Telemetry & Funnels])"]
        uc_inspect["([UC-14: Inspect Student Drill-Down])"]
        uc_cms["([UC-15: Manage Curriculum & Question Bank])"]
        uc_users["([UC-16: Moderate User Accounts])"]
    end

    %% Student Connections
    student --> uc_auth
    student --> uc_profile
    student --> uc_dsa
    student --> uc_sql
    student --> uc_mcq
    student --> uc_puzzle
    student --> uc_battle
    student --> uc_interview
    student --> uc_resume

    %% Admin Connections
    admin --> uc_auth
    admin --> uc_telemetry
    admin --> uc_inspect
    admin --> uc_cms
    admin --> uc_users

    %% Include / Extend Relationships
    uc_dsa -.->|"<<include>>"| uc_submit
    uc_submit -.->|"<<include>>"| sandbox
    uc_puzzle -.->|"<<extend>>"| uc_hint
    uc_battle -.->|"<<include>>"| uc_submit
    uc_battle -.->|"<<include>>"| uc_winner
    uc_winner -.->|"<<include>>"| redis
    uc_interview -.->|"<<include>>"| gemini
    uc_resume -.->|"<<include>>"| gemini
```

---

### 2.3 Subsystem Use Case Diagrams

#### 2.3.1 DSA Arena & Code Execution

```mermaid
flowchart LR
    student["👤 Student Candidate"]
    sandbox["📦 Execution Sandbox (Docker / cgroup)"]

    subgraph DsaSubsystem["Subsystem: Algorithmic Coding Arena"]
        uc_browse["([Browse & Filter Problems by Topic/Difficulty])"]
        uc_code["([Write Code in Monaco Editor])"]
        uc_run["([Run Sample Test Cases])"]
        uc_submit["([Submit for Final Judging])"]
        uc_verify["([Execute in Isolated Sandbox])"]
        uc_metrics["([Analyze Time/Memory Complexity])"]
        uc_xp["([Award XP & Update Readiness Index])"]
    end

    student --> uc_browse
    student --> uc_code
    student --> uc_run
    student --> uc_submit

    uc_run -.->|"<<include>>"| uc_verify
    uc_submit -.->|"<<include>>"| uc_verify
    uc_verify --> sandbox
    uc_submit -.->|"<<include>>"| uc_metrics
    uc_submit -.->|"<<include>>"| uc_xp
```

---

#### 2.3.2 Safe SQL Playground

```mermaid
flowchart LR
    student["👤 Student Candidate"]
    db["🗄️ PostgreSQL Engine"]

    subgraph SqlSubsystem["Subsystem: Safe SQL Playground"]
        uc_schema["([Explore Schema Tables & Metadata])"]
        uc_write["([Compose SQL Query])"]
        uc_execute["([Execute Query Against Practice DB])"]
        uc_sanitize["([Sanitize Query & Check Forbidden Tokens])"]
        uc_txn["([Wrap in Transaction & Issue Unconditional ROLLBACK])"]
        uc_diff["([Compare Result Table with Solution Output])"]
    end

    student --> uc_schema
    student --> uc_write
    student --> uc_execute

    uc_execute -.->|"<<include>>"| uc_sanitize
    uc_execute -.->|"<<include>>"| uc_txn
    uc_execute -.->|"<<include>>"| uc_diff
    uc_txn --> db
```

---

#### 2.3.3 Real-Time Multiplayer Code Battles

```mermaid
flowchart LR
    host["👤 Battle Host"]
    peer["👤 Opponent Player"]
    redis["⚡ Redis (Lock Manager)"]
    ws["📡 WebSocket Server"]

    subgraph BattleSubsystem["Subsystem: Real-Time Battle Engine"]
        uc_create["([Create Battle Room with Code])"]
        uc_join["([Join Battle via 6-Char Room Code])"]
        uc_sync["([Synchronize Game State over WebSocket])"]
        uc_solve["([Solve Live Challenge Under Pressure])"]
        uc_lock["([Atomic Winner Resolution via SETNX])"]
        uc_rematch["([Request Instant Rematch])"]
    end

    host --> uc_create
    host --> uc_solve
    peer --> uc_join
    peer --> uc_solve

    uc_create -.->|"<<include>>"| uc_sync
    uc_join -.->|"<<include>>"| uc_sync
    uc_sync --> ws
    uc_solve -.->|"<<include>>"| uc_lock
    uc_lock --> redis
    uc_solve -.->|"<<extend>>"| uc_rematch
```

---

#### 2.3.4 AI Mock Recruiter & ATS Resume Scanner

```mermaid
flowchart LR
    student["👤 Student Candidate"]
    gemini["🤖 Google Gemini 1.5 Flash API"]

    subgraph AiSubsystem["Subsystem: AI Mentorship & Resume Engine"]
        uc_role["([Select Target SDE Role & Experience Level])"]
        uc_start_int["([Launch Multi-Turn AI Technical Interview])"]
        uc_gen_q["([Generate Adaptive Follow-Up Questions])"]
        uc_scorecard["([Compute Rubric Scorecard & Feedback])"]
        
        uc_upload_cv["([Upload PDF Resume])"]
        uc_extract_text["([Extract Text Content via PyPDF])"]
        uc_ats_match["([Evaluate ATS Compatibility & Skill Gaps])"]
        uc_star_tips["([Generate STAR Bullet Rewrites])"]
    end

    student --> uc_role
    student --> uc_start_int
    student --> uc_upload_cv

    uc_start_int -.->|"<<include>>"| uc_gen_q
    uc_start_int -.->|"<<include>>"| uc_scorecard
    uc_upload_cv -.->|"<<include>>"| uc_extract_text
    uc_upload_cv -.->|"<<include>>"| uc_ats_match
    uc_upload_cv -.->|"<<include>>"| uc_star_tips

    uc_gen_q --> gemini
    uc_scorecard --> gemini
    uc_ats_match --> gemini
    uc_star_tips --> gemini
```

---

#### 2.3.5 Institutional Admin & TPO Telemetry

```mermaid
flowchart LR
    admin["👔 Admin / Placement Officer"]
    db["🗄️ System Database"]

    subgraph AdminSubsystem["Subsystem: Institutional Governance Portal"]
        uc_dash["([View Real-Time Telemetry Dashboard])"]
        uc_metrics["([Analyze DAU / WAU & Drop-Off Funnels])"]
        uc_student_detail["([Inspect Individual Student Log & Readiness])"]
        uc_curriculum["([Author / Edit Problems & Test Cases])"]
        uc_account["([Manage Student Account Status])"]
    end

    admin --> uc_dash
    admin --> uc_metrics
    admin --> uc_student_detail
    admin --> uc_curriculum
    admin --> uc_account

    uc_dash --> db
    uc_metrics --> db
    uc_student_detail --> db
    uc_curriculum --> db
    uc_account --> db
```

---

### 2.4 Tabular Use Case Specifications

#### Use Case: UC-04 Submit Code Solution
- **Primary Actor**: Student Candidate
- **Supporting Actors**: Code Judge Sandbox (Docker/cgroups), PostgreSQL
- **Preconditions**:
  1. Student is authenticated with a valid JWT token.
  2. Student has opened a valid coding problem in the DSA Arena.
- **Main Success Scenario**:
  1. Student writes code in Monaco Editor and clicks "Submit".
  2. System captures source code, programming language (`python`, `cpp`, `java`, `javascript`), and problem identifier.
  3. System spins up an ephemeral execution container or subprocess with CPU limit (2.0s) and memory ceiling (256MB).
  4. Code is compiled (if C++/Java) and executed against hidden test cases.
  5. Test outputs are diff-checked against expected answers.
  6. All test cases match: System issues `Accepted` verdict, calculates runtime/memory percentiles, updates user XP (+XP), records submission in `submissions` table, and logs telemetry.
  7. Client UI displays success animation with confetti and execution statistics.
- **Alternative / Failure Flows**:
  - *4a. Compilation Error*: Sandbox returns compiler diagnostic text; system marks submission as `Compile Error` and returns compiler traceback to Monaco editor.
  - *4b. Time Limit Exceeded (TLE)*: Subprocess/container exceeds 2.0s CPU time; system kills process via SIGKILL and tags submission as `TLE`.
  - *4c. Memory Limit Exceeded (MLE)*: Subprocess exceeds 256MB; memory cgroup aborts run; tagged as `MLE`.
  - *5a. Wrong Answer (WA)*: Output differs on test case $k$; system marks as `Wrong Answer` and highlights failing sample difference.

---

#### Use Case: UC-05 Execute SQL Practice Query
- **Primary Actor**: Student Candidate
- **Supporting Actors**: PostgreSQL Relational Database Engine
- **Preconditions**:
  1. Student is viewing a SQL problem with schema definition.
- **Main Success Scenario**:
  1. Student writes query in SQL editor and clicks "Execute".
  2. Backend validator parses statement tokens.
  3. Verifies that query strictly begins with `SELECT` or `WITH` and contains zero mutating statements (`DROP`, `ALTER`, `TRUNCATE`, `UPDATE`, `DELETE`, `INSERT`).
  4. Backend opens a dedicated database transaction: `BEGIN TRANSACTION`.
  5. Query executes inside the isolated transaction against sample tables.
  6. Backend generates structured JSON table rows and column headers.
  7. In an unconditional `finally` block, backend executes: `ROLLBACK`.
  8. Output dataset is compared with expected reference query results.
  9. Results are rendered in an interactive spreadsheet-style grid in the frontend.
- **Alternative Flow**:
  - *3a. Prohibited Token Detected*: Query contains destructive keywords; backend rejects query immediately with HTTP 400 (`Destructive SQL keywords prohibited`).

---

#### Use Case: UC-10 Settle Atomic Battle Winner
- **Primary Actor**: Student Candidate (Player 1 or Player 2)
- **Supporting Actors**: Redis Distributed Memory Store, WebSocket Server
- **Preconditions**:
  1. Both players have joined the same battle room via a 6-character room code.
  2. The battle is in the `active` state.
- **Main Success Scenario**:
  1. Player passes 100% of algorithmic test cases for the battle problem.
  2. Backend executes atomic Redis command: `SETNX room:{room_code}:winner {user_id}`.
  3. Redis returns integer reply `1` (indicating key did not previously exist; lock successfully acquired).
  4. Backend updates database status of `battle_rooms` to `completed`, designating this player as the sole champion.
  5. Backend awards +100 XP to the champion.
  6. WebSocket server broadcasts `room_winner` event containing winner identity and elapsed time to both connected clients.
  7. Frontend renders victory modal for winner and runner-up display for opponent with rematch options.
- **Alternative Flow**:
  - *3a. Lock Already Held*: Second player passes all test cases 10ms later. Redis `SETNX` returns integer `0` (key already exists). Backend designates player as `runner_up` with no race condition.

---

## 3. Data Flow Diagrams (DFD)

### 3.1 Data Flow Notation & Conventions
The following Data Flow Diagrams strictly follow standard Software Engineering notations (Gane & Sarson / Yourdon):
- **External Entity**: Rectangular box representing an external source or sink of data outside system boundary.
- **Process**: Rounded box or circle representing a computation, transformation, or verification step.
- **Data Flow**: Directed arrows labeled with the exact data payload moving between entities, processes, and stores.
- **Data Store**: Open-ended parallel lines or labeled storage symbol indicating persistent repository (`D1`, `D2`, etc.).

---

### 3.2 DFD Level 0 — Context Diagram

The Context Diagram defines the global scope of **Code Quest**, depicting the boundary between external stakeholders/services and the platform.

```mermaid
flowchart TD
    %% External Entities
    subgraph Entities["External Entities"]
        student["👤 Student / Candidate"]
        admin["👔 Institution Admin / TPO"]
        sandbox["📦 Isolated Sandbox (Docker / cgroup)"]
        gemini["🤖 Google Gemini 1.5 Flash API"]
    end

    %% Central Process
    codequest["0.0<br/><b>CODE QUEST PLATFORM</b><br/>Intelligent Placement & Assessment Ecosystem"]

    %% Student Data Flows
    student -->|"Credentials, Profile Info"| codequest
    student -->|"Source Code Submissions"| codequest
    student -->|"SQL Queries"| codequest
    student -->|"MCQ Answers & Puzzle Solutions"| codequest
    student -->|"Battle Commands (Create/Join/Submit)"| codequest
    student -->|"Interview Responses (Chat Turns)"| codequest
    student -->|"Resume Binary (PDF Document)"| codequest

    codequest -->|"Auth Tokens (JWT) & Profile Stats"| student
    codequest -->|"Execution Verdicts (Pass/Fail/TLE/MLE)"| student
    codequest -->|"SQL Result Grids & Validation Tables"| student
    codequest -->|"Assessment Scores & Solution Hints"| student
    codequest -->|"Live Battle State & Winner Broadcasts"| student
    codequest -->|"Dynamic AI Questions & Scorecards"| student
    codequest -->|"ATS Match Score & STAR Rewrite Tips"| student

    %% Admin Data Flows
    admin -->|"Curriculum Content (Problems, MCQs, Tests)"| codequest
    admin -->|"Admin Queries & Account Actions"| codequest

    codequest -->|"Institutional Telemetry (DAU, WAU, Funnels)"| admin
    codequest -->|"Student Deep-Dive Activity Logs"| admin

    %% Sandbox Data Flows
    codequest -->|"Untrusted Source Code & Test Inputs"| sandbox
    sandbox -->|"Execution Output, CPU Time, Memory, Exit Code"| codequest

    %% Gemini AI Data Flows
    codequest -->|"Interview Transcripts & Prompt Templates"| gemini
    codequest -->|"Extracted Resume Text & Job Role Standards"| gemini
    gemini -->|"Generated AI Interview Questions & Rubric Scores"| codequest
    gemini -->|"ATS Match Percentage, Keyword Gaps & Advice"| codequest
```

#### ASCII Box Diagram (Context Level 0)
```
                               ┌────────────────────────────────┐
                               │     Google Gemini 1.5 Flash    │
                               └────────────────────────────────┘
                                    │ ▲                     │ ▲
     AI Interview & ATS Prompts    │ │                     │ │ AI Responses & Rubric Scores
                                    ▼ │                     ▼ │
 ┌──────────────────────┐      ┌───────────────────────────────────┐      ┌─────────────────────────┐
 │   Student Candidate  │─────►│                0.0                │─────►│  Institution Admin/TPO  │
 │                      │◄─────│            CODE QUEST             │◄─────│                         │
 └──────────────────────┘      │             PLATFORM              │      └─────────────────────────┘
  - User Credentials            └───────────────────────────────────┘       - Curriculum Additions
  - Source Code / SQL                ▲ │                     ▲ │            - Filter & Drill Queries
  - Battle WebSockets                │ │                     │ │            - Account Moderation
  - PDF Resume                       │ ▼                     │ ▼
                               ┌────────────────────────────────┐
                               │   Code Judge Sandbox (Docker)  │
                               └────────────────────────────────┘
                                - Compilation & Execution Limits
                                - Exit Codes, Runtime & Memory
```

---

### 3.3 DFD Level 1 — System Decomposition Diagram

Level 1 explodes the platform into its eight fundamental functional subsystems and six core data stores.

*High-Resolution Image: [images/data_flow_diagram.jpg](./images/data_flow_diagram.jpg)*

![Code Quest Level 1 Data Flow Diagram](./images/data_flow_diagram.jpg)

```mermaid
flowchart TD
    %% External Entities
    ent_student["👤 Student Candidate"]
    ent_admin["👔 Admin / TPO"]
    ent_sandbox["📦 Execution Sandbox"]
    ent_gemini["🤖 Google Gemini API"]

    %% Data Stores
    ds_users[("D1: Users & Profiles")]
    ds_questions[("D2: Question Bank & Test Cases")]
    ds_submissions[("D3: Submissions & Results")]
    ds_battles[("D4: Redis Battle Rooms & Locks")]
    ds_telemetry[("D5: Telemetry & Analytics Events")]
    ds_resumes[("D6: Resumes & ATS Reports")]

    %% Level 1 Processes
    p1["1.0<br/>Authentication &<br/>Profile Management"]
    p2["2.0<br/>DSA Code Judging<br/>& Execution Engine"]
    p3["3.0<br/>Safe SQL Sandbox<br/>& Query Processor"]
    p4["4.0<br/>Assessment & Quiz<br/>Engine (MCQ/Puzzles)"]
    p5["5.0<br/>Real-Time Code Battle<br/>Matchmaker (WebSockets)"]
    p6["6.0<br/>AI Mock Recruiter<br/>& Interview Engine"]
    p7["7.0<br/>Resume ATS Scanner<br/>& Profiling Engine"]
    p8["8.0<br/>Telemetry Aggregator<br/>& Admin Governance"]

    %% Flows: P1 Auth
    ent_student -->|"Registration / Login"| p1
    ent_admin -->|"Admin Login"| p1
    p1 <-->|"Read/Write User Data"| ds_users
    p1 -->|"JWT Token & Profile Info"| ent_student

    %% Flows: P2 DSA
    ent_student -->|"Submit Source Code"| p2
    p2 <-->|"Fetch Test Cases"| ds_questions
    p2 -->|"Dispatch Code to Sandbox"| ent_sandbox
    ent_sandbox -->|"Raw Output / Limits"| p2
    p2 -->|"Save Verdict"| ds_submissions
    p2 -->|"Verdict & Metrics"| ent_student
    p2 -->|"Log Solve Event"| ds_telemetry

    %% Flows: P3 SQL
    ent_student -->|"Submit SQL Query"| p3
    p3 <-->|"Fetch Schema & Reference Query"| ds_questions
    p3 -->|"Validate, Rollback & Return Rows"| ent_student
    p3 -->|"Save Query Result"| ds_submissions

    %% Flows: P4 MCQ & Puzzles
    ent_student -->|"Submit MCQ Answers / Request Hint"| p4
    p4 <-->|"Fetch Questions & Hints"| ds_questions
    p4 -->|"Score & Explanations"| ent_student
    p4 -->|"Log Score Event"| ds_telemetry

    %% Flows: P5 Battle
    ent_student <-->|"WebSocket Actions (Join/Submit)"| p5
    p5 <-->|"Atomic Winner Lock (SETNX)"| ds_battles
    p5 -->|"Delegate Code"| p2
    p5 -->|"Game Over & Winner Broadcast"| ent_student
    p5 -->|"Log Battle Event"| ds_telemetry

    %% Flows: P6 AI Interview
    ent_student <-->|"Multi-turn Chat Answers"| p6
    p6 <-->|"Prompt & Transcript Context"| ent_gemini
    p6 -->|"Store Interview Session"| ds_submissions
    p6 -->|"Feedback Scorecard"| ent_student

    %% Flows: P7 Resume ATS
    ent_student -->|"Upload PDF Resume"| p7
    p7 -->|"Store PDF Document"| ds_resumes
    p7 <-->|"Semantic Analysis Prompt"| ent_gemini
    p7 -->|"ATS Report & STAR Tips"| ent_student

    %% Flows: P8 Telemetry & Admin
    ds_telemetry -->|"Read Aggregated Events"| p8
    ds_users -->|"Read Student Profiles"| p8
    ent_admin -->|"Curriculum Updates"| p8
    p8 -->|"Write New Problems"| ds_questions
    p8 -->|"Institutional Metrics & Funnels"| ent_admin
```

---

### 3.4 DFD Level 2 — Micro-Process Pipelines

#### 3.4.1 DFD Level 2.1: DSA Code Compilation & Sandboxed Execution

```mermaid
flowchart TD
    student["👤 Student"]
    ds_q[("D2: Question Bank")]
    ds_sub[("D3: Submissions")]
    ds_tel[("D5: Telemetry")]
    sandbox["📦 Execution Sandbox"]

    p21["2.1<br/>Code Payload Ingestion &<br/>Language Pre-Check"]
    p22["2.2<br/>Fetch Test Suite<br/>(Sample & Hidden)"]
    p23["2.3<br/>Compile Source Code<br/>(g++ / javac)"]
    p24["2.4<br/>Execute with cgroups<br/>(Time: 2.0s, RAM: 256MB)"]
    p25["2.5<br/>Diff Output & Calculate<br/>Verdict (AC/WA/TLE/MLE)"]
    p26["2.6<br/>Store Verdict,<br/>XP & Telemetry"]

    student -->|"Source Code + Lang + ProbID"| p21
    p21 -->|"Validated Payload"| p22
    p22 <-->|"Fetch Test Cases"| ds_q
    p22 -->|"Source Code + Inputs"| p23

    p23 -->|"Compile Command"| sandbox
    sandbox -->|"Compiler Diagnostic / Binary"| p23

    p23 -->|"Binary / Script"| p24
    p24 -->|"Run under Resource Limits"| sandbox
    sandbox -->|"Stdout, Stderr, CPU Time, Peak RAM"| p24

    p24 -->|"Actual Output"| p25
    p22 -->|"Expected Output"| p25

    p25 -->|"Verdict Result Payload"| p26
    p26 -->|"Store Submission Record"| ds_sub
    p26 -->|"Fire problem_solved Event"| ds_tel
    p26 -->|"Return Verdict to Frontend"| student
```

---

#### 3.4.2 DFD Level 2.2: Safe SQL Transactional Execution Engine

```mermaid
flowchart TD
    student["👤 Student"]
    ds_q[("D2: Question Bank")]
    ds_sub[("D3: Submissions")]
    pg[("🗄️ PostgreSQL Engine")]

    p31["3.1<br/>Sanitize SQL & Tokenize<br/>(Filter DROP/TRUNCATE)"]
    p32["3.2<br/>Fetch Target Schema &<br/>Reference Solution"]
    p33["3.3<br/>Open Transaction Block<br/>(BEGIN TRANSACTION)"]
    p34["3.4<br/>Execute User Query &<br/>Fetch Result Rows"]
    p35["3.5<br/>Execute Guaranteed<br/>ROLLBACK in finally"]
    p36["3.6<br/>Compare Result Sets &<br/>Format Table Grid"]

    student -->|"Raw SQL Query"| p31
    p31 -->|"Sanitized Query"| p32
    p32 <-->|"Fetch Expected Schema"| ds_q
    p32 -->|"Approved Query"| p33

    p33 -->|"BEGIN"| pg
    p33 --> p34
    p34 -->|"Run Query"| pg
    pg -->|"Resultset (Rows, Cols)"| p34

    p34 --> p35
    p35 -->|"ROLLBACK (Unconditional)"| pg

    p34 -->|"Raw Result Rows"| p36
    p32 -->|"Expected Result Rows"| p36
    p36 -->|"Match Status + Formatted Grid"| student
    p36 -->|"Record Result"| ds_sub
```

---

#### 3.4.3 DFD Level 2.3: Real-Time Battle Matchmaking & Redis SETNX Settlement

```mermaid
flowchart TD
    host["👤 Battle Host"]
    peer["👤 Peer Player"]
    redis[("D4: Redis In-Memory")]
    p2["Process 2.0: DSA Code Judge"]
    ds_tel[("D5: Telemetry")]

    p51["5.1<br/>Generate 6-Char Code &<br/>Initialize Lobby State"]
    p52["5.2<br/>WebSocket Connection Hub &<br/>Lobby Synchronization"]
    p53["5.3<br/>Broadcast Start Signal &<br/>Distribute Challenge"]
    p54["5.4<br/>Live Submission Ingestion &<br/>Test Verification"]
    p55["5.5<br/>Atomic Lock Acquisition<br/>(SETNX room:winner)"]
    p56["5.6<br/>Broadcast Victory Status &<br/>Award Battle XP"]

    host -->|"Create Battle Request"| p51
    p51 -->|"Store Room Key"| redis
    p51 -->|"Return Room Code"| host

    peer -->|"Join Room Code"| p52
    host <-->|"WebSocket Connect"| p52
    peer <-->|"WebSocket Connect"| p52
    p52 <-->|"Sync Lobby Roster"| redis

    host -->|"Start Battle Trigger"| p53
    p53 -->|"Broadcast Problem Payload"| host
    p53 -->|"Broadcast Problem Payload"| peer

    peer -->|"Submit Code"| p54
    host -->|"Submit Code"| p54
    p54 <-->|"Verify Tests"| p2

    p54 -->|"100% Passed Event"| p55
    p55 -->|"SETNX room:{id}:winner {uid}"| redis
    redis -->|"Reply: 1 (Winner) or 0 (Late)"| p55

    p55 -->|"Winner Identified"| p56
    p56 -->|"Broadcast room_winner via WS"| host
    p56 -->|"Broadcast room_winner via WS"| peer
    p56 -->|"Fire battle_won Event (+100 XP)"| ds_tel
```

---

#### 3.4.4 DFD Level 2.4: AI Mock Interview & Resume ATS Parsing Flow

```mermaid
flowchart TD
    student["👤 Student"]
    gemini["🤖 Google Gemini 1.5 Flash API"]
    ds_sub[("D3: Submissions & Sessions")]
    ds_cv[("D6: Resumes & ATS Reports")]

    %% Interview Branch
    p61["6.1<br/>Select Job Target &<br/>Initialize Interview Session"]
    p62["6.2<br/>Multi-Turn Dialogue<br/>Prompt Orchestrator"]
    p63["6.3<br/>Compute Rubric Scorecard<br/>(Accuracy, Articulation, S/W)"]

    %% Resume Branch
    p71["7.1<br/>Accept PDF Upload &<br/>Validate MIME Type"]
    p72["7.2<br/>Extract Plain Text<br/>via PyPDF Engine"]
    p73["7.3<br/>Semantic Match against<br/>Target Role Job Description"]
    p74["7.4<br/>Synthesize ATS Score &<br/>STAR Format Recommendations"]

    %% Interview Connections
    student -->|"Target Role (e.g. SDE-1)"| p61
    p61 -->|"Initial Prompt"| p62
    student <-->|"Submit Candidate Answer"| p62
    p62 <-->|"Context + Dynamic Question"| gemini
    p62 -->|"Completed Transcript"| p63
    p63 <-->|"Structured Evaluation Rubric"| gemini
    p63 -->|"Store Interview Scorecard"| ds_sub
    p63 -->|"Return Full Scorecard"| student

    %% Resume Connections
    student -->|"Upload Resume PDF"| p71
    p71 -->|"Raw PDF Binary"| ds_cv
    p71 -->|"Validated Binary"| p72
    p72 -->|"Clean Extracted Text"| p73
    p73 <-->|"Skill Extraction & Gap Analysis"| gemini
    p73 -->|"Matched & Missing Skills"| p74
    p74 <-->|"STAR Format Rewrites"| gemini
    p74 -->|"Store ATS Report"| ds_cv
    p74 -->|"Display ATS Score & Tips"| student
```

---

## 4. Data Dictionary

The following table defines the key data structures and payloads moving across the DFD processes:

| Data Flow Item | Source | Destination | Content Description / Schema |
|---|---|---|---|
| **User Credentials** | Student / Admin | Process 1.0 | `email` (string), `password` (string, plaintext), `college` (string), `graduation_year` (int). |
| **JWT Token Payload** | Process 1.0 | Student / Admin | `access_token` (JWT string), `refresh_token` (JWT string), `token_type` ("Bearer"), `role` ("user" \| "admin"). |
| **Source Code Submission** | Student | Process 2.0 | `problem_id` (UUID), `language` ("python" \| "cpp" \| "java" \| "javascript"), `source_code` (string). |
| **Sandbox Execution Results** | Sandbox | Process 2.0 | `stdout` (string), `stderr` (string), `exit_code` (int), `execution_time_ms` (float), `memory_used_kb` (int). |
| **SQL Submission Payload** | Student | Process 3.0 | `problem_id` (UUID), `sql_query` (string, SELECT/WITH only). |
| **SQL Output Grid** | Process 3.0 | Student | `columns` (array of strings), `rows` (array of row objects), `is_correct` (boolean), `execution_time_ms` (float). |
| **Battle WebSocket Event** | Student / WS Hub | Process 5.0 | `event_type` ("join" \| "submit" \| "ping"), `room_code` (string), `player_id` (UUID), `payload` (JSON object). |
| **Winner Distributed Lock** | Process 5.0 | Redis (D4) | Key: `room:{room_code}:winner`, Value: `user_id`, Expire: 3600 seconds. Set via atomic `SETNX`. |
| **Gemini Interview Turn** | Process 6.0 | Gemini API | System instructions (role prompt), conversation history (`role`, `parts`), current candidate reply. |
| **Rubric Scorecard** | Gemini API | Process 6.0 | JSON: `overall_score` (0-100), `technical_score` (0-100), `communication_score` (0-100), `strengths` ([]), `weaknesses` ([]), `suggestions` ([]). |
| **Extracted Resume Text** | Process 7.2 | Process 7.3 | Raw ASCII/UTF-8 string parsed from uploaded PDF binary pages via `pypdf`. |
| **ATS Audit Report** | Process 7.4 | Student | JSON: `ats_score` (0-100), `matched_skills` ([]), `missing_skills` ([]), `star_rewrites` ([]). |
| **Telemetry Event Log** | Processes 2/4/5/6 | Data Store D5 | `event_id` (UUID), `user_id` (UUID), `event_type` (string), `metadata` (JSON), `created_at` (timestamp). |

---

## 5. Summary & Traceability Matrix

| Requirement ID | Module | Primary Use Case | DFD Process Mapping | Primary Data Store |
|---|---|---|---|---|
| **FR-1** | Authentication & RBAC | UC-01, UC-02 | Process 1.0 | D1 (Users & Profiles) |
| **FR-2** | DSA Coding Arena & Judge | UC-03, UC-04 | Process 2.0 | D2 (Questions), D3 (Submissions) |
| **FR-3** | Safe SQL Practice Lab | UC-05 | Process 3.0 | D2 (Questions), D3 (Submissions) |
| **FR-4** | CS Fundamentals MCQs | UC-06 | Process 4.0 | D2 (Questions), D5 (Telemetry) |
| **FR-5** | Logic & Aptitude Puzzles | UC-07, UC-08 | Process 4.0 | D2 (Questions), D5 (Telemetry) |
| **FR-6** | Multiplayer Code Battles | UC-09, UC-10 | Process 5.0 | D4 (Redis Rooms), D5 (Telemetry) |
| **FR-7** | AI Mock Recruiter | UC-11 | Process 6.0 | D3 (Submissions), Gemini API |
| **FR-8** | Resume ATS Scanner | UC-12 | Process 7.0 | D6 (Resumes), Gemini API |
| **FR-9** | Placement Readiness Index | UC-02 | Process 1.0, 8.0 | D1 (Profiles), D5 (Telemetry) |
| **FR-10**| Admin Telemetry & Portal | UC-13, UC-14, UC-15, UC-16 | Process 8.0 | D1, D2, D5 |
