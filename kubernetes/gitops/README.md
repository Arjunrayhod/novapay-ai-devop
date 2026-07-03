# GitOps Repository Layout

## Directory Structure

```
kubernetes/gitops/
├── argocd/                          # ArgoCD installation (kustomize + upstream base)
│   ├── kustomization.yaml
│   ├── argocd-cm.yaml               # Global ArgoCD configuration
│   ├── argocd-rbac-cm.yaml          # RBAC policies
│   └── namespace-patch.yaml         # argocd namespace labels
├── appsets/                         # ApplicationSets (dynamic app generation)
│   ├── kustomization.yaml
│   ├── cluster-generator.yaml       # Per-cluster Application generation
│   ├── git-generator.yaml           # Per-directory + SCM provider generation
│   └── matrix-generator.yaml        # Combined cluster × git generation
├── projects/                        # ArgoCD AppProjects
│   ├── kustomization.yaml
│   └── platform.yaml                # Platform-wide project with sync windows
├── applications/                    # App of Apps definitions
│   ├── kustomization.yaml
│   ├── applications.yaml           # Root Application (App of Apps)
│   ├── cert-manager.yaml           # Cert-manager platform app
│   ├── external-dns.yaml           # ExternalDNS platform app
│   ├── external-secrets.yaml       # External Secrets platform app
│   ├── ingress-nginx.yaml          # Ingress NGINX platform app
│   ├── metrics-server.yaml         # Metrics Server platform app
│   └── environments/               # Environment-specific Applications
│       ├── dev.yaml
│       ├── staging.yaml
│       └── prod.yaml
├── rollouts/                        # Argo Rollouts (progressive delivery)
│   ├── kustomization.yaml
│   ├── install/                    # Rollouts controller installation
│   ├── analysis/                   # AnalysisTemplates (Prometheus)
│   │   ├── error-rate.yaml
│   │   ├── latency.yaml
│   │   └── success-rate.yaml
│   └── strategies/                 # Rollout strategy templates
│       ├── canary.yaml
│       └── blue-green.yaml
├── notifications/                  # ArgoCD Notifications
│   ├── kustomization.yaml
│   ├── argocd-notifications-cm.yaml  # Slack + Email templates
│   └── argocd-notifications-secret.yaml
├── hooks/                          # Sync hooks (PreSync, Sync, PostSync)
│   ├── kustomization.yaml
│   ├── presync/                    # Database migration hook
│   ├── sync/                       # Data seed hook
│   └── postsync/                   # Smoke test hook
├── clusters/                        # Cluster definitions
│   ├── kustomization.yaml
│   ├── platform-cluster.yaml        # In-cluster destination
│   ├── staging-cluster.yaml         # Staging cluster
│   └── prod-cluster.yaml           # Production cluster
├── base/                            # Shared base configurations
│   ├── kustomization.yaml
│   └── repo-creds.yaml              # Repository credentials template
├── environments/                    # Environment overlays
│   ├── kustomization.yaml
│   ├── base/                        # Shared environment base
│   ├── dev/                         # Development environment
│   ├── staging/                     # Staging environment
│   └── prod/                        # Production environment
├── runbooks/                        # Production runbooks
│   ├── kustomization.yaml
│   ├── incident-response.yaml       # Incident response procedures
│   └── rollback-procedure.yaml      # Rollback procedures
├── docs/                            # GitOps documentation
│   ├── kustomization.yaml
│   ├── disaster-recovery.yaml       # DR scenarios and procedures
│   ├── backup-restore.yaml          # Backup & restore procedures
│   ├── repository-failover.yaml     # Repository failover strategy
│   ├── validation.yaml              # Validation pipeline documentation
│   └── architecture.yaml           # Architecture diagrams and decisions
├── bootstrap/                       # Bootstrap manifests
│   ├── kustomization.yaml
│   └── root.yaml                    # Bootstrap root Application
├── kustomization.yaml              # Root kustomization
└── README.md                       # This file
```

## Architecture Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| GitOps tool | ArgoCD v2.12.0 | Declarative, Kubernetes-native, mature multi-cluster support |
| Installation method | Kustomize remote base | Upstream manifests pinned, patched via strategic merge |
| App management | App of Apps + ApplicationSets | Hybrid: static apps + dynamic generation per cluster/directory/matrix |
| Project model | Single platform + per-environment | Platform-wide infra in `platform`, workload isolation in env projects |
| Sync strategy | Automated + SelfHeal (non-prod), Manual (prod) | Safety gates for production, agility for dev/staging |
| RBAC model | RBAC ConfigMap + CSV + Project Roles | Role-based access with scoped policies |
| Secrets | External Secrets Operator | Repo creds template in base, actual values injected at deploy time |
| Sync Windows | Project-level allow/deny with freezes | Prevent production syncs during business hours and holiday freezes |
| Sync Waves | Application annotations | Ordered rollout: wave -2 (creds) to 10 (PostSync hooks) |
| Progressive Delivery | Argo Rollouts v1.7.1 | Weighted canary steps + blue-green with preview services |
| Analysis | Prometheus-backed AnalysisTemplates | Error rate, P99 latency, success rate metrics |
| Multi-Cluster | Cluster CRD + typed labels | In-cluster, staging, prod with ApplicationSet cluster generators |
| Generators | Cluster + Git + Matrix | Dynamic app generation at scale across clusters and directories |
| Notifications | Slack + Email | Operational alerts (Slack) + audit trail (Email) |
| Backup | Git as source of truth | ConfigMaps and Secrets backed up daily to S3 |
| DR | Layered recovery procedures | Control plane, git compromise, cluster failure, etcd loss scenarios |

## Bootstrap Steps

