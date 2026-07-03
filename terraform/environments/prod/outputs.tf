output "environment" {
  description = "Current environment name"
  value       = local.environment
}

output "aws_region" {
  description = "AWS region for this environment"
  value       = var.aws_region
}

output "vpc_cidr" {
  description = "VPC CIDR block"
  value       = var.vpc_cidr
}

output "common_tags" {
  description = "Tags applied to all resources"
  value       = local.common_tags
}

output "cluster_version" {
  description = "EKS cluster version"
  value       = var.cluster_version
}
