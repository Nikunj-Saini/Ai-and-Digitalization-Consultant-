import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GEMINI_API_KEY_2: str = os.getenv("GEMINI_API_KEY_2", "")
    
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-3.5-flash")
    GEMINI_MODEL_2: str = os.getenv("GEMINI_MODEL_2", "gemini-3.5-flash-lite")
    GEMINI_MODEL_3: str = os.getenv("GEMINI_MODEL_3", "gemini-3.6-flash")
    GEMINI_MODEL_4: str = os.getenv("GEMINI_MODEL_4", "gemini-2.5-flash")
    GEMINI_MODEL_5: str = os.getenv("GEMINI_MODEL_5", "gemini-3.7-flash")


    CLAUDE_MODEL: str = os.getenv("CLAUDE_MODEL", "")
    
    MYSQL_HOST: str = os.getenv("MYSQL_HOST", "localhost")
    MYSQL_PORT: int = int(os.getenv("MYSQL_PORT", 3306))
    MYSQL_USER: str = os.getenv("MYSQL_USER", "root")
    MYSQL_PASSWORD: str = os.getenv("MYSQL_PASSWORD", "password")
    MYSQL_DATABASE: str = os.getenv("MYSQL_DATABASE", "digitalization_advisor")
    
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        f"mysql+pymysql://{MYSQL_USER}:{MYSQL_PASSWORD}@{MYSQL_HOST}:{MYSQL_PORT}/{MYSQL_DATABASE}"
    )
    
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    EXPORTS_DIR: str = os.getenv("EXPORTS_DIR", "./static/exports")
    
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

settings = Settings()
