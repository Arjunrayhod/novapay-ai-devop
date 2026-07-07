from ...docker_engine.services.container_service import list_containers
from ...docker_engine.services.health_service import get_docker_info
from ...environment.router import get_health, get_system, get_tools
from ...helm_center.services.health_service import get_helm_health
from ...helm_center.services.helm_service import list_releases
from ...k8s.services.cluster_service import get_cluster_info
from ...k8s.services.health_service import get_kubernetes_health
from ...observability.services.health_service import (
    get_observability_health,
    get_observability_overview,
)
from ...observability.services.prometheus_service import list_alerts
from ...security_center.services.health_service import get_security_health, get_security_overview
from ...terraform_center.services.health_service import get_terraform_health
from ...terraform_center.services.state_service import get_state_summary
from ..schemas import ToolDefinition, ToolResult
import asyncio

_TOOL_DEFINITIONS: list[ToolDefinition] = [
    ToolDefinition(
        name="get_docker_status",
        description="Get Docker Engine status, container count, and basic health",
        parameters={},
    ),
    ToolDefinition(
        name="get_docker_containers",
        description="List all Docker containers with their status",
        parameters={},
    ),
    ToolDefinition(
        name="get_kubernetes_health",
        description="Get Kubernetes cluster health status",
        parameters={},
    ),
    ToolDefinition(
        name="get_kubernetes_info",
        description="Get Kubernetes cluster information including node count and version",
        parameters={},
    ),
    ToolDefinition(
        name="get_helm_status",
        description="Get Helm availability and release overview",
        parameters={},
    ),
    ToolDefinition(
        name="get_helm_releases",
        description="List all Helm releases",
        parameters={},
    ),
    ToolDefinition(
        name="get_terraform_status",
        description="Get Terraform availability and health",
        parameters={},
    ),
    ToolDefinition(
        name="get_terraform_state",
        description="Get Terraform state summary including resource counts",
        parameters={},
    ),
    ToolDefinition(
        name="get_observability_health",
        description="Get observability stack health (Prometheus, Grafana, Loki, Tempo, OTel)",
        parameters={},
    ),
    ToolDefinition(
        name="get_observability_overview",
        description="Get observability overview including alert counts and dashboard info",
        parameters={},
    ),
    ToolDefinition(
        name="get_prometheus_alerts",
        description="Get active Prometheus alerts",
        parameters={},
    ),
    ToolDefinition(
        name="get_security_health",
        description="Get security tool health status (SAST, dependency scan, OPA, Trivy)",
        parameters={},
    ),
    ToolDefinition(
        name="get_security_overview",
        description="Get security overview including issue counts and compliance score",
        parameters={},
    ),
    ToolDefinition(
        name="get_environment_system",
        description="Get system information (OS, CPU, memory, disk)",
        parameters={},
    ),
    ToolDefinition(
        name="get_environment_tools",
        description="Get installed development tools and their versions",
        parameters={},
    ),
    ToolDefinition(
        name="get_environment_health",
        description="Get environment health score",
        parameters={},
    ),
]


def get_tool_definitions() -> list[ToolDefinition]:
    return _TOOL_DEFINITIONS


async def execute_tool(name: str) -> ToolResult:
    try:
        if name == "get_docker_status":
            data = get_docker_info()
            return ToolResult(
                tool=name,
                success=True,
                data=data.model_dump() if hasattr(data, "model_dump") else str(data),
            )

        elif name == "get_docker_containers":
            containers = list_containers(all=True) if list_containers(all=True) else []
            return ToolResult(
                tool=name,
                success=True,
                data=[c.model_dump() if hasattr(c, "model_dump") else str(c) for c in containers],
            )

        elif name == "get_kubernetes_health":
            data = get_kubernetes_health()
            return ToolResult(
                tool=name,
                success=True,
                data=data.model_dump() if hasattr(data, "model_dump") else str(data),
            )

        elif name == "get_kubernetes_info":
            data = get_cluster_info()
            return ToolResult(
                tool=name,
                success=True,
                data=data.model_dump() if hasattr(data, "model_dump") else str(data),
            )

        elif name == "get_helm_status":
            data = get_helm_health()
            return ToolResult(
                tool=name,
                success=True,
                data=data.model_dump() if hasattr(data, "model_dump") else str(data),
            )

        elif name == "get_helm_releases":
            releases = list_releases() if list_releases() else []
            return ToolResult(
                tool=name,
                success=True,
                data=[r.model_dump() if hasattr(r, "model_dump") else str(r) for r in releases],
            )

        elif name == "get_terraform_status":
            data = get_terraform_health()
            return ToolResult(
                tool=name,
                success=True,
                data=data.model_dump() if hasattr(data, "model_dump") else str(data),
            )

        elif name == "get_terraform_state":
            data = get_state_summary()
            return ToolResult(
                tool=name,
                success=True,
                data=data.model_dump() if hasattr(data, "model_dump") else str(data),
            )

        elif name == "get_observability_health":
            data = get_observability_health()
            return ToolResult(tool=name, success=True, data=data)

        elif name == "get_observability_overview":
            data = get_observability_overview()
            return ToolResult(tool=name, success=True, data=data)

        elif name == "get_prometheus_alerts":
            alerts = list_alerts() or []
            return ToolResult(tool=name, success=True, data=alerts)

        elif name == "get_security_health":
            data = get_security_health()
            return ToolResult(tool=name, success=True, data=data)

        elif name == "get_security_overview":
            data = get_security_overview()
            return ToolResult(tool=name, success=True, data=data)

        elif name == "get_environment_system":
            from ...environment.schemas import SystemInfo

            data = await get_system()
            return ToolResult(
                tool=name,
                success=True,
                data=data.model_dump() if isinstance(data, SystemInfo) else str(data),
            )

        elif name == "get_environment_tools":
            data = await get_tools()
            return ToolResult(
                tool=name,
                success=True,
                data=[t.model_dump() if hasattr(t, "model_dump") else str(t) for t in data],
            )

        elif name == "get_environment_health":
            data = await get_health()
            return ToolResult(
                tool=name,
                success=True,
                data=data.model_dump() if hasattr(data, "model_dump") else str(data),
            )

        return ToolResult(tool=name, success=False, error=f"Unknown tool: {name}")

    except Exception as e:
        return ToolResult(tool=name, success=False, error=str(e))


async def execute_tools(tool_names: list[str]) -> list[ToolResult]:
    loop = asyncio.get_running_loop()

    async def run_one(name: str) -> ToolResult:
        try:
            result = await asyncio.wait_for(
                loop.run_in_executor(None, _run_tool_sync, name),
                timeout=5.0,
            )
            return result
        except asyncio.TimeoutError:
            return ToolResult(tool=name, success=False, error="Tool execution timed out")
        except Exception as e:
            return ToolResult(tool=name, success=False, error=str(e))

    tasks = [run_one(name) for name in tool_names]
    return await asyncio.gather(*tasks)


def _run_tool_sync(name: str) -> ToolResult:
    try:
        return asyncio.run(execute_tool(name))
    except Exception as e:
        return ToolResult(tool=name, success=False, error=str(e))
