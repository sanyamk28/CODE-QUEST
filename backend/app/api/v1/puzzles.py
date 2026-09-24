import uuid
import random
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.database import get_db
from app.api.v1.deps import get_current_user, get_current_user_optional
from app.models import models
from app.schemas import schemas
from app.core.analytics import record_analytics_event

router = APIRouter()

FALLBACK_PUZZLES_AND_SCENARIOS = [
    {
        "id": "puz-001",
        "title": "The 3 Light Bulbs and 3 Switches",
        "description": "You are in a room with three light switches (all currently in the OFF position) connected to three light bulbs in an adjacent room that you cannot see from where you are. You can only enter the bulb room once. How can you definitively determine which switch controls which bulb?",
        "type": "puzzle",
        "difficulty": "Easy",
        "category": "Lateral Thinking",
        "xp_reward": 20,
        "hints": [
            "Bulbs don't just produce light—think about other physical properties.",
            "Can you leave a switch on for a while before turning it off?"
        ],
        "solution": "1. Turn Switch 1 ON and leave it on for 5-10 minutes so the bulb gets hot.\n2. Turn Switch 1 OFF and turn Switch 2 ON.\n3. Immediately walk into the bulb room:\n   - The bulb that is ON is controlled by Switch 2.\n   - The bulb that is OFF but WARM to the touch is controlled by Switch 1.\n   - The bulb that is OFF and COLD is controlled by Switch 3.",
        "company_tags": ["Google", "Microsoft", "Amazon"],
        "options": None,
        "sample_approach": "Leverage multiple sensor states (optical state: ON/OFF, thermal state: HOT/COLD) to encode more than 1 bit of information per trial."
    },
    {
        "id": "puz-002",
        "title": "Measuring 4 Liters with 3L and 5L Jugs",
        "description": "You have an unlimited supply of water and two unmarked jugs: one with an exact capacity of 3 liters and another of 5 liters. How can you measure exactly 4 liters of water?",
        "type": "puzzle",
        "difficulty": "Easy",
        "category": "Mathematical Logic",
        "xp_reward": 20,
        "hints": [
            "Think about filling the 5-liter jug first and transferring into the 3-liter jug.",
            "Track the remaining volume step by step."
        ],
        "solution": "Approach 1:\n1. Fill the 5-liter jug to capacity (5L).\n2. Pour water from the 5L jug into the 3L jug until full. (Now 5L jug has 2L, 3L jug has 3L).\n3. Empty the 3L jug.\n4. Transfer the remaining 2L from the 5L jug into the 3L jug. (Now 3L jug has 2L, 5L jug is empty).\n5. Fill the 5L jug completely (5L).\n6. Pour water from the 5L jug into the 3L jug until it fills (takes exactly 1L since it already held 2L).\n7. Exactly 4 liters remain in the 5-liter jug!",
        "company_tags": ["Goldman Sachs", "Amazon", "Bloomberg"],
        "options": None,
        "sample_approach": "State-space traversal using modulo and remainder arithmetic: 5 - 3 = 2, then 5 - (3 - 2) = 4."
    },
    {
        "id": "puz-003",
        "title": "The 25 Horses Race - Minimum Races",
        "description": "You have 25 horses and a track that can race at most 5 horses at a time. There is no stopwatch, so you can only observe the relative finishing order of the horses in each race. What is the minimum number of races needed to find the top 3 fastest horses?",
        "type": "puzzle",
        "difficulty": "Medium",
        "category": "Algorithm & Optimization",
        "xp_reward": 35,
        "hints": [
            "Start by dividing the 25 horses into 5 groups of 5 and racing each group.",
            "Race the winners of each group against each other to eliminate large subsets.",
            "Carefully determine which candidate horses could mathematically still be in the top 3."
        ],
        "solution": "Minimum races: 7 races.\n1. Divide 25 horses into 5 groups (A, B, C, D, E) and run 5 races. Rank them 1 to 5 within each group: A1-A5, B1-B5, etc.\n2. Race 6: Race the 5 winners (A1, B1, C1, D1, E1). Assume order is A1 > B1 > C1 > D1 > E1.\n   - A1 is unconditionally the fastest overall horse (#1).\n   - Groups D and E are eliminated entirely.\n   - From group C, only C1 could possibly be 3rd.\n   - From group B, B1 could be 2nd or 3rd, and B2 could be 3rd.\n   - From group A, A2 could be 2nd or 3rd, and A3 could be 3rd.\n3. Race 7: Race the 5 contenders for 2nd and 3rd place: {A2, A3, B1, B2, C1}.\n   - The 1st and 2nd finishers of this race are the 2nd and 3rd fastest horses overall.",
        "company_tags": ["Google", "Meta", "Uber", "DE Shaw"],
        "options": None,
        "sample_approach": "Divide and conquer followed by posets (partially ordered sets) graph reduction."
    },
    {
        "id": "puz-004",
        "title": "Two Burning Ropes (45 Minutes Timer)",
        "description": "You have two ropes of irregular density and material. Each rope takes exactly 60 minutes to burn completely from one end to the other, but they burn at non-uniform speeds (e.g. half the rope might burn in 10 minutes and the other half in 50 minutes). How can you measure exactly 45 minutes using only these two ropes and a lighter?",
        "type": "puzzle",
        "difficulty": "Medium",
        "category": "Lateral Thinking",
        "xp_reward": 30,
        "hints": [
            "If you light both ends of a rope simultaneously, how long does it take to burn completely?",
            "Can you stage the ignition of the second rope?"
        ],
        "solution": "1. Light both ends (End A and End B) of Rope 1 simultaneously, and light ONE end of Rope 2 at the exact same moment.\n2. Because Rope 1 is burning from both ends, it will burn completely in exactly 30 minutes (regardless of non-uniform burn rate).\n3. When Rope 1 completely burns out (at exactly 30 minutes), immediately light the second end of Rope 2.\n4. Since Rope 2 had 30 minutes of burn time remaining, lighting its second end causes the remaining portion to burn twice as fast, taking exactly 15 minutes.\n5. Total elapsed time when Rope 2 completely extinguishes: 30 + 15 = 45 minutes.",
        "company_tags": ["Amazon", "Microsoft", "Adobe"],
        "options": None,
        "sample_approach": "Simultaneous bidirectional burning doubles the burn rate, halving total burn duration regardless of non-linear burn characteristics."
    },
    {
        "id": "puz-005",
        "title": "The Counterfeit Coin among 12 Coins",
        "description": "You are given 12 identical-looking coins. Exactly one coin is counterfeit and has a different weight (you don't know whether it is heavier or lighter than a genuine coin). You have a two-pan balance scale. What is the minimum number of weighings needed to identify the counterfeit coin and determine if it is heavier or lighter?",
        "type": "puzzle",
        "difficulty": "Hard",
        "category": "Information Theory",
        "xp_reward": 50,
        "hints": [
            "Each weighing has 3 possible outcomes: Left heavy, Equal, Right heavy (3^k states).",
            "There are 12 coins * 2 possibilities (heavy/light) = 24 candidate outcomes.",
            "Can 3 weighings (3^3 = 27 states) suffice?"
        ],
        "solution": "Minimum weighings: 3 weighings.\nWeighing 1: Weigh 4 coins against 4 coins (e.g., [1,2,3,4] vs [5,6,7,8]).\nCase A (Balance holds): Counterfeit is in [9,10,11,12]. Weigh [9,10,11] against 3 known good coins [1,2,3]. If balance, coin 12 is counterfeit (weigh against good to test heavy/light). If tilts, you know heavy/light; weigh 9 vs 10.\nCase B (Tilts): You have 8 suspect coins with known direction bias. Swap and substitute 3 coins from left with good coins, rotate 3 from right to left, leaving 2 aside. Step 3 identifies the exact deviant coin and its weight anomaly.",
        "company_tags": ["Morgan Stanley", "Tower Research", "Jane Street"],
        "options": None,
        "sample_approach": "Ternary decision tree maximizing information gain per comparison: log_3(24) < 3."
    },
    {
        "id": "scen-001",
        "title": "Production Database Connection Pool Exhaustion at 2 AM",
        "description": "At 2:00 AM on a Friday, your monitoring alerts fire: API p99 latency spiked from 45ms to 12,000ms, and error rates jumped to 42% with 'Timeout: connection pool exhausted (max 100 connections)'. The database CPU is only at 18%, memory is normal, but all 100 backend connection slots are pinned. Traffic volume has NOT increased. Walk through your immediate incident response, diagnosis strategy, root cause isolation, and long-term remediation.",
        "type": "scenario",
        "difficulty": "Hard",
        "category": "System Design & DevOps",
        "xp_reward": 45,
        "hints": [
            "Low DB CPU with saturated connections usually indicates idle-in-transaction or lock contention/slow external I/O inside transaction blocks.",
            "Prioritize restoring user availability first before deep debugging.",
            "Check pg_stat_activity / SHOW PROCESSLIST."
        ],
        "solution": "Immediate Mitigation (0-10 min):\n1. Check pg_stat_activity / SHOW PROCESSLIST to identify what connections are executing or waiting on locks.\n2. If queries are blocked by an uncommitted lock, terminate the blocking PID with pg_terminate_backend(blocking_pid).\n3. Temporarily scale out connection pooling with PgBouncer / ProxySQL if connections are leaked.\n\nRoot Cause Analysis:\n- Look for unclosed database sessions in recently deployed code (e.g., missing context manager / try-finally around sessions, or slow third-party HTTP calls made INSIDE a DB transaction block).\n\nLong-term Prevention:\n- Enforce transaction timeouts (idle_in_transaction_session_timeout = 10s).\n- Implement circuit breakers, connection leak detectors, and strict lint rules forbidding external network calls inside DB transaction scopes.",
        "company_tags": ["Netflix", "Stripe", "Uber", "Amazon"],
        "options": None,
        "sample_approach": "Incident Triage Framework: 1. Assess & Mitigate blast radius -> 2. Inspect active locks/queries -> 3. Isolate leak or lock origin -> 4. Guardrail with timeouts and pooling middleware."
    },
    {
        "id": "scen-002",
        "title": "Critical Zero-Day Remote Code Execution (RCE) 2 Hours Before Launch",
        "description": "Your team is 2 hours away from a highly publicized global product launch. A critical zero-day CVE with an active public exploit is disclosed for a core logging dependency (similar to Log4j) used across all your backend microservices. Marketing and executive leadership are reluctant to cancel or delay the launch. How do you lead this situation technically and managerially?",
        "type": "scenario",
        "difficulty": "Medium",
        "category": "Cybersecurity & Leadership",
        "xp_reward": 40,
        "hints": [
            "Safety and customer trust supersede launch deadlines.",
            "Can you apply an edge/WAF mitigation or JVM flag without recompiling every service?",
            "How do you communicate risk clearly in business terms to stakeholders?"
        ],
        "solution": "1. Immediate Triage & Risk Communication:\n- Communicate clearly to executive leadership: An active RCE allows complete infrastructure takeover, severe data breach, and irreversible brand damage. Security is a non-negotiable prerequisite to launch.\n2. Hotfix & Edge Mitigation:\n- Deploy an immediate WAF (Web Application Firewall) rule at Cloudflare/AWS CloudFront to inspect and block payload patterns.\n- Identify if an environment variable or runtime flag can disable the vulnerable behavior without full service rebuilds.\n3. Patch Pipeline:\n- Update dependency version in the root dependency lockfile, run automated regression tests, and prepare hotfix container images.\n4. Decision Gate:\n- If edge mitigation passes penetration testing and automated verification runs clean, launch can proceed with heightened monitoring; otherwise, delay launch by 4-6 hours with a coordinated executive statement.",
        "company_tags": ["Google", "Apple", "CrowdStrike", "Cloudflare"],
        "options": None,
        "sample_approach": "Defense-in-depth: Edge mitigation (WAF) -> Runtime mitigation (flags) -> Dependency upgrade & CI/CD verification -> Clear stakeholder risk quantification."
    },
    {
        "id": "scen-003",
        "title": "Sudden 10x Flash-Sale Traffic Spike Causing Cascading Failures",
        "description": "During a celebrity flash sale, traffic spikes by 10x in under 90 seconds. Your Recommendation Service slows down, which causes the Checkout API gateway to exhaust worker threads waiting for recommendations. The entire e-commerce checkout flow collapses, dropping revenue to zero. Design an architectural recovery and graceful degradation strategy.",
        "type": "scenario",
        "difficulty": "Hard",
        "category": "Distributed Systems",
        "xp_reward": 45,
        "hints": [
            "Is the Recommendation Service on the critical checkout path?",
            "Look into Circuit Breakers, Bulkheading, and Fallback caches."
        ],
        "solution": "1. Critical vs Non-Critical Path Decoupling:\n- The Recommendation Service must NEVER be on the synchronous blocking path of Checkout.\n2. Circuit Breakers & Fallback Mechanisms:\n- Introduce Netflix Hystrix / Resilience4j style circuit breakers with tight timeout thresholds (e.g., 200ms).\n- If the recommendation service fails or trips open, fall back immediately to a static cached list of popular items or return empty recommendations without stalling checkout.\n3. Rate Limiting & Shedding:\n- Deploy token bucket / leaky bucket rate limiters at the API gateway.\n- Prioritize traffic: give priority tokens to users already holding active checkout sessions/carts, shed anonymous browsing traffic during peak surges.\n4. Asynchronous Processing:\n- Decouple order confirmation from non-essential processing (inventory sync, email triggers, analytics) via message queues (Kafka / RabbitMQ).",
        "company_tags": ["Amazon", "Shopify", "Flipkart", "DoorDash"],
        "options": None,
        "sample_approach": "Failure isolation via Bulkhead pattern + Circuit Breaker with static fallback + Graceful degradation of non-essential features."
    },
    {
        "id": "scen-004",
        "title": "Silent Data Corruption in Financial Ledgers",
        "description": "During an end-of-day reconciliation script, the finance team notices that total account balances differ from the transaction sum by $1,420 across 8 accounts. No errors were thrown in the application logs, and the database ACID transactions committed successfully. How do you locate the cause, quarantine affected records, correct ledger integrity, and prevent recurrence?",
        "type": "scenario",
        "difficulty": "Hard",
        "category": "Backend Engineering & FinTech",
        "xp_reward": 50,
        "hints": [
            "Look for floating-point arithmetic rounding errors vs BigDecimal/Integer cents.",
            "Check for concurrency race conditions like Read-Modify-Write without pessimistic locking (SELECT FOR UPDATE)."
        ],
        "solution": "1. Quarantine & Containment:\n- Temporarily flag the 8 affected accounts to prevent outward withdrawals/settlements while allowing deposits.\n2. Root Cause Investigation:\n- Check data types: Were balances stored using IEEE 754 floating-point instead of arbitrary-precision NUMERIC / DECIMAL or integer cents?\n- Check concurrency: Look for lost updates in concurrent transactions: e.g., balance = balance + amount performed in memory after a basic SELECT rather than atomic UPDATE accounts SET balance = balance + :amt WHERE id = :id or SELECT ... FOR UPDATE.\n3. Audit Log Reconstruction:\n- Replay the immutable double-entry journal / event stream from the beginning of the day to compute the ground-truth balances.\n4. Correction & Settlement:\n- Apply compensatory ledger adjustment entries (never delete past entries; create audited correcting journal entries).\n5. Architectural Guardrails:\n- Adopt strict Double-Entry Bookkeeping: every debit must equal a credit (sum == 0).\n- Store all monetary values as integer micro-units (or cents).",
        "company_tags": ["Stripe", "Coinbase", "Robinhood", "PayPal"],
        "options": None,
        "sample_approach": "Immutable ledger re-computation + Concurrency isolation level review (Serializable or row-level pessimistic locking) + Fixed-precision math enforcement."
    },
    {
        "id": "scen-005",
        "title": "Kubernetes Pod OOMKilled Loop Every 4 Hours",
        "description": "Your main Node.js / Python API microservice runs on Kubernetes with a 1GB memory limit. Every 4 hours, pods get terminated with exit code 137 (OOMKilled) in a rolling fashion. Traffic is uniform and there are no traffic spikes at the 4-hour mark. How do you diagnose, isolate, and eliminate this memory leak?",
        "type": "scenario",
        "difficulty": "Medium",
        "category": "DevOps & Performance",
        "xp_reward": 35,
        "hints": [
            "Exit code 137 indicates SIGKILL sent by Linux kernel Out-Of-Memory Killer.",
            "Uniform traffic with steady memory growth points to unbounded caching, uncollected event listeners, or global variable accumulation."
        ],
        "solution": "1. Immediate Stabilization:\n- Temporarily increase the memory limit in the Helm/K8s deployment spec (e.g. from 1Gi to 2Gi) or configure automated pod recycling before the threshold is breached.\n2. Profiling & Heap Snapshots:\n- Take heap dumps at 1 hour (baseline) and 3 hours (elevated) into the pod lifespan using heap snapshot tooling.\n- Compare retained object counts between the two snapshots.\n3. Common Culprits to Check:\n- Unbounded in-memory LRU cache with no TTL or max-size limit.\n- Global event listeners added per-request without cleanup.\n- Database query results streaming the entire unpaginated table into an in-memory array.\n4. Validation:\n- Reproduce under load in a staging environment using a benchmark tool (k6/Locust) and monitor RSS memory graph to verify memory stabilizes under flat load.",
        "company_tags": ["Datadog", "Spotify", "GitLab"],
        "options": None,
        "sample_approach": "Differential heap analysis (snapshot comparison) -> Identify retained object graph root -> Enforce bounded cache limits and streaming queries."
    }
]

