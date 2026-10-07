from pathlib import Path
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_env: str = Field(default="development")
    api_host: str = Field(default="127.0.0.1")
    api_port: int = Field(default=8000)
    database_url: str = Field(default="sqlite+aiosqlite:///./ivenue.db")
    
    redis_host: str = Field(default="redis")
    redis_port: int = Field(default=6379)
    secret_key: str = Field(default="development-secret")
    
    project_name: str = Field(default="iVenue API")
    resend_api_key: str | None = None
    resend_api_url: str = Field(default="https://api.resend.com/emails")
    resend_from_email: str = Field(default="iVenue <onboarding@resend.dev>")
    termii_api_key: str | None = None
    termii_api_url: str = Field(default="https://api.ng.termii.com/api/sms/send")
    termii_sender_id: str = Field(default="iVenue")
    public_app_url: str = Field(default="http://localhost:8081")
    jwt_algorithm: str = Field(default="HS256")
    jwt_access_token_expire_minutes: int = Field(default=30)
    otp_expiry_minutes: int = Field(default=5)
    otp_max_attempts: int = Field(default=5)
    otp_resend_cooldown_seconds: int = Field(default=60)

    model_config = SettingsConfigDict(
        env_file=Path(__file__).resolve().parents[2] / ".env",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
    )

    @property
    def async_database_url(self) -> str:
        if self.database_url.startswith("postgresql+psycopg"):
            return self.database_url.replace("postgresql+psycopg", "postgresql+asyncpg", 1)
        if self.database_url.startswith("postgresql://"):
            return self.database_url.replace("postgresql://", "postgresql+asyncpg://", 1)
        return self.database_url


_settings: Settings | None = None


def get_settings() -> Settings:
    global _settings
    if _settings is None:
        _settings = Settings()
    return _settings

settings = get_settings()