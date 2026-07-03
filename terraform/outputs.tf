output "environment" {
  description = "Current deployment environment"
  value       = local.environment
}

output "aws_region" {
  description = "AWS region configured for this deployment"
  value       = var.aws_region
}

output "common_tags" {
  description = "Map of common tags applied to all resources"
  value       = local.common_tags
}

output "name_prefix" {
  description = "Resource name prefix for this deployment"
  value       = local.name_prefix
}
