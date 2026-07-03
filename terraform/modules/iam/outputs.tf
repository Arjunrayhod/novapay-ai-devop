# ---------------------------------------------------------------------------
# Role outputs
# ---------------------------------------------------------------------------

output "platform_admin_role_arn" {
  description = "ARN of the Platform Admin IAM role"
  value       = try(aws_iam_role.platform_admin[0].arn, null)
}

output "platform_admin_role_name" {
  description = "Name of the Platform Admin IAM role"
  value       = try(aws_iam_role.platform_admin[0].name, null)
}

output "platform_operator_role_arn" {
  description = "ARN of the Platform Operator IAM role"
  value       = try(aws_iam_role.platform_operator[0].arn, null)
}

output "platform_operator_role_name" {
  description = "Name of the Platform Operator IAM role"
  value       = try(aws_iam_role.platform_operator[0].name, null)
}

output "cicd_role_arn" {
  description = "ARN of the CI/CD IAM role"
  value       = try(aws_iam_role.cicd[0].arn, null)
}

output "cicd_role_name" {
  description = "Name of the CI/CD IAM role"
  value       = try(aws_iam_role.cicd[0].name, null)
}

output "readonly_role_arn" {
  description = "ARN of the ReadOnly IAM role"
  value       = try(aws_iam_role.readonly[0].arn, null)
}

output "readonly_role_name" {
  description = "Name of the ReadOnly IAM role"
  value       = try(aws_iam_role.readonly[0].name, null)
}

output "terraform_execution_role_arn" {
  description = "ARN of the Terraform Execution IAM role"
  value       = try(aws_iam_role.terraform_execution[0].arn, null)
}

output "terraform_execution_role_name" {
  description = "Name of the Terraform Execution IAM role"
  value       = try(aws_iam_role.terraform_execution[0].name, null)
}

output "cross_account_role_arn" {
  description = "ARN of the Cross-Account IAM role"
  value       = try(aws_iam_role.cross_account[0].arn, null)
}

output "cross_account_role_name" {
  description = "Name of the Cross-Account IAM role"
  value       = try(aws_iam_role.cross_account[0].name, null)
}

# ---------------------------------------------------------------------------
# Permission boundary outputs
# ---------------------------------------------------------------------------

output "permission_boundary_arn" {
  description = "ARN of the permission boundary policy"
  value       = try(aws_iam_policy.permission_boundary[0].arn, null)
}

output "permission_boundary_name" {
  description = "Name of the permission boundary policy"
  value       = try(aws_iam_policy.permission_boundary[0].name, null)
}

# ---------------------------------------------------------------------------
# OIDC outputs
# ---------------------------------------------------------------------------

output "github_oidc_provider_arn" {
  description = "ARN of the GitHub OIDC identity provider"
  value       = try(aws_iam_openid_connect_provider.github[0].arn, null)
}

output "github_oidc_provider_url" {
  description = "URL of the GitHub OIDC identity provider"
  value       = try(aws_iam_openid_connect_provider.github[0].url, null)
}
