# Policy Framework

Network policies, Pod Security Standards, and future OPA/Gatekeeper integration.

## Network Policy Architecture

Zero-trust by default. Every namespace receives a `default-deny-all` policy that
blocks all ingress and egress traffic. Workloads opt into connectivity through
explicit allow policies — no allow-all policies exist.

All allowed traffic flows must be documented and reviewed as part of the
deployment process.

### Policy Inventory (7 policies)

| # | Policy | Direction | Scope | Ports | Applied To |
|---|--------|-----------|-------|-------|------------|
| 1 | `aegisai-default-deny-all` | Ingress + Egress | Deny all | — | All namespaces |
| 2 | `aegisai-allow-dns` | Egress | `kube-system` namespace, UDP/TCP | 53 | All namespaces |
| 3 | `aegisai-allow-same-namespace` | Ingress + Egress | Same namespace (podSelector: {}) | All | All namespaces |
| 4 | `aegisai-allow-kube-apiserver` | Egress | `default` namespace | TCP 443 | All namespaces |
| 5 | `aegisai-allow-intra-tier` | Ingress + Egress | System & Platform tier namespaces | All | System & Platform namespaces |
| 6 | `aegisai-allow-platform` | Ingress | System & Platform tier namespaces | All | Workload namespaces |
| 7 | `aegisai-allow-ingress-controller` | Ingress | ingress-nginx / istio-ingressgateway pods | TCP 80, 443 | Workload namespaces |

### Allowed Traffic Matrix

| From | To | Allowed By | Ports | Purpose |
|------|----|------------|-------|---------|
| Any pod | Any pod (same NS) | `allow-same-namespace` | All | Inter-pod communication |
| Any pod | `kube-system` CoreDNS | `allow-dns` | UDP/TCP 53 | DNS resolution |
| Any pod | `default` K8s API | `allow-kube-apiserver` | TCP 443 | K8s API access |
| System NS pods | System/Platform NS pods | `allow-intra-tier` | All | System ↔ system, system ↔ platform |
| Platform NS pods | System/Platform NS pods | `allow-intra-tier` | All | Platform ↔ platform, platform ↔ system |
| System/Platform NS | Workload NS pods | `allow-platform` | All | Prometheus scrape, health checks |
| ingress-nginx | Workload NS pods | `allow-ingress-controller` | TCP 80, 443 | HTTP/S ingress traffic |
| istio-ingressgateway | Workload NS pods | `allow-ingress-controller` | TCP 80, 443 | HTTP/S ingress traffic |

**Not allowed by default:**
- Cross-team namespace traffic (e.g., `team-novapay` → `team-paysecure`)
- Team → System/Platform egress (team pods cannot initiate connections to system namespaces)
- External egress beyond DNS and K8s API (requires explicit policy per workload)

### Namespace Tiers

Policies use the `aegisai.io/tier` label to select namespaces:

| Tier | Label | Namespaces |
|------|-------|------------|
| System | `aegisai.io/tier: system` | `aegisai-system-security`, `aegisai-system-istio`, `aegisai-system-observability` |
| Platform | `aegisai.io/tier: platform` | `aegisai-platform-ingress-nginx`, `aegisai-platform-cert-manager`, `aegisai-platform-metrics-server`, `aegisai-platform-external-dns` |
| Team | `aegisai.io/tier: team` | `aegisai-team-novapay`, `aegisai-team-paysecure`, `aegisai-team-lendflow`, `aegisai-team-finserv` |

### Deployment Order

Policies must be applied in order (enforced by CNI evaluation priority):

1. **`default-deny-all`** — creates the deny baseline
2. **`allow-dns`**, **`allow-same-namespace`**, **`allow-kube-apiserver`** — foundation policies for every namespace
3. **`allow-intra-tier`** — inter-namespace communication within system/platform tiers
4. **`allow-platform`** — monitoring scrape and platform health checks
5. **`allow-ingress-controller`** — external traffic into workload namespaces

## Pod Security Admission

Applied via namespace labels (configured in `security/`):

| Level | Enforcement | Namespace Types |
|-------|------------|-----------------|
| `privileged` | audit + warn | system, platform-istio |
| `baseline` | enforce | team, shared, addons |
| `restricted` | enforce | user workloads (future) |

## Future: OPA/Gatekeeper

Constraint templates ready for future implementation:

- `requiredlabels` — enforce `aegisai.io/*` labels
- `allowedrepos` — restrict container image registries
- `requiredprobes` — require liveness/readiness probes
- `requiredresources` — require CPU/memory limits
- `disallowlatest` — prevent `latest` image tag
- `requiredannotations` — enforce `aegisai.io/*` annotations

## PriorityClass Strategy

Six PriorityClasses define the scheduling hierarchy for all AegisAI workloads.
Defined in `priority-classes/` directory.

| PriorityClass | Value | GlobalDefault | Preempts | Preempted By |
|--------------|-------|---------------|----------|--------------|
| `aegisai-platform-critical` | 10000 | No | All below | — |
| `aegisai-security-critical` | 9000 | No | All below | platform-critical |
| `aegisai-observability-critical` | 8000 | No | All below | platform-critical, security-critical |
| `aegisai-application-high` | 1000 | No | normal, batch | All critical tiers |
| `aegisai-application-normal` | 0 | **Yes** | batch | All above |
| `aegisai-batch-low` | -100 | No | — | All above |

See `namespaces/README.md` for QoS strategy and capacity planning.

## Directory

```
policies/
├── README.md
├── kustomization.yaml
├── network-policies/
│   ├── default-deny-all.yaml           # Zero-trust baseline
│   ├── allow-dns.yaml                  # CoreDNS egress
│   ├── allow-same-namespace.yaml        # Intra-namespace communication
│   ├── allow-kube-apiserver.yaml        # K8s API egress
│   ├── allow-intra-tier.yaml            # System/platform inter-tier
│   ├── allow-platform.yaml             # Monitoring ingress
│   └── allow-ingress-controller.yaml   # Ingress controller ingress
└── priority-classes/
    ├── platform-critical.yaml           # Value: 10000
    ├── security-critical.yaml           # Value: 9000
    ├── observability-critical.yaml      # Value: 8000
    ├── application-high.yaml            # Value: 1000
    ├── application-normal.yaml          # Value: 0 (default)
    └── batch-low.yaml                   # Value: -100
```

> PSA labels are defined in `security/pod-security/psa-labels.yaml`.
