# AegisAI Terraform Modules

Reusable Terraform modules for the AegisAI platform.

## Module Index

| Module | Status | Provider | Description |
|--------|--------|----------|-------------|
| bootstrap | Active | AWS | Terraform state backend (S3 + DynamoDB + KMS) |
| iam | Active | AWS | Platform IAM roles with least privilege, permission boundaries, and OIDC-ready GitHub Actions trust |
| governance | Active | AWS | Enterprise governance foundation: tagging, naming, compliance mapping, cost allocation, validations |
| network | Active | AWS | Enterprise VPC with multi-AZ subnets, NAT Gateway strategy, flow logs, VPC endpoints, DHCP, security group framework |
| _(forthcoming)_ | Planned | AWS | EKS |
| _(forthcoming)_ | Planned | AWS | RDS |
| _(forthcoming)_ | Planned | AWS | S3 |
| _(forthcoming)_ | Planned | AWS | IAM |
| _(forthcoming)_ | Planned | AWS | DynamoDB |
| _(forthcoming)_ | Planned | AWS | ElastiCache |
| _(forthcoming)_ | Planned | AWS | ACM + Route53 |
| _(forthcoming)_ | Planned | AWS | Security Groups |
| _(forthcoming)_ | Planned | AWS | ECR |

## Usage

```hcl
module "vpc" {
  source = "../modules/vpc"

  environment = var.environment
  vpc_cidr    = var.vpc_cidr
  # ...
}
```

Refer to `MODULE_STANDARDS.md` for module development requirements.
