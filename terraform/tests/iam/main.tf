# Test: IAM module creates all roles with correct configuration
# This is a validation test — run with: terraform validate && terraform plan

terraform {
  required_version = ">= 1.9.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.80"
    }
  }
}

provider "aws" {
  region = "ap-south-1"
}

module "iam" {
  source = "../../modules/iam"

  environment = "test"
  name_prefix = "aegisai-test"

  create_platform_admin_role      = true
  create_platform_operator_role   = true
  create_cicd_role                = true
  create_readonly_role            = true
  create_terraform_execution_role = true
  create_cross_account_role       = false

  create_github_oidc_provider = false
  require_mfa                 = false

  create_permission_boundary = true
}

output "roles_created" {
  description = "Map of created role ARNs"
  value = {
    admin               = module.iam.platform_admin_role_arn
    operator            = module.iam.platform_operator_role_arn
    cicd                = module.iam.cicd_role_arn
    readonly            = module.iam.readonly_role_arn
    terraform_execution = module.iam.terraform_execution_role_arn
  }
}

output "permission_boundary" {
  description = "Permission boundary ARN"
  value       = module.iam.permission_boundary_arn
}

# Validation: all expected roles must have ARNs
resource "terraform_data" "validate_roles_count" {
  lifecycle {
    precondition {
      condition = alltrue([
        module.iam.platform_admin_role_arn != null,
        module.iam.platform_operator_role_arn != null,
        module.iam.cicd_role_arn != null,
        module.iam.readonly_role_arn != null,
        module.iam.terraform_execution_role_arn != null,
      ])
      error_message = "One or more expected IAM roles were not created."
    }
  }
}

# Validation: cross-account role must NOT be created (flag is false)
resource "terraform_data" "validate_cross_account_not_created" {
  lifecycle {
    precondition {
      condition     = module.iam.cross_account_role_arn == null
      error_message = "Cross-account role should not be created when create_cross_account_role is false."
    }
  }
}

# Validation: OIDC provider must NOT be created (flag is false)
resource "terraform_data" "validate_oidc_not_created" {
  lifecycle {
    precondition {
      condition     = module.iam.github_oidc_provider_arn == null
      error_message = "OIDC provider should not be created when create_github_oidc_provider is false."
    }
  }
}

# Validation: permission boundary must be created
resource "terraform_data" "validate_permission_boundary" {
  lifecycle {
    precondition {
      condition     = module.iam.permission_boundary_arn != null
      error_message = "Permission boundary was not created."
    }
  }
}
