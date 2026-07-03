# Network Module

Enterprise-grade VPC networking foundation for the AegisAI platform. Creates a multi-AZ VPC with four subnet tiers, NAT Gateway strategy, VPC Flow Logs, VPC Endpoints, DHCP options, and a security group framework.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                           VPC (10.100.0.0/16)                    │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │  Public       │  │  Private App │  │  Private Data │           │
│  │  Subnets      │  │  Subnets     │  │  Subnets      │           │
│  │  (AZ a, b)    │  │  (AZ a, b)   │  │  (AZ a, b)    │           │
│  │  IGW route    │  │  NAT route   │  │  NAT route    │           │
│  │  k8s ELB tag  │  │  k8s int-ELB │  │               │           │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘           │
│         │                  │                  │                    │
│         │     ┌────────────┴────────────┐     │                    │
│         │     │  Isolated Subnets       │     │                    │
│         │     │  (no internet route)    │     │                    │
│         │     └─────────────────────────┘     │                    │
│         │                                      │                    │
│  ┌──────┴───────┐  ┌───────────────────────────┘                    │
│  │  Internet GW │  │  NAT Gateway(s)                                │
│  └──────────────┘  └────────────────────────────────────────────────┘
│                                                                   │
│  VPC Endpoints: S3 (Gateway), Interface (SSM, EC2, Logs, ...)     │
│  Flow Logs → CloudWatch / S3                                      │
│  Security Groups: default-deny, intra-vpc                          │
└───────────────────────────────────────────────────────────────────┘
```

## Subnet Tiers

| Tier | Internet Route | Use Case | k8s Tag |
|------|---------------|----------|---------|
| Public | IGW (0.0.0.0/0) | Load balancers, bastions | `kubernetes.io/role/elb` |
| Private App | NAT (0.0.0.0/0) | Application workloads | `kubernetes.io/role/internal-elb` |
| Private Data | NAT (0.0.0.0/0) | Databases, caches | — |
| Isolated | None | Compliance-bounded workloads | — |

## NAT Gateway Strategy

| Strategy | NAT Count | Cost | Availability |
|----------|-----------|------|-------------|
| `single` | 1 (AZ[0]) | Low | Single-AZ failure risk |
| `per_az` | N (per AZ) | High | Fully resilient |

With `single` strategy, all private subnets share one route table pointing to the single NAT in AZ[0]. With `per_az`, each AZ gets its own route table and NAT Gateway.

## Route Table Strategy

- **Public**: 1 shared route table (all public subnets)
- **Private App**: 1 shared (`single`) or N per-AZ (`per_az`)
- **Private Data**: 1 shared (`single`) or N per-AZ (`per_az`)
- **Isolated**: 1 (no default route)

## VPC Endpoints

| Endpoint | Type | Default | Notes |
|----------|------|---------|-------|
| S3 | Gateway | Enabled | Attached to public + private route tables |
| DynamoDB | Gateway | Disabled | Attached to public + private route tables |
| SSM, EC2, Logs, ... | Interface | Configurable | Placed in private app subnets by default |

## VPC Flow Logs

- **Destination**: CloudWatch Logs (default) or S3
- **Format**: Configurable (default captures all standard + advanced fields)
- **Retention**: Configurable (default 90 days)
- **Traffic Type**: ACCEPT, REJECT, or ALL (default)

## CIDR Planning

Recommended CIDR allocation for a `/16` VPC:

| Range | Size | Tier |
|-------|------|------|
| 10.100.1.0/24 – 10.100.4.0/24 | /24 × N | Public |
| 10.100.11.0/24 – 10.100.14.0/24 | /24 × N | Private App |
| 10.100.21.0/24 – 10.100.24.0/24 | /24 × N | Private Data |
| 10.100.31.0/24 – 10.100.34.0/24 | /24 × N | Isolated |

Reserve blocks at `/24` granularity per AZ per tier. For 3 AZs with all 4 tiers, 12 × /24 = 3,072 IPs from a /16 (65,536 total).

## Usage

```hcl
module "governance" {
  source = "../../modules/governance"

