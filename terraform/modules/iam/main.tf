# ---------------------------------------------------------------------------
# Platform Admin Role
# Full infrastructure management, bounded by permission boundary.
# No IAM privilege escalation possible.
# ---------------------------------------------------------------------------

resource "aws_iam_role" "platform_admin" {
  count = var.create_platform_admin_role ? 1 : 0

  name                 = "${local.role_name_prefix}-admin"
  path                 = var.roles_path
  assume_role_policy   = data.aws_iam_policy_document.trust_account.json
  max_session_duration = var.platform_admin_session_duration
  permissions_boundary = try(aws_iam_policy.permission_boundary[0].arn, null)
  description          = "Platform administrator role for ${var.environment} — full infrastructure access bounded by permission boundary"
  tags                 = merge(local.tags, { Role = "platform-admin" })
}

resource "aws_iam_role_policy_attachment" "platform_admin" {
  count = var.create_platform_admin_role ? 1 : 0

  role       = aws_iam_role.platform_admin[0].name
  policy_arn = aws_iam_policy.platform_admin[0].arn
}

# ---------------------------------------------------------------------------
# Platform Operator Role
# Day-to-day operations: deploy, manage, monitor.
# No IAM actions, no security policy changes.
# ---------------------------------------------------------------------------

resource "aws_iam_role" "platform_operator" {
  count = var.create_platform_operator_role ? 1 : 0

  name                 = "${local.role_name_prefix}-operator"
  path                 = var.roles_path
  assume_role_policy   = data.aws_iam_policy_document.trust_account.json
  max_session_duration = var.platform_operator_session_duration
  permissions_boundary = try(aws_iam_policy.permission_boundary[0].arn, null)
  description          = "Platform operator role for ${var.environment} — deploy and manage resources within defined scopes"
  tags                 = merge(local.tags, { Role = "platform-operator" })
}

resource "aws_iam_role_policy_attachment" "platform_operator" {
  count = var.create_platform_operator_role ? 1 : 0

  role       = aws_iam_role.platform_operator[0].name
  policy_arn = aws_iam_policy.platform_operator[0].arn
}

# ---------------------------------------------------------------------------
# CI/CD Role
# Assumed by GitHub Actions (OIDC) or CI pipelines.
# Bounded by permission boundary.
# ---------------------------------------------------------------------------

resource "aws_iam_role" "cicd" {
  count = var.create_cicd_role ? 1 : 0

  name                 = "${local.role_name_prefix}-cicd"
  path                 = var.roles_path
  assume_role_policy   = local.cicd_trust_policy
  max_session_duration = var.cicd_session_duration
  permissions_boundary = try(aws_iam_policy.permission_boundary[0].arn, null)
  description          = "CI/CD role for ${var.environment} — pipeline execution for infrastructure deployment"
  tags                 = merge(local.tags, { Role = "cicd" })
}

resource "aws_iam_role_policy_attachment" "cicd" {
  count = var.create_cicd_role ? 1 : 0

  role       = aws_iam_role.cicd[0].name
  policy_arn = aws_iam_policy.cicd[0].arn
}

# ---------------------------------------------------------------------------
# ReadOnly Role
# Read-only access across all AWS services.
# ---------------------------------------------------------------------------

resource "aws_iam_role" "readonly" {
  count = var.create_readonly_role ? 1 : 0

  name                 = "${local.role_name_prefix}-readonly"
  path                 = var.roles_path
  assume_role_policy   = data.aws_iam_policy_document.trust_account.json
  max_session_duration = var.readonly_session_duration
  description          = "ReadOnly role for ${var.environment} — view-only access across all services"
  tags                 = merge(local.tags, { Role = "readonly" })
}

resource "aws_iam_role_policy_attachment" "readonly" {
  count = var.create_readonly_role ? 1 : 0

  role       = aws_iam_role.readonly[0].name
  policy_arn = aws_iam_policy.readonly[0].arn
}

# ---------------------------------------------------------------------------
# Terraform Execution Role
# Assumed by Terraform runs (local or CI/CD) to provision infrastructure.
# Broader permissions than CI/CD role for full Terraform lifecycle.
# ---------------------------------------------------------------------------

resource "aws_iam_role" "terraform_execution" {
  count = var.create_terraform_execution_role ? 1 : 0

  name                 = "${local.role_name_prefix}-terraform"
  path                 = var.roles_path
  assume_role_policy   = local.terraform_trust_policy
  max_session_duration = var.terraform_execution_session_duration
  permissions_boundary = try(aws_iam_policy.permission_boundary[0].arn, null)
  description          = "Terraform execution role for ${var.environment} — infrastructure provisioning via Terraform"
  tags                 = merge(local.tags, { Role = "terraform-execution" })
}

resource "aws_iam_role_policy_attachment" "terraform_execution" {
  count = var.create_terraform_execution_role ? 1 : 0

  role       = aws_iam_role.terraform_execution[0].name
  policy_arn = aws_iam_policy.terraform_execution[0].arn
}

# ---------------------------------------------------------------------------
# Cross-Account Role
# Future-ready: enables multi-account access from designated source accounts.
# Disabled by default.
# ---------------------------------------------------------------------------

resource "aws_iam_role" "cross_account" {
  count = var.create_cross_account_role ? 1 : 0

  name                 = "${local.role_name_prefix}-cross-account"
  path                 = var.roles_path
  assume_role_policy   = data.aws_iam_policy_document.trust_cross_account[0].json
  max_session_duration = var.cross_account_session_duration
  permissions_boundary = try(aws_iam_policy.permission_boundary[0].arn, null)
  description          = "Cross-account role for ${var.environment} — multi-account access from trusted source accounts"
  tags                 = merge(local.tags, { Role = "cross-account" })
}

resource "aws_iam_role_policy_attachment" "cross_account" {
  count = var.create_cross_account_role ? 1 : 0

  role       = aws_iam_role.cross_account[0].name
  policy_arn = aws_iam_policy.cross_account[0].arn
}
