# ---------------------------------------------------------------------------
# General
# ---------------------------------------------------------------------------

variable "environment" {
  description = "Deployment environment name"
  type        = string
  validation {
    condition     = can(regex("^[a-z0-9_-]+$", var.environment))
    error_message = "Environment must contain only lowercase letters, numbers, hyphens, and underscores."
  }
}

variable "name_prefix" {
  description = "Prefix for all resource names"
  type        = string
  default     = "aegisai"
  validation {
    condition     = can(regex("^[a-z][a-z0-9-]{0,20}$", var.name_prefix))
    error_message = "Name prefix must start with a letter, contain only lowercase letters, numbers, and hyphens, and be at most 21 characters."
  }
}

variable "aws_region" {
  description = "AWS region where resources are deployed"
  type        = string
  default     = "ap-south-1"
  validation {
    condition     = can(regex("^[a-z]{2}-[a-z]+-[0-9]{1}$", var.aws_region))
    error_message = "AWS region must be a valid region code (e.g., ap-south-1)."
  }
}

variable "additional_tags" {
  description = "Additional tags to merge with governance tags"
  type        = map(string)
  default     = {}
}

# ---------------------------------------------------------------------------
# Workload / Service identity
# ---------------------------------------------------------------------------

variable "workload" {
  description = "Name of the workload or service being deployed"
  type        = string
  validation {
    condition     = can(regex("^[a-z][a-z0-9-]{1,48}$", var.workload))
    error_message = "Workload name must start with a letter, contain only lowercase letters, numbers, and hyphens, and be 2-49 characters."
  }
}

variable "workload_type" {
  description = "Type of workload (web-service, event-processor, batch-job, internal-api, platform-service, data-store, ai-service)"
  type        = string
  default     = "platform-service"
  validation {
    condition     = contains(["web-service", "event-processor", "batch-job", "internal-api", "platform-service", "data-store", "ai-service"], var.workload_type)
    error_message = "Workload type must be one of: web-service, event-processor, batch-job, internal-api, platform-service, data-store, ai-service."
  }
}

# ---------------------------------------------------------------------------
# Ownership and accountability
# ---------------------------------------------------------------------------

variable "owner" {
  description = "Team or individual owning the deployed resources"
  type        = string
  default     = "platform-engineering"
  validation {
    condition     = can(regex("^[a-z][a-z0-9-_]{1,48}$", var.owner))
    error_message = "Owner must start with a letter and contain only lowercase letters, numbers, hyphens, and underscores."
  }
}

variable "cost_center" {
  description = "Cost center identifier for billing allocation and chargeback"
  type        = string
  default     = "cc-platform"
  validation {
    condition     = can(regex("^cc-[a-z][a-z0-9-]{0,30}$", var.cost_center))
    error_message = "Cost center must start with 'cc-' followed by a letter and contain only lowercase letters, numbers, and hyphens."
  }
}

variable "budget_code" {
  description = "Budget code for cost tracking and forecasting"
  type        = string
  default     = ""
  validation {
    condition     = var.budget_code == "" || can(regex("^bg-[a-z0-9-]{1,30}$", var.budget_code))
    error_message = "Budget code must be empty or start with 'bg-' followed by lowercase letters, numbers, and hyphens."
  }
}

# ---------------------------------------------------------------------------
# Data classification and compliance
# ---------------------------------------------------------------------------

variable "data_classification" {
  description = "Data classification level for the workload"
  type        = string
  default     = "internal"
  validation {
    condition     = contains(["public", "internal", "confidential", "restricted"], var.data_classification)
    error_message = "Data classification must be one of: public, internal, confidential, restricted."
  }
}

variable "compliance_frameworks" {
  description = "List of compliance frameworks applicable to this workload"
  type        = list(string)
  default     = []
  validation {
    condition     = alltrue([for f in var.compliance_frameworks : contains(["pci-dss", "soc2", "iso27001", "rbi", "hipaa", "gdpr", "none"], f)])
    error_message = "Compliance frameworks must be from: pci-dss, soc2, iso27001, rbi, hipaa, gdpr, none."
  }
}

variable "resource_criticality" {
  description = "Business criticality level of the resources"
  type        = string
  default     = "medium"
  validation {
    condition     = contains(["critical", "high", "medium", "low"], var.resource_criticality)
    error_message = "Resource criticality must be one of: critical, high, medium, low."
  }
}

variable "requires_encryption_at_rest" {
  description = "Require encryption at rest for all storage resources"
  type        = bool
  default     = true
}

variable "requires_encryption_in_transit" {
  description = "Require TLS 1.3 for all network communication"
  type        = bool
  default     = true
}

variable "requires_backup" {
  description = "Require automated backup configuration"
  type        = bool
  default     = true
}

# ---------------------------------------------------------------------------
# Lifecycle
# ---------------------------------------------------------------------------

variable "environment_tier" {
  description = "Environment tier for lifecycle management"
  type        = string
  default     = "development"
  validation {
    condition     = contains(["development", "testing", "staging", "production", "sandbox", "ephemeral"], var.environment_tier)
    error_message = "Environment tier must be one of: development, testing, staging, production, sandbox, ephemeral."
  }
}

variable "expiration_date" {
  description = "Expiration date for ephemeral resources (format: YYYY-MM-DD). Leave empty for permanent resources."
  type        = string
  default     = ""
  validation {
    condition     = var.expiration_date == "" || can(regex("^20[0-9]{2}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$", var.expiration_date))
    error_message = "Expiration date must be empty or in YYYY-MM-DD format."
  }
}

# ---------------------------------------------------------------------------
# Naming overrides
# ---------------------------------------------------------------------------

variable "naming_delimiter" {
  description = "Delimiter character used in resource names"
  type        = string
  default     = "-"
  validation {
    condition     = contains(["-", "_", "."], var.naming_delimiter)
    error_message = "Naming delimiter must be one of: -, _, ."
  }
}

variable "resource_name_max_length" {
  description = "Maximum length for generated resource names"
  type        = number
  default     = 63
  validation {
    condition     = var.resource_name_max_length >= 10 && var.resource_name_max_length <= 255
    error_message = "Resource name max length must be between 10 and 255."
  }
}
