from fastapi import APIRouter
from datetime import datetime

from .schemas import SystemInfo, ToolInfo, ValidationResult, HealthScore, Report
from .health import calculate_health
from .validation import run_all_validations

from .detectors.system_detector import SystemDetector
from .detectors.python_detector import PythonDetector
from .detectors.node_detector import NodeDetector
from .detectors.git_detector import GitDetector
from .detectors.docker_detector import DockerDetector
from .detectors.docker_compose_detector import DockerComposeDetector
from .detectors.kubectl_detector import KubectlDetector
from .detectors.helm_detector import HelmDetector
from .detectors.terraform_detector import TerraformDetector
from .detectors.kind_detector import KindDetector
from .detectors.wsl_detector import WSLDetector
from .detectors.gh_detector import GitHubCLIDetector
from .detectors.aws_detector import AWSDetector
from .detectors.azure_detector import AzureDetector
from .detectors.gcloud_detector import GCloudDetector

router = APIRouter()

_TOOL_DETECTORS = [
    PythonDetector(),
    NodeDetector(),
    GitDetector(),
    DockerDetector(),
    DockerComposeDetector(),
    KubectlDetector(),
    HelmDetector(),
    TerraformDetector(),
    KindDetector(),
    WSLDetector(),
    GitHubCLIDetector(),
    AWSDetector(),
    AzureDetector(),
    GCloudDetector(),
]


@router.get("/system")
async def get_system() -> SystemInfo:
    detector = SystemDetector()
    data = detector.detect()
    return SystemInfo(**data)


@router.get("/tools")
async def get_tools() -> list[ToolInfo]:
    results = []
    for detector in _TOOL_DETECTORS:
        result = detector.detect()
        results.append(
            ToolInfo(
                name=result.name,
                installed=result.installed,
                version=result.version,
                latest_version=result.latest_version,
                path=result.path,
                error=result.error,
            )
        )
    return results


@router.get("/validation")
async def get_validation() -> list[ValidationResult]:
    return run_all_validations()


@router.get("/health")
async def get_health() -> HealthScore:
    tools = await get_tools()
    validations = await get_validation()
    return calculate_health(tools, validations)


@router.get("/report")
async def get_report() -> Report:
    detector = SystemDetector()
    system_data = detector.detect()
    system = SystemInfo(**system_data)
    tools = await get_tools()
    validations = await get_validation()
    health = calculate_health(tools, validations)
    return Report(
        system=system,
        tools=tools,
        validation=validations,
        health=health,
        generated_at=datetime.utcnow().isoformat() + "Z",
    )