```bash
# 1. Install ArgoCD
kubectl kustomize kubernetes/gitops/argocd | kubectl apply -f -

# 2. Wait for ArgoCD to be ready
kubectl wait --for=condition=available --timeout=300s -n argocd deployment/argocd-server

# 3. Apply projects
kubectl kustomize kubernetes/gitops/projects | kubectl apply -f -

# 4. Apply base configs (repo creds, clusters)
kubectl kustomize kubernetes/gitops/base | kubectl apply -f -
kubectl kustomize kubernetes/gitops/clusters | kubectl apply -f -

# 5. Bootstrap App of Apps
kubectl kustomize kubernetes/gitops/applications | kubectl apply -f -

# 6. (Optional) Apply ApplicationSets for dynamic generation
kubectl kustomize kubernetes/gitops/appsets | kubectl apply -f -

# 7. (Optional) Apply environment projects
kubectl kustomize kubernetes/gitops/environments | kubectl apply -f -

# 8. (Optional) Apply notifications, hooks, rollouts, runbooks, docs
kubectl kustomize kubernetes/gitops | kubectl apply -f -
```

## Sync Waves

| Wave | Resources | Description |
|------|-----------|-------------|
| -2 | Repository credentials | Secrets that ArgoCD needs before syncing |
| -1 | Namespaces, Clusters | Target namespaces for workloads, cluster registration |
| 0 | Projects + Applications + Bootstrap | ArgoCD Project and Application CRDs |
| 1 | Metrics Server | Core monitoring infrastructure |
| 2 | ApplicationSets + Base apps | Dynamic app generators + platform apps |
| 3 | Ingress, Cert-manager, ExternalDNS | Network and certificate infrastructure |
| 4 | External Secrets, Matrix ApplicationSets | Secret infrastructure + combined generators |
| 5 | Dev/Staging environment applications | Per-environment workload deployment |
| 6 | Production environment applications | Production workload deployment |
| 10 | PostSync hooks | Smoke tests after all sync operations |

## Sync Windows

| Window | Schedule | Duration | Scope | Description |
|--------|----------|----------|-------|-------------|
| Prod deploy | Daily 22:00 UTC | 2 hours | `*-prod` | Production deployment window |
| Prod deny | Mon-Fri 08:00-22:00 UTC | 14 hours | `*-prod` | Block prod syncs during business hours |
| Staging deploy | Mon-Fri 06:00-08:00 UTC | 2 hours | `*-staging` | Staging deployment window |
| Dev allow | Always | 168h | `*-dev` | Dev always allowed |
| Christmas freeze | Dec 25 00:00 UTC | 72 hours | `*` | Global holiday freeze |
| New Year freeze | Jan 1 00:00 UTC | 48 hours | `*` | Global holiday freeze |

## ApplicationSet Generators

| Generator | Type | Purpose | Example |
|-----------|------|---------|---------|
| Cluster | `clusters:` | Per-cluster platform/environment apps | `{{name}}-platform-apps` per cluster |
| Git Directory | `git:\n  directories:` | Per-directory app generation | `{{path.basename}}` from `kubernetes/apps/*` |
| SCM Provider | `scmProvider:` | Per-repository/branch apps | `{{repository}}-{{branch}}` |
| Matrix (Cluster × Git) | `matrix:` | Per-cluster × per-service apps | `{{name}}-{{path.basename}}` |

## Multi-Cluster Architecture

| Cluster | Server | Type | Labels | Used By |
|---------|--------|------|--------|---------|
| in-cluster | `https://kubernetes.default.svc` | Platform | `aegisai.io/cluster-type: platform` | ArgoCD, addons |
| staging | `https://staging-cluster.novapay.io:6443` | Environment | `aegisai.io/cluster-type: environment`, `aegisai.io/environment: staging` | Staging workloads |
| prod | `https://prod-cluster.novapay.io:6443` | Environment | `aegisai.io/cluster-type: environment`, `aegisai.io/environment: prod` | Production workloads |

## Progressive Delivery (Argo Rollouts)

| Strategy | Steps | Analysis | Auto-Promotion |
|----------|-------|----------|----------------|
| Canary | 10% (5m) → analyze → 30% (5m) → analyze → 60% (5m) → analyze → 100% | ErrorRate, Latency, SuccessRate | Manual (paused between steps) |
| BlueGreen | Preview → pre-promotion analysis → promote → post-promotion analysis | ErrorRate, Latency, SuccessRate | Manual (`autoPromotionEnabled: false`) |

## Security

- RBAC policies enforce least-privilege access
- Repository credentials use short-lived tokens provisioned by External Secrets Operator
- ArgoCD runs in its own namespace with network policies
- OIDC integration planned via argocd-cm `oidc.config`
- Pod Security Standards: `restricted` enforcement on platform namespaces
- Sync Windows prevent unauthorized production changes
- Holiday freezes prevent deployments during critical periods

## Disaster Recovery

See `docs/disaster-recovery.yaml` ConfigMap for full DR runbooks covering:
1. Complete ArgoCD Control Plane Loss
2. Git Repository Compromise
3. Cluster Failure
4. etcd Data Loss

## Backup

See `docs/backup-restore.yaml` ConfigMap for:
- Daily automated ArgoCD ConfigMap/Secret backups to S3
- GPG-encrypted secrets in backup
- 30-day retention with monthly/yearly archival
- Step-by-step restore procedures

## Validation

See `docs/validation.yaml` ConfigMap for validation pipeline:
- Pre-commit: yamllint, kustomize build, markdownlint
- CI: yamllint, kustomize build, actionlint, JSON validation
- Deployment: PreSync/Sync/PostSync hooks, AnalysisRuns, smoke tests
- Continuous: ArgoCD health checks, drift detection, self-heal
