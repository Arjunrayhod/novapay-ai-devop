data "aws_caller_identity" "current" {}

locals {
  account_id = var.account_id != "" ? var.account_id : data.aws_caller_identity.current.account_id

  role_name_prefix = "${var.name_prefix}-${var.environment}"

  tags = merge({
    Environment = var.environment
    ManagedBy   = "terraform"
    Platform    = var.name_prefix
    Component   = "iam"
  }, var.tags)

  # GitHub repository subjects for OIDC trust policy
  # Format: repo:org/repo:ref:refs/heads/main
  oidc_subjects = length(var.github_repositories) > 0 ? [
    for repo in var.github_repositories : "repo:${repo}"
  ] : []

  # CI/CD trust policy: prefers OIDC when available, falls back to account trust
  cicd_trust_policy = try(
    data.aws_iam_policy_document.trust_cicd_oidc[0].json,
    data.aws_iam_policy_document.trust_account.json
  )

  # Terraform trust policy: prefers CI/CD role chain, falls back to account trust
  terraform_trust_policy = try(
    data.aws_iam_policy_document.trust_terraform[0].json,
    data.aws_iam_policy_document.trust_account.json
  )
}
