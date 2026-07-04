from pathlib import Path
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_env: str = Field(default="development")
    api_host: str = Field(default="127.0.0.1")
    api_port: int = Field(default=8000)
    postgres_host: str = Field(default="db")  # Default to 'db' for Docker network
    postgres_port: int = Field(default=5432)
    postgres_user: str = Field(default="postgres_admin")
    postgres_db: str = Field(default="ivenuedb")
    database_url: str | None = Field(default=None)
    
    redis_host: str = Field(default="redis")
    redis_port: int = Field(default=6379)
    secret_key: str = Field(default="development-secret")

    model_config = SettingsConfigDict(
        env_file=Path(__file__).resolve().parents[2] / ".env",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
    )

    @property
    def async_database_url(self) -> str:
        # Fallback: If database_url isn't explicitly supplied in .env, construct it passwordless
        if not self.database_url:
            return f"postgresql+asyncpg://{self.postgres_user}@{self.postgres_host}:{self.postgres_port}/{self.postgres_db}"
        
        if self.database_url.startswith("postgresql+psycopg"):
            return self.database_url.replace("postgresql+psycopg", "postgresql+asyncpg", 1)
        elif self.database_url.startswith("postgresql://"):
            return self.database_url.replace("postgresql://", "postgresql+asyncpg://", 1)
        return self.database_url


_settings: Settings | None = None


def get_settings() -> Settings:
    global _settings
    if _settings is None:
        _settings = Settings()
    return _settings

settings = get_settings()