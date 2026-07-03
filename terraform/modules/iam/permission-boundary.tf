# ---------------------------------------------------------------------------
# Permission Boundary
#
# Applied to all platform roles. Prevents privilege escalation while
# allowing full infrastructure management.
#
# Allowed:
#   - Create/manage infrastructure resources
#   - Create IAM roles under /platform/, /workloads/, /terraform/ paths
#   - Pass roles from approved paths to AWS services
#
# Denied:
#   - IAM actions on privileged roles (outside approved paths)
#   - Organization management
#   - Account termination / closure
#   - Disabling security services (CloudTrail, Config, GuardDuty, WAF)
#   - Root user operations
# ---------------------------------------------------------------------------

data "aws_iam_policy_document" "permission_boundary" {
  # Allow: full infrastructure management
  statement {
    sid    = "AllowFullInfrastructureManagement"
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

  # Allow: limited IAM — create roles under approved paths only
  statement {
    sid    = "AllowLimitedIAM"
    effect = "Allow"

    actions = [
      "iam:CreateRole",
      "iam:DeleteRole",
      "iam:UpdateRole",
      "iam:GetRole",
      "iam:ListRoles",
      "iam:CreateInstanceProfile",
      "iam:DeleteInstanceProfile",
      "iam:GetInstanceProfile",
      "iam:AddRoleToInstanceProfile",
      "iam:RemoveRoleFromInstanceProfile",
      "iam:TagRole",
      "iam:UntagRole",
    ]

    resources = [
      for path in var.allowed_iam_role_paths : "arn:aws:iam::${local.account_id}:role${path}*"
    ]
  }

  # Allow: IAM role policy management under approved paths
  statement {
    sid    = "AllowRolePolicyManagement"
    effect = "Allow"

    actions = [
      "iam:PutRolePolicy",
      "iam:DeleteRolePolicy",
      "iam:GetRolePolicy",
      "iam:AttachRolePolicy",
      "iam:DetachRolePolicy",
      "iam:ListAttachedRolePolicies",
    ]

    resources = [
      for path in var.allowed_iam_role_paths : "arn:aws:iam::${local.account_id}:role${path}*"
    ]
  }

  # Allow: pass roles from approved paths to AWS services
  statement {
    sid    = "AllowPassRole"
    effect = "Allow"

    actions = [
      "iam:PassRole",
    ]

    resources = [
      for path in var.allowed_pass_role_paths : "arn:aws:iam::${local.account_id}:role${path}*"
    ]

    condition {
      test     = "StringLike"
      variable = "iam:PassedToService"
      values   = [
        "ec2.amazonaws.com",
        "eks.amazonaws.com",
        "eks-fargate-pods.amazonaws.com",
        "lambda.amazonaws.com",
        "rds.amazonaws.com",
        "ssm.amazonaws.com",
        "ecs-tasks.amazonaws.com",
        "codedeploy.amazonaws.com",
      ]
    }
  }

  # Allow: manage IAM policies under /platform/ path
  statement {
    sid    = "AllowManagePlatformPolicies"
    effect = "Allow"

    actions = [
      "iam:CreatePolicy",
      "iam:DeletePolicy",
      "iam:GetPolicy",
      "iam:ListPolicies",
      "iam:CreatePolicyVersion",
      "iam:DeletePolicyVersion",
      "iam:SetDefaultPolicyVersion",
    ]

    resources = [
      "arn:aws:iam::${local.account_id}:policy/platform/*",
      "arn:aws:iam::${local.account_id}:policy/terraform/*",
    ]
  }

  # Deny: IAM actions on privileged roles
  statement {
    sid    = "DenyIAMOnPrivilegedRoles"
    effect = "Deny"

    actions = [
      "iam:*",
    ]

    resources = [
      "arn:aws:iam::${local.account_id}:role/aws-reserved/*",
      "arn:aws:iam::${local.account_id}:role/service-role/*",
      "arn:aws:iam::${local.account_id}:role/aws-service-role/*",
      "arn:aws:iam::${local.account_id}:role/admin",
      "arn:aws:iam::${local.account_id}:role/*admin*",
    ]
  }

  # Deny: organization management
  statement {
    sid    = "DenyOrganizationManagement"
    effect = "Deny"

    actions = [
      "organizations:*",
    ]

    resources = ["*"]
  }

  # Deny: root-level account actions
  statement {
    sid    = "DenyAccountManagement"
    effect = "Deny"

    actions = [
      "account:CloseAccount",
      "aws-portal:*",
      "tax:*",
      "payment:*",
    ]

    resources = ["*"]
  }

  # Deny: disabling security services
  statement {
    sid    = "DenySecurityServiceDisable"
    effect = "Deny"

    actions = [
      "cloudtrail:StopLogging",
      "cloudtrail:DeleteTrail",
      "cloudtrail:UpdateTrail",
      "guardduty:DeleteDetector",
      "guardduty:UpdateDetector",
      "config:DeleteConfigRule",
      "config:DeleteConfigurationRecorder",
      "config:StopConfigurationRecorder",
      "waf-regional:DeleteWebACL",
      "wafv2:DeleteWebACL",
    ]

    resources = ["*"]
  }

  # Deny: IAM user and group management (use roles only)
  statement {
    sid    = "DenyUserAndGroupManagement"
    effect = "Deny"

    actions = [
      "iam:CreateUser",
      "iam:DeleteUser",
      "iam:UpdateUser",
      "iam:CreateGroup",
      "iam:DeleteGroup",
      "iam:AddUserToGroup",
      "iam:RemoveUserFromGroup",
      "iam:CreateAccessKey",
      "iam:DeleteAccessKey",
      "iam:UpdateAccessKey",
      "iam:CreateLoginProfile",
      "iam:DeleteLoginProfile",
      "iam:UpdateLoginProfile",
    ]

    resources = ["*"]
  }
}

resource "aws_iam_policy" "permission_boundary" {
  count = var.create_permission_boundary ? 1 : 0

  name        = "${var.name_prefix}-${var.environment}-permission-boundary"
  path        = "/platform/"
  description = "Permission boundary for ${var.environment} platform roles — prevents privilege escalation while allowing infrastructure management"
  policy      = data.aws_iam_policy_document.permission_boundary.json
  tags        = merge(local.tags, { Policy = "permission-boundary" })
}
