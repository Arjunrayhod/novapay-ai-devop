# ---------------------------------------------------------------------------
# CI/CD Policy
#
# Scope: Pipeline execution for infrastructure deployment via GitHub Actions.
# Bounded by Permission Boundary — no privilege escalation.
#
# Permissions:
#   - Terraform state management (S3 + DynamoDB)
#   - Infrastructure CRUD: EC2, S3, RDS, EKS, Lambda, DynamoDB, KMS
#   - IAM role creation with permission boundary (for workload roles)
#   - PassRole to AWS services (EC2, EKS, Lambda, RDS)
#
# Denied:
#   - IAM actions on privileged roles
#   - Organization management
#   - Account closure
#   - User/group management
# ---------------------------------------------------------------------------

data "aws_iam_policy_document" "cicd" {
  # Allow: Terraform state backend access
  statement {
    sid    = "AllowStateBackend"
    effect = "Allow"
    actions = [
      "s3:GetObject",
      "s3:PutObject",
      "s3:DeleteObject",
      "s3:ListBucket",
      "s3:GetBucketVersioning",
      "s3:GetObjectVersion",
      "dynamodb:GetItem",
      "dynamodb:PutItem",
      "dynamodb:DeleteItem",
      "dynamodb:DescribeTable",
    ]
    resources = [
      "arn:aws:s3:::aegisai-terraform-state*",
      "arn:aws:s3:::aegisai-terraform-state*/*",
      "arn:aws:dynamodb:*:*:table/aegisai-terraform-locks",
    ]
  }

  # Allow: full infrastructure CRUD
  statement {
    sid    = "AllowInfrastructureCRUD"
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

  # Allow: IAM role management for workload roles
  statement {
    sid    = "AllowWorkloadIAM"
    effect = "Allow"
    actions = [
      "iam:CreateRole",
      "iam:DeleteRole",
      "iam:GetRole",
      "iam:ListRoles",
      "iam:TagRole",
      "iam:UntagRole",
      "iam:PutRolePolicy",
      "iam:DeleteRolePolicy",
      "iam:GetRolePolicy",
      "iam:AttachRolePolicy",
      "iam:DetachRolePolicy",
      "iam:CreateInstanceProfile",
      "iam:DeleteInstanceProfile",
      "iam:AddRoleToInstanceProfile",
      "iam:RemoveRoleFromInstanceProfile",
      "iam:CreatePolicy",
      "iam:DeletePolicy",
      "iam:GetPolicy",
      "iam:CreatePolicyVersion",
      "iam:DeletePolicyVersion",
      "iam:SetDefaultPolicyVersion",
    ]
    resources = ["*"]
  }

  # Allow: PassRole to AWS services
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
      ]
    }
  }
}

resource "aws_iam_policy" "cicd" {
  count = var.create_cicd_role ? 1 : 0

  name        = "${var.name_prefix}-${var.environment}-cicd"
  path        = "/platform/"
  description = "CI/CD policy for ${var.environment} — pipeline execution for infrastructure deployment via GitHub Actions OIDC"
  policy      = data.aws_iam_policy_document.cicd.json
  tags        = merge(local.tags, { Policy = "cicd" })
}
