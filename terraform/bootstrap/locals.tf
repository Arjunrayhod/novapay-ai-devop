locals {
  common_tags = {
    Environment = "bootstrap"
    ManagedBy   = "terraform"
    Platform    = var.name_prefix
    Component   = "terraform-backend"
    Owner       = "platform-engineering"
    Provisioner = "terraform"
  }

  merged_tags = merge(local.common_tags, var.tags)
}
