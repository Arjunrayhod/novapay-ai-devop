# Security Framework

RBAC, ServiceAccount strategy, Pod Security Admission, and secrets management for the AegisAI platform.

## RBAC Framework

### Architecture

RBAC is organized into four domain tiers with aggregation for admin-level roles:

| Domain | Admin (aggregated) | Sub-roles | Edit | View |
|--------|-------------------|-----------|------|------|
| **Platform** | `aegisai:platform:admin` | `core-admin`, `security:admin`, `observability:admin` | `aegisai:platform:edit` | `aegisai:platform:view` |
| **Namespace** | `aegisai:namespace:admin` | `workload-admin`, `config-admin`, `rbac-admin` | `aegisai:namespace:edit` | `aegisai:namespace:view` |

### Aggregation Strategy

Admin ClusterRoles use `aggregationRule` with custom labels — not K8s built-in `aggregate-to-admin/edit/view`:

```yaml
aggregationRule:
  clusterRoleSelectors:
    - matchLabels:
        aegisai.io/rbac-aggregate: platform-admin  # or namespace-admin
rules: []
```

Sub-roles carry the matching label and opt in to the admin aggregate:
- `aegisai.io/rbac-aggregate: platform-admin` → aggregated into `aegisai:platform:admin`
- `aegisai.io/rbac-aggregate: namespace-admin` → aggregated into `aegisai:namespace:admin`

### ClusterRole Inventory (12 roles)

| Role | Tier | Aggregated Into | Scope |
|------|------|----------------|-------|
| `aegisai:platform:admin` | platform | — (aggregator) | Cluster-wide: nodes, PVs, storage, security, observability |
| `aegisai:platform:core-admin` | platform | platform:admin | Nodes, PVs, storageclasses, priorityclasses, runtimeclasses, ingressclasses, nonResourceURLs |
| `aegisai:security:admin` | security | platform:admin | ClusterRoles/RoleBindings (bind+escalate), SAs, auth reviews |
| `aegisai:observability:admin` | observability | platform:admin | Events, pods/log, configmaps (read), metrics.k8s.io, CRDs |
| `aegisai:platform:edit` | platform | — | Read cluster-scoped + coordination leases + nonResourceURLs |
| `aegisai:platform:view` | platform | — | Read cluster-scoped + events + nonResourceURLs |
| `aegisai:namespace:admin` | namespace | — (aggregator) | Full namespace: workloads, config, RBAC |
| `aegisai:namespace:workload-admin` | namespace | namespace:admin | Pods, deployments, services, HPA, PDB |
| `aegisai:namespace:config-admin` | namespace | namespace:admin | Secrets, configmaps, serviceaccounts |
| `aegisai:namespace:rbac-admin` | namespace | namespace:admin | Roles, rolebindings (bind+escalate) |
| `aegisai:namespace:edit` | namespace | — | Full CRUD workload resources in namespace |
| `aegisai:namespace:view` | namespace | — | Read-only workload resources in namespace |

### ClusterRoleBindings

| Binding | ClusterRole | Subjects |
|---------|------------|----------|
| `aegisai:platform:admin-bind` | `aegisai:platform:admin` | `aegisai:platform-admins` group, `aegisai-platform-admin` SA |
| `aegisai:platform:edit-bind` | `aegisai:platform:edit` | `aegisai:platform-editors` group, `aegisai-platform-operator` SA |
| `aegisai:platform:view-bind` | `aegisai:platform:view` | `aegisai:platform-viewers` group, `aegisai-readonly` SA |

### Namespace RoleBindings

Every application namespace (system-security, system-istio, system-observability, team-*) receives three RoleBindings mapping `aegisai:namespace:{admin,edit,view}` to the appropriate SAs and groups. See `rbac/namespace-bindings.yaml`.

### ServiceAccount Strategy

| SA Pattern | Usage | Bound To |
|-----------|-------|----------|
| `{workload}-sa` | Workload identity | Deployments, StatefulSets |
| `{platform}-controller` | Platform operators | Operator deployments |
| `{team}-pipeline` | CI/CD | GitHub Actions (IRSA) |

### IRSA (IAM Roles for ServiceAccounts)
Maps Terraform IAM roles → Kubernetes ServiceAccounts:
```
terraform/modules/iam                                     kubernetes/
├── platform_admin_role       ──── IRSA ────►             ├── security/service-accounts/admin-sa.yaml
├── platform_operator_role    ──── IRSA ────►             ├── security/service-accounts/operator-sa.yaml
├── cicd_role                 ──── IRSA ────►             ├── security/service-accounts/cicd-sa.yaml
└── readonly_role             ──── IRSA ────►             └── security/service-accounts/readonly-sa.yaml
```

## Pod Security Admission

| PSA Level | Namespace Tiers | Enforcement Mode |
|-----------|----------------|------------------|
| `privileged` | system, platform-istio | `audit` + `warn` only |
| `baseline` | team, shared, addons | `enforce` |
| `restricted` | user workloads (future) | `enforce` |

Applied via namespace labels:
```yaml
apiVersion: v1
kind: Namespace
metadata:
  labels:
    pod-security.kubernetes.io/enforce: baseline
    pod-security.kubernetes.io/enforce-version: latest
```

## Secrets Management

Current: Kubernetes Secrets (static, for platform bootstrap)
Future: External Secrets Operator with AWS Secrets Manager / Parameter Store

```
Current:
  Kubernetes Secret ───► Mounted as env/volume

Future (ESO):
  AWS Secrets Manager ───► ExternalSecret CR ───► Kubernetes Secret
  AWS Parameter Store ───► ExternalSecret CR ───► Kubernetes Secret
```

## Encryption

- Etcd encryption at rest via AWS KMS (configured in EKS cluster Terraform)
- Secrets encrypted in transit via TLS
- Future: envelope encryption with customer-managed KMS keys

## Directory

```
security/
├── README.md
├── kustomization.yaml
├── rbac/
│   ├── cluster-roles.yaml           # ClusterRole definitions (12 roles)
│   ├── cluster-role-bindings.yaml   # ClusterRoleBindings (platform scope)
│   └── namespace-bindings.yaml      # Namespace-scoped RoleBindings
├── service-accounts/
│   ├── platform-admin-sa.yaml
│   ├── platform-operator-sa.yaml
│   ├── cicd-sa.yaml
│   └── readonly-sa.yaml
└── pod-security/
    └── psa-labels.yaml              # PSA label reference
```
