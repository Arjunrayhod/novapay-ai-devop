# ---------------------------------------------------------------------------
# Naming
# ---------------------------------------------------------------------------

locals {
  network_prefix = "${var.name_prefix}-${var.environment}"

  naming = {
    vpc               = "${local.network_prefix}-vpc"
    igw               = "${local.network_prefix}-igw"
    nat_eip           = "${local.network_prefix}-nat-eip"
    nat_gateway       = "${local.network_prefix}-nat"
    public_rt         = "${local.network_prefix}-public-rt"
    app_rt            = "${local.network_prefix}-app-rt"
    data_rt           = "${local.network_prefix}-data-rt"
    isolated_rt       = "${local.network_prefix}-isolated-rt"
    dhcp              = "${local.network_prefix}-dhcp"
    flow_logs         = "${local.network_prefix}-flow-logs"
    s3_endpoint       = "${local.network_prefix}-s3-endpoint"
    dynamodb_endpoint = "${local.network_prefix}-dynamodb-endpoint"
  }

  # ---------------------------------------------------------------------------
  # Tags
  # ---------------------------------------------------------------------------

  base_tags = {
    Environment = var.environment
    ManagedBy   = "terraform"
    Platform    = var.name_prefix
    Component   = "network"
  }

  merged_tags = merge(local.base_tags, var.tags)

  # ---------------------------------------------------------------------------
  # Subnet configuration maps
  # ---------------------------------------------------------------------------

  az_count = length(var.availability_zones)

  public_subnets = length(var.public_subnet_cidrs) > 0 ? {
    for i, cidr in var.public_subnet_cidrs :
    "${local.network_prefix}-public-${i}" => {
      cidr                    = cidr
      az                      = var.availability_zones[i]
      type                    = "public"
      map_public_ip_on_launch = true
      tags = merge(local.merged_tags, {
        Name                                            = "${local.network_prefix}-public-${i}"
        Type                                            = "public"
        Tier                                            = "public"
        "kubernetes.io/role/elb"                        = "1"
        "kubernetes.io/cluster/${local.network_prefix}" = "shared"
      })
    }
  } : {}

  private_app_subnets = length(var.private_app_subnet_cidrs) > 0 ? {
    for i, cidr in var.private_app_subnet_cidrs :
    "${local.network_prefix}-app-${i}" => {
      cidr                    = cidr
      az                      = var.availability_zones[i]
      type                    = "private-app"
      map_public_ip_on_launch = false
      tags = merge(local.merged_tags, {
        Name                                            = "${local.network_prefix}-app-${i}"
        Type                                            = "private-app"
        Tier                                            = "application"
        "kubernetes.io/role/internal-elb"               = "1"
        "kubernetes.io/cluster/${local.network_prefix}" = "shared"
      })
    }
  } : {}

  private_data_subnets = length(var.private_data_subnet_cidrs) > 0 ? {
    for i, cidr in var.private_data_subnet_cidrs :
    "${local.network_prefix}-data-${i}" => {
      cidr                    = cidr
      az                      = var.availability_zones[i]
      type                    = "private-data"
      map_public_ip_on_launch = false
      tags = merge(local.merged_tags, {
        Name = "${local.network_prefix}-data-${i}"
        Type = "private-data"
        Tier = "data"
      })
    }
  } : {}

  isolated_subnets = length(var.isolated_subnet_cidrs) > 0 ? {
    for i, cidr in var.isolated_subnet_cidrs :
    "${local.network_prefix}-isolated-${i}" => {
      cidr                    = cidr
      az                      = var.availability_zones[i]
      type                    = "isolated"
      map_public_ip_on_launch = false
      tags = merge(local.merged_tags, {
        Name = "${local.network_prefix}-isolated-${i}"
        Type = "isolated"
        Tier = "isolated"
      })
    }
  } : {}

  all_subnets = merge(
    local.public_subnets,
    local.private_app_subnets,
    local.private_data_subnets,
    local.isolated_subnets
  )

  # ---------------------------------------------------------------------------
  # NAT Gateway strategy
  # ---------------------------------------------------------------------------

  nat_gateway_count = var.enable_nat_gateway ? (
    var.nat_gateway_strategy == "per_az" ? local.az_count : 1
  ) : 0

  # For per_az strategy, each NAT gets an EIP and lives in one public subnet
  # For single strategy, one NAT in the first public subnet
  nat_gateway_azs = var.enable_nat_gateway ? (
    var.nat_gateway_strategy == "per_az" ? var.availability_zones : [var.availability_zones[0]]
  ) : []

  nat_gateway_subnet_ids = var.enable_nat_gateway ? (
    var.nat_gateway_strategy == "per_az" ? values(aws_subnet.public)[*].id : [values(aws_subnet.public)[0].id]
  ) : []

  # ---------------------------------------------------------------------------
  # Route table targets (for route creation)
  # ---------------------------------------------------------------------------

  igw_id = var.enable_igw ? aws_internet_gateway.this[0].id : null

  nat_gateway_ids = var.enable_nat_gateway ? aws_nat_gateway.this[*].id : []

  # ---------------------------------------------------------------------------
  # VPC Endpoint — filtered service list (prefix with com.amazonaws.region)
  # ---------------------------------------------------------------------------

  interface_endpoint_services = length(var.enable_interface_endpoints) > 0 ? [
    for svc in var.enable_interface_endpoints : "com.amazonaws.${data.aws_region.current.name}.${svc}"
  ] : []

  # Default to private app subnets for interface endpoints
  interface_endpoint_subnet_ids = length(var.interface_endpoint_subnet_ids) > 0 ? var.interface_endpoint_subnet_ids : values(aws_subnet.private_app)[*].id

  # ---------------------------------------------------------------------------
  # Region (used in endpoint service names)
  # ---------------------------------------------------------------------------

  region = data.aws_region.current.name
}

# ---------------------------------------------------------------------------
# Data sources
# ---------------------------------------------------------------------------

data "aws_region" "current" {}

data "aws_caller_identity" "current" {}
