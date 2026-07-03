# Namespace Strategy

AegisAI uses a tiered namespace model based on workload type, security requirements, and team boundaries.

## Namespace Tiers

| Tier | Pattern | Example | Quota Profile | PSA | Network Policy |
|------|---------|---------|---------------|-----|----------------|
| Platform | `aegisai-platform-*` | `aegisai-platform-ingress-nginx` | Platform | Privileged | Allow cluster ingress |
| Team | `aegisai-team-*` | `aegisai-team-novapay` | Team | Baseline | Isolated per team |
| System (Security) | `aegisai-system-security` | `aegisai-system-security` | Security | Privileged | Admin only |
| System (Observability) | `aegisai-system-observability` | `aegisai-system-observability` | Observability | Baseline | Allow ingress |
| System (Istio) | `aegisai-system-istio` | `aegisai-system-istio` | Platform | Privileged | Admin only |
| Addon | `aegisai-addon-*` | `aegisai-addon-vpa` | Addon | Baseline | Egress only |

## Naming Convention

```
aegisai-{tier}-{workload}-{environment}
```

Where:
- `tier` = platform | team | system | addon
- `workload` = descriptive name (ingress-nginx, novapay, security, vpa)
- `environment` = dev | staging | prod (omitted for cluster-wide resources)

## Resource Governance

Five quota profiles and five limit range profiles provide tier-appropriate resource controls.

### ResourceQuota Profiles

| Profile | Pods | CPU req | Mem req | CPU lim | Mem lim | ConfigMaps | Secrets | PVC | Services |
|---------|------|---------|---------|---------|---------|------------|---------|-----|----------|
| Platform | 200 | 32 | 128Gi | 64 | 256Gi | 50 | 50 | 20 | 20 |
| Team | 50 | 8 | 32Gi | 16 | 64Gi | 20 | 20 | 10 | 10 |
| Security | 30 | 4 | 16Gi | 8 | 32Gi | 20 | 50 | — | 10 |
| Observability | 50 | 16 | 64Gi | 32 | 128Gi | 30 | 20 | 10 | 15 |
| Addon | 20 | 4 | 16Gi | 8 | 32Gi | 10 | 10 | — | 5 |

**Namespace-to-Quota mapping:**

| Namespace | Quota Profile | Rationale |
|-----------|--------------|-----------|
| `aegisai-platform-ingress-nginx` | Platform | High-throughput ingress controller |
| `aegisai-platform-cert-manager` | Platform | Certificate signing under load |
| `aegisai-platform-metrics-server` | Platform | Cluster-wide metrics aggregation |
| `aegisai-platform-external-dns` | Platform | DNS control plane |
| `aegisai-system-security` | Security | Security controllers, SA token volume |
| `aegisai-system-istio` | Platform | Service mesh control plane (high resource) |
| `aegisai-system-observability` | Observability | Prometheus, Loki, Grafana storage |
| `aegisai-team-novapay` | Team | Team workload |
| `aegisai-team-paysecure` | Team | Team workload |
| `aegisai-team-lendflow` | Team | Team workload |
| `aegisai-team-finserv` | Team | Team workload |

### LimitRange Profiles

| Profile | Default CPU | Default Mem | DefaultReq CPU | DefaultReq Mem | Max CPU | Max Mem | Min CPU | Min Mem |
|---------|-------------|-------------|----------------|----------------|---------|---------|---------|---------|
| Platform | 500m | 512Mi | 100m | 256Mi | 8 | 32Gi | 10m | 32Mi |
| Team | 200m | 256Mi | 50m | 128Mi | 4 | 8Gi | 10m | 32Mi |
| Security | 200m | 256Mi | 50m | 128Mi | 2 | 4Gi | 10m | 32Mi |
| Observability | 500m | 1Gi | 200m | 512Mi | 8 | 16Gi | 10m | 32Mi |
| Addon | 100m | 128Mi | 25m | 64Mi | 2 | 4Gi | 10m | 32Mi |

### PriorityClass Strategy

Six PriorityClasses define the scheduling hierarchy:

| PriorityClass | Value | Default | Preempts | Preempted By | Target Workloads |
|--------------|-------|---------|----------|--------------|------------------|
| `aegisai-platform-critical` | 10000 | No | All below | — | Ingress controller, cert-manager, external-dns, cluster-autoscaler |
| `aegisai-security-critical` | 9000 | No | All below | platform-critical | OPA/Gatekeeper, Falco, auth proxies |
| `aegisai-observability-critical` | 8000 | No | All below | platform-critical, security-critical | Prometheus, Grafana, Loki, Alertmanager |
| `aegisai-application-high` | 1000 | No | normal, batch | All critical tiers | API gateways, payment processors, real-time services |
| `aegisai-application-normal` | 0 | **Yes** | batch | All above | Standard stateless workloads |
| `aegisai-batch-low` | -100 | No | — | All above | CI runners, data pipelines, batch jobs |

