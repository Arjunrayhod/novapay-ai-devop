# ---------------------------------------------------------------------------
# General
# ---------------------------------------------------------------------------

variable "environment" {
  description = "Deployment environment name"
  type        = string
  validation {
    condition     = can(regex("^[a-z0-9_-]+$", var.environment))
    error_message = "Environment must contain only lowercase letters, numbers, hyphens, and underscores."
  }
}

variable "name_prefix" {
  description = "Prefix for all network resource names"
  type        = string
  default     = "aegisai"
}

variable "tags" {
  description = "Additional tags to apply to all network resources"
  type        = map(string)
  default     = {}
}

# ---------------------------------------------------------------------------
# VPC configuration
# ---------------------------------------------------------------------------

variable "vpc_cidr" {
  description = "CIDR block for the VPC"
  type        = string
  validation {
    condition     = can(cidrhost(var.vpc_cidr, 0))
    error_message = "VPC CIDR must be a valid IPv4 CIDR notation."
  }
}

variable "availability_zones" {
  description = "List of Availability Zones to deploy subnets into"
  type        = list(string)
  validation {
    condition     = length(var.availability_zones) >= 2 && length(var.availability_zones) <= 4
    error_message = "At least 2 and at most 4 Availability Zones are required."
  }
}

# ---------------------------------------------------------------------------
# Subnet CIDRs
# ---------------------------------------------------------------------------

variable "public_subnet_cidrs" {
  description = "List of CIDR blocks for public subnets (one per AZ)"
  type        = list(string)
  validation {
    condition     = length(var.public_subnet_cidrs) >= 2
    error_message = "At least 2 public subnet CIDRs are required for multi-AZ."
  }
}

variable "private_app_subnet_cidrs" {
  description = "List of CIDR blocks for private application subnets (one per AZ)"
  type        = list(string)
  validation {
    condition     = length(var.private_app_subnet_cidrs) >= 2
    error_message = "At least 2 private application subnet CIDRs are required for multi-AZ."
  }
}

variable "private_data_subnet_cidrs" {
  description = "List of CIDR blocks for private data subnets (one per AZ)"
  type        = list(string)
  default     = []
  validation {
    condition     = length(var.private_data_subnet_cidrs) == 0 || length(var.private_data_subnet_cidrs) >= 2
    error_message = "If provided, at least 2 private data subnet CIDRs are required."
  }
}

variable "isolated_subnet_cidrs" {
  description = "List of CIDR blocks for isolated subnets (one per AZ, no internet access)"
  type        = list(string)
  default     = []
  validation {
    condition     = length(var.isolated_subnet_cidrs) == 0 || length(var.isolated_subnet_cidrs) >= 2
    error_message = "If provided, at least 2 isolated subnet CIDRs are required."
  }
}

# ---------------------------------------------------------------------------
# NAT Gateway strategy
# ---------------------------------------------------------------------------

variable "nat_gateway_strategy" {
  description = "NAT Gateway deployment strategy: single (one NAT for all AZs, cost-optimized) or per_az (one NAT per AZ, high-availability)"
  type        = string
  default     = "single"
  validation {
    condition     = contains(["single", "per_az"], var.nat_gateway_strategy)
    error_message = "NAT Gateway strategy must be 'single' or 'per_az'."
  }
}

variable "enable_nat_gateway" {
  description = "Enable NAT Gateway(s) for private subnet internet access"
  type        = bool
  default     = true
}

# ---------------------------------------------------------------------------
# Internet Gateway
# ---------------------------------------------------------------------------

variable "enable_igw" {
  description = "Enable Internet Gateway for public subnet internet access"
  type        = bool
  default     = true
}

# ---------------------------------------------------------------------------
# DNS
# ---------------------------------------------------------------------------

variable "enable_dns_support" {
  description = "Enable DNS resolution in the VPC"
  type        = bool
  default     = true
}

variable "enable_dns_hostnames" {
  description = "Enable DNS hostnames in the VPC"
  type        = bool
  default     = true
}

# ---------------------------------------------------------------------------
# DHCP options
# ---------------------------------------------------------------------------

