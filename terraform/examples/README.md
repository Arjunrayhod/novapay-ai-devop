# AegisAI Terraform Examples

Usage examples for Terraform modules.

## Structure

```
examples/
├── README.md                    # This file
├── basic-vpc/                   # Example: VPC with public/private subnets
│   ├── main.tf
│   ├── variables.tf
│   ├── outputs.tf
│   ├── terraform.tfvars.example
│   └── README.md
└── (future)                     # Additional examples per module
```

## Usage

Each example is a standalone Terraform configuration. To run:

```bash
cd examples/basic-vpc
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your values
terraform init
terraform plan
```

Examples demonstrate module composition patterns and serve as smoke tests. They use local module references (`source = "../../modules/<name>"`) so changes are validated at source.

## Naming Convention

Examples follow `{module-name}-{variant}` naming:

- `basic-vpc` — Minimal VPC with default settings
- `vpc-with-nat` — VPC with NAT gateways
- `eks-managed-nodegroup` — EKS with managed node groups
- `rds-postgres` — RDS PostgreSQL with Multi-AZ

Refer to individual example READMEs for specific usage.
