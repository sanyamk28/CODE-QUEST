# Changelog (CHANGELOG.md)

All notable changes to the Code Quest platform are documented in this file.

## [1.0.0] - 2026-09-01

### Added
- **Full Email/Password User Authentication & Profile Persistence**: Added complete registration with automatic candidate profile initialization, database bcrypt password hashing, JWT token storage in `localStorage`, persistent session rehydration, and candidate log out.
- **Live Code Battle Engine**: Real-time room lifecycle (Create, Join via 6-char code, Start, Problem Reveal, Submit), FastAPI WebSockets, and atomic Redis `SETNX room:{id}:winner` winner determination.
- **Analytics & Telemetry Architecture**: Dedicated `analytics_events` table and admin telemetry endpoints tracking enrolled users, DAU/WAU, feature adoption rates, and roadmap step drop-offs.
- **Puzzles & Scenarios Router**: Dedicated `/api/v1/puzzles` endpoint for logical riddles, mathematical puzzles, and incident response scenarios with progressive hint unlocking.
- **Modern Student Web Platform (`frontend/`)**: Full React 18 + Vite + TypeScript + TailwindCSS application containing Dashboard, Code Arena, SQL Lab, MCQ Quiz, Puzzles, Company Bundles, Code Battle, AI Mock Interview, AI Resume ATS Scanner, Roadmaps, and Leaderboard.
- **Automated Test Suite**: Added `test_puzzles_and_battles.py` and `test_analytics_and_events.py`, bringing total passed backend test suites to 12/12.
- **Persistent Project Brain**: Added `/docs` folder with `ARCHITECTURE.md`, `DATABASE.md`, `API.md`, `WORKFLOWS.md`, `DECISIONS.md`, `TESTING.md`, `KNOWN_ISSUES.md`, and `CHANGELOG.md`.

### Changed
- Refactored `backend/app/api/v1/problems.py` with multi-tier execution judging (Docker Sandbox + safe local subprocess fallback for Python/JS/C++).
- Added automatic telemetry event logging across authentication, MCQs, coding submissions, resume ATS scoring, roadmaps, and mock interviews.
