# ---------------------------------------------------------------------------
# VPC
# ---------------------------------------------------------------------------

resource "aws_vpc" "this" {
  cidr_block           = var.vpc_cidr
  enable_dns_support   = var.enable_dns_support
  enable_dns_hostnames = var.enable_dns_hostnames

  tags = merge(local.merged_tags, {
    Name = local.naming.vpc
  })
}

# ---------------------------------------------------------------------------
# DHCP Options
# ---------------------------------------------------------------------------

resource "aws_vpc_dhcp_options" "this" {
  count = var.dhcp_domain_name != "" || length(var.dhcp_domain_name_servers) > 0 ? 1 : 0

  domain_name         = var.dhcp_domain_name != "" ? var.dhcp_domain_name : null
  domain_name_servers = length(var.dhcp_domain_name_servers) > 0 ? var.dhcp_domain_name_servers : null

  tags = merge(local.merged_tags, {
    Name = local.naming.dhcp
  })
}

resource "aws_vpc_dhcp_options_association" "this" {
  count = var.dhcp_domain_name != "" || length(var.dhcp_domain_name_servers) > 0 ? 1 : 0

  vpc_id          = aws_vpc.this.id
  dhcp_options_id = aws_vpc_dhcp_options.this[0].id
}

# ---------------------------------------------------------------------------
# Subnets
# ---------------------------------------------------------------------------

resource "aws_subnet" "public" {
  for_each = local.public_subnets

  vpc_id                  = aws_vpc.this.id
  cidr_block              = each.value.cidr
  availability_zone       = each.value.az
  map_public_ip_on_launch = each.value.map_public_ip_on_launch

  tags = each.value.tags
}

resource "aws_subnet" "private_app" {
  for_each = local.private_app_subnets

  vpc_id                  = aws_vpc.this.id
  cidr_block              = each.value.cidr
  availability_zone       = each.value.az
  map_public_ip_on_launch = each.value.map_public_ip_on_launch

  tags = each.value.tags
}

resource "aws_subnet" "private_data" {
  for_each = local.private_data_subnets

  vpc_id                  = aws_vpc.this.id
  cidr_block              = each.value.cidr
  availability_zone       = each.value.az
  map_public_ip_on_launch = each.value.map_public_ip_on_launch

  tags = each.value.tags
}

resource "aws_subnet" "isolated" {
  for_each = local.isolated_subnets

  vpc_id                  = aws_vpc.this.id
  cidr_block              = each.value.cidr
  availability_zone       = each.value.az
  map_public_ip_on_launch = each.value.map_public_ip_on_launch

  tags = each.value.tags
}

# ---------------------------------------------------------------------------
# Internet Gateway
# ---------------------------------------------------------------------------

resource "aws_internet_gateway" "this" {
  count = var.enable_igw ? 1 : 0

  vpc_id = aws_vpc.this.id

  tags = merge(local.merged_tags, {
    Name = local.naming.igw
  })
}

# ---------------------------------------------------------------------------
# Elastic IPs (for NAT Gateways)
# ---------------------------------------------------------------------------

resource "aws_eip" "nat" {
  count = local.nat_gateway_count

  domain = "vpc"

  tags = merge(local.merged_tags, {
    Name = "${local.naming.nat_eip}-${count.index}"
  })
}

# ---------------------------------------------------------------------------
# NAT Gateways
# ---------------------------------------------------------------------------

resource "aws_nat_gateway" "this" {
  count = local.nat_gateway_count

  allocation_id = aws_eip.nat[count.index].id
  subnet_id     = local.nat_gateway_subnet_ids[count.index]

  tags = merge(local.merged_tags, {
    Name = "${local.naming.nat_gateway}-${count.index}"
  })

  depends_on = [aws_internet_gateway.this]
}

# ---------------------------------------------------------------------------
# Route Tables — Public
# ---------------------------------------------------------------------------

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.this.id

  tags = merge(local.merged_tags, {
    Name = local.naming.public_rt
  })
}

resource "aws_route" "public_internet" {
  count = var.enable_igw ? 1 : 0

  route_table_id         = aws_route_table.public.id
  destination_cidr_block = "0.0.0.0/0"
  gateway_id             = aws_internet_gateway.this[0].id
}

resource "aws_route_table_association" "public" {
  for_each = aws_subnet.public

  subnet_id      = each.value.id
  route_table_id = aws_route_table.public.id
}

# ---------------------------------------------------------------------------
# Route Tables — Private Application
#   single NAT: 1 route table shared by all app subnets
#   per_az NAT: 1 route table per AZ, each with route to its AZ's NAT
# ---------------------------------------------------------------------------

locals {
  private_app_route_tables = merge(
    var.nat_gateway_strategy == "single" ? {
      "${local.network_prefix}-app-rt" => {
        az_index          = 0
        nat_gw_available  = local.nat_gateway_count > 0
      }
    } : {},
    var.nat_gateway_strategy == "per_az" ? {
      for i, az in var.availability_zones :
      "${local.network_prefix}-app-rt-${i}" => {
        az_index          = i
        nat_gw_available  = local.nat_gateway_count > i
      }
    } : {},
  )
}

