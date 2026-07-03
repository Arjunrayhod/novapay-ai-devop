# Production Environment
#
# Production workload infrastructure.
# High availability across multiple AZs.
# Strict security and compliance controls.
#
# Modules will be added here as they are implemented:
#
# module "vpc" {
#   source = "../../modules/vpc"
#
#   environment       = local.environment
#   vpc_cidr          = var.vpc_cidr
#   availability_zones = var.availability_zones
#   enable_nat_gateway  = var.enable_nat_gateway
#   single_nat_gateway  = var.single_nat_gateway
#   tags              = local.merged_tags
# }
