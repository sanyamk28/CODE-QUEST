# Architecture & Engineering Decision Log (DECISIONS.md)

## 2026-09-01: Live Code Battle Winner-Lock Architecture
- **Context**: Code battle allows concurrent players to submit solutions simultaneously. Timestamp-based or request-arrival comparison is prone to race conditions and network jitter.
- **Decision**: Implemented atomic Redis `SETNX room:{room_id}:winner <user_id>` with an in-memory thread lock fallback.
- **Rationale**: `SETNX` (Set if Not eXists) is guaranteed atomic by Redis single-threaded command execution. The first submission that passes all test cases sets the key and receives a return value of 1. All concurrent or subsequent submissions receive 0 and cannot overwrite the winner state.
- **Alternatives Rejected**:
  - *Database row update timestamp*: Subject to database connection pool delays and clock skew across distributed servers.
  - *WebSocket arrival ordering*: Network packet arrival order does not guarantee execution completion order.

---

## 2026-09-01: Multi-Tier Sandboxed & Fallback Code Execution
- **Context**: The platform must execute candidate code across Python, JavaScript, C++, and Java in resource-limited containers without relying on expensive third-party APIs.
- **Decision**: Primary execution routes to the self-hosted Docker Sandbox executor container. If the sandbox container is undergoing maintenance or running locally in development without Docker, execution seamlessly falls back to a safe local subprocess runner.
- **Rationale**: Guarantees zero downtime for unit testing and offline development while maintaining sandboxed isolation in production.

---

## 2026-09-01: Dedicated Analytics Telemetry Table
- **Context**: Engagement metrics, active users, and readiness tracking must be queryable by administrators without bloating core user/submission tables.
- **Decision**: Created a dedicated `analytics_events` table with indexed `user_id`, `event_type`, `created_at`, and flexible `metadata_json` JSONB payloads.
- **Rationale**: Keeps business entity schemas clean while providing append-only, high-performance telemetry event queries for DAU/WAU and feature adoption analytics.
