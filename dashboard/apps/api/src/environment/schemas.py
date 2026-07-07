from pydantic import BaseModel
from typing import Any


class ToolInfo(BaseModel):
    name: str
    installed: bool = False
    version: str | None = None
    latest_version: str | None = None
    path: str | None = None
    error: str | None = None


class SystemInfo(BaseModel):
    os: str
    architecture: str
    hostname: str
    username: str
    cpu: str
    cpu_cores: int
    cpu_frequency: str
    ram_total: int
    ram_available: int
    ram_percent: float
    disk_total: int
    disk_used: int
    disk_free: int
    disk_percent: float


class ValidationResult(BaseModel):
    check: str
    status: str  # PASS | WARNING | FAILED | SKIPPED
    message: str
    details: dict[str, Any] = {}


class HealthScoreBreakdown(BaseModel):
    infrastructure: int
    development: int
    cloud: int
    monitoring: int


class HealthScore(BaseModel):
    overall: int
    breakdown: HealthScoreBreakdown


class Report(BaseModel):
    system: SystemInfo
    tools: list[ToolInfo]
    validation: list[ValidationResult]
    health: HealthScore
    generated_at: str
