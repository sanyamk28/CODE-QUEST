# System Architecture — Placement Prep Platform ("Code Quest")

## 1. High-Level Architecture

Code Quest is an enterprise-grade technical placement preparation and live assessment platform. It consists of multiple decoupled services communicating over REST APIs and WebSockets.

```
┌────────────────────────────────────────┐     ┌──────────────────────────────────────┐
│  Student Web Platform (React + Vite)   │     │  Admin Portal (React + Vite + TS)    │
└──────────────────┬─────────────────────┘     └──────────────────┬───────────────────┘
                   │ HTTP / WebSockets                            │ HTTP REST
                   ▼                                              ▼
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                       FastAPI Backend Service (Python 3.11+)                        │
│   - Auth & Session Management (JWT / Google OAuth)                                  │
│   - Coding Judge & Multi-tier Subprocess Fallback                                   │
│   - SQL Sandbox (Transactional Isolation & Rollback)                                │
│   - Real-time Code Battle Room Manager (WebSocket + Redis SETNX)                    │
│   - Analytics & Telemetry Engine (`analytics_events`)                              │
│   - AI Module (Google Gemini 1.5 Flash: Mock Technical Interviews & ATS Scoring)    │
└──────────────┬───────────────────────────────┬───────────────────────────────┬──────┘
               │                               │                               │
               ▼                               ▼                               ▼
┌──────────────────────────────┐ ┌───────────────────────────┐ ┌───────────────────────────┐
│ PostgreSQL / SQLite Database │ │ Redis (PubSub, Rooms, Lock) │ │ Celery Background Worker  │
└──────────────────────────────┘ └───────────────────────────┘ └───────────────────────────┘
                                               │
                                               ▼
                                 ┌───────────────────────────┐
                                 │ Sandbox Execution (Docker)│
                                 └───────────────────────────┘
```

## 2. Service Boundaries

| Service | Technology | Responsibility |
|---|---|---|
| **Student Web Platform** | React 18, Vite, TypeScript, TailwindCSS | User onboarding, coding arena, SQL lab, MCQs, puzzles, assessments, code battles, AI interviews, ATS resume scanning, roadmap progress |
| **Admin Portal** | React 18, Vite, TypeScript, TailwindCSS | Student roster, activity telemetry, analytics summary explorer, curriculum CMS, contest management, system health |
| **Backend API** | FastAPI, Pydantic, SQLAlchemy | REST routing, WebSocket management, authentication, scoring algorithms, transactional execution |
| **Database** | PostgreSQL (Prod) / SQLite (Dev & Test) | Relational persistence for users, questions, submissions, battles, roadmaps, and analytics events |
| **Cache & Pub/Sub** | Redis | Room state caching, pub/sub for battle updates, and atomic winner locking via `SETNX` |
| **Background Queue** | Celery + Redis | Asynchronous, non-blocking resume parsing, LLM scoring, and test bundle processing |
| **Execution Sandbox** | Docker (Alpine + Python/C++/Java/Node) | Isolated container executing untrusted user code under strict cgroup limits and timeouts |

## 3. Technology Rationale

1. **FastAPI**: Asynchronous native support enables high-concurrency WebSocket connections for live Code Battles alongside low-latency REST endpoints.
2. **Redis `SETNX`**: Concurrency-safe winner determination ensures that when two battle participants submit within milliseconds of each other, race conditions are mathematically prevented.
3. **SQL Transactional Isolation**: Candidates practice raw SQL queries against real database tables safely because every query runs inside an explicit transaction that automatically issues `ROLLBACK`.
4. **Google Gemini 1.5 Flash**: Fast, low-latency LLM inference suitable for multi-turn conversational mock recruiter rounds and detailed resume keyword gap extraction.
