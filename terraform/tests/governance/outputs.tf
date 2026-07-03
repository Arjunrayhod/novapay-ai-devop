# ---------------------------------------------------------------------------
# Local outputs for test verification
# ---------------------------------------------------------------------------

output "test_minimal_naming_base" {
  description = "Naming base from minimal governance test"
  value       = module.governance_minimal.naming_base
}

output "test_minimal_tag_count" {
  description = "Tag count from minimal governance test"
  value       = length(module.governance_minimal.merged_tags)
}

output "test_production_has_compliance" {
  description = "Whether production test has compliance requirements"
  value       = module.governance_production.has_compliance_requirements
}

output "test_production_selected_frameworks" {
  description = "Selected compliance frameworks from production test"
  value       = keys(module.governance_production.selected_controls)
}

output "test_ephemeral_expires_on" {
  description = "Expiration date tag from ephemeral test"
  value       = module.governance_ephemeral.merged_tags["ExpiresOn"]
}

output "test_ephemeral_is_ephemeral" {
  description = "Is ephemeral classification flag"
  value       = module.governance_ephemeral.resource_classification.is_ephemeral
}

output "test_region_naming_base" {
  description = "Naming base for US East region test"
  value       = module.governance_us_east.naming_base
}

output "test_compliance_pci_name" {
  description = "PCI-DSS framework name from compliance controls"
  value       = module.governance_production.compliance_controls["pci-dss"].framework
}

output "test_cost_allocation_chargeback" {
  description = "Chargeback enabled flag"
  value       = module.governance_production.cost_allocation.chargeback_enabled
}

output "test_cost_allocation_budget_code" {
  description = "Auto-generated budget code"
  value       = module.governance_production.cost_allocation.budget_code
}
