module "bootstrap" {
  source = "../modules/bootstrap"

  aws_region                  = var.aws_region
  name_prefix                 = var.name_prefix
  state_bucket_name           = var.state_bucket_name
  state_lock_table_name       = var.state_lock_table_name
  kms_key_alias               = var.kms_key_alias
  kms_deletion_window         = var.kms_deletion_window
  enable_kms_key_rotation     = var.enable_kms_key_rotation
  force_destroy_bucket        = var.force_destroy_bucket
  lifecycle_transition_days   = var.lifecycle_transition_days
  noncurrent_version_expiration_days = var.noncurrent_version_expiration_days
  tags                        = local.merged_tags
}
