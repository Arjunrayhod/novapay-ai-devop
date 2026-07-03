variable "environment" {
  description = "Deployment environment"
  type        = string
  default     = "dev"
  validation {
    condition     = contains(["dev", "staging", "prod", "_global"], var.environment)
    error_message = "Environment must be one of: dev, staging, prod, _global."
  }
}

variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "ap-south-1"
}

variable "name_prefix" {
  description = "Prefix for resource names"
  type        = string
  default     = "aegisai"
}

variable "workload" {
  description = "Name of the workload or service"
  type        = string
  default     = "example-service"
}

variable "workload_type" {
  description = "Type of workload"
  type        = string
  default     = "platform-service"
}

variable "owner" {
  description = "Team or individual owning the resources"
  type        = string
  default     = "platform-engineering"
}

variable "cost_center" {
  description = "Cost center for billing allocation"
  type        = string
  default     = "cc-platform"
}

variable "budget_code" {
  description = "Budget code for cost tracking"
  type        = string
  default     = ""
}

variable "data_classification" {
  description = "Data classification level"
  type        = string
  default     = "internal"
}

variable "compliance_frameworks" {
  description = "Applicable compliance frameworks"
  type        = list(string)
  default     = ["soc2"]
}

variable "resource_criticality" {
  description = "Business criticality level"
  type        = string
  default     = "medium"
}

variable "requires_encryption_at_rest" {
  description = "Require encryption at rest"
  type        = bool
  default     = true
}

variable "requires_encryption_in_transit" {
  description = "Require TLS 1.3 in transit"
  type        = bool
  default     = true
}

variable "requires_backup" {
  description = "Require automated backup"
  type        = bool
  default     = true
}

variable "environment_tier" {
  description = "Environment tier for lifecycle management"
  type        = string
  default     = "development"
}

variable "expiration_date" {
  description = "Expiration date for ephemeral resources (YYYY-MM-DD)"
  type        = string
  default     = ""
}

variable "additional_tags" {
  description = "Additional tags to merge with governance tags"
  type        = map(string)
  default     = {
    Demo = "governance-example"
  }
}
