# Enterprise Helm Platform

This directory contains the shared Helm chart foundation used by all AegisAI platform services.

## Directory Structure

```
helm/
├── OWNERS.md                  # Directory ownership
├── README.md                  # This file
└── charts/
    └── aegisai-common/        # Reusable base chart
        ├── Chart.yaml         # Chart metadata
        ├── values.yaml        # Default values
        ├── values.schema.json # JSON Schema validation
        ├── README.md          # Chart documentation
        └── templates/
            ├── _helpers.tpl           # Named templates (labels, annotations, names)
            ├── deployment.yaml        # Production Deployment template
            ├── service.yaml           # Service template
            ├── configmap.yaml         # ConfigMap template
            ├── serviceaccount.yaml    # ServiceAccount template
            ├── hpa.yaml               # HorizontalPodAutoscaler template
            ├── pdb.yaml               # PodDisruptionBudget template
            └── tests/
                └── test-connection.yaml  # Helm test pod
```

## aegisai-common

The `aegisai-common` chart provides:

- **Standard labels and annotations** — Every resource receives consistent Kubernetes recommended labels and AegisAI platform labels (`aegisai.io/environment`, `aegisai.io/tier`, `aegisai.io/data-classification`, `aegisai.io/owner`, `aegisai.io/cost-center`)
- **Production-hardened Deployment** — Security context (non-root, read-only root, drop all capabilities, seccomp RuntimeDefault), liveness/readiness/startup probes, PodAntiAffinity, TopologySpreadConstraints, PDB, preStop lifecycle hook
- **Service** — ClusterIP with configurable ports, session affinity, LB settings
- **ConfigMap** — Optional application configuration with volume mount support
- **ServiceAccount** — Optional with IRSA annotation support
- **HPA** — CPU/memory based autoscaling ready
- **Downward API env vars** — `POD_NAME`, `POD_NAMESPACE`, `NODE_NAME` injected automatically

## Usage

Platform service charts depend on `aegisai-common` as a subchart:

```yaml
# Chart.yaml
dependencies:
  - name: aegisai-common
    version: 0.1.0
    repository: file://../aegisai-common
```

Override values in your service chart's values.yaml under the `aegisai-common` key:

```yaml
aegisai-common:
  global:
    environment: prod
    tier: platform
  image:
    repository: aegisai/my-service
    tag: v1.0.0
  service:
    ports:
      - name: grpc
        port: 8080
        targetPort: grpc
        protocol: TCP
```

## Validation

```bash
helm lint charts/aegisai-common
helm template test-release charts/aegisai-common --namespace aegisai-system-platform
```

## Standards

These charts follow Section 8 (Helm Standards) of ENGINEERING_STANDARDS.md:
- Chart.yaml with semver version and appVersion
- values.yaml with documented parameters
- values.schema.json for type validation
- All templates namespaced via `{{ .Release.Namespace }}`
- Standard Helm labels on all resources
- Helm test template included
- No hardcoded namespaces
- No secrets in values