  environment     = var.environment
  workload        = "network"
  workload_type   = "platform-service"
  owner           = "platform-engineering"
  cost_center     = "cc-platform"
  aws_region      = var.aws_region
  name_prefix     = var.name_prefix

  data_classification   = "internal"
  compliance_frameworks = []
  resource_criticality  = "high"

  requires_encryption_at_rest    = true
  requires_encryption_in_transit = true
  requires_backup                = false

  environment_tier = "development"
  additional_tags  = {}
}

module "network" {
  source = "../../modules/network"

  environment = var.environment
  name_prefix = var.name_prefix
  tags        = module.governance.merged_tags

  vpc_cidr           = "10.100.0.0/16"
  availability_zones = ["ap-south-1a", "ap-south-1b"]

  public_subnet_cidrs      = ["10.100.1.0/24", "10.100.2.0/24"]
  private_app_subnet_cidrs = ["10.100.11.0/24", "10.100.12.0/24"]
  private_data_subnet_cidrs = ["10.100.21.0/24", "10.100.22.0/24"]
  isolated_subnet_cidrs    = []

  enable_igw           = true
  enable_nat_gateway   = true
  nat_gateway_strategy = "single"

  enable_flow_logs            = true
  flow_logs_destination       = "cloudwatch"
  flow_logs_retention_in_days = 90
  flow_logs_traffic_type      = "ALL"

  enable_s3_gateway_endpoint      = true
  enable_dynamodb_gateway_endpoint = false
  enable_interface_endpoints      = ["ssm", "ec2", "ecr.api", "logs", "monitoring"]

