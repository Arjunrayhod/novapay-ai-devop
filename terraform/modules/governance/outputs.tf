# ---------------------------------------------------------------------------
# Tagging outputs
# ---------------------------------------------------------------------------

output "merged_tags" {
  description = "Complete set of governance-enforced tags merged from all tag categories and additional tags"
  value       = local.merged_tags
}

output "mandatory_tags" {
  description = "Mandatory base tags applied to all resources"
  value       = local.mandatory_tags
}

output "data_classification_tags" {
  description = "Tags related to data classification and compliance framework applicability"
  value       = local.data_classification_tags
}

output "security_tags" {
  description = "Tags indicating encryption and security posture requirements"
  value       = local.security_tags
}

output "cost_tags" {
  description = "Tags for cost allocation, chargeback, and budget tracking"
  value       = local.cost_tags
}

output "lifecycle_tags" {
  description = "Tags for resource lifecycle management and environment tier"
  value       = local.lifecycle_tags
}

# ---------------------------------------------------------------------------
# Naming convention outputs
# ---------------------------------------------------------------------------

output "naming_base" {
  description = "Base naming prefix following convention: {prefix}-{env}-{region_code}-{workload}"
  value       = local.naming_base
}

output "naming_map" {
  description = "Map of pre-computed resource names for common resource types following the naming convention"
  value       = local.naming_map
}

output "region_code" {
  description = "Short region code for naming (e.g., aps1 for ap-south-1)"
  value       = local.region_code
}

# ---------------------------------------------------------------------------
# Compliance outputs
# ---------------------------------------------------------------------------

output "compliance_controls" {
  description = "Full map of compliance framework definitions with controls and platform coverage mappings"
  value       = local.compliance_controls
}

output "selected_controls" {
  description = "Compliance controls filtered to only the frameworks specified in var.compliance_frameworks"
  value       = local.selected_controls
}

output "has_compliance_requirements" {
  description = "Boolean flag indicating whether any compliance frameworks are selected"
  value       = local.has_compliance_requirements
}

# ---------------------------------------------------------------------------
# Resource classification outputs
# ---------------------------------------------------------------------------

output "resource_classification" {
  description = "Resource classification metadata including criticality, data classification, tier, and compliance applicability"
  value       = local.resource_classification
}

# ---------------------------------------------------------------------------
# Cost allocation outputs
# ---------------------------------------------------------------------------

output "cost_allocation" {
  description = "Cost allocation metadata for chargeback and budget tracking"
  value       = local.cost_allocation
}

# ---------------------------------------------------------------------------
# AWS Organizations (future)
# ---------------------------------------------------------------------------

output "organizations_config" {
  description = "AWS Organizations integration configuration (placeholder for future multi-account support)"
  value       = local.organizations_config
}

output "scp_templates" {
  description = "Pre-defined SCP templates for future AWS Organizations policy enforcement"
  value       = local.scp_templates
}

# ---------------------------------------------------------------------------
# Module metadata
# ---------------------------------------------------------------------------

output "governance_version" {
  description = "Version identifier for the governance module"
  value       = "1.0.0"
}
