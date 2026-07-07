from fastapi import APIRouter, HTTPException

from .schemas import (
    ClusterHealth,
    ClusterInfo,
    ClusterMetrics,
    ConfigMapInfo,
    DaemonSetInfo,
    DeploymentInfo,
    EventInfo,
    IngressInfo,
    NamespaceInfo,
    NodeInfo,
    NodeMetric,
    PersistentVolumeClaimInfo,
    PersistentVolumeInfo,
    PodInfo,
    PodMetric,
    SecretInfo,
    ServiceInfo,
    StatefulSetInfo,
    VersionInfo,
)
from .services.cluster_service import get_cluster_info, get_cluster_version
from .services.configmap_service import list_configmaps
from .services.daemonset_service import list_daemonsets
from .services.deployment_service import list_deployments
from .services.event_service import list_events
from .services.health_service import get_kubernetes_health
from .services.ingress_service import list_ingresses
from .services.k8s_service import is_kubernetes_available
from .services.metrics_service import get_cluster_metrics, get_node_metrics, get_pod_metrics
from .services.namespace_service import list_namespaces
from .services.node_service import list_nodes
from .services.pod_service import list_pods
from .services.pvc_service import list_persistent_volume_claims, list_persistent_volumes
from .services.secret_service import list_secrets
from .services.service_service import list_services
from .services.statefulset_service import list_statefulsets

router = APIRouter()


def _require_k8s():
    if not is_kubernetes_available():
        raise HTTPException(
            status_code=503,
            detail=(
                "Kubernetes cluster is not accessible. "
                "Check kubeconfig or in-cluster configuration."
            ),
        )


@router.get("/version")
async def kubernetes_version() -> VersionInfo:
    _require_k8s()
    return VersionInfo(**get_cluster_version())


@router.get("/cluster")
async def kubernetes_cluster() -> ClusterInfo:
    _require_k8s()
    return ClusterInfo(**get_cluster_info())


@router.get("/health")
async def kubernetes_health() -> ClusterHealth:
    return ClusterHealth(**get_kubernetes_health())


@router.get("/nodes")
async def kubernetes_nodes() -> list[NodeInfo]:
    _require_k8s()
    return [NodeInfo(**n) for n in list_nodes()]


@router.get("/namespaces")
async def kubernetes_namespaces() -> list[NamespaceInfo]:
    _require_k8s()
    return [NamespaceInfo(**ns) for ns in list_namespaces()]


@router.get("/pods")
async def kubernetes_pods(namespace: str = "") -> list[PodInfo]:
    _require_k8s()
    return [PodInfo(**p) for p in list_pods(namespace)]


@router.get("/deployments")
async def kubernetes_deployments(namespace: str = "") -> list[DeploymentInfo]:
    _require_k8s()
    return [DeploymentInfo(**d) for d in list_deployments(namespace)]


@router.get("/daemonsets")
async def kubernetes_daemonsets(namespace: str = "") -> list[DaemonSetInfo]:
    _require_k8s()
    return [DaemonSetInfo(**ds) for ds in list_daemonsets(namespace)]


@router.get("/statefulsets")
async def kubernetes_statefulsets(namespace: str = "") -> list[StatefulSetInfo]:
    _require_k8s()
    return [StatefulSetInfo(**s) for s in list_statefulsets(namespace)]


@router.get("/services")
async def kubernetes_services(namespace: str = "") -> list[ServiceInfo]:
    _require_k8s()
    return [ServiceInfo(**s) for s in list_services(namespace)]


@router.get("/ingress")
async def kubernetes_ingress(namespace: str = "") -> list[IngressInfo]:
    _require_k8s()
    return [IngressInfo(**ing) for ing in list_ingresses(namespace)]


@router.get("/configmaps")
async def kubernetes_configmaps(namespace: str = "") -> list[ConfigMapInfo]:
    _require_k8s()
    return [ConfigMapInfo(**cm) for cm in list_configmaps(namespace)]


@router.get("/secrets")
async def kubernetes_secrets(namespace: str = "") -> list[SecretInfo]:
    _require_k8s()
    return [SecretInfo(**sec) for sec in list_secrets(namespace)]


@router.get("/persistentvolumes")
async def kubernetes_persistent_volumes() -> list[PersistentVolumeInfo]:
    _require_k8s()
    return [PersistentVolumeInfo(**pv) for pv in list_persistent_volumes()]


@router.get("/persistentvolumeclaims")
async def kubernetes_persistent_volume_claims(
    namespace: str = "",
) -> list[PersistentVolumeClaimInfo]:
    _require_k8s()
    return [PersistentVolumeClaimInfo(**pvc) for pvc in list_persistent_volume_claims(namespace)]


@router.get("/events")
async def kubernetes_events(namespace: str = "", limit: int = 100) -> list[EventInfo]:
    _require_k8s()
    return [EventInfo(**ev) for ev in list_events(namespace, limit)]


@router.get("/metrics/pods")
async def kubernetes_pod_metrics(namespace: str = "") -> list[PodMetric]:
    _require_k8s()
    return [PodMetric(**m) for m in get_pod_metrics(namespace)]


@router.get("/metrics/nodes")
async def kubernetes_node_metrics() -> list[NodeMetric]:
    _require_k8s()
    return [NodeMetric(**m) for m in get_node_metrics()]


@router.get("/metrics")
async def kubernetes_metrics() -> ClusterMetrics:
    _require_k8s()
    return ClusterMetrics(**get_cluster_metrics())
