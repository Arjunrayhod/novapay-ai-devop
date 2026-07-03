# Staging Environment

Pre-production environment for integration testing, performance validation, and release candidate verification.

## Configuration

| Setting          | Value          |
|------------------|----------------|
| VPC CIDR         | 10.200.0.0/16  |
| EKS Node Type    | t3.large       |
| Node Count       | 2–6            |
| NAT Gateway      | Single         |

## Usage

```hcl
terraform init -backend-config="key=staging/terraform.tfstate"
terraform plan
terraform apply
```
