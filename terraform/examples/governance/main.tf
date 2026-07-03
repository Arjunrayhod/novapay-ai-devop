# ---------------------------------------------------------------------------
# Governance Module Usage Example
# ---------------------------------------------------------------------------
# This example demonstrates how to use the governance module to enforce
# enterprise tagging, naming, compliance, and cost allocation standards.
#
# The governance module is data-only (no resources created). It produces
# computed values that other modules and root configurations consume.
# ---------------------------------------------------------------------------

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

# ---------------------------------------------------------------------------
# Governance module — primary consumption pattern
# ---------------------------------------------------------------------------
# Every workload module should instantiate governance and use its outputs
# for tagging, naming, compliance, and cost allocation.
# ---------------------------------------------------------------------------

module "governance" {
  source = "../../modules/governance"

  environment   = var.environment
  workload      = var.workload
  workload_type = var.workload_type
  owner         = var.owner
  cost_center   = var.cost_center
  budget_code   = var.budget_code
  aws_region    = var.aws_region
  name_prefix   = var.name_prefix

  data_classification   = var.data_classification
  compliance_frameworks = var.compliance_frameworks
  resource_criticality  = var.resource_criticality

  requires_encryption_at_rest    = var.requires_encryption_at_rest
  requires_encryption_in_transit = var.requires_encryption_in_transit
  requires_backup                = var.requires_backup

  environment_tier = var.environment_tier
  expiration_date  = var.expiration_date

  additional_tags = var.additional_tags
}

# ---------------------------------------------------------------------------
# Example 1: Using merged_tags for resource creation
# ---------------------------------------------------------------------------
# The most common pattern: pass module.governance.merged_tags directly
# to every resource's tags argument.
# ---------------------------------------------------------------------------

resource "aws_s3_bucket" "example" {
  bucket = module.governance.naming_map.s3_bucket
  tags   = module.governance.merged_tags
}

resource "aws_kms_key" "example" {
  description             = "${module.governance.naming_base}-example-key"
  deletion_window_in_days = 7
  enable_key_rotation     = true
  tags                    = module.governance.merged_tags
}

resource "aws_kms_alias" "example" {
  name          = "alias/${module.governance.naming_base}-example"
  target_key_id = aws_kms_key.example.id
}

# ---------------------------------------------------------------------------
# Example 2: Compliance-aware configuration
# ---------------------------------------------------------------------------
# When compliance frameworks are specified, the module provides control
# mappings that can be used for documentation, tagging, and policy
# configuration.
# ---------------------------------------------------------------------------

# Check if compliance is required — useful for conditional policy attachment
locals {
  compliance_logging = module.governance.has_compliance_requirements ? "Compliance frameworks: ${join(", ", var.compliance_frameworks)}" : "No compliance frameworks specified"
}

# ---------------------------------------------------------------------------
# Example 3: Cost allocation tags
# ---------------------------------------------------------------------------
# Every resource automatically gets cost allocation tags via merged_tags.
# The cost_allocation output can be used for budget API integration.
# ---------------------------------------------------------------------------

resource "aws_sns_topic" "budget_alerts" {
  name = "${module.governance.naming_base}-budget-alerts"
  tags = module.governance.merged_tags
}

# ---------------------------------------------------------------------------
# Example 4: Resource classification for operational runbooks
# ---------------------------------------------------------------------------
# The resource_classification output informs operational decisions
# like backup frequency, monitoring criticality, and SLA tiers.
# ---------------------------------------------------------------------------

locals {
  backup_policy = module.governance.resource_classification.requires_backup ? "Daily backups with 30-day retention" : "No backup required"

  monitoring_tier = module.governance.resource_classification.criticality_level == "critical" ? "P1 monitoring with 1-minute scrape interval" : "Standard monitoring with 5-minute scrape interval"
}

# ---------------------------------------------------------------------------
# Outputs for verification
# ---------------------------------------------------------------------------

output "governance_tags" {
  description = "Complete set of governance-enforced tags"
  value       = module.governance.merged_tags
}

output "governance_naming_base" {
  description = "Naming convention base prefix"
  value       = module.governance.naming_base
}

output "governance_naming_map" {
  description = "Pre-computed resource names by type"
  value       = module.governance.naming_map
}

output "compliance_frameworks" {
  description = "Selected compliance frameworks and their controls"
  value       = module.governance.selected_controls
}

output "resource_classification" {
  description = "Resource classification metadata"
  value       = module.governance.resource_classification
}

output "cost_allocation" {
  description = "Cost allocation metadata for chargeback"
  value       = module.governance.cost_allocation
}
