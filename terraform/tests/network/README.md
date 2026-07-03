# Network Module Tests

Validates that the Network module creates all VPC resources with correct configuration.

## Test Cases

| Test | Description | Verification |
|------|-------------|-------------|
| VPC ID created | VPC resource ID is non-null | `terraform_data.validate_vpc_id` |
| VPC CIDR matches | VPC CIDR matches configured value | `terraform_data.validate_vpc_cidr` |
| Public subnet count | 2 subnets for 2 AZs | `terraform_data.validate_public_subnet_count` |
| Private app subnet count | 2 subnets for 2 AZs | `terraform_data.validate_private_app_subnet_count` |
| Private data subnet count | 2 subnets for 2 AZs | `terraform_data.validate_private_data_subnet_count` |
| Isolated subnet empty | No isolated subnets when none configured | `terraform_data.validate_isolated_subnet_empty` |
| IGW created | Internet Gateway present | `terraform_data.validate_igw_created` |
| NAT Gateway count | 1 NAT GW for single strategy | `terraform_data.validate_nat_gateways_created` |
| S3 Gateway Endpoint | Endpoint created | `terraform_data.validate_s3_endpoint_created` |
| Interface endpoints | 3 endpoints (ssm, ec2, logs) | `terraform_data.validate_interface_endpoints_created` |
| Default security groups | Both default SGs created | `terraform_data.validate_default_security_groups` |

## Run

```bash
cd terraform/tests/network
terraform init
terraform validate
terraform plan -out=test.tfplan
terraform apply test.tfplan
```

## Cleanup

```bash
terraform destroy
```
