variable "aws_region" {
  description = "AWS region to deploy resources into"
  type        = string
}

variable "environment" {
  description = "Deployment environment name"
  type        = string
  validation {
    condition     = contains(["dev", "staging", "prod", "_global"], var.environment)
    error_message = "Environment must be one of: dev, staging, prod, _global"
  }
}

variable "name" {
  description = "Name identifier for this module instance"
  type        = string
}

variable "owner" {
  description = "Team or individual owning this resource"
  type        = string
  default     = "platform-engineering"
}

variable "cost_center" {
  description = "Cost center identifier for billing"
  type        = string
  default     = "cc-platform"
}

variable "tags" {
  description = "Additional tags to merge with defaults"
  type        = map(string)
  default     = {}
}
