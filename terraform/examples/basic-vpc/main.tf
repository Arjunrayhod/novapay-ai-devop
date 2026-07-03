# Basic VPC Example
#
# Demonstrates VPC module usage with public and private subnets.
# Replace source path with the actual VPC module once implemented.

# module "vpc" {
#   source = "../../modules/vpc"
#
#   environment        = var.environment
#   vpc_cidr           = var.vpc_cidr
#   availability_zones = var.availability_zones
#   enable_nat_gateway = var.enable_nat_gateway
#   single_nat_gateway = var.single_nat_gateway
#   tags               = var.tags
# }

output "note" {
  description = "Example setup guide"
  value       = <<-EOT
    This example demonstrates the VPC module pattern.
    To use:
    1. Implement the VPC module in modules/vpc/
    2. Uncomment the module block above
    3. Run: terraform init && terraform plan
  EOT
}
