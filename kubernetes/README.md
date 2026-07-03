# AegisAI Enterprise Kubernetes Platform

## Platform Architecture

```
┌──────────────────────────────────────────────────────────────────────────┐
│                        GITOPS (Flux / Argo CD)                           │
│               ┌──────────────────┐  ┌──────────────────┐                 │
│               │   App Repos      │  │  Platform Repo   │                 │
│               └────────┬─────────┘  └────────┬─────────┘                 │
│                        │                      │                           │
│                        ▼                      ▼                           │
│               ┌──────────────────────────────────────────┐                │
│               │          Kustomize Overlays               │               │
│               │  dev/  │  staging/  │  prod/              │               │
│               └────────────────────┬─────────────────────┘                │
│                                     │                                      │
│               ┌─────────────────────▼─────────────────────┐                │
│               │           EKS Cluster (AWS)                │               │
│               │  ┌──────────────────────────────────────┐  │               │
│               │  │        Platform Layer                 │  │               │
│               │  │  ┌──────┐ ┌──────┐ ┌────────┐       │  │               │
│               │  │  │Ingress│ │Cert- │ │External│       │  │               │
│               │  │  │ Nginx │ │Mngr  │ │  DNS   │       │  │               │
│               │  │  └──────┘ └──────┘ └────────┘       │  │               │
│               │  │  ┌──────────┐ ┌─────────────────┐    │  │               │
│               │  │  │Istio     │ │Metrics Server   │    │  │               │
│               │  │  │(future)  │ │+ VPA/CA         │    │  │               │
│               │  │  └──────────┘ └─────────────────┘    │  │               │
│               │  └──────────────────────────────────────┘  │               │
│               │  ┌──────────────────────────────────────┐  │               │
│               │  │        Security Layer                 │  │               │
│               │  │  RBAC │ PSA │ NetPol │ OPA/Gatekeeper│  │               │
│               │  └──────────────────────────────────────┘  │               │
│               │  ┌──────────────────────────────────────┐  │               │
│               │  │        Observability Layer            │  │               │
│               │  │  Prometheus │ Loki │ Tempo │ Grafana │  │               │
│               │  └──────────────────────────────────────┘  │               │
│               │  ┌──────────────────────────────────────┐  │               │
│               │  │        Storage Layer                  │  │               │
│               │  │  EBS CSI │ EFS CSI │ StorageClasses  │  │               │
│               │  └──────────────────────────────────────┘  │               │
│               └─────────────────────────────────────────────┘               │
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                       Workload Namespaces                             │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │  │
│  │  │  Team-A  │ │  Team-B  │ │  Team-C  │ │  Shared  │ │  System  │   │  │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘   │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────┘
```

## Namespace Model

| Tier | Namespace Pattern | Quota | PSA | Network Policy |
|------|------------------|-------|-----|----------------|
| Platform | `aegisai-platform-*` | High | Privileged / Baseline | Allow ingress from cluster |
| Team | `aegisai-{team}-*` | Medium | Baseline | Isolated by team |
| Shared | `aegisai-shared-*` | Medium | Baseline | Allow inter-team |
| System | `aegisai-system-*` | High | Privileged | Restricted to admin |
| Addons | `aegisai-addon-*` | Medium | Baseline | Egress only |

### Naming Convention
```
aegisai-{tier}-{workload}-{environment}
```
Example: `aegisai-platform-ingress-nginx-prod`

## Security Model

### Pod Security Admission (PSA)
| Level | Namespace Types | Enforcement |
|-------|----------------|-------------|
| `privileged` | system, platform-istio | `audit` + `warn` |
| `baseline` | team, shared, addons | `enforce` |
| `restricted` | user workloads (future) | `enforce` |

### RBAC Framework
```
ClusterRole/ │ Role/            │ RoleBinding/     │ ServiceAccount
ClusterRoleBinding              │ ClusterRoleBinding│
──────────────┼─────────────────┼──────────────────┼─────────────
platform:admin│ cluster-wide    │ per-NS binding   │ platform
platform:edit │ per-namespace   │ per-NS binding   │ team-member
platform:view │ per-namespace   │ per-NS binding   │ viewer
```

### Network Policy Defaults
| Direction | Default Action | Exceptions |
|-----------|---------------|------------|
| Ingress | Deny all | Platform NS, monitoring |
| Egress | Deny all | DNS (udp 53), HTTP(S) proxy |
| Inter-namespace | Deny by default | Explicit allow-list |

