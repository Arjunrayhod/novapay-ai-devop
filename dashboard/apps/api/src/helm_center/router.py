from fastapi import APIRouter, HTTPException

from .schemas import (
    HelmChart,
    HelmDependency,
    HelmHealth,
    HelmHistory,
    HelmOverview,
    HelmRelease,
    HelmReleaseDetail,
    HelmRepository,
    HelmVersion,
)
from .services.health_service import get_helm_health
from .services.helm_service import (
    get_chart_dependencies,
    get_helm_version,
    get_overview,
    get_release,
    get_release_history,
    get_values,
    is_helm_available,
    list_charts,
    list_releases,
    list_repositories,
)

router = APIRouter()


def _require_helm():
    if not is_helm_available():
        raise HTTPException(status_code=503, detail="Helm CLI is not available")


@router.get("/version")
async def helm_version() -> HelmVersion:
    return HelmVersion(version=get_helm_version())


@router.get("/health")
async def helm_health() -> HelmHealth:
    return HelmHealth(**get_helm_health())


@router.get("/overview")
async def helm_overview() -> HelmOverview:
    if not is_helm_available():
        return HelmOverview(
            total_releases=0,
            healthy_releases=0,
            failed_releases=0,
            namespace_count=0,
            repository_count=0,
            chart_count=0,
        )
    return HelmOverview(**get_overview())


@router.get("/releases")
async def helm_releases(namespace: str = "") -> list[HelmRelease]:
    _require_helm()
    return [HelmRelease(**r) for r in list_releases(namespace)]


@router.get("/releases/{name}")
async def helm_release_detail(name: str, namespace: str = "") -> HelmReleaseDetail:
    _require_helm()
    r = get_release(name, namespace)
    if not r:
        raise HTTPException(status_code=404, detail=f"Release '{name}' not found")
    return HelmReleaseDetail(**r)


@router.get("/history/{name}")
async def helm_history(name: str, namespace: str = "") -> list[HelmHistory]:
    _require_helm()
    return [HelmHistory(**h) for h in get_release_history(name, namespace)]


@router.get("/charts")
async def helm_charts(repo: str = "") -> list[HelmChart]:
    _require_helm()
    return [HelmChart(**c) for c in list_charts(repo)]


@router.get("/repositories")
async def helm_repositories() -> list[HelmRepository]:
    _require_helm()
    return [HelmRepository(**r) for r in list_repositories()]


@router.get("/values/{release}")
async def helm_values(release: str, namespace: str = "") -> dict:
    _require_helm()
    yaml_str = get_values(release, namespace)
    return {"release": release, "values": yaml_str}


@router.get("/dependencies/{chart_ref:path}")
async def helm_dependencies(chart_ref: str) -> list[HelmDependency]:
    _require_helm()
    return [HelmDependency(**d) for d in get_chart_dependencies(chart_ref)]