variable "dhcp_domain_name" {
  description = "Domain name for the VPC DHCP options set. Empty uses the default AWS name."
  type        = string
  default     = ""
}

variable "dhcp_domain_name_servers" {
  description = "List of DNS servers for the VPC DHCP options set. Empty uses the default AWS nameservers."
  type        = list(string)
  default     = []
}

# ---------------------------------------------------------------------------
# VPC Flow Logs
# ---------------------------------------------------------------------------

variable "enable_flow_logs" {
  description = "Enable VPC Flow Logs"
  type        = bool
  default     = true
}

variable "flow_logs_destination" {
  description = "Destination for VPC Flow Logs: cloudwatch or s3"
  type        = string
  default     = "cloudwatch"
  validation {
    condition     = contains(["cloudwatch", "s3"], var.flow_logs_destination)
    error_message = "Flow logs destination must be 'cloudwatch' or 's3'."
  }
}

variable "flow_logs_retention_in_days" {
  description = "Retention period (days) for CloudWatch Logs flow log group"
  type        = number
  default     = 90
  validation {
    condition     = var.flow_logs_retention_in_days >= 1 && var.flow_logs_retention_in_days <= 3653
    error_message = "Flow log retention must be between 1 and 3653 days."
  }
}

variable "flow_logs_traffic_type" {
  description = "Type of traffic to capture: ACCEPT, REJECT, or ALL"
  type        = string
  default     = "ALL"
  validation {
    condition     = contains(["ACCEPT", "REJECT", "ALL"], var.flow_logs_traffic_type)
    error_message = "Flow log traffic type must be ACCEPT, REJECT, or ALL."
  }
}

variable "flow_logs_custom_format" {
  description = "Custom format string for VPC Flow Logs"
  type        = string
  default     = <<-'EOF'
${version} ${account-id} ${interface-id} ${srcaddr} ${dstaddr} ${srcport} ${dstport} ${protocol} ${packets} ${bytes} ${start} ${end} ${action} ${log-status} ${vpc-id} ${subnet-id} ${instance-id} ${tcp-flags} ${type} ${pkt-srcaddr} ${pkt-dstaddr} ${region} ${az-id} ${sublocation-type} ${sublocation-id}
EOF
}

variable "flow_logs_bucket_arn" {
  description = "ARN of S3 bucket for flow logs (required when destination is 's3')"
  type        = string
  default     = ""
}

# ---------------------------------------------------------------------------
# VPC Endpoints
# ---------------------------------------------------------------------------

variable "enable_s3_gateway_endpoint" {
  description = "Create a Gateway VPC Endpoint for S3"
  type        = bool
  default     = true
}

variable "enable_dynamodb_gateway_endpoint" {
  description = "Create a Gateway VPC Endpoint for DynamoDB"
  type        = bool
  default     = false
}

variable "enable_interface_endpoints" {
  description = "List of AWS service names to create Interface VPC Endpoints for (e.g., ['ssm', 'ec2', 'ecr.api', 'logs', 'monitoring'])"
  type        = list(string)
  default     = []
}

variable "interface_endpoint_subnet_ids" {
  description = "Subnet IDs for Interface VPC Endpoints (defaults to private app subnets if empty)"
  type        = list(string)
  default     = []
}

# ---------------------------------------------------------------------------
# Security group framework
# ---------------------------------------------------------------------------

variable "enable_default_security_groups" {
  description = "Create default security groups: vpc-default-deny, intra-vpc-allow"
  type        = bool
  default     = true
}

# ---------------------------------------------------------------------------
# IPv6 (future)
# ---------------------------------------------------------------------------

variable "enable_ipv6" {
  description = "Enable IPv6 support (future — currently unsupported)"
  type        = bool
  default     = false
}

# ---------------------------------------------------------------------------
# Transit Gateway (future)
# ---------------------------------------------------------------------------

variable "transit_gateway_id" {
  description = "ID of Transit Gateway for VPC attachment (future — empty until TGW is deployed)"
  type        = string
  default     = ""
}

variable "enable_transit_gateway_routes" {
  description = "Add routes to Transit Gateway from private subnets (future)"
  type        = bool
  default     = false
}
