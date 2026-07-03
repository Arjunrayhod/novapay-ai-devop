# Base Kustomize Configuration

Shared base configurations inherited by all environment overlays.

## Contents

| File | Purpose |
|------|---------|
| `common-labels.yaml` | Reference label set — applied via Kustomize `commonLabels` in overlays |
| `common-annotations.yaml` | Reference annotation set — maps 1:1 to Terraform governance module outputs |
| `kustomization.yaml` | Base kustomization — loaded by `envs/{dev,staging,prod}/` |

## Label Strategy

Labels follow both AegisAI convention and Kubernetes recommended labels:

### AegisAI Labels (`aegisai.io/*`)
Propagated from Terraform governance module:
```yaml
aegisai.io/environment: dev
aegisai.io/cost-center: cc-platform
aegisai.io/data-classification: internal
aegisai.io/compliance: soc2,iso27001
```

### Kubernetes Recommended Labels (`app.kubernetes.io/*`)
```yaml
app.kubernetes.io/name: my-app
app.kubernetes.io/instance: my-app-prod
app.kubernetes.io/component: api
app.kubernetes.io/part-of: aegisai
app.kubernetes.io/managed-by: kustomize
```

## Terraform Integration

These labels and annotations are NOT rendered by Kustomize alone. They document the contract between Terraform and Kubernetes. In practice:

1. Terraform governance module produces `merged_tags` output
2. A script or controller (future: ACK/crossplane) syncs tags → k8s annotations
3. Kustomize `commonLabels` and `commonAnnotations` provide the static baseline

## Usage

```bash
# Apply via environment overlay (preferred):
kustomize build envs/dev | kubectl apply -f -

# Validate base output:
kustomize build base
```
