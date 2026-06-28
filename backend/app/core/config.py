from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application configuration, overridable via environment variables."""

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # Database
    database_url: str = "sqlite:///./tickets.db"

    # JWT / auth
    jwt_secret: str = "change-me-in-production"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 12  # 12 hours

    # Admin credentials (the only user in this app)
    admin_username: str = "admin"
    admin_password: str = "admin"

    # CORS — allowed frontend origins
    cors_origins: list[str] = ["http://localhost:5173", "http://localhost:3000"]


settings = Settings()
