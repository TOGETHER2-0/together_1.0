from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str = "mysql+pymysql://root@127.0.0.1:3307/together_db"
    SECRET_KEY: str = "super-secret-key-change-in-production-1234567890"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # Comma-separated list of allowed frontend origins (CORS).
    # In prod set e.g. FRONTEND_ORIGINS="https://together.vercel.app"
    FRONTEND_ORIGINS: str = "http://localhost:3000"

    @property
    def cors_origins(self) -> list[str]:
        return [o.strip() for o in self.FRONTEND_ORIGINS.split(",") if o.strip()]

    class Config:
        env_file = ".env"

settings = Settings()
