output "merged_tags" {
  description = "Complete governance-enforced tag set"
  value       = module.governance.merged_tags
}

output "naming_base" {
  description = "Generated naming base prefix"
  value       = module.governance.naming_base
}

output "selected_controls" {
  description = "Compliance controls for selected frameworks"
  value       = module.governance.selected_controls
}

output "resource_classification" {
  description = "Resource classification metadata"
  value       = module.governance.resource_classification
}

output "cost_allocation" {
  description = "Cost allocation metadata"
  value       = module.governance.cost_allocation
}
