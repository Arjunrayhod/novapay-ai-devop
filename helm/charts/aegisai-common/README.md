# aegisai-common

AegisAI enterprise shared Helm chart providing reusable Kubernetes resource templates, standard labels, annotations, and production-hardened defaults for all platform services.

## Version

- **Chart version:** 0.1.0
- **App version:** 0.1.0
- **Kubernetes:** >= 1.30.0
- **Helm:** >= 3.16

## Usage

Add as a dependency in your service chart's `Chart.yaml`:

```yaml
dependencies:
  - name: aegisai-common
    version: 0.1.0
    repository: file://../aegisai-common
```

Then run:

```bash
helm dependency update
helm template <release-name> . --namespace <namespace>
```

## Templates

| Template | Resource | Description |
|----------|----------|-------------|
| `deployment.yaml` | Deployment | Production-ready Deployment with probes, securityContext, affinity, topology spread, anti-affinity |
| `service.yaml` | Service | Service with configurable type, ports, session affinity, LB settings |
| `configmap.yaml` | ConfigMap | Optional ConfigMap with runtime mounting support |
| `serviceaccount.yaml` | ServiceAccount | Optional SA with IRSA annotations support |
| `hpa.yaml` | HorizontalPodAutoscaler | Optional HPA with CPU/memory or custom metrics |
| `pdb.yaml` | PodDisruptionBudget | PDB for HA with minAvailable or maxUnavailable |

## Helpers

| Helper | Description |
|--------|-------------|
| `aegisai-common.name` | Component name (Chart.Name or nameOverride) |
| `aegisai-common.fullname` | Fully qualified name (Release.Name + Chart.Name) |
| `aegisai-common.labels` | Standard Kubernetes recommended labels + AegisAI platform labels |
| `aegisai-common.selectorLabels` | Pod selector labels (immutable after creation) |
| `aegisai-common.annotations` | Standard AegisAI annotations |
| `aegisai-common.image` | Full container image reference |
| `aegisai-common.namespace` | Release namespace |
| `aegisai-common.serviceAccountName` | Service account name |
| `aegisai-common.configmapName` | ConfigMap name |

## Standard Labels

Every resource receives these labels:

| Label | Source |
|-------|--------|
| `helm.sh/chart` | Chart.Name + Chart.Version |
| `app.kubernetes.io/name` | Chart.Name |
| `app.kubernetes.io/instance` | Release.Name |
| `app.kubernetes.io/version` | Chart.AppVersion |
| `app.kubernetes.io/component` | values.component |
| `app.kubernetes.io/part-of` | values.partOf |
| `app.kubernetes.io/managed-by` | Helm |
| `aegisai.io/environment` | values.global.environment |
| `aegisai.io/tier` | values.global.tier |
| `aegisai.io/data-classification` | values.global.dataClassification |
| `aegisai.io/owner` | values.global.owner |
| `aegisai.io/cost-center` | values.global.costCenter |

## Standard Annotations

| Annotation | Source |
|------------|--------|
| `aegisai.io/environment` | values.global.environment |
| `aegisai.io/owner` | values.global.owner |
| `aegisai.io/cost-center` | values.global.costCenter |
| `aegisai.io/data-classification` | values.global.dataClassification |
| `aegisai.io/compliance-frameworks` | Always `pci-dss,soc2,rbi` |

## Production Defaults

- **Security:** runAsNonRoot, readOnlyRootFilesystem, drop ALL capabilities, seccomp RuntimeDefault
- **Resilience:** PodAntiAffinity, TopologySpreadConstraints, PDB (minAvailable: 1)
- **Observability:** liveness, readiness, startup probes on /healthz, /readyz, /startupz
- **Probes:** PreStop sleep for graceful shutdown
- **Downward API:** POD_NAME, POD_NAMESPACE, NODE_NAME env vars injected automatically
- **Scaling:** HPA ready with CPU at 70%, memory at 80% utilization targets

## Values

| Parameter | Default | Description |
|-----------|---------|-------------|
| `global.environment` | `dev` | Deployment environment (dev, staging, prod) |
| `global.tier` | `platform` | Namespace tier label |
| `global.dataClassification` | `internal` | Data sensitivity classification |
| `global.owner` | `platform-engineering` | Owning team |
| `global.costCenter` | `platform` | Cost allocation center |
| `image.repository` | `""` | Container image repository |
| `image.tag` | `""` | Container image tag (defaults to vAppVersion) |
| `image.pullPolicy` | `IfNotPresent` | Image pull policy |
| `service.type` | `ClusterIP` | Kubernetes service type |
| `service.ports` | `[{name: http, port: 80, targetPort: http, protocol: TCP}]` | Service ports |
| `deployment.replicas` | `2` | Number of replicas |
| `deployment.strategy` | `RollingUpdate` with maxSurge=1, maxUnavailable=0 | Update strategy |
| `deployment.resources.requests.cpu` | `100m` | CPU request |
| `deployment.resources.requests.memory` | `128Mi` | Memory request |
| `deployment.resources.limits.cpu` | `500m` | CPU limit |
| `deployment.resources.limits.memory` | `256Mi` | Memory limit |
| `hpa.enabled` | `false` | Enable HorizontalPodAutoscaler |
| `pdb.enabled` | `true` | Enable PodDisruptionBudget |
| `configmap.enabled` | `true` | Enable ConfigMap creation |
| `serviceAccount.enabled` | `true` | Enable ServiceAccount creation |

See [values.yaml](values.yaml) for the full parameter reference.
