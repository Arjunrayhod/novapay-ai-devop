# ---------------------------------------------------------------------------
# General
# ---------------------------------------------------------------------------

variable "environment" {
  description = "Deployment environment"
  type        = string
  validation {
    condition     = can(regex("^[a-z0-9_-]+$", var.environment))
    error_message = "Environment must contain only lowercase letters, numbers, hyphens, and underscores."
  }
}

variable "name_prefix" {
  description = "Prefix for all IAM resource names"
  type        = string
  default     = "aegisai"
}

variable "tags" {
  description = "Additional tags to apply to all IAM resources"
  type        = map(string)
  default     = {}
}

# ---------------------------------------------------------------------------
# Role enablement flags
# ---------------------------------------------------------------------------

variable "create_platform_admin_role" {
  description = "Create the Platform Admin IAM role"
  type        = bool
  default     = true
}

variable "create_platform_operator_role" {
  description = "Create the Platform Operator IAM role"
  type        = bool
  default     = true
}

variable "create_cicd_role" {
  description = "Create the CI/CD IAM role for pipeline execution"
  type        = bool
  default     = true
}

variable "create_readonly_role" {
  description = "Create the ReadOnly IAM role"
  type        = bool
  default     = true
}

variable "create_terraform_execution_role" {
  description = "Create the Terraform Execution IAM role for infrastructure provisioning"
  type        = bool
  default     = true
}

variable "create_cross_account_role" {
  description = "Create the Cross-Account IAM role for multi-account access (future)"
  type        = bool
  default     = false
}

# ---------------------------------------------------------------------------
# Session duration
# ---------------------------------------------------------------------------

variable "platform_admin_session_duration" {
  description = "Maximum session duration (seconds) for Platform Admin role"
  type        = number
  default     = 28800
}

variable "platform_operator_session_duration" {
  description = "Maximum session duration (seconds) for Platform Operator role"
  type        = number
  default     = 28800
}

variable "cicd_session_duration" {
  description = "Maximum session duration (seconds) for CI/CD role"
  type        = number
  default     = 3600
}

variable "readonly_session_duration" {
  description = "Maximum session duration (seconds) for ReadOnly role"
  type        = number
  default     = 43200
}

variable "terraform_execution_session_duration" {
  description = "Maximum session duration (seconds) for Terraform Execution role"
  type        = number
  default     = 3600
}

variable "cross_account_session_duration" {
  description = "Maximum session duration (seconds) for Cross-Account role"
  type        = number
  default     = 3600
}

# ---------------------------------------------------------------------------
# Trust relationships
# ---------------------------------------------------------------------------

variable "account_id" {
  description = "AWS account ID for account-level trust policies. If empty, uses caller identity."
  type        = string
  default     = ""
}

variable "require_mfa" {
  description = "Require MFA session for account-based role assumption"
  type        = bool
  default     = true
}

variable "github_oidc_provider_url" {
  description = "URL of the GitHub OIDC provider. If empty, the OIDC provider is not created."
  type        = string
  default     = "token.actions.githubusercontent.com"
}

variable "github_oidc_audience" {
  description = "Audience for GitHub OIDC token"
  type        = string
  default     = "sts.amazonaws.com"
}

variable "create_github_oidc_provider" {
  description = "Create the GitHub OIDC identity provider in AWS IAM"
  type        = bool
  default     = false
}

variable "github_repositories" {
  description = "List of GitHub repositories allowed to assume CI/CD role (format: org/repo:ref:refs/heads/main)"
  type        = list(string)
  default     = []
}

variable "cross_account_source_accounts" {
  description = "List of external AWS account IDs allowed to assume the cross-account role"
  type        = list(string)
  default     = []
}

variable "cross_account_source_role_names" {
  description = "List of IAM role names in external accounts allowed to assume cross-account role"
  type        = list(string)
  default     = []
}

# ---------------------------------------------------------------------------
# Permission boundary overrides
# ---------------------------------------------------------------------------

variable "create_permission_boundary" {
  description = "Create the permission boundary policy for platform roles"
  type        = bool
  default     = true
}

variable "allowed_iam_role_paths" {
  description = "List of IAM paths where roles can be created (for permission boundary)"
  type        = list(string)
  default     = ["/platform/", "/workloads/", "/terraform/"]
}

variable "allowed_pass_role_paths" {
  description = "List of IAM paths for roles that can be passed to AWS services"
  type        = list(string)
  default     = ["/platform/", "/workloads/", "/terraform/"]
}

# ---------------------------------------------------------------------------
# Path and name overrides
# ---------------------------------------------------------------------------

variable "roles_path" {
  description = "IAM path for all roles created by this module"
  type        = string
  default     = "/platform/"
}