resource "aws_route_table" "private_app" {
  for_each = local.private_app_route_tables

  vpc_id = aws_vpc.this.id

  tags = merge(local.merged_tags, {
    Name = each.key
  })
}

resource "aws_route" "private_app_nat" {
  for_each = {
    for k, v in local.private_app_route_tables : k => v
    if v.nat_gw_available
  }

  route_table_id         = aws_route_table.private_app[each.key].id
  destination_cidr_block = "0.0.0.0/0"
  nat_gateway_id         = aws_nat_gateway.this[each.value.az_index].id
}

# Associate each private app subnet with its AZ's route table
resource "aws_route_table_association" "private_app" {
  for_each = aws_subnet.private_app

  subnet_id = each.value.id

  route_table_id = var.nat_gateway_strategy == "per_az" ? (
    aws_route_table.private_app["${local.network_prefix}-app-rt-${index(var.availability_zones, each.value.availability_zone)}"].id
  ) : (
    aws_route_table.private_app["${local.network_prefix}-app-rt"].id
  )
}

# ---------------------------------------------------------------------------
# Route Tables — Private Data
#   Same pattern as private app: single or per-AZ route tables.
# ---------------------------------------------------------------------------

locals {
  private_data_route_tables = length(var.private_data_subnet_cidrs) > 0 ? (
    var.nat_gateway_strategy == "per_az" ? {
      for i, az in var.availability_zones :
      "${local.network_prefix}-data-rt-${i}" => {
        az_index      = i
        nat_gw_available = local.nat_gateway_count > i
      }
    } : {
      "${local.network_prefix}-data-rt" => {
        az_index      = 0
        nat_gw_available = local.nat_gateway_count > 0
      }
    }
  ) : {}
}

resource "aws_route_table" "private_data" {
  for_each = local.private_data_route_tables

  vpc_id = aws_vpc.this.id

  tags = merge(local.merged_tags, {
    Name = each.key
  })
}

resource "aws_route" "private_data_nat" {
  for_each = {
    for k, v in local.private_data_route_tables : k => v
    if v.nat_gw_available
  }

  route_table_id         = aws_route_table.private_data[each.key].id
  destination_cidr_block = "0.0.0.0/0"
  nat_gateway_id         = aws_nat_gateway.this[each.value.az_index].id
}

resource "aws_route_table_association" "private_data" {
  for_each = aws_subnet.private_data

  subnet_id = each.value.id

  route_table_id = var.nat_gateway_strategy == "per_az" ? (
    aws_route_table.private_data["${local.network_prefix}-data-rt-${index(var.availability_zones, each.value.availability_zone)}"].id
  ) : (
    aws_route_table.private_data["${local.network_prefix}-data-rt"].id
  )
}

# ---------------------------------------------------------------------------
# Route Tables — Isolated (no internet access)
# ---------------------------------------------------------------------------

resource "aws_route_table" "isolated" {
  count = length(var.isolated_subnet_cidrs) > 0 ? 1 : 0

  vpc_id = aws_vpc.this.id

  tags = merge(local.merged_tags, {
    Name = local.naming.isolated_rt
  })
}

resource "aws_route_table_association" "isolated" {
  for_each = aws_subnet.isolated

  subnet_id      = each.value.id
  route_table_id = aws_route_table.isolated[0].id
}

# ---------------------------------------------------------------------------
# VPC Flow Logs — IAM Role (CloudWatch destination)
# ---------------------------------------------------------------------------

resource "aws_iam_role" "flow_logs" {
  count = var.enable_flow_logs && var.flow_logs_destination == "cloudwatch" ? 1 : 0

  name = "${local.network_prefix}-flow-logs-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "vpc-flow-logs.amazonaws.com"
        }
        Action = "sts:AssumeRole"
      }
    ]
  })

  tags = merge(local.merged_tags, {
    Name = "${local.network_prefix}-flow-logs-role"
  })
}

resource "aws_iam_role_policy" "flow_logs" {
  count = var.enable_flow_logs && var.flow_logs_destination == "cloudwatch" ? 1 : 0

  name = "${local.network_prefix}-flow-logs-policy"
  role = aws_iam_role.flow_logs[0].id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents",
          "logs:DescribeLogGroups",
          "logs:DescribeLogStreams",
        ]
        Resource = "*"
      }
    ]
  })
}

# ---------------------------------------------------------------------------
# VPC Flow Logs — CloudWatch Log Group
# ---------------------------------------------------------------------------

resource "aws_cloudwatch_log_group" "flow_logs" {
  count = var.enable_flow_logs && var.flow_logs_destination == "cloudwatch" ? 1 : 0

  name              = local.naming.flow_logs
  retention_in_days = var.flow_logs_retention_in_days

  tags = merge(local.merged_tags, {
    Name = local.naming.flow_logs
  })
}

# ---------------------------------------------------------------------------
# VPC Flow Logs — Resource
# ---------------------------------------------------------------------------

