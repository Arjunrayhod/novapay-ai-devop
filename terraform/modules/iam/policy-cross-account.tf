# ---------------------------------------------------------------------------
# Cross-Account Policy
#
# Scope: Multi-account access for centralized platform management.
# Same scope as Platform Admin, but accessible from external accounts.
# Enabled only when cross_account_source_accounts is populated.
#
# Permissions:
#   - Full infrastructure management across all services
#   - IAM read and limited write (bounded by permission boundary)
#
# Denied (via permission boundary):
#   - Organization management
#   - Account closure
#   - User/group management
#   - Security service disable
# ---------------------------------------------------------------------------

data "aws_iam_policy_document" "cross_account" {
  # Allow: full infrastructure management
  statement {
    sid    = "AllowFullInfrastructureCRUD"
    effect = "Allow"
    actions = [
      "ec2:*",
      "s3:*",
      "rds:*",
      "eks:*",
      "lambda:*",
      "dynamodb:*",
      "kms:*",
      "logs:*",
      "cloudwatch:*",
      "autoscaling:*",
      "elasticloadbalancing:*",
      "sqs:*",
      "sns:*",
      "elasticache:*",
      "ecr:*",
      "acm:*",
      "route53:*",
      "secretsmanager:*",
      "ssm:*",
    ]
    resources = ["*"]
  }

  # Allow: IAM read and PassRole
  statement {
    sid    = "AllowIAMReadAndPass"
    effect = "Allow"
    actions = [
      "iam:GetRole",
      "iam:ListRoles",
      "iam:GetPolicy",
      "iam:ListPolicies",
      "iam:PassRole",
      "iam:GetInstanceProfile",
      "iam:ListInstanceProfiles",
    ]
    resources = ["*"]
  }

  # Allow: read monitoring and logging
  statement {
    sid    = "AllowMonitoringAccess"
    effect = "Allow"
    actions = [
      "cloudwatch:Describe*",
      "cloudwatch:Get*",
      "cloudwatch:List*",
      "logs:Describe*",
      "logs:Get*",
      "logs:List*",
      "logs:FilterLogEvents",
    ]
    resources = ["*"]
  }
}

resource "aws_iam_policy" "cross_account" {
  count = var.create_cross_account_role ? 1 : 0

  name        = "${var.name_prefix}-${var.environment}-cross-account"
  path        = "/platform/"
  description = "Cross-account policy for ${var.environment} — multi-account infrastructure management from trusted source accounts"
  policy      = data.aws_iam_policy_document.cross_account.json
  tags        = merge(local.tags, { Policy = "cross-account" })
}
