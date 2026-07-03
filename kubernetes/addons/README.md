# Optional Addons

Optional platform addons that teams can opt into. Deployed per-cluster based on requirements.

| Addon | Purpose | Namespace | CRDs |
|-------|---------|-----------|------|
| VPA | Vertical Pod Autoscaler — right-size pods automatically | `aegisai-addon-vpa` | VerticalPodAutoscaler |
| Cluster Autoscaler | Auto-scale EKS node groups | `aegisai-addon-cluster-autoscaler` | None |

## VPA

Vertical Pod Autoscaler recommends or automatically adjusts CPU/memory requests. Used alongside HPA (VPA handles vertical, HPA handles horizontal).

**Modes**: `Off` (recommend only), `Auto` (auto-update)

## Cluster Autoscaler

Scales EKS node groups based on unschedulable pods. Requires IAM role (via IRSA) with `autoscaling:DescribeAutoScalingGroups`, `ec2:CreateFleet`, etc.

## Terraform Integration

| Addon | Terraform Dependency |
|-------|---------------------|
| VPA | EKS node group instance types |
| Cluster Autoscaler | IAM role (via IRSA), ASG tags (`k8s.io/cluster-autoscaler/enabled`) |

## Directory

```
addons/
├── README.md
├── kustomization.yaml
├── vpa/
│   ├── kustomization.yaml
│   ├── namespace.yaml
│   └── values.yaml
└── cluster-autoscaler/
    ├── kustomization.yaml
    ├── namespace.yaml
    └── values.yaml
```
