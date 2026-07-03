# ---------------------------------------------------------------------------
# CIDR validation
# ---------------------------------------------------------------------------

resource "terraform_data" "validate_vpc_cidr" {
  lifecycle {
    precondition {
      condition     = can(regex("^([0-9]{1,3}\\.){3}[0-9]{1,3}/[0-9]{1,2}$", var.vpc_cidr))
      error_message = <<-EOT
        VPC CIDR must be a valid IPv4 CIDR notation (e.g., "10.0.0.0/16").
        Provided: ${var.vpc_cidr}
      EOT
    }
  }
}

# ---------------------------------------------------------------------------
# Subnet CIDR overlap validation
# ---------------------------------------------------------------------------

locals {
  all_subnet_cidrs = concat(
    var.public_subnet_cidrs,
    var.private_app_subnet_cidrs,
    var.private_data_subnet_cidrs,
    var.isolated_subnet_cidrs,
  )
}

resource "terraform_data" "validate_subnet_cidrs_within_vpc" {
  for_each = toset(local.all_subnet_cidrs)

  lifecycle {
    precondition {
      condition     = try(cidrsubnet(var.vpc_cidr, ceil(log(length(local.all_subnet_cidrs) + 1, 2)), 0) != null, false) || try(cidrhost(each.key, 0) != null, false)
      error_message = <<-EOT
        All subnet CIDRs must be within the VPC CIDR (${var.vpc_cidr}).
        Validating: ${each.key}
      EOT
    }
  }
}

resource "terraform_data" "validate_subnet_cidr_count_matches_az" {
  lifecycle {
    precondition {
      condition     = length(var.public_subnet_cidrs) == length(var.availability_zones)
      error_message = <<-EOT
        Public subnet CIDR count (${length(var.public_subnet_cidrs)}) must match Availability Zone count (${length(var.availability_zones)}).
        Provide exactly one public subnet CIDR per AZ.
      EOT
    }
  }
}

resource "terraform_data" "validate_private_app_cidr_count_matches_az" {
  lifecycle {
    precondition {
      condition     = length(var.private_app_subnet_cidrs) == length(var.availability_zones)
      error_message = <<-EOT
        Private app subnet CIDR count (${length(var.private_app_subnet_cidrs)}) must match Availability Zone count (${length(var.availability_zones)}).
        Provide exactly one private app subnet CIDR per AZ.
      EOT
    }
  }
}

resource "terraform_data" "validate_private_data_cidr_count_matches_az" {
  count = length(var.private_data_subnet_cidrs) > 0 ? 1 : 0

  lifecycle {
    precondition {
      condition     = length(var.private_data_subnet_cidrs) == length(var.availability_zones)
      error_message = <<-EOT
        Private data subnet CIDR count (${length(var.private_data_subnet_cidrs)}) must match Availability Zone count (${length(var.availability_zones)}).
        Provide exactly one private data subnet CIDR per AZ, or leave empty.
      EOT
    }
  }
}

resource "terraform_data" "validate_isolated_cidr_count_matches_az" {
  count = length(var.isolated_subnet_cidrs) > 0 ? 1 : 0

  lifecycle {
    precondition {
      condition     = length(var.isolated_subnet_cidrs) == length(var.availability_zones)
      error_message = <<-EOT
        Isolated subnet CIDR count (${length(var.isolated_subnet_cidrs)}) must match Availability Zone count (${length(var.availability_zones)}).
        Provide exactly one isolated subnet CIDR per AZ, or leave empty.
      EOT
    }
  }
}

# ---------------------------------------------------------------------------
# AZ count validation
# ---------------------------------------------------------------------------

resource "terraform_data" "validate_az_count_for_strategy" {
  lifecycle {
    precondition {
      condition     = var.nat_gateway_strategy == "single" || length(var.availability_zones) <= 3
      error_message = <<-EOT
        NAT Gateway strategy "per_az" with more than 3 AZs (${length(var.availability_zones)}) is not recommended.
        Use "single" strategy for 4+ AZs, or reduce AZ count.
      EOT
    }
  }
}

# ---------------------------------------------------------------------------
# NAT Gateway validation
# ---------------------------------------------------------------------------

resource "terraform_data" "validate_nat_with_igw" {
  count = var.enable_nat_gateway && !var.enable_igw ? 1 : 0

  lifecycle {
    precondition {
      condition     = var.enable_igw
      error_message = <<-EOT
        NAT Gateway requires an Internet Gateway. Set enable_igw = true when enable_nat_gateway = true.
      EOT
    }
  }
}

# ---------------------------------------------------------------------------
# S3 Flow Logs destination validation
# ---------------------------------------------------------------------------

resource "terraform_data" "validate_s3_flow_logs_bucket" {
  count = var.enable_flow_logs && var.flow_logs_destination == "s3" && var.flow_logs_bucket_arn == "" ? 1 : 0

  lifecycle {
    precondition {
      condition     = var.flow_logs_bucket_arn != ""
      error_message = <<-EOT
        S3 flow log destination requires var.flow_logs_bucket_arn to be set.
        Provide the ARN of an existing S3 bucket for flow log storage.
      EOT
    }
  }
}

# ---------------------------------------------------------------------------
# Interface endpoint validation
# ---------------------------------------------------------------------------

resource "terraform_data" "validate_interface_endpoints_with_subnets" {
  count = length(var.enable_interface_endpoints) > 0 && length(var.private_app_subnet_cidrs) == 0 && length(var.interface_endpoint_subnet_ids) == 0 ? 1 : 0

  lifecycle {
    precondition {
      condition     = length(var.private_app_subnet_cidrs) > 0 || length(var.interface_endpoint_subnet_ids) > 0
      error_message = <<-EOT
        Interface endpoints require private app subnets or explicit subnet IDs.
        Create private app subnets or set var.interface_endpoint_subnet_ids.
      EOT
    }
  }
}
