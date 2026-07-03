data "aws_caller_identity" "current" {}

locals {
  account_id = data.aws_caller_identity.current.account_id

  bucket_name = var.state_bucket_name != "" ? var.state_bucket_name : "${var.name_prefix}-terraform-state-${local.account_id}"
  table_name  = var.state_lock_table_name != "" ? var.state_lock_table_name : "${var.name_prefix}-terraform-locks"

  kms_key_alias = trimsuffix(var.kms_key_alias, "/")

  common_tags = {
    Environment = var.environment
    ManagedBy   = "terraform"
    Platform    = var.name_prefix
    Component   = "terraform-backend"
    Owner       = "platform-engineering"
    Provisioner = "terraform"
  }

  merged_tags = merge(local.common_tags, var.tags)
}
