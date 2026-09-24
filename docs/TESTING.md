# Testing Guide & Coverage (TESTING.md)

## 1. Running Automated Tests

### Backend Test Suite (Pytest)
```powershell
cd backend
python -m pytest tests -v
```

### Frontend Typecheck & Build Verification
```powershell
cd frontend
npm run build
```

### Admin Portal Build Verification
```powershell
cd admin
npm run build
```

## 2. Test Architecture

The backend test suite is structured around isolated SQLite in-memory fixtures configured in `backend/tests/conftest.py`:

| Test Module | Coverage Scope |
|---|---|
| [`test_auth.py`](file:///e:/CODE%20QUEST/backend/tests/test_auth.py) | User registration, JWT login, token refresh, Google OAuth auto-onboarding, and profile readiness score calculations |
| [`test_problems_topics.py`](file:///e:/CODE%20QUEST/backend/tests/test_problems_topics.py) | Topics CRUD, Subtopics, coding problem listing, test cases evaluation, and Python execution judge |
| [`test_mcqs_sql.py`](file:///e:/CODE%20QUEST/backend/tests/test_mcqs_sql.py) | MCQ answer evaluation, negative marking penalties, and SQL playground execution with destructive keyword blocking |
| [`test_puzzles_and_battles.py`](file:///e:/CODE%20QUEST/backend/tests/test_puzzles_and_battles.py) | Puzzles listing, hint unlocking, reasoning checks, live code battle room creation, join flow, start trigger, and atomic winner locking |
| [`test_analytics_and_events.py`](file:///e:/CODE%20QUEST/backend/tests/test_analytics_and_events.py) | Analytics event ingestion, admin access control, and summary telemetry aggregation (DAU/WAU, adoption rates) |
| [`test_admin_and_dashboard.py`](file:///e:/CODE%20QUEST/backend/tests/test_admin_and_dashboard.py) | Admin student moderation, account active toggling, progress inspection, dynamic readiness score calculations |

## 3. Coverage Status
- **Backend Tests**: 12/12 test suites passing (100%).
- **Frontend TypeScript Build**: 0 errors.
- **Admin TypeScript Build**: 0 errors.
