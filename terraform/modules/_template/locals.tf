locals {
  module_name = var.name

  resource_name = join("-", compact([
    var.environment,
    local.module_name,
  ]))

  tags = merge(
    {
      Environment = var.environment
      ManagedBy   = "terraform"
      Module      = local.module_name
      Owner       = var.owner
      CostCenter  = var.cost_center
    },
    var.tags
  )
}
