# Development Environment

Isolated sandbox for feature development and testing.

## Configuration

| Setting          | Value          |
|------------------|----------------|
| VPC CIDR         | 10.100.0.0/16  |
| EKS Node Type    | t3.medium      |
| Node Count       | 1–4            |
| NAT Gateway      | Single (cost-optimized) |

## Usage

```hcl
terraform init -backend-config="key=dev/terraform.tfstate"
terraform plan
terraform apply
```
