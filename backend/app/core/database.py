from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.core.config import settings

db_url = settings.DATABASE_URL
connect_args = {}

if db_url.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

try:
    if "postgresql" in db_url:
        import psycopg2
        # Quick ping test with short timeout
        engine = create_engine(db_url, pool_pre_ping=True, connect_args={"connect_timeout": 2})
        with engine.connect():
            pass
    else:
        engine = create_engine(db_url, pool_pre_ping=True, connect_args=connect_args)
except Exception:
    # Gracefully fallback to local SQLite for seamless local execution
    db_url = "sqlite:///./placementforge.db"
    connect_args = {"check_same_thread": False}
    engine = create_engine(db_url, connect_args=connect_args)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

