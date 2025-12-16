from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Application settings"""
    
    # API Settings
    API_TITLE: str = "APRHS API"
    API_VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    
    # Security
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # Database
    COUCHDB_URL: str = "http://localhost:5984"
    COUCHDB_USER: Optional[str] = "admin"
    COUCHDB_PASSWORD: Optional[str] = "password"
    
    # CORS
    CORS_ORIGINS: list = [
        "http://localhost:3000",
        "http://localhost:5173",
        "https://aprhs.local"
    ]
    
    # AI Services
    TRIAGE_MODEL: str = "rule-based"  # or "llm"
    VISION_MODEL: str = "placeholder"  # or "co2dnet"
    NLU_MODEL: str = "simple"  # or "transformers"
    
    # Feature Flags
    ENABLE_AUTH: bool = True
    ENABLE_SYNC: bool = True
    ENABLE_NOTIFICATIONS: bool = True
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
