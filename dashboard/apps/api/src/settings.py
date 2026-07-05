from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    PROJECT_NAME: str = "AegisAI API"
    VERSION: str = "0.9.0"
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

    GITHUB_TOKEN: str = ""

    model_config = {"env_file": ".env", "case_sensitive": True}


settings = Settings()