**Preemption chain:** batch-low < application-normal < application-high < observability-critical < security-critical < platform-critical

### QoS Strategy

Kubernetes QoS classes are determined by container resource spec:

| QoS Class | Spec Pattern | Preemptibility | Use Case |
|-----------|-------------|----------------|----------|
| **Guaranteed** | `requests == limits` for all resources | Never preempted | Platform-critical, security-critical, observability-critical — pods must have equal requests and limits |
| **Burstable** | `requests < limits` or only requests set | Preempted after Guaranteed | Application workloads with predictable baselines and burst capacity. Default for team namespaces |
| **BestEffort** | No requests or limits set | First to be preempted | Batch jobs, CI runners, development workloads. Must use `aegisai-batch-low` PriorityClass |

**Guidelines:**

1. **Guaranteed:** All platform, security, and observability critical workloads MUST use Guaranteed QoS. Set `resources.requests` equal to `resources.limits` for both CPU and memory.
2. **Burstable:** Team workloads SHOULD use Burstable QoS. Set `resources.requests` at baseline usage and `resources.limits` at maximum allowed burst.
3. **BestEffort:** BestEffort pods MUST use `aegisai-batch-low` PriorityClass. These pods must tolerate preemption and restart.
4. **Resource audits:** Scheduled validation must flag any pod running BestEffort without `aegisai-batch-low` PriorityClass.

### Capacity Planning Guidance

**Per-node allocation budget (example: 8 CPU / 32 Gi node):**

| Reserve For | CPU | Memory | Notes |
|-------------|-----|--------|-------|
| OS + kubelet | 1 | 4Gi | ~10-15% of node capacity |
| Platform critical | 3 | 12Gi | 5x platform-critical pods |
| Security critical | 1 | 4Gi | 2x security-critical pods |
| Observability critical | 1 | 4Gi | 2x observability-critical pods |
| Buffer (unallocated) | 2 | 8Gi | Cluster autoscaler headroom, node pressure relief |

**Cluster-level budget (example: 5-node cluster, 40 CPU / 160 Gi):**

| Tier | CPU Budget | Memory Budget | % of Cluster |
|------|-----------|---------------|-------------|
| Platform reservable | 15 | 60Gi | 37.5% |
| System reservable | 10 | 40Gi | 25% |
| Team reservable | 10 | 40Gi | 25% |
| Buffer | 5 | 20Gi | 12.5% |

**Quota sizing rules:**
- Team quotas should sum to ≤ 70% of cluster allocatable CPU/memory (leaving room for platform + scaling)
- Platform quota sum should be ≤ 40% of cluster (platform components scale with workloads)
- No single namespace should consume > 30% of cluster allocatable capacity
- Quota reviews triggered when namespace utilization reaches 80% of hard limit for 7 consecutive days

## Directory Structure

```
namespaces/
├── README.md
├── kustomization.yaml
├── resource-quotas/                   # ResourceQuota templates per tier
│   ├── quota-platform.yaml            # 200 pods, 32 CPU, 128Gi
│   ├── quota-team.yaml                # 50 pods, 8 CPU, 32Gi
│   ├── quota-addon.yaml               # 20 pods, 4 CPU, 16Gi
│   ├── quota-security.yaml            # 30 pods, 4 CPU, 16Gi, 50 secrets
│   └── quota-observability.yaml       # 50 pods, 16 CPU, 64Gi, 10 PVCs
├── limit-ranges/                      # LimitRange templates per tier
│   ├── limits-platform.yaml           # default 500m/512Mi, max 8/32Gi
│   ├── limits-team.yaml               # default 200m/256Mi, max 4/8Gi
│   ├── limits-addon.yaml              # default 100m/128Mi, max 2/4Gi
│   ├── limits-security.yaml           # default 200m/256Mi, max 2/4Gi
│   └── limits-observability.yaml      # default 500m/1Gi, max 8/16Gi
```

> PriorityClasses are defined in `policies/priority-classes/`.

## Terraform Integration

Namespace metadata derives from Terraform governance module:

```yaml
metadata:
  labels:
    aegisai.io/environment: "${var.environment}"
    aegisai.io/cost-center: "${var.cost_center}"
    aegisai.io/data-classification: "${var.data_classification}"
  annotations:
    aegisai.io/owner: "${var.owner}"
    aegisai.io/workload-type: "${var.workload_type}"
    aegisai.io/resource-criticality: "${var.resource_criticality}"
```
