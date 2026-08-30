import os
from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    ENV_MODE: str = "development"
    SECRET_KEY: str = "devsecretjwtkeyplacementforge123456789"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 300
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # PostgreSQL Database
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "postgrespassword"
    POSTGRES_DB: str = "placementforge"
    POSTGRES_HOST: str = "localhost"
    POSTGRES_PORT: str = "5432"

    @property
    def DATABASE_URL(self) -> str:
        if os.getenv("USE_SQLITE") == "true":
            return "sqlite:///./local_db.db"
        env_db = os.getenv("DATABASE_URL")
        if env_db:
            if env_db.startswith("postgres://"):
                env_db = env_db.replace("postgres://", "postgresql://", 1)
            return env_db
        return f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"

    # Redis Cache and Queue
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_URL: str = "redis://localhost:6379/0"

    # Sandbox execution micro-service
    SANDBOX_HOST: str = "localhost"
    SANDBOX_PORT: int = 8080
    SANDBOX_SECRET_TOKEN: str = "devsandboxsecrettoken"

    @property
    def SANDBOX_URL(self) -> str:
        return f"http://{self.SANDBOX_HOST}:{self.SANDBOX_PORT}"

    # Google Gemini API Key
    GEMINI_API_KEY: Optional[str] = None

    # Firebase Cloud Messaging
    FCM_SERVER_KEY: Optional[str] = "mock-fcm-server-key"

    # Google OAuth Client ID
    GOOGLE_CLIENT_ID: Optional[str] = "962508754195-j659dsdq3goseasg4925a90j0qiktetg.apps.googleusercontent.com"

    # Admin seed credentials
    ADMIN_DEFAULT_EMAIL: str = "admin@placementforge.com"
    ADMIN_DEFAULT_PASSWORD: str = "adminsecurepass123"

settings = Settings()