@router.get("/", response_model=List[schemas.PuzzleListResponse])
def get_puzzles(
    difficulty: Optional[str] = None,
    category: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    query = db.query(models.Question).filter(models.Question.type.in_(["puzzle", "scenario"]))
    if difficulty:
        query = query.filter(models.Question.difficulty == difficulty)
    
    questions = query.all()
    results = []
    for q in questions:
        cat = q.subtopic.name if q.subtopic else "Logic & Reasoning"
        results.append(schemas.PuzzleListResponse(
            id=q.id,
            title=q.title,
            description=q.description[:140] + "..." if len(q.description) > 140 else q.description,
            difficulty=q.difficulty,
            category=cat,
            xp_reward=q.xp_reward or 15
        ))
    return results

@router.get("/random", response_model=schemas.RandomPuzzleScenarioResponse)
def get_random_puzzle_or_scenario(
    type: Optional[str] = Query(None, description="Filter by type: 'puzzle' or 'scenario'"),
    difficulty: Optional[str] = Query(None, description="Filter by difficulty: 'Easy', 'Medium', 'Hard'"),
    category: Optional[str] = Query(None, description="Filter by category or topic keyword"),
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(get_current_user_optional)
):
    """
    Returns a random technical puzzle or scenario-based interview question.
    Can be filtered by type ('puzzle' or 'scenario') and difficulty ('Easy', 'Medium', 'Hard').
    Works both with and without authentication.
    """
    # 1. First attempt to query the database
    target_types = []
    if type:
        norm_type = type.strip().lower()
        if norm_type in ["puzzle", "scenario"]:
            target_types = [norm_type]
    else:
        target_types = ["puzzle", "scenario"]

    db_query = db.query(models.Question).filter(models.Question.type.in_(target_types))
    if difficulty:
        db_query = db_query.filter(func.lower(models.Question.difficulty) == difficulty.strip().lower())

    db_items = db_query.all()

    candidates = []

    # Map DB items to candidate dicts
    for q in db_items:
        hints = []
        if q.mcq_detail:
            if q.mcq_detail.option_a and q.mcq_detail.option_a.startswith("Hint"):
                hints.append(q.mcq_detail.option_a)
            if q.mcq_detail.option_b and q.mcq_detail.option_b.startswith("Hint"):
                hints.append(q.mcq_detail.option_b)
        if not hints:
            hints = ["Think about edge cases and constraint boundaries.", "Break the problem into smaller logical transitions."]

        opts = None
        if q.mcq_detail and q.mcq_detail.option_a and not q.mcq_detail.option_a.startswith("Hint"):
            opts = [q.mcq_detail.option_a, q.mcq_detail.option_b]
            if q.mcq_detail.option_c:
                opts.append(q.mcq_detail.option_c)
            if q.mcq_detail.option_d:
                opts.append(q.mcq_detail.option_d)

        candidates.append({
            "id": str(q.id),
            "title": q.title,
            "description": q.description,
            "type": q.type,
            "difficulty": q.difficulty,
            "category": q.subtopic.name if q.subtopic else ("Logic & Reasoning" if q.type == "puzzle" else "System Design"),
            "xp_reward": q.xp_reward or 25,
            "hints": hints,
            "solution": q.mcq_detail.explanation if (q.mcq_detail and q.mcq_detail.explanation) else "Apply structured reasoning and first-principles analysis.",
            "company_tags": q.company_tags or ["Google", "Amazon", "Microsoft"],
            "options": opts,
            "sample_approach": "Identify the primary constraint, enumerate candidate states, and eliminate contradictions."
        })

    # Filter fallback pool based on requested parameters
    filtered_fallback = FALLBACK_PUZZLES_AND_SCENARIOS
    if target_types:
        filtered_fallback = [item for item in filtered_fallback if item["type"] in target_types]
    if difficulty:
        filtered_fallback = [item for item in filtered_fallback if item["difficulty"].lower() == difficulty.strip().lower()]
    if category:
        filtered_fallback = [item for item in filtered_fallback if category.strip().lower() in item["category"].lower()]

    # Combine candidates from DB and fallback
    all_candidates = candidates + filtered_fallback
    if not all_candidates:
        # Fallback to all items if strict filter yielded no results
        all_candidates = FALLBACK_PUZZLES_AND_SCENARIOS

    chosen = random.choice(all_candidates)

    # Analytics event if user is authenticated
    if current_user:
        try:
            record_analytics_event(
                db=db,
                event_type="random_puzzle_requested",
                user_id=current_user.id,
                metadata={
                    "item_id": chosen["id"],
                    "item_title": chosen["title"],
                    "item_type": chosen["type"],
                    "difficulty": chosen["difficulty"]
                }
            )
        except Exception:
            pass

    return schemas.RandomPuzzleScenarioResponse(**chosen)

@router.get("/scenario/random", response_model=schemas.RandomPuzzleScenarioResponse)
def get_random_scenario(
    difficulty: Optional[str] = Query(None, description="Filter by difficulty: 'Easy', 'Medium', 'Hard'"),
    category: Optional[str] = Query(None, description="Filter by category"),
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(get_current_user_optional)
):
    """Convenience alias to retrieve a random scenario-based question."""
    return get_random_puzzle_or_scenario(type="scenario", difficulty=difficulty, category=category, db=db, current_user=current_user)

@router.get("/puzzle/random", response_model=schemas.RandomPuzzleScenarioResponse)
def get_random_puzzle(
    difficulty: Optional[str] = Query(None, description="Filter by difficulty: 'Easy', 'Medium', 'Hard'"),
    category: Optional[str] = Query(None, description="Filter by category"),
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(get_current_user_optional)
):
    """Convenience alias to retrieve a random logical puzzle."""
    return get_random_puzzle_or_scenario(type="puzzle", difficulty=difficulty, category=category, db=db, current_user=current_user)


@router.get("/{id}", response_model=schemas.PuzzleDetailResponse)
def get_puzzle_detail(
    id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    try:
        qid = uuid.UUID(id)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid puzzle ID")

    q = db.query(models.Question).filter(models.Question.id == qid).first()
    if not q or q.type not in ["puzzle", "scenario"]:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Puzzle not found")

    hints = []
    if q.mcq_detail:
        if q.mcq_detail.option_a and q.mcq_detail.option_a.startswith("Hint"):
            hints.append(q.mcq_detail.option_a)
        if q.mcq_detail.option_b and q.mcq_detail.option_b.startswith("Hint"):
            hints.append(q.mcq_detail.option_b)
    if not hints:
        hints = ["Focus on the constraint boundaries and edge conditions.", "Break down the problem into smaller discrete states."]

    # Emit analytics
    record_analytics_event(
        db=db,
        event_type="puzzle_attempted",
        user_id=current_user.id,
        metadata={"puzzle_id": str(q.id), "puzzle_title": q.title}
    )

    return schemas.PuzzleDetailResponse(
        id=q.id,
        title=q.title,
        description=q.description,
        difficulty=q.difficulty,
        category=q.subtopic.name if q.subtopic else "Logical Puzzle",
        xp_reward=q.xp_reward or 15,
        hints=hints,
        has_solution=True,
        company_tags=q.company_tags or []
    )

@router.post("/{id}/check", response_model=schemas.PuzzleCheckResponse)
def check_puzzle_solution(
    id: str,
    payload: schemas.PuzzleCheckRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    try:
        qid = uuid.UUID(id)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid puzzle ID")

    q = db.query(models.Question).filter(models.Question.id == qid).first()
    if not q or q.type not in ["puzzle", "scenario"]:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Puzzle not found")

    user_text = payload.solution_text.strip().lower()
    is_valid_attempt = len(user_text) > 10
    
    explanation = "Good analytical thinking. Review the complete formal logic walkthrough."
    if q.mcq_detail and q.mcq_detail.explanation:
        explanation = q.mcq_detail.explanation

    score = q.xp_reward if is_valid_attempt else 5

    # Save submission
    sub = models.Submission(
        user_id=current_user.id,
        question_id=q.id,
        score=score,
        is_correct=is_valid_attempt
    )
    db.add(sub)

    # Award profile score
    if current_user.profile and is_valid_attempt:
        current_user.profile.xp += score
        current_user.profile.aptitude_level = min(current_user.profile.aptitude_level + 2.0, 100.0)

    db.commit()

    # Emit analytics
    record_analytics_event(
        db=db,
        event_type="puzzle_completed",
        user_id=current_user.id,
        metadata={
            "puzzle_id": str(q.id),
            "puzzle_title": q.title,
            "score": score,
            "is_correct": is_valid_attempt
        }
    )

    return schemas.PuzzleCheckResponse(
        is_correct=is_valid_attempt,
        score=score,
        explanation=explanation
    )
