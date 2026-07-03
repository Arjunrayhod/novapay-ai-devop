# ---------------------------------------------------------------------------
# Terraform Execution Policy
#
# Scope: Full Terraform provisioning lifecycle.
# Intended to be assumed by CI/CD role or authorized operators.
# Bounded by Permission Boundary — no privilege escalation.
#
# Permissions:
#   - Full infrastructure CRUD (EC2, S3, RDS, EKS, Lambda, etc.)
#   - Terraform state backend access (S3 + DynamoDB)
#   - IAM role management for workload roles
#   - KMS management for service keys
#
# Denied:
#   - Organization management
#   - Account closure
#   - IAM user/group management
#   - Security service disable
# ---------------------------------------------------------------------------

data "aws_iam_policy_document" "terraform_execution" {
  # Allow: Terraform state backend
  statement {
    sid    = "AllowStateBackend"
    effect = "Allow"
    actions = [
      "s3:GetObject",
      "s3:PutObject",
      "s3:DeleteObject",
      "s3:ListBucket",
      "s3:GetBucketVersioning",
      "s3:GetBucketPolicy",
      "s3:PutBucketPolicy",
      "s3:GetBucketPublicAccessBlock",
      "s3:PutBucketPublicAccessBlock",
      "s3:GetBucketEncryption",
      "s3:PutBucketEncryption",
      "s3:GetBucketVersioning",
      "s3:PutBucketVersioning",
      "dynamodb:GetItem",
      "dynamodb:PutItem",
      "dynamodb:DeleteItem",
      "dynamodb:DescribeTable",
      "dynamodb:UpdateItem",
    ]
    resources = [
      "arn:aws:s3:::aegisai-terraform-state*",
      "arn:aws:s3:::aegisai-terraform-state*/*",
      "arn:aws:dynamodb:*:*:table/aegisai-terraform-locks",
      "arn:aws:dynamodb:*:*:table/*-terraform-locks",
    ]
  }

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
      "ecs:*",
    ]
    resources = ["*"]
  }

  # Allow: IAM role management
  statement {
    sid    = "AllowIAMRoleManagement"
    effect = "Allow"
    actions = [
      "iam:CreateRole",
      "iam:DeleteRole",
      "iam:UpdateRole",
      "iam:GetRole",
      "iam:ListRoles",
      "iam:TagRole",
      "iam:UntagRole",
      "iam:PutRolePolicy",
      "iam:DeleteRolePolicy",
      "iam:GetRolePolicy",
      "iam:AttachRolePolicy",
      "iam:DetachRolePolicy",
      "iam:ListAttachedRolePolicies",
      "iam:CreateInstanceProfile",
      "iam:DeleteInstanceProfile",
      "iam:GetInstanceProfile",
      "iam:ListInstanceProfiles",
      "iam:AddRoleToInstanceProfile",
      "iam:RemoveRoleFromInstanceProfile",
      "iam:CreatePolicy",
      "iam:DeletePolicy",
      "iam:GetPolicy",
      "iam:ListPolicies",
      "iam:CreatePolicyVersion",
      "iam:DeletePolicyVersion",
      "iam:SetDefaultPolicyVersion",
      "iam:GetPolicyVersion",
    ]
    resources = ["*"]
  }

  # Allow: PassRole to services
  statement {
    sid    = "AllowPassRoleToServices"
    effect = "Allow"
    actions = [
      "iam:PassRole",
    ]
    resources = ["*"]
    condition {
      test     = "StringLike"
      variable = "iam:PassedToService"
      values = [
        "ec2.amazonaws.com",
        "eks.amazonaws.com",
        "eks-fargate-pods.amazonaws.com",
        "lambda.amazonaws.com",
        "rds.amazonaws.com",
        "ssm.amazonaws.com",
        "ecs-tasks.amazonaws.com",
        "codedeploy.amazonaws.com",
        "cloudformation.amazonaws.com",
      ]
    }
  }

  # Allow: OIDC provider management (for GitHub Actions setup)
  statement {
    sid    = "AllowOIDCManagement"
    effect = "Allow"
    actions = [
      "iam:CreateOpenIDConnectProvider",
      "iam:DeleteOpenIDConnectProvider",
      "iam:GetOpenIDConnectProvider",
      "iam:ListOpenIDConnectProviders",
      "iam:UpdateOpenIDConnectProviderThumbprint",
    ]
    resources = ["*"]
  }
}

resource "aws_iam_policy" "terraform_execution" {
  count = var.create_terraform_execution_role ? 1 : 0

  name        = "${var.name_prefix}-${var.environment}-terraform"
  path        = "/platform/"
  description = "Terraform execution policy for ${var.environment} — infrastructure provisioning via Terraform with full resource lifecycle management"
  policy      = data.aws_iam_policy_document.terraform_execution.json
  tags        = merge(local.tags, { Policy = "terraform-execution" })
}
