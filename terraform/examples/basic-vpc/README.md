# Basic VPC Example

Demonstrates VPC module usage with public/private subnet topology.

## Usage

```bash
cd examples/basic-vpc
cp terraform.tfvars.example terraform.tfvars
terraform init
terraform plan
```

## Requirements

| Name | Version |
|------|---------|
| Terraform | >= 1.9.0 |
| AWS Provider | ~> 5.80 |

## Inputs

| Name | Description | Default |
|------|-------------|---------|
| environment | Environment name | `"example"` |
| vpc_cidr | VPC CIDR block | `"10.99.0.0/16"` |
| availability_zones | AZs to use | `["ap-south-1a", "ap-south-1b"]` |
| enable_nat_gateway | Enable NAT | `true` |
| single_nat_gateway | Single NAT | `true` |

## Module Source

This example references the VPC module at `../../modules/vpc/`. Implement the module first before running this example.
