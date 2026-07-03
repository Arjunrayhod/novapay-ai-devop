# ---------------------------------------------------------------------------
# Network Module Usage Example — Dev Environment
# ---------------------------------------------------------------------------
# This example demonstrates how to use the network module to create a
# multi-AZ VPC with public, private app, private data, and isolated subnets.
#
# Integration with the governance module provides consistent tagging and
# naming across all network resources.
# ---------------------------------------------------------------------------

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
  region = var.aws_region
}

# ---------------------------------------------------------------------------
# Governance module — provides consistent tagging and naming
# ---------------------------------------------------------------------------

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
  compliance_frameworks = var.compliance_frameworks
  resource_criticality  = "high"

  requires_encryption_at_rest    = true
  requires_encryption_in_transit = true
  requires_backup                = false

  environment_tier = var.environment_tier
  expiration_date  = ""

  additional_tags = var.additional_tags
}

# ---------------------------------------------------------------------------
# Network module
# ---------------------------------------------------------------------------

module "network" {
  source = "../../modules/network"

  environment = var.environment
  name_prefix = var.name_prefix
  tags        = module.governance.merged_tags

  vpc_cidr           = var.vpc_cidr
  availability_zones = var.availability_zones

  public_subnet_cidrs      = var.public_subnet_cidrs
  private_app_subnet_cidrs = var.private_app_subnet_cidrs
  private_data_subnet_cidrs = var.private_data_subnet_cidrs
  isolated_subnet_cidrs    = var.isolated_subnet_cidrs

  enable_igw               = var.enable_igw
  enable_nat_gateway       = var.enable_nat_gateway
  nat_gateway_strategy     = var.nat_gateway_strategy

  enable_dns_support       = true
  enable_dns_hostnames     = true

  dhcp_domain_name         = var.dhcp_domain_name
  dhcp_domain_name_servers = var.dhcp_domain_name_servers

  enable_flow_logs              = var.enable_flow_logs
  flow_logs_destination         = var.flow_logs_destination
  flow_logs_retention_in_days   = var.flow_logs_retention_in_days
  flow_logs_traffic_type        = var.flow_logs_traffic_type
  flow_logs_custom_format       = var.flow_logs_custom_format

  enable_s3_gateway_endpoint      = var.enable_s3_gateway_endpoint
  enable_dynamodb_gateway_endpoint = var.enable_dynamodb_gateway_endpoint
  enable_interface_endpoints      = var.enable_interface_endpoints

  enable_default_security_groups = true
}
