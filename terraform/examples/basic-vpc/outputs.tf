output "environment" {
  description = "Environment this example deploys to"
  value       = var.environment
}

output "vpc_cidr" {
  description = "VPC CIDR block being used"
  value       = var.vpc_cidr
}