  enable_default_security_groups = true
}
```

<!-- BEGIN_TF_DOCS -->
## Requirements

| Name | Version |
|------|---------|
| terraform | >= 1.9.0 |
| aws | ~> 5.80 |

## Inputs

| Name | Description | Type | Default |
|------|-------------|------|---------|
| environment | Deployment environment name | `string` | — |
| name_prefix | Prefix for all network resource names | `string` | `"aegisai"` |
| tags | Additional tags to apply to all network resources | `map(string)` | `{}` |
| vpc_cidr | CIDR block for the VPC | `string` | — |
| availability_zones | List of Availability Zones to deploy subnets into | `list(string)` | — |
| public_subnet_cidrs | List of CIDR blocks for public subnets (one per AZ) | `list(string)` | — |
| private_app_subnet_cidrs | List of CIDR blocks for private application subnets (one per AZ) | `list(string)` | — |
| private_data_subnet_cidrs | List of CIDR blocks for private data subnets (one per AZ) | `list(string)` | `[]` |
| isolated_subnet_cidrs | List of CIDR blocks for isolated subnets (one per AZ, no internet access) | `list(string)` | `[]` |
| nat_gateway_strategy | NAT Gateway deployment strategy: single or per_az | `string` | `"single"` |
| enable_nat_gateway | Enable NAT Gateway(s) for private subnet internet access | `bool` | `true` |
| enable_igw | Enable Internet Gateway for public subnet internet access | `bool` | `true` |
| enable_dns_support | Enable DNS resolution in the VPC | `bool` | `true` |
| enable_dns_hostnames | Enable DNS hostnames in the VPC | `bool` | `true` |
| dhcp_domain_name | Domain name for the VPC DHCP options set | `string` | `""` |
| dhcp_domain_name_servers | List of DNS servers for the VPC DHCP options set | `list(string)` | `[]` |
| enable_flow_logs | Enable VPC Flow Logs | `bool` | `true` |
| flow_logs_destination | Destination for VPC Flow Logs: cloudwatch or s3 | `string` | `"cloudwatch"` |
| flow_logs_retention_in_days | Retention period (days) for CloudWatch Logs flow log group | `number` | `90` |
| flow_logs_traffic_type | Type of traffic to capture: ACCEPT, REJECT, or ALL | `string` | `"ALL"` |
| flow_logs_custom_format | Custom format string for VPC Flow Logs | `string` | (all standard + advanced fields) |
| flow_logs_bucket_arn | ARN of S3 bucket for flow logs (required when destination is 's3') | `string` | `""` |
| enable_s3_gateway_endpoint | Create a Gateway VPC Endpoint for S3 | `bool` | `true` |
| enable_dynamodb_gateway_endpoint | Create a Gateway VPC Endpoint for DynamoDB | `bool` | `false` |
| enable_interface_endpoints | List of AWS service names to create Interface VPC Endpoints for | `list(string)` | `[]` |
| interface_endpoint_subnet_ids | Subnet IDs for Interface VPC Endpoints (defaults to private app subnets) | `list(string)` | `[]` |
| enable_default_security_groups | Create default security groups: vpc-default-deny, intra-vpc-allow | `bool` | `true` |
| enable_ipv6 | Enable IPv6 support (future — currently unsupported) | `bool` | `false` |
| transit_gateway_id | ID of Transit Gateway for VPC attachment (future) | `string` | `""` |
| enable_transit_gateway_routes | Add routes to Transit Gateway from private subnets (future) | `bool` | `false` |

## Outputs

| Name | Description |
|------|-------------|
| vpc_id | ID of the created VPC |
| vpc_arn | ARN of the created VPC |
| vpc_cidr | CIDR block of the created VPC |
| vpc_main_route_table_id | ID of the VPC's main route table |
| vpc_dhcp_options_id | ID of the VPC DHCP options set |
| public_subnet_ids | List of public subnet IDs |
| private_app_subnet_ids | List of private application subnet IDs |
| private_data_subnet_ids | List of private data subnet IDs |
| isolated_subnet_ids | List of isolated subnet IDs |
| all_subnet_ids | Combined list of all subnet IDs across all tiers |
| internet_gateway_id | ID of the Internet Gateway |
| nat_gateway_ids | List of NAT Gateway IDs |
| nat_gateway_public_ips | List of public IP addresses associated with NAT Gateways |
| public_route_table_ids | List of public route table IDs |
| private_app_route_table_ids | List of private application route table IDs |
| private_data_route_table_ids | List of private data route table IDs |
| isolated_route_table_ids | List of isolated route table IDs |
| flow_log_id | ID of the VPC Flow Log |
| s3_gateway_endpoint_id | ID of the S3 Gateway Endpoint |
| dynamodb_gateway_endpoint_id | ID of the DynamoDB Gateway Endpoint |
| interface_endpoint_ids | Map of Interface Endpoint service names to IDs |
| default_deny_security_group_id | ID of the default-deny security group |
| intra_vpc_security_group_id | ID of the intra-VPC security group |
| transit_gateway_attachment_id | ID of the Transit Gateway VPC attachment |
| availability_zones | List of Availability Zones used |
| network_prefix | Network resource name prefix |

## Dependencies

- **Governance module** (`terraform/modules/governance`) — for consistent tagging and naming

## Security Considerations

- Default-deny security group framework enforces least privilege by default
- VPC Flow Logs provide audit trail of all network traffic
- VPC Endpoints keep traffic within the AWS network (no internet transit)
- No `0.0.0.0/0` ingress rules in any security group
- Interface endpoints use private IPs from private app subnets
- Isolated subnets have no internet route (no IGW, no NAT)
- S3 Gateway Endpoint is enabled by default to route S3 traffic through AWS backbone

## Extension Plan

| Feature | Status |
|---------|--------|
| VPC creation | ✅ Shipped |
| Multi-AZ subnets (4 tiers) | ✅ Shipped |
| NAT Gateway (single / per_az) | ✅ Shipped |
| Internet Gateway | ✅ Shipped |
| VPC Flow Logs (CW / S3) | ✅ Shipped |
| VPC Endpoints (S3 Gateway, Interface) | ✅ Shipped |
| DHCP options | ✅ Shipped |
| DNS configuration | ✅ Shipped |
| Security group framework | ✅ Shipped |
| IPv6 support | 🔜 Future |
| Transit Gateway attachment | 🔜 Future |
| Network Firewall | 🔜 Future |
| PrivateLink | 🔜 Future |
<!-- END_TF_DOCS -->
