# Test: Network module creates VPC, subnets, gateways, endpoints, and security groups
# This is a validation test — run with: terraform validate && terraform plan

terraform {
  required_version = ">= 1.9.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.80"
    }
  }
}

provider "aws" {
  region = "ap-south-1"
}

module "network" {
  source = "../../modules/network"

  environment = "test"
  name_prefix = "aegisai"
  tags        = {}

  vpc_cidr           = "10.100.0.0/16"
  availability_zones = ["ap-south-1a", "ap-south-1b"]

  public_subnet_cidrs      = ["10.100.1.0/24", "10.100.2.0/24"]
  private_app_subnet_cidrs = ["10.100.11.0/24", "10.100.12.0/24"]
  private_data_subnet_cidrs = ["10.100.21.0/24", "10.100.22.0/24"]
  isolated_subnet_cidrs    = []

  enable_igw               = true
  enable_nat_gateway       = true
  nat_gateway_strategy     = "single"

  enable_dns_support       = true
  enable_dns_hostnames     = true

  enable_flow_logs              = true
  flow_logs_destination         = "cloudwatch"
  flow_logs_retention_in_days   = 90
  flow_logs_traffic_type        = "ALL"

  enable_s3_gateway_endpoint      = true
  enable_dynamodb_gateway_endpoint = false
  enable_interface_endpoints      = ["ssm", "ec2", "logs"]

  enable_default_security_groups = true
}

output "vpc_id" {
  description = "VPC ID"
  value       = module.network.vpc_id
}

output "vpc_cidr" {
  description = "VPC CIDR"
  value       = module.network.vpc_cidr
}

output "public_subnet_ids" {
  description = "Public subnet IDs"
  value       = module.network.public_subnet_ids
}

output "private_app_subnet_ids" {
  description = "Private app subnet IDs"
  value       = module.network.private_app_subnet_ids
}

output "private_data_subnet_ids" {
  description = "Private data subnet IDs"
  value       = module.network.private_data_subnet_ids
}

output "isolated_subnet_ids" {
  description = "Isolated subnet IDs"
  value       = module.network.isolated_subnet_ids
}

output "nat_gateway_ids" {
  description = "NAT Gateway IDs"
  value       = module.network.nat_gateway_ids
}

output "internet_gateway_id" {
  description = "Internet Gateway ID"
  value       = module.network.internet_gateway_id
}

output "s3_gateway_endpoint_id" {
  description = "S3 Gateway Endpoint ID"
  value       = module.network.s3_gateway_endpoint_id
}

output "interface_endpoint_ids" {
  description = "Interface Endpoint IDs"
  value       = module.network.interface_endpoint_ids
}

output "default_deny_security_group_id" {
  description = "Default deny SG ID"
  value       = module.network.default_deny_security_group_id
}

output "intra_vpc_security_group_id" {
  description = "Intra-VPC SG ID"
  value       = module.network.intra_vpc_security_group_id
}

# ---------------------------------------------------------------------------
# Validations
# ---------------------------------------------------------------------------

resource "terraform_data" "validate_vpc_id" {
  lifecycle {
    precondition {
      condition     = module.network.vpc_id != null && module.network.vpc_id != ""
      error_message = "VPC ID must be non-empty."
    }
  }
}

resource "terraform_data" "validate_vpc_cidr" {
  lifecycle {
    precondition {
      condition     = module.network.vpc_cidr == "10.100.0.0/16"
      error_message = "VPC CIDR must match the configured value."
    }
  }
}

resource "terraform_data" "validate_public_subnet_count" {
  lifecycle {
    precondition {
      condition     = length(module.network.public_subnet_ids) == 2
      error_message = "Expected 2 public subnets for 2 AZs."
    }
  }
}

resource "terraform_data" "validate_private_app_subnet_count" {
  lifecycle {
    precondition {
      condition     = length(module.network.private_app_subnet_ids) == 2
      error_message = "Expected 2 private app subnets for 2 AZs."
    }
  }
}

resource "terraform_data" "validate_private_data_subnet_count" {
  lifecycle {
    precondition {
      condition     = length(module.network.private_data_subnet_ids) == 2
      error_message = "Expected 2 private data subnets."
    }
  }
}

resource "terraform_data" "validate_isolated_subnet_empty" {
  lifecycle {
    precondition {
      condition     = length(module.network.isolated_subnet_ids) == 0
      error_message = "Expected 0 isolated subnets when none configured."
    }
  }
}

resource "terraform_data" "validate_igw_created" {
  lifecycle {
    precondition {
      condition     = module.network.internet_gateway_id != null
      error_message = "Internet Gateway must be created when enable_igw = true."
    }
  }
}

resource "terraform_data" "validate_nat_gateways_created" {
  lifecycle {
    precondition {
      condition     = length(module.network.nat_gateway_ids) == 1
      error_message = "Expected 1 NAT Gateway for single strategy."
    }
  }
}

resource "terraform_data" "validate_s3_endpoint_created" {
  lifecycle {
    precondition {
      condition     = module.network.s3_gateway_endpoint_id != null
      error_message = "S3 Gateway Endpoint must be created when enable_s3_gateway_endpoint = true."
    }
  }
}

resource "terraform_data" "validate_interface_endpoints_created" {
  lifecycle {
    precondition {
      condition     = length(module.network.interface_endpoint_ids) == 3
      error_message = "Expected 3 interface endpoints (ssm, ec2, logs)."
    }
  }
}

resource "terraform_data" "validate_default_security_groups" {
  lifecycle {
    precondition {
      condition     = module.network.default_deny_security_group_id != null && module.network.intra_vpc_security_group_id != null
      error_message = "Default security groups must be created when enable_default_security_groups = true."
    }
  }
}
