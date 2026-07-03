variable "aws_region" {
  description = "AWS region for bootstrap resources"
  type        = string
  default     = "ap-south-1"
}

variable "name_prefix" {
  description = "Prefix for bootstrap resource names"
  type        = string
  default     = "aegisai"
}

variable "state_bucket_name" {
  description = "Name of the S3 bucket for Terraform state. Auto-generated if empty."
  type        = string
  default     = ""
}

variable "state_lock_table_name" {
  description = "Name of the DynamoDB table for state locking. Auto-generated if empty."
  type        = string
  default     = ""
}

variable "kms_key_alias" {
  description = "Alias for the KMS key used to encrypt Terraform state"
  type        = string
  default     = "alias/terraform-state-key"
}

variable "kms_deletion_window" {
  description = "Waiting period (days) before KMS key deletion"
  type        = number
  default     = 30
}

variable "enable_kms_key_rotation" {
  description = "Enable automatic yearly rotation of the KMS key"
  type        = bool
  default     = true
}

variable "force_destroy_bucket" {
  description = "Allow forceful destruction of the state bucket even when non-empty"
  type        = bool
  default     = false
}

variable "lifecycle_transition_days" {
  description = "Days after which state files transition to Glacier"
  type        = number
  default     = 90
}

variable "noncurrent_version_expiration_days" {
  description = "Days after which noncurrent versions are permanently deleted"
  type        = number
  default     = 365
}

variable "tags" {
  description = "Additional tags to apply to all bootstrap resources"
  type        = map(string)
  default     = {}
}
