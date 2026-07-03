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
  description = "Private application subnet IDs"
  value       = module.network.private_app_subnet_ids
}

output "private_data_subnet_ids" {
  description = "Private data subnet IDs"
  value       = module.network.private_data_subnet_ids
}

output "nat_gateway_public_ips" {
  description = "NAT Gateway public IPs"
  value       = module.network.nat_gateway_public_ips
}

output "nat_gateway_strategy" {
  description = "NAT Gateway strategy"
  value       = module.network.nat_gateway_strategy
}
