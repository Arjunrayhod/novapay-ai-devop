provider "aws" {
  region = var.aws_region

  default_tags {
    tags = local.common_tags
  }

  dynamic "assume_role" {
    for_each = var.aws_assume_role_arn != "" ? [1] : []
    content {
      role_arn     = var.aws_assume_role_arn
      session_name = "aegisai-terraform"
    }
  }
}

provider "azurerm" {
  count = var.enable_azure_provider ? 1 : 0

  features {
    resource_group {
      prevent_deletion_if_contains_resources = false
    }
  }

  subscription_id = var.azure_subscription_id
  tenant_id       = var.azure_tenant_id
}

provider "google" {
  count = var.enable_gcp_provider ? 1 : 0

  project = var.gcp_project_id
  region  = var.gcp_region
}
