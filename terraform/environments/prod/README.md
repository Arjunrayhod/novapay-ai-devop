# Production Environment

Mission-critical environment serving live financial workloads. PCI-DSS and SOC2 compliant.

## Configuration

| Setting          | Value          |
|------------------|----------------|
| VPC CIDR         | 10.0.0.0/16    |
| EKS Node Type    | t3.xlarge      |
| Node Count       | 3–12           |
| NAT Gateway      | One per AZ (HA) |

## Usage

```hcl
terraform init -backend-config="key=prod/terraform.tfstate"
terraform plan
terraform apply
```

## Compliance

- PCI-DSS 4.0 controls enforced via Checkov policies
- SOC2 Type II audit trail requirements
- Change-management approval required for all applies
