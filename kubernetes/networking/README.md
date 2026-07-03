# Networking Strategy

Ingress classes, CNI configuration, and DNS strategy for the AegisAI platform.

## Ingress Strategy

| Ingress Class | Controller | Type | Default | Use Case |
|---------------|-----------|------|---------|----------|
| `aegisai-nginx` | ingress-nginx | Public | Yes | HTTP/HTTPS workloads |
| `aegisai-nginx-internal` | ingress-nginx | Private | No | Internal services |
| `aegisai-istio` | Istio Gateway | Public/Private | No | Future: service mesh |

The Terraform network module provisions:
- Public subnets with `kubernetes.io/role/elb` = `1` tag
- Private app subnets with `kubernetes.io/role/internal-elb` = `1` tag

These tags tell AWS Load Balancer Controller which subnets to provision ALBs/NLBs into.

## IngressClass Configuration

```yaml
# Public ingress (internet-facing)
apiVersion: networking.k8s.io/v1
kind: IngressClass
metadata:
  name: aegisai-nginx
spec:
  controller: k8s.io/ingress-nginx
  parameters:
    kind: IngressClassParams
    name: aegisai-nginx-public
---
apiVersion: elbv2.k8s.aws/v1beta1
kind: IngressClassParams
metadata:
  name: aegisai-nginx-public
spec:
  group:
    name: aegisai
  loadBalancerAttributes:
    - key: deletion_protection.enabled
      value: "true"
  subnets:
    - xxxxx   # Populated from Terraform public_subnet_ids output
  tags:
    - key: aegisai.io/component
      value: ingress
```

## CNI Configuration

AWS VPC CNI is used (default for EKS):
- Custom networking with security groups per pod (future)
- Prefix delegation mode for increased IP density
- Network Policy enforcement via Calico or AWS Network Policy (future)

## DNS Strategy

| Domain | DNS Provider | Record Type | Target |
|--------|-------------|-------------|--------|
| `*.apps.aegisai.io` | external-dns | CNAME | ingress-nginx ALB |
| `*.internal.aegisai.io` | external-dns | CNAME | ingress-nginx-internal NLB |
| `*.mesh.aegisai.io` | external-dns | CNAME | Istio Gateway ALB (future) |

## Terraform Integration

```
terraform/modules/network/outputs.tf              kubernetes/networking/
├── public_subnet_ids          ────►              ├── ingress-classes/public-params.yaml
├── private_app_subnet_ids     ────►              ├── ingress-classes/internal-params.yaml
├── vpc_cidr                   ────►              ├── cni-config/vpc-cidr.yaml
└── vpc_id                     ────►              └── cni-config/vpc-id.yaml
```

## Directory

```
networking/
├── README.md
├── kustomization.yaml
└── ingress-classes/
    ├── ingress-nginx-public.yaml       # Public IngressClass + params
    └── ingress-nginx-internal.yaml     # Internal IngressClass + params
```
