# Staging Environment
#
# Pre-production validation environment.
# Mirrors production configuration with reduced capacity.
#
# Modules will be added here as they are implemented:
#
# module "vpc" {
#   source = "../../modules/vpc"
#
#   environment       = local.environment
#   vpc_cidr          = var.vpc_cidr
#   availability_zones = var.availability_zones
#   tags              = local.merged_tags
# }
