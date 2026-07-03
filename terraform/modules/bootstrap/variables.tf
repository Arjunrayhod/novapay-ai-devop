variable "environment" {
  description = "Deployment environment name"
  type        = string
  default     = "_global"

  validation {
    condition     = can(regex("^[a-z0-9_-]+$", var.environment))
    error_message = "Environment must contain only lowercase letters, numbers, hyphens, and underscores."
  }
}

variable "aws_region" {
  description = "AWS region for state backend resources"
  type        = string
}

variable "name_prefix" {
  description = "Prefix for resource names"
  type        = string
  default     = "aegisai"
}

variable "state_bucket_name" {
  description = "Name of the S3 bucket for Terraform state. If empty, auto-generated from name_prefix and account ID."
  type        = string
  default     = ""
}

variable "state_lock_table_name" {
  description = "Name of the DynamoDB table for state locking. If empty, auto-generated from name_prefix."
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

  validation {
    condition     = var.kms_deletion_window >= 7 && var.kms_deletion_window <= 30
    error_message = "KMS deletion window must be between 7 and 30 days."
  }
}

variable "enable_kms_key_rotation" {
  description = "Enable automatic yearly rotation of the KMS key"
  type        = bool
  default     = true
}

variable "enable_bucket_versioning" {
  description = "Enable versioning on the state S3 bucket"
  type        = bool
  default     = true
}

variable "enable_bucket_encryption" {
  description = "Enable server-side encryption on the state S3 bucket"
  type        = bool
  default     = true
}

variable "enable_dynamodb_encryption" {
  description = "Enable server-side encryption on the DynamoDB lock table"
  type        = bool
  default     = true
}

variable "enable_dynamodb_pitr" {
  description = "Enable point-in-time recovery for the DynamoDB lock table"
  type        = bool
  default     = true
}

variable "enable_bucket_key" {
  description = "Enable S3 bucket key for KMS cost optimization"
  type        = bool
  default     = true
}

variable "force_destroy_bucket" {
  description = "Allow forceful destruction of the state bucket even when non-empty (use with caution)"
  type        = bool
  default     = false
}

variable "lock_table_billing_mode" {
  description = "Billing mode for the DynamoDB lock table (PAY_PER_REQUEST or PROVISIONED)"
  type        = string
  default     = "PAY_PER_REQUEST"

  validation {
    condition     = contains(["PAY_PER_REQUEST", "PROVISIONED"], var.lock_table_billing_mode)
    error_message = "DynamoDB billing mode must be PAY_PER_REQUEST or PROVISIONED."
  }
}

variable "tags" {
  description = "Additional tags to apply to all bootstrap resources"
  type        = map(string)
  default     = {}
}

variable "iam_principals_arn" {
  description = "List of IAM principal ARNs permitted to use the KMS key for encrypt/decrypt state. Empty allows root account administration only."
  type        = list(string)
  default     = []
}

variable "lifecycle_transition_days" {
  description = "Days after which state files transition to Glacier"
  type        = number
  default     = 90
}

variable "lifecycle_expiration_days" {
  description = "Days after which non-current state file versions are permanently deleted (0 = keep indefinitely)"
  type        = number
  default     = 0
}

variable "noncurrent_version_transition_days" {
  description = "Days after noncurrent versions transition to Glacier"
  type        = number
  default     = 30
}

variable "noncurrent_version_expiration_days" {
  description = "Days after which noncurrent versions are permanently deleted (0 = keep indefinitely)"
  type        = number
  default     = 365
}
