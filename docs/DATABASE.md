# Database Schema & Relational Models

## 1. Schema Overview

The database is built on relational principles using PostgreSQL (production) and SQLite (development/automated testing). All entity primary keys use UUIDs for global uniqueness and secure ID generation.

```
                  ┌──────────────┐
                  │    users     │
                  └──────┬───────┘
          ┌──────────────┼───────────────────────────┐
          │ 1:1          │ 1:N                       │ 1:N
          ▼              ▼                           ▼
    ┌───────────┐  ┌─────────────┐            ┌───────────────┐
    │ profiles  │  │ submissions │            │ battle_rooms  │
    └───────────┘  └──────┬──────┘            └───────┬───────┘
                          │ 1:1                       │ 1:N
                  ┌───────┴───────┐           ┌───────┴───────────────┐
                  ▼               ▼           ▼                       ▼
          ┌───────────────┐ ┌──────────┐ ┌───────────────────┐ ┌────────────────────┐
          │ coding_submis.│ │ attempts │ │battle_participants│ │ battle_submissions │
          └───────────────┘ └──────────┘ └───────────────────┘ └────────────────────┘

  ┌──────────────┐       ┌──────────────┐       ┌──────────────────┐
  │    topics    │──1:N──│  subtopics   │──1:N──│    questions     │
  └──────────────┘       └──────────────┘       └────────┬─────────┘
                                                         │ 1:1
                                        ┌────────────────┼────────────────┐
                                        ▼                ▼                ▼
                                  ┌────────────┐   ┌────────────┐   ┌────────────┐
                                  │ mcq_detail │   │ coding_det │   │ sql_detail │
                                  └────────────┘   └────────────┘   └────────────┘
```

## 2. Core Tables

### `users`
- `id` (UUID, PK)
- `email` (String, Unique, Indexed)
- `hashed_password` (String)
- `is_active` (Boolean, Default True)
- `is_admin` (Boolean, Default False)
- `auth_provider` (String, Default "local")
- `created_at`, `updated_at` (DateTime)

### `profiles`
- `id` (UUID, PK)
- `user_id` (UUID, FK -> `users.id`, Unique)
- `name`, `college`, `degree`, `graduation_year`
- `target_role`, `experience_level`
- `target_companies` (JSONB)
- `prep_duration`, `daily_study_goal`
- `xp`, `streak`, `readiness_score`
- `dsa_level`, `sql_level`, `aptitude_level`, `cs_fundamentals_level`, `communication_level` (Float)

### `questions`
- `id` (UUID, PK)
- `title` (String, Indexed)
- `description` (Text)
- `difficulty` (String: "Easy", "Medium", "Hard")
- `type` (String: "coding", "sql", "mcq", "aptitude", "puzzle", "scenario")
- `topic_id`, `subtopic_id` (UUID, FK)
- `xp_reward` (Integer)
- `company_tags` (JSONB)

### `analytics_events`
- `id` (UUID, PK)
- `user_id` (UUID, FK -> `users.id`, Nullable, Indexed)
- `event_type` (String, Indexed)
- `metadata_json` (JSONB)
- `created_at` (DateTime, Indexed)

### `battle_rooms` & `battle_participants`
- `battle_rooms`: `id`, `room_code` (Unique 6-char, Indexed), `host_id`, `problem_id`, `status`, `winner_id`, `max_players`, `created_at`, `started_at`, `ended_at`
- `battle_participants`: `id`, `room_id`, `user_id`, `has_passed`, `score`, `joined_at`
- `battle_submissions`: `id`, `room_id`, `user_id`, `code`, `language`, `is_correct`, `test_cases_passed`, `total_test_cases`, `execution_time`, `compiler_output`

### `interviews` & `interview_sessions`
- `interviews`: `id`, `user_id`, `mode`, `status`, `created_at`
- `interview_sessions`: `id`, `interview_id`, `transcripts` (JSONB), `overall_score`, `technical_score`, `communication_score`, `strengths` (JSONB), `weaknesses` (JSONB), `feedback` (Text)

### `resumes` & `resume_analysis`
- `resumes`: `id`, `user_id`, `file_name`, `file_path`, `uploaded_at`
- `resume_analysis`: `id`, `resume_id`, `ats_score`, `matched_skills` (JSONB), `missing_skills` (JSONB), `formatting_feedback`, `role_alignment`, `suggestions` (JSONB)
