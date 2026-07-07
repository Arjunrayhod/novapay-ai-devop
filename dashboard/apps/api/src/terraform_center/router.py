from fastapi import APIRouter, HTTPException

from .schemas import (
    TerraformHealth,
    TerraformModule,
    TerraformOutput,
    TerraformOverview,
    TerraformPlan,
    TerraformProvider,
    TerraformResource,
    TerraformState,
    TerraformVersion,
)
from .services.health_service import get_overview, get_terraform_health
from .services.module_service import list_modules
from .services.output_service import list_outputs
from .services.plan_service import get_plan
from .services.provider_service import list_providers
from .services.resource_service import list_resources
from .services.state_service import get_state_summary
from .services.version_service import get_terraform_version, is_terraform_available

router = APIRouter()


def _require_terraform():
    if not is_terraform_available():
        raise HTTPException(status_code=503, detail="Terraform CLI is not available")


@router.get("/version")
async def terraform_version() -> TerraformVersion:
    _require_terraform()
    return TerraformVersion(**get_terraform_version())


@router.get("/state")
async def terraform_state() -> TerraformState:
    _require_terraform()
    return TerraformState(**get_state_summary())


@router.get("/modules")
async def terraform_modules() -> list[TerraformModule]:
    _require_terraform()
    return [TerraformModule(**m) for m in list_modules()]


@router.get("/resources")
async def terraform_resources() -> list[TerraformResource]:
    _require_terraform()
    return [TerraformResource(**r) for r in list_resources()]


@router.get("/providers")
async def terraform_providers() -> list[TerraformProvider]:
    _require_terraform()
    return [TerraformProvider(**p) for p in list_providers()]


@router.get("/outputs")
async def terraform_outputs() -> list[TerraformOutput]:
    _require_terraform()
    return [TerraformOutput(**o) for o in list_outputs()]


@router.get("/plan")
async def terraform_plan() -> TerraformPlan:
    _require_terraform()
    return TerraformPlan(**get_plan())


@router.get("/health")
async def terraform_health() -> TerraformHealth:
    return TerraformHealth(**get_terraform_health())


@router.get("/overview")
async def terraform_overview() -> TerraformOverview:
    return TerraformOverview(**get_overview())
