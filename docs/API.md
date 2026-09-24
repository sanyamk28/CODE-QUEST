# API Reference — Placement Prep Platform ("Code Quest")

Base URL: `http://localhost:8000/api/v1`

## 1. Authentication & Users (`/auth`)

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/auth/register` | Public | Register new candidate with email & password |
| `POST` | `/auth/login` | Public | Authenticate user & issue access/refresh JWT tokens |
| `POST` | `/auth/google` | Public | Verify Google OAuth token & auto-onboard candidate |
| `POST` | `/auth/refresh` | Public | Refresh expired access token using valid refresh token |
| `GET` | `/auth/me` | User | Get authenticated user record |
| `POST` | `/auth/onboard` | User | Save role preference, skills, and initialize readiness |
| `GET` | `/auth/profile` | User | Get student profile details and domain skill levels |
| `GET` | `/auth/students` | Admin | Get all enrolled student profiles |
| `GET` | `/auth/students/{id}/progress` | Admin | Deep inspection into student progress, submissions, & logins |
| `POST` | `/auth/students/{id}/toggle-active`| Admin | Suspend or activate student account |

## 2. Coding Problems & Topics (`/problems`)

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/problems/` | User | List coding challenges with difficulty/tag filters |
| `GET` | `/problems/{id}` | User | Get problem detail, code templates, & test cases |
| `POST` | `/problems/{id}/submit` | User | Submit solution for containerized/fallback judging |
| `GET` | `/problems/topics/all` | User | Get all curriculum topics and subtopics |
| `POST` | `/problems/topics` | Admin | Create curriculum topic |
| `DELETE` | `/problems/topics/{id}` | Admin | Delete curriculum topic |

## 3. SQL Practice Lab (`/sql/problems`)

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/sql/problems/` | User | List SQL challenges |
| `GET` | `/sql/problems/{id}` | User | Get SQL problem schema and expected output |
| `POST` | `/sql/problems/{id}/execute` | User | Execute SQL query with transactional rollback |

## 4. MCQs & CS Fundamentals (`/mcqs`)

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/mcqs/` | User | List domain MCQs (OS, DBMS, Networks, OOP, Aptitude) |
| `GET` | `/mcqs/{id}` | User | Get MCQ question detail & options |
| `POST` | `/mcqs/{id}/attempt` | User | Submit answer, calculate score & negative marking |

## 5. Puzzles & Scenarios (`/puzzles`)

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/puzzles/` | User | List logic puzzles, math riddles & system scenarios |
| `GET` | `/puzzles/{id}` | User | Get puzzle details and hints |
| `POST` | `/puzzles/{id}/check` | User | Submit reasoning and reveal official solution |

## 6. Live Code Battles (`/battles`)

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/battles/create` | User | Create a battle room with 6-character room code |
| `POST` | `/battles/join` | User | Join an existing room via room code |
| `POST` | `/battles/{code}/start` | Host | Host starts the battle and reveals problem |
| `GET` | `/battles/{code}` | User | Get room status, participants, and winner |
| `POST` | `/battles/{code}/submit` | User | Submit battle code; acquires Redis `SETNX` winner lock |
| `WS` | `/battles/ws/{code}` | User | Real-time WebSocket connection for room events |

## 7. AI Features (`/ai`)

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/ai/interviews/start` | User | Initiate Gemini mock technical interview |
| `POST` | `/ai/interviews/{id}/respond`| User | Send candidate response; returns follow-up or report |
| `POST` | `/ai/resume/upload` | User | Upload PDF resume for PyPDF & Gemini ATS match scoring |

## 8. Analytics & Telemetry (`/analytics`)

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/analytics/events` | User/Pub| Ingest user telemetry event |
| `GET` | `/analytics/events` | Admin | Query recent raw telemetry stream |
| `GET` | `/analytics/summary` | Admin | Query aggregate enrolled, DAU/WAU, adoption & drop-offs |
