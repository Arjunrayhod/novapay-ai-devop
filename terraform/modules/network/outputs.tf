# ---------------------------------------------------------------------------
# VPC outputs
# ---------------------------------------------------------------------------

output "vpc_id" {
  description = "ID of the created VPC"
  value       = aws_vpc.this.id
}

output "vpc_arn" {
  description = "ARN of the created VPC"
  value       = aws_vpc.this.arn
}

output "vpc_cidr" {
  description = "CIDR block of the created VPC"
  value       = aws_vpc.this.cidr_block
}

output "vpc_main_route_table_id" {
  description = "ID of the VPC's main route table"
  value       = aws_vpc.this.main_route_table_id
}

output "vpc_dhcp_options_id" {
  description = "ID of the VPC DHCP options set (empty if not configured)"
  value       = try(aws_vpc_dhcp_options.this[0].id, null)
}

# ---------------------------------------------------------------------------
# Subnet outputs
# ---------------------------------------------------------------------------

output "public_subnet_ids" {
  description = "List of public subnet IDs"
  value       = values(aws_subnet.public)[*].id
}

output "public_subnet_arns" {
  description = "List of public subnet ARNs"
  value       = values(aws_subnet.public)[*].arn
}

output "public_subnet_cidrs" {
  description = "List of public subnet CIDR blocks"
  value       = values(aws_subnet.public)[*].cidr_block
}

output "public_subnet_azs" {
  description = "List of Availability Zones for public subnets"
  value       = values(aws_subnet.public)[*].availability_zone
}

output "private_app_subnet_ids" {
  description = "List of private application subnet IDs"
  value       = values(aws_subnet.private_app)[*].id
}

output "private_app_subnet_arns" {
  description = "List of private application subnet ARNs"
  value       = values(aws_subnet.private_app)[*].arn
}

output "private_app_subnet_cidrs" {
  description = "List of private application subnet CIDR blocks"
  value       = values(aws_subnet.private_app)[*].cidr_block
}

output "private_app_subnet_azs" {
  description = "List of Availability Zones for private application subnets"
  value       = values(aws_subnet.private_app)[*].availability_zone
}

output "private_data_subnet_ids" {
  description = "List of private data subnet IDs (empty list if not created)"
  value       = values(aws_subnet.private_data)[*].id
}

output "private_data_subnet_cidrs" {
  description = "List of private data subnet CIDR blocks (empty list if not created)"
  value       = values(aws_subnet.private_data)[*].cidr_block
}

output "isolated_subnet_ids" {
  description = "List of isolated subnet IDs (empty list if not created)"
  value       = values(aws_subnet.isolated)[*].id
}

output "all_subnet_ids" {
  description = "Combined list of all subnet IDs across all tiers"
  value = concat(
    values(aws_subnet.public)[*].id,
    values(aws_subnet.private_app)[*].id,
    values(aws_subnet.private_data)[*].id,
    values(aws_subnet.isolated)[*].id,
  )
}

# ---------------------------------------------------------------------------
# Gateway outputs
# ---------------------------------------------------------------------------

output "internet_gateway_id" {
  description = "ID of the Internet Gateway (null if disabled)"
  value       = try(aws_internet_gateway.this[0].id, null)
}

output "nat_gateway_ids" {
  description = "List of NAT Gateway IDs"
  value       = aws_nat_gateway.this[*].id
}

output "nat_gateway_public_ips" {
  description = "List of public IP addresses associated with NAT Gateways"
  value       = aws_eip.nat[*].public_ip
}

output "nat_gateway_strategy" {
  description = "NAT Gateway deployment strategy in use"
  value       = var.nat_gateway_strategy
}

# ---------------------------------------------------------------------------
# Route table outputs
# ---------------------------------------------------------------------------

output "public_route_table_ids" {
  description = "List of public route table IDs"
  value       = [aws_route_table.public.id]
}

output "private_app_route_table_ids" {
  description = "List of private application route table IDs"
  value       = values(aws_route_table.private_app)[*].id
}

output "private_data_route_table_ids" {
  description = "List of private data route table IDs (empty if not created)"
  value       = length(var.private_data_subnet_cidrs) > 0 ? values(aws_route_table.private_data)[*].id : []
}

output "isolated_route_table_ids" {
  description = "List of isolated route table IDs (empty if not created)"
  value       = try([aws_route_table.isolated[0].id], [])
}

# ---------------------------------------------------------------------------
# VPC Flow Log outputs
# ---------------------------------------------------------------------------

output "flow_log_id" {
  description = "ID of the VPC Flow Log (null if disabled)"
  value       = try(aws_flow_log.this[0].id, null)
}

output "flow_log_destination_type" {
  description = "Destination type for VPC Flow Logs"
  value       = var.enable_flow_logs ? var.flow_logs_destination : "disabled"
}

# ---------------------------------------------------------------------------
# VPC Endpoint outputs
# ---------------------------------------------------------------------------

output "s3_gateway_endpoint_id" {
  description = "ID of the S3 Gateway Endpoint (null if disabled)"
  value       = try(aws_vpc_endpoint.s3_gateway[0].id, null)
}

output "dynamodb_gateway_endpoint_id" {
  description = "ID of the DynamoDB Gateway Endpoint (null if disabled)"
  value       = try(aws_vpc_endpoint.dynamodb_gateway[0].id, null)
}

output "interface_endpoint_ids" {
  description = "Map of Interface Endpoint service names to IDs"
  value       = { for k, v in aws_vpc_endpoint.interface : k => v.id }
}

# ---------------------------------------------------------------------------
# Security Group outputs
# ---------------------------------------------------------------------------

output "default_deny_security_group_id" {
  description = "ID of the default-deny security group (null if disabled)"
  value       = try(aws_security_group.default_deny[0].id, null)
}

output "intra_vpc_security_group_id" {
  description = "ID of the intra-VPC security group (null if disabled)"
  value       = try(aws_security_group.intra_vpc[0].id, null)
}

# ---------------------------------------------------------------------------
# Transit Gateway outputs (future)
# ---------------------------------------------------------------------------

output "transit_gateway_attachment_id" {
  description = "ID of the Transit Gateway VPC attachment (null if not configured)"
  value       = try(aws_ec2_transit_gateway_vpc_attachment.this[0].id, null)
}

# ---------------------------------------------------------------------------
# Availability Zone outputs
# ---------------------------------------------------------------------------

output "availability_zones" {
  description = "List of Availability Zones used for subnet deployment"
  value       = var.availability_zones
}

output "az_count" {
  description = "Number of Availability Zones deployed"
  value       = local.az_count
}

# ---------------------------------------------------------------------------
# Network metadata
# ---------------------------------------------------------------------------

output "network_prefix" {
  description = "Network resource name prefix"
  value       = local.network_prefix
}
