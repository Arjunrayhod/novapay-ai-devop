# Platform Operators

Managed platform components required for cluster operations. Each component has its own directory with Kustomize config, README, and tests.

## Components

| Component | Namespace | CRDs | Description |
|-----------|-----------|------|-------------|
| ingress-nginx | `aegisai-platform-ingress-nginx` | N/A | HTTP/HTTPS ingress controller |
| cert-manager | `aegisai-platform-cert-manager` | Certificate, Issuer, ClusterIssuer | TLS certificate management |
| external-dns | `aegisai-platform-external-dns` | N/A | DNS record management with AWS Route53 |
| metrics-server | `aegisai-platform-metrics-server` | N/A | Cluster-wide resource metrics |

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Internet / AWS ALB                           │
│                            │                                      │
│                            ▼                                      │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                ingress-nginx                             │    │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐       │    │
│  │  │  Team A │ │  Team B │ │  Team C │ │ Platform│       │    │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘       │    │
│  └──────────────────────────┬──────────────────────────────┘    │
│                             │                                      │
│                    ┌────────┴────────┐                             │
│                    │   cert-manager  │                             │
│                    │  (TLS for all)  │                             │
│                    └─────────────────┘                             │
│                                                                     │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │                    external-dns                             │   │
│  │  *.apps.aegisai.io ──► ingress-nginx ALB                    │   │
│  │  *.internal.aegisai.io ──► ingress-nginx-internal NLB      │   │
│  └────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │                    metrics-server                           │   │
│  │  Used by: HPA, kubectl top, VPA, CA                        │   │
│  └────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## Terraform Integration

| Terraform Module | Platform Component |
|-----------------|-------------------|
| `modules/network` (public_subnet_ids) | ingress-nginx ALB placement |
| `modules/iam` (IRSA roles) | cert-manager, external-dns SA |
| `modules/governance` (tags) | Resource tagging |

## Deployment Order

1. metrics-server (required by HPA)
2. ingress-nginx (required by cert-manager HTTP-01)
3. cert-manager (required by TLS)
4. external-dns (optional, for DNS automation)

## Directory

```
platform/
├── README.md
├── kustomization.yaml
├── ingress-nginx/
│   ├── kustomization.yaml
│   ├── namespace.yaml
│   └── values.yaml
├── cert-manager/
│   ├── kustomization.yaml
│   ├── namespace.yaml
│   ├── values.yaml
│   └── cluster-issuer.yaml
├── external-dns/
│   ├── kustomization.yaml
│   ├── namespace.yaml
│   └── values.yaml
└── metrics-server/
    ├── kustomization.yaml
    ├── namespace.yaml
    └── values.yaml
```
