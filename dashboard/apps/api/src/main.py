from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routes import (
    docker,
    kubernetes,
    terraform,
    helm,
    github,
    monitoring,
    security,
    system,
    ai,
    environment,
)
from .environment.router import router as environment_module_router
from .docker_engine.router import router as docker_module_router
from .k8s.router import router as kubernetes_module_router
from .settings import settings

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    docs_url="/api/docs",
    openapi_url="/api/openapi.json",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(docker.router, prefix="/api/v1/docker", tags=["docker"])
app.include_router(kubernetes.router, prefix="/api/v1/kubernetes", tags=["kubernetes"])
app.include_router(terraform.router, prefix="/api/v1/terraform", tags=["terraform"])
app.include_router(helm.router, prefix="/api/v1/helm", tags=["helm"])
app.include_router(github.router, prefix="/api/v1/github", tags=["github"])
app.include_router(monitoring.router, prefix="/api/v1/monitoring", tags=["monitoring"])
app.include_router(security.router, prefix="/api/v1/security", tags=["security"])
app.include_router(system.router, prefix="/api/v1/system", tags=["system"])
app.include_router(ai.router, prefix="/api/v1/ai", tags=["ai"])
app.include_router(environment.router, prefix="/api/v1/environment", tags=["environment"])
app.include_router(
    environment_module_router, prefix="/api/environment", tags=["environment-module"]
)
app.include_router(docker_module_router, prefix="/api/docker", tags=["docker-module"])
app.include_router(kubernetes_module_router, prefix="/api/kubernetes", tags=["kubernetes-module"])


@app.get("/api/health")
async def health():
    return {"status": "ok", "version": settings.VERSION}
