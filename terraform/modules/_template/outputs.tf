output "resource_name" {
  description = "Generated resource name based on naming convention"
  value       = local.resource_name
}

output "tags" {
  description = "Complete tag map applied to resources"
  value       = local.tags
}

output "environment" {
  description = "Environment this module instance targets"
  value       = var.environment
}
