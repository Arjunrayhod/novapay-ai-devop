output "platform_admin_role_arn" {
  description = "ARN of the Platform Admin role"
  value       = module.iam.platform_admin_role_arn
}

output "cicd_role_arn" {
  description = "ARN of the CI/CD role (for GitHub Actions)"
  value       = module.iam.cicd_role_arn
}

output "terraform_execution_role_arn" {
  description = "ARN of the Terraform Execution role"
  value       = module.iam.terraform_execution_role_arn
}

output "permission_boundary_arn" {
  description = "ARN of the permission boundary policy"
  value       = module.iam.permission_boundary_arn
}

output "github_oidc_provider_arn" {
  description = "ARN of the GitHub OIDC provider"
  value       = module.iam.github_oidc_provider_arn
}
