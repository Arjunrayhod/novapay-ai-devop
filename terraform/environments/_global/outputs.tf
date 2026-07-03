output "environment" {
  description = "Current environment identifier"
  value       = local.environment
}

output "common_tags" {
  description = "Tags applied to all global resources"
  value       = local.common_tags
}

output "domain_name" {
  description = "Root domain name configured for the platform"
  value       = var.domain_name
}
