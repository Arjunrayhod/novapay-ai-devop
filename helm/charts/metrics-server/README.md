# metrics-server

Metrics Server is a scalable, efficient source of container resource metrics for Kubernetes
built-in autoscaling pipelines. This chart wraps `aegisai-common` for standard AegisAI platform
conventions.

## Version

- **Chart version:** 0.1.0
- **App version:** 0.7.2 (metrics-server)
- **Kubernetes:** >= 1.30.0
- **Helm:** >= 3.16

## Installation

```bash
# Dev
helm install metrics-server . \
  --namespace aegisai-platform-metrics-server \
  --create-namespace \
  --values values-dev.yaml

# Staging
helm install metrics-server . \
  --namespace aegisai-platform-metrics-server \
  --create-namespace \
  --values values-staging.yaml

# Production
helm install metrics-server . \
  --namespace aegisai-platform-metrics-server \
  --create-namespace \
  --values values-prod.yaml
```

## Upgrade

```bash
helm upgrade metrics-server . \
  --namespace aegisai-platform-metrics-server \
  --values values-prod.yaml
```

## Rollback

```bash
helm rollback metrics-server <revision> \
  --namespace aegisai-platform-metrics-server
```

## Uninstall

```bash
helm uninstall metrics-server \
  --namespace aegisai-platform-metrics-server
```

## Templates

| Template | Resource | Provided By |
|----------|----------|-------------|
| `deployment.yaml` | Deployment | aegisai-common |
| `service.yaml` | Service | aegisai-common |
| `serviceaccount.yaml` | ServiceAccount | aegisai-common |
| `pdb.yaml` | PodDisruptionBudget | aegisai-common |
| `clusterrole.yaml` | ClusterRole | this chart |
| `clusterrolebinding.yaml` | ClusterRoleBinding | this chart |
| `apiservice.yaml` | APIService | this chart |

## Configuration

### Global

| Parameter | Default | Description |
|-----------|---------|-------------|
| `global.environment` | `dev` | Deployment environment |
| `global.tier` | `platform` | Namespace tier label |
| `global.owner` | `platform-kubernetes` | Owning team |

### Subchart (aegisai-common)

See [aegisai-common README](../aegisai-common/README.md) for all available parameters.
Key overrides for metrics-server:

| Parameter | Default | Description |
|-----------|---------|-------------|
| `aegisai-common.image.repository` | `registry.k8s.io/metrics-server/metrics-server` | Container image |
| `aegisai-common.image.tag` | `v0.7.2` | Image tag |
| `aegisai-common.deployment.replicas` | `2` | Number of replicas |
| `aegisai-common.deployment.args` | `["--kubelet-preferred-address-types=InternalIP", "--kubelet-insecure-tls", "--cert-dir=/tmp/certs", "--metric-resolution=15s"]` | Container args |
| `aegisai-common.service.ports[0].port` | `443` | Service port (HTTPS) |
| `aegisai-common.service.ports[0].targetPort` | `https` | Container port name |
| `aegisai-common.configmap.enabled` | `false` | ConfigMap disabled (not needed) |

## Environment Differences

| Setting | Dev | Staging | Prod |
|---------|-----|---------|------|
| Replicas | 1 | 2 | 3 |
| CPU request | 50m | 100m | 150m |
| Memory request | 100Mi | 200Mi | 250Mi |
| CPU limit | 100m | 200m | 300m |
| Memory limit | 200Mi | 300Mi | 400Mi |
| `--kubelet-insecure-tls` | true | false | false |

## RBAC

| ClusterRole | Reason |
|-------------|--------|
| `nodes`, `nodes/metrics`, `nodes/stats` | Scrape kubelet metrics |
| `pods`, `namespaces` | Resource discovery |
| `metrics.k8s.io` | Serve the resource metrics API |
| `verticalpodautoscalers` | VPA compatibility |
| nonResourceURLs `/metrics`, `/livez`, `/readyz` | Self-monitoring |
