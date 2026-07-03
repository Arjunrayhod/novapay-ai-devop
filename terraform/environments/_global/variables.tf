variable "aws_region" {
  description = "AWS region for global resources"
  type        = string
  default     = "ap-south-1"
}

variable "aws_assume_role_arn" {
  description = "ARN of IAM role to assume for global operations"
  type        = string
  default     = ""
}

variable "owner" {
  description = "Team or individual owning global resources"
  type        = string
  default     = "platform-engineering"
}

variable "cost_center" {
  description = "Cost center for billing allocation"
  type        = string
  default     = "cc-platform"
}

variable "tags" {
  description = "Additional tags for global resources"
  type        = map(string)
  default     = {}
}

variable "domain_name" {
  description = "Root domain name for the platform"
  type        = string
  default     = "aegisai.platform"
}

variable "state_bucket_name" {
  description = "S3 bucket name for Terraform state"
  type        = string
  default     = "aegisai-terraform-state"
}

variable "state_lock_table" {
  description = "DynamoDB table for state locking"
  type        = string
  default     = "aegisai-terraform-locks"
}
