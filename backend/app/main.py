import os
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import Base, engine, get_db
from app.models import models
from app.core.security import get_password_hash

# Import routers (we will define them in api/v1)
from app.api.v1 import auth, problems, sql_playground, mcqs, assessments, ai_features, roadmaps, dashboard, contests

app = FastAPI(
    title="Code Quest API",
    description="The complete backend API for the Code Quest preparation and assessment platform.",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create database tables automatically if not present (ensures seamless startup in Docker)
@app.on_event("startup")
def startup_db_init():
    Base.metadata.create_all(bind=engine)
    
    # Optional: Seed administrative account if not exists
    db = next(get_db())
    try:
        admin_email = settings.ADMIN_DEFAULT_EMAIL
        existing_admin = db.query(models.User).filter(models.User.email == admin_email).first()
        if not existing_admin:
            admin_user = models.User(
                email=admin_email,
                hashed_password=get_password_hash(settings.ADMIN_DEFAULT_PASSWORD),
                is_active=True,
                is_admin=True
            )
            db.add(admin_user)
            db.commit()
            print(f"Admin user seeded successfully with email: {admin_email}")
    except Exception as e:
        print(f"Error seeding admin user: {e}")
    finally:
        db.close()

# Include API endpoints
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(problems.router, prefix="/api/v1/problems", tags=["Coding Problems"])
app.include_router(sql_playground.router, prefix="/api/v1/sql/problems", tags=["SQL Playground"])
app.include_router(mcqs.router, prefix="/api/v1/mcqs", tags=["MCQs, Aptitude & Puzzles"])
app.include_router(assessments.router, prefix="/api/v1/assessments", tags=["Assessments"])
app.include_router(ai_features.router, prefix="/api/v1/ai", tags=["AI Features"])
app.include_router(roadmaps.router, prefix="/api/v1/roadmaps", tags=["Roadmaps"])
app.include_router(dashboard.router, prefix="/api/v1/dashboard", tags=["Dashboard"])
app.include_router(contests.router, prefix="/api/v1/contests", tags=["Contests"])

@app.get("/")
def root_index():
    return {
        "message": "Welcome to the Code Quest Cloud API",
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

