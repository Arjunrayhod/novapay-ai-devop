variable "environment" {
  description = "Deployment environment name"
  type        = string
  validation {
    condition     = contains(["dev", "staging", "prod", "_global"], var.environment)
    error_message = "Environment must be one of: dev, staging, prod, _global"
  }
}

variable "aws_region" {
  description = "AWS region for all resources"
  type        = string
  default     = "ap-south-1"
}

variable "aws_assume_role_arn" {
  description = "ARN of IAM role to assume for AWS provider operations"
  type        = string
  default     = ""
}

variable "azure_subscription_id" {
  description = "Azure subscription ID"
  type        = string
  default     = ""
}

variable "azure_tenant_id" {
  description = "Azure tenant ID"
  type        = string
  default     = ""
}

variable "gcp_project_id" {
  description = "GCP project ID"
  type        = string
  default     = ""
}

variable "gcp_region" {
  description = "GCP region"
  type        = string
  default     = ""
}

variable "enable_azure_provider" {
  description = "Enable the AzureRM provider for multi-cloud deployments"
  type        = bool
  default     = false
}

variable "enable_gcp_provider" {
  description = "Enable the Google Cloud provider for multi-cloud deployments"
  type        = bool
  default     = false
}

variable "owner" {
  description = "Team or individual owning the deployed resources"
  type        = string
  default     = "platform-engineering"
}

variable "cost_center" {
  description = "Cost center identifier for billing allocation"
  type        = string
  default     = "cc-platform"
}

variable "name_prefix" {
  description = "Prefix for all resource names. Defaults to 'aegisai' if empty."
  type        = string
  default     = "aegisai"
}

variable "tags" {
  description = "Additional tags to merge with common_tags"
  type        = map(string)
  default     = {}
}

variable "terraform_state_bucket" {
  description = "S3 bucket name for Terraform state storage"
  type        = string
  default     = "aegisai-terraform-state"
}

variable "terraform_state_dynamodb_table" {
  description = "DynamoDB table name for Terraform state locking"
  type        = string
  default     = "aegisai-terraform-locks"
}

variable "terraform_state_region" {
  description = "AWS region for Terraform state backend"
  type        = string
  default     = "ap-south-1"
}

variable "terraform_state_kms_alias" {
  description = "KMS key alias for state encryption"
  type        = string
  default     = "alias/terraform-state-key"
}
