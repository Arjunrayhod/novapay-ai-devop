from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    PROJECT_NAME: str = "AegisAI API"
    VERSION: str = "0.10.0"
    DEBUG: bool = False
    CORS_ORIGINS: list[str] = ["http://localhost:3000"]

    API_HOST: str = "0.0.0.0"
    API_PORT: int = 8000

    REDIS_URL: str = "redis://localhost:6379/0"

    KUBERNETES_API_SERVER: str = ""
    KUBERNETES_TOKEN: str = ""

    PROMETHEUS_URL: str = "http://localhost:9090"
    LOKI_URL: str = "http://localhost:3100"
    TEMPO_URL: str = "http://localhost:3200"
    GRAFANA_URL: str = "http://localhost:3001"

    JWT_SECRET: str = "change-me-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRY_HOURS: int = 72

    ENCRYPTION_KEY: str = ""
    DATABASE_URL: str = "sqlite+aiosqlite:///./aegisai.db"

    GITHUB_OWNER: str = "Arjunrayhod"
    GITHUB_REPO: str = "novapay-ai-devop"
    GITHUB_API_BASE: str = "https://api.github.com"

    AI_PROVIDER: str = "mock"
    OPENAI_API_KEY: str = ""
    OPENAI_MODEL: str = "gpt-4o"
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-2.0-flash"
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "llama3"
    AZURE_OPENAI_ENDPOINT: str = ""
    AZURE_OPENAI_API_KEY: str = ""
    AZURE_OPENAI_DEPLOYMENT: str = ""

    model_config = {"env_file": ".env", "case_sensitive": True}


settings = Settings()
