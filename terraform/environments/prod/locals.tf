locals {
  environment = "prod"

  common_tags = {
    Environment = local.environment
    ManagedBy   = "terraform"
    Platform    = "aegisai"
    Project     = "aegisai-platform"
    Owner       = var.owner
    CostCenter  = var.cost_center
  }

  merged_tags = merge(local.common_tags, var.tags)
}
