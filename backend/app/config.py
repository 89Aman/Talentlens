import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    gemini_api_key: str = ""
    groq_api_key: str = ""
    port: int = 8000
    host: str = "127.0.0.1"

    # Use pydantic-settings configuration to load from .env
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

# Try loading from local environment
try:
    settings = Settings()
except Exception:
    # Fallback to direct environment read if dotenv fails
    settings = Settings(
        gemini_api_key=os.getenv("GEMINI_API_KEY", ""),
        groq_api_key=os.getenv("GROQ_API_KEY", ""),
        port=int(os.getenv("PORT", "8000")),
        host=os.getenv("HOST", "127.0.0.1")
    )