## Kustomize Strategy

```
kubernetes/
├── base/                          # Shared base configurations
│   ├── common-labels.yaml         #   aegisai.io/* labels
│   ├── common-annotations.yaml    #   Terraform integration annotations
│   └── kustomization.yaml         #   Base kustomization
│
├── namespaces/                    # Namespace definitions
├── security/                      # RBAC, PSA, ServiceAccounts
├── policies/                      # NetworkPolicies, OPA
├── storage/                       # StorageClasses, CSI
├── networking/                    # IngressClasses, CNI
├── observability/                 # Monitoring, logging, tracing
│
├── platform/                      # Platform operators (one dir each)
│   ├── ingress-nginx/
│   ├── cert-manager/
│   ├── external-dns/
│   └── metrics-server/
│
├── addons/                        # Optional addons
│   ├── vpa/
│   └── cluster-autoscaler/
│
├── envs/                          # Environment overlays
│   ├── base/                      #   Common overlay patches
│   ├── dev/                       #   Dev overrides
│   ├── staging/                   #   Staging overrides
│   └── prod/                      #   Prod overrides
│
└── tests/                         # Conformance + validation
```

### Overlay Inheritance
```
envs/dev/kustomization.yaml
  ├── resources:
  │   ├── ../../base
  │   ├── ../../namespaces
  │   ├── ../../security
  │   ├── ../../policies
  │   ├── ../../storage
  │   ├── ../../networking
  │   ├── ../../platform
  │   └── ../../observability
  └── patches:
      └── dev/patches/*.yaml
```

## Terraform Integration

| Terraform Module | Kubernetes Integration |
|-----------------|----------------------|
| `terraform/modules/network` | Subnet IDs → node groups, VPC CIDR → NetworkPolicies, Flow Logs audit |
| `terraform/modules/iam` | OIDC provider → IRSA, IAM roles → kube2iam/kiam |
| `terraform/modules/governance` | Tags → propagated to k8s resources, Compliance → PSA levels |

### Tag Propagation
Terraform governance tags propagate to Kubernetes resources via annotations:
```yaml
metadata:
  annotations:
    aegisai.io/environment: "${environment}"
    aegisai.io/cost-center: "${cost_center}"
    aegisai.io/data-classification: "${data_classification}"
    aegisai.io/compliance-frameworks: "${compliance_frameworks}"
```

## Future GitOps Plan

### Phase 1: Monorepo (Current)
```
kubernetes/  ← Platform team PRs
├── base/
├── platform/
├── envs/
└── tests/
```

### Phase 2: GitOps Integration (Flux/Argo CD)
```yaml
# apps/team-a/kustomization.yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
resources:
  - github.com/aegisai/platform/kubernetes/envs/prod
  - deployment.yaml
  - service.yaml
```

### Phase 3: Multi-Repo (Scale)
```
aegisai-platform/        ← This repo (infra + platform k8s)
aegisai-gitops-config/   ← Flux/Argo CD bootstrap + app-of-apps
aegisai-team-a-apps/     ← Team A workload repos
aegisai-team-b-apps/     ← Team B workload repos
```

## Future Helm Integration

Helm charts are consumed via Kustomize `helmChartInflationGenerator` or `helm template`:

```yaml
# For operators requiring Helm (e.g., ingress-nginx, cert-manager):
# Generate with: helm template ... > generated.yaml
# Or use flux-helm-controller / argocd-helm for live reconciliation
```

## Future Istio Integration

Istio will be added as a platform component in a future epic:
- `platform/istio/` — IstioOperator CR, ingress gateways
- `networking/virtual-services/` — VirtualService templates
- `security/authorization-policies/` — AuthorizationPolicy templates
- Mesh federation between VPCs via TGW + Istio multi-cluster

## CNCF Alignment

| Capability | CNCF Project | Status |
|-----------|-------------|--------|
| Service Mesh | Istio | 🔜 Future |
| Observability | Prometheus + Grafana + Loki + Tempo | 🔲 Config |
| Ingress | ingress-nginx | 🔲 Config |
| Certificate Mgmt | cert-manager | 🔲 Config |
| Policy Engine | OPA Gatekeeper / Kyverno | 🔜 Future |
| Service Discovery | CoreDNS | ✅ Built-in |
| Storage | EBS CSI + EFS CSI | 🔲 Config |
| Secret Mgmt | External Secrets Operator | 🔜 Future |
| GitOps | Flux / Argo CD | 🔜 Future |