resource "aws_flow_log" "this" {
  count = var.enable_flow_logs ? 1 : 0

  log_destination_type     = var.flow_logs_destination == "cloudwatch" ? "cloud-watch-logs" : "s3"
  traffic_type             = var.flow_logs_traffic_type
  vpc_id                   = aws_vpc.this.id
  max_aggregation_interval = 60

  log_destination = var.flow_logs_destination == "cloudwatch" ? aws_cloudwatch_log_group.flow_logs[0].arn : var.flow_logs_bucket_arn
  log_format     = var.flow_logs_custom_format

  iam_role_arn = var.flow_logs_destination == "cloudwatch" ? aws_iam_role.flow_logs[0].arn : null

  tags = merge(local.merged_tags, {
    Name = local.naming.flow_logs
  })
}

# ---------------------------------------------------------------------------
# VPC Endpoints — Gateway Endpoints (S3, DynamoDB)
# ---------------------------------------------------------------------------

resource "aws_vpc_endpoint" "s3_gateway" {
  count = var.enable_s3_gateway_endpoint ? 1 : 0

  vpc_id       = aws_vpc.this.id
  service_name = "com.amazonaws.${data.aws_region.current.name}.s3"
  vpc_endpoint_type = "Gateway"

  route_table_ids = concat(
    [aws_route_table.public.id],
    [for rt in aws_route_table.private_app : rt.id],
    length(var.private_data_subnet_cidrs) > 0 ? [for rt in aws_route_table.private_data : rt.id] : [],
  )

  tags = merge(local.merged_tags, {
    Name = local.naming.s3_endpoint
  })
}

resource "aws_vpc_endpoint" "dynamodb_gateway" {
  count = var.enable_dynamodb_gateway_endpoint ? 1 : 0

  vpc_id       = aws_vpc.this.id
  service_name = "com.amazonaws.${data.aws_region.current.name}.dynamodb"
  vpc_endpoint_type = "Gateway"

  route_table_ids = concat(
    [aws_route_table.public.id],
    [for rt in aws_route_table.private_app : rt.id],
    length(var.private_data_subnet_cidrs) > 0 ? [for rt in aws_route_table.private_data : rt.id] : [],
  )

  tags = merge(local.merged_tags, {
    Name = local.naming.dynamodb_endpoint
  })
}

# ---------------------------------------------------------------------------
# VPC Endpoints — Interface Endpoints (SSM, EC2, ECR, Logs, etc.)
# ---------------------------------------------------------------------------

resource "aws_security_group" "interface_endpoints" {
  count = length(local.interface_endpoint_services) > 0 ? 1 : 0

  name        = "${local.network_prefix}-vpce-sg"
  description = "Security group for VPC Interface Endpoints"
  vpc_id      = aws_vpc.this.id

  ingress {
    description = "HTTPS from VPC"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = [var.vpc_cidr]
  }

  tags = merge(local.merged_tags, {
    Name = "${local.network_prefix}-vpce-sg"
  })
}

resource "aws_vpc_endpoint" "interface" {
  for_each = toset(local.interface_endpoint_services)

  vpc_id              = aws_vpc.this.id
  service_name        = each.value
  vpc_endpoint_type   = "Interface"
  subnet_ids          = local.interface_endpoint_subnet_ids
  security_group_ids  = [aws_security_group.interface_endpoints[0].id]
  private_dns_enabled = true

  tags = merge(local.merged_tags, {
    Name = "${local.network_prefix}-vpce-${each.value}"
  })
}

# ---------------------------------------------------------------------------
# Security Group Framework — Default Security Groups
# ---------------------------------------------------------------------------

resource "aws_security_group" "default_deny" {
  count = var.enable_default_security_groups ? 1 : 0

  name        = "${local.network_prefix}-default-deny"
  description = "Default deny all traffic (no ingress, no egress rules)"
  vpc_id      = aws_vpc.this.id

  tags = merge(local.merged_tags, {
    Name = "${local.network_prefix}-default-deny"
    Purpose = "default-deny-framework"
  })
}

resource "aws_security_group" "intra_vpc" {
  count = var.enable_default_security_groups ? 1 : 0

  name        = "${local.network_prefix}-intra-vpc"
  description = "Allow traffic within VPC CIDR"
  vpc_id      = aws_vpc.this.id

  ingress {
    description = "All traffic from VPC CIDR"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = [var.vpc_cidr]
  }

  egress {
    description = "All traffic to VPC CIDR"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = [var.vpc_cidr]
  }

  tags = merge(local.merged_tags, {
    Name = "${local.network_prefix}-intra-vpc"
    Purpose = "intra-vpc-communication"
  })
}

# ---------------------------------------------------------------------------
# Transit Gateway Attachment (future)
# ---------------------------------------------------------------------------

resource "aws_ec2_transit_gateway_vpc_attachment" "this" {
  count = var.transit_gateway_id != "" && var.enable_transit_gateway_routes ? 1 : 0

  transit_gateway_id = var.transit_gateway_id
  vpc_id             = aws_vpc.this.id
  subnet_ids         = values(aws_subnet.private_app)[*].id

  tags = merge(local.merged_tags, {
    Name = "${local.network_prefix}-tgw-attach"
  })
}
