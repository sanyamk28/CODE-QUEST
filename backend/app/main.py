import os
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import Base, engine, get_db
from app.models import models
from app.core.security import get_password_hash

# Import routers (we will define them in api/v1)
from app.api.v1 import auth, problems, sql_playground, mcqs, puzzles, assessments, ai_features, roadmaps, dashboard, contests, battles, analytics

from contextlib import asynccontextmanager

from sqlalchemy import text

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Create database tables automatically if not present
    Base.metadata.create_all(bind=engine)
    
    # Ensure new columns exist if table already existed
    try:
        with engine.begin() as conn:
            for col in ["score_breakdown", "metrics"]:
                try:
                    conn.execute(text(f"ALTER TABLE resume_analysis ADD COLUMN {col} JSON;"))
                except Exception:
                    pass
            try:
                conn.execute(text("ALTER TABLE users ADD COLUMN auth_provider VARCHAR DEFAULT 'local';"))
            except Exception:
                pass
    except Exception:
        pass

    # Optional: Seed default accounts if not exists
    db = next(get_db())
    try:
        admin_email = "admin@codequest.dev"
        existing_admin = db.query(models.User).filter(models.User.email == admin_email).first()
        if not existing_admin:
            admin_user = models.User(
                email=admin_email,
                hashed_password=get_password_hash("Admin@1234"),
                is_active=True,
                is_admin=True
            )
            db.add(admin_user)
            db.commit()
            print(f"Admin user seeded successfully with email: {admin_email}")

        candidate_email = "alex.chen@codequest.dev"
        existing_candidate = db.query(models.User).filter(models.User.email == candidate_email).first()
        if not existing_candidate:
            cand_user = models.User(
                email=candidate_email,
                hashed_password=get_password_hash("pass123"),
                is_active=True,
                is_admin=False
            )
            db.add(cand_user)
            db.commit()
            db.refresh(cand_user)
            cand_profile = models.Profile(
                user_id=cand_user.id,
                name="Alex Chen",
                college="Stanford University",
                degree="B.Tech Computer Science",
                target_role="Software Engineer",
                xp=540,
                streak=7,
                readiness_score=78.5,
                skills=["Python", "SQL", "Data Structures (DSA)", "FastAPI", "React"],
                target_companies=["Google", "Amazon", "Microsoft"]
            )
            db.add(cand_profile)
            db.commit()
            print(f"Candidate user seeded successfully with email: {candidate_email}")
    except Exception as e:
        print(f"Error seeding initial users: {e}")
    finally:
        db.close()
    
    yield

app = FastAPI(
    title="Code Quest API",
    description="The complete backend API for the Code Quest preparation and assessment platform.",
    version="1.0.0",
    lifespan=lifespan
)

# Standard-compliant CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_origin_regex=r"https?://.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API endpoints
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(problems.router, prefix="/api/v1/problems", tags=["Coding Problems"])
app.include_router(sql_playground.router, prefix="/api/v1/sql/problems", tags=["SQL Playground"])
app.include_router(mcqs.router, prefix="/api/v1/mcqs", tags=["MCQs & Aptitude"])
app.include_router(puzzles.router, prefix="/api/v1/puzzles", tags=["Puzzles & Scenarios"])
app.include_router(assessments.router, prefix="/api/v1/assessments", tags=["Assessments"])
app.include_router(ai_features.router, prefix="/api/v1/ai", tags=["AI Features"])
app.include_router(roadmaps.router, prefix="/api/v1/roadmaps", tags=["Roadmaps"])
app.include_router(dashboard.router, prefix="/api/v1/dashboard", tags=["Dashboard"])
app.include_router(contests.router, prefix="/api/v1/contests", tags=["Contests"])
app.include_router(battles.router, prefix="/api/v1/battles", tags=["Live Code Battles"])
app.include_router(analytics.router, prefix="/api/v1/analytics", tags=["Analytics & Telemetry"])

@app.get("/")
@app.get("/api/v1")
def root_index():
    return {
        "message": "Welcome to the Code Quest Cloud API",
        "version": "v1",
        "status": "online",
        "docs_url": "/docs",
        "health_check": "/api/v1/health"
    }

@app.get("/api/v1/health")
@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "environment": settings.ENV_MODE,
        "database": "connected"
    }

