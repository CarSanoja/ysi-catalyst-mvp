from typing import List, Union
from pydantic_settings import BaseSettings
from pydantic import AnyHttpUrl, validator
import os
import json

class Settings(BaseSettings):
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-here")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8  # 8 days

    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "mysql+pymysql://ysi_user:ysi_mysql_password@localhost:3306/ysi_db"
    )

    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:3001",  # YSI Admin Frontend
        "http://localhost:8000",
        "http://localhost:8080",
        "http://localhost",
        "https://bool-mic-acrylic-elliott.trycloudflare.com",  # Cloudflare tunnel
        "https://ysi-catalyst-mvp.vercel.app",  # Vercel production
        "https://ysi-catalyst-mvp-git-main-carsanojas-projects.vercel.app",  # Vercel preview deployments
        "https://ysi15.vercel.app",  # Additional Vercel deployment
    ]

    @validator("BACKEND_CORS_ORIGINS", pre=True)
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> Union[List[str], str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            # If it's a JSON string, parse it
            if isinstance(v, str):
                try:
                    parsed = json.loads(v)
                    if isinstance(parsed, list):
                        return parsed
                except json.JSONDecodeError:
                    pass
            return v
        raise ValueError(v)
    
    PROJECT_NAME: str = "YSI Catalyst"
    
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    
    # MinIO Configuration
    MINIO_HOST: str = os.getenv("MINIO_HOST", "localhost")
    MINIO_PORT: int = int(os.getenv("MINIO_PORT", "9000"))
    MINIO_CONSOLE_PORT: int = int(os.getenv("MINIO_CONSOLE_PORT", "9001"))
    MINIO_USER: str = os.getenv("MINIO_USER", "ysi_user")
    MINIO_PASSWORD: str = os.getenv("MINIO_PASSWORD", "ysi_minio_password")
    MINIO_BUCKET: str = os.getenv("MINIO_BUCKET", "ysi-storage")
    MINIO_SECURE: bool = os.getenv("MINIO_SECURE", "false").lower() == "true"
    
    class Config:
        case_sensitive = True
        env_file = ".env"
        extra = "ignore"

settings = Settings()