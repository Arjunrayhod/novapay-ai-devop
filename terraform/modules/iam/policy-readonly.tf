# ---------------------------------------------------------------------------
# ReadOnly Policy
#
# Scope: Read-only access across all AWS services.
# No write, create, delete, or modify operations.
#
# Permissions:
#   - List, Describe, Get on all major services
#   - CloudWatch metrics and log viewing
#   - IAM read (list roles, policies)
#
# Justified wildcards:
#   - ec2:Describe* — single action pattern covers all Describe calls
#   - s3:Get* — must cover GetObject, GetBucketLocation, GetBucketPolicy, etc.
#   - rds:Describe* — single action pattern covers all RDS describes
# ---------------------------------------------------------------------------

data "aws_iam_policy_document" "readonly" {
  # Allow: EC2 read
  statement {
    sid    = "AllowEC2Read"
    effect = "Allow"
    actions = [
      "ec2:Describe*",
      "ec2:Get*",
    ]
    resources = ["*"]
  }

  # Allow: S3 read
  statement {
    sid    = "AllowS3Read"
    effect = "Allow"
    actions = [
      "s3:ListAllMyBuckets",
      "s3:ListBucket",
      "s3:GetObject",
      "s3:GetObjectVersion",
      "s3:GetBucketLocation",
      "s3:GetBucketVersioning",
      "s3:GetBucketPolicy",
      "s3:GetBucketPublicAccessBlock",
      "s3:GetEncryptionConfiguration",
    ]
    resources = ["*"]
  }

  # Allow: RDS read
  statement {
    sid    = "AllowRDSRead"
    effect = "Allow"
    actions = [
      "rds:Describe*",
      "rds:ListTagsForResource",
      "rds:DownloadDBLogFilePortion",
    ]
    resources = ["*"]
  }

  # Allow: EKS read
  statement {
    sid    = "AllowEKSRead"
    effect = "Allow"
    actions = [
      "eks:Describe*",
      "eks:List*",
      "eks:AccessKubernetesApi",
    ]
    resources = ["*"]
  }

  # Allow: Lambda read
  statement {
    sid    = "AllowLambdaRead"
    effect = "Allow"
    actions = [
      "lambda:Get*",
      "lambda:List*",
    ]
    resources = ["*"]
  }

  # Allow: DynamoDB read
  statement {
    sid    = "AllowDynamoDBRead"
    effect = "Allow"
    actions = [
      "dynamodb:Describe*",
      "dynamodb:GetItem",
      "dynamodb:List*",
      "dynamodb:Query",
      "dynamodb:Scan",
    ]
    resources = ["*"]
  }

  # Allow: KMS read
  statement {
    sid    = "AllowKMSRead"
    effect = "Allow"
    actions = [
      "kms:Describe*",
      "kms:Get*",
      "kms:List*",
    ]
    resources = ["*"]
  }

  # Allow: CloudWatch and logs read
  statement {
    sid    = "AllowMonitoringRead"
    effect = "Allow"
    actions = [
      "cloudwatch:Describe*",
      "cloudwatch:Get*",
      "cloudwatch:List*",
      "logs:Describe*",
      "logs:Get*",
      "logs:List*",
      "logs:FilterLogEvents",
      "logs:StartQuery",
      "logs:GetQueryResults",
    ]
    resources = ["*"]
  }

  # Allow: IAM read
  statement {
    sid    = "AllowIAMRead"
    effect = "Allow"
    actions = [
      "iam:Get*",
      "iam:List*",
      "iam:GenerateServiceLastAccessedDetails",
    ]
    resources = ["*"]
  }

  # Allow: networking read
  statement {
    sid    = "AllowNetworkingRead"
    effect = "Allow"
    actions = [
      "elasticloadbalancing:Describe*",
      "route53:Get*",
      "route53:List*",
      "acm:Describe*",
      "acm:List*",
    ]
    resources = ["*"]
  }

  # Allow: container read
  statement {
    sid    = "AllowContainerRead"
    effect = "Allow"
    actions = [
      "ecr:Describe*",
      "ecr:Get*",
      "ecr:List*",
      "ecs:Describe*",
      "ecs:List*",
    ]
    resources = ["*"]
  }

  # Allow: security services read
  statement {
    sid    = "AllowSecurityRead"
    effect = "Allow"
    actions = [
      "waf:Get*",
      "waf:List*",
      "wafv2:Get*",
      "wafv2:List*",
      "shield:Get*",
      "shield:List*",
      "guardduty:Get*",
      "guardduty:List*",
      "cloudtrail:Get*",
      "cloudtrail:List*",
      "config:Get*",
      "config:List*",
      "config:Describe*",
    ]
    resources = ["*"]
  }

  # Allow: cost and usage read
  statement {
    sid    = "AllowCostRead"
    effect = "Allow"
    actions = [
      "ce:Get*",
      "ce:List*",
      "ce:Describe*",
    ]
    resources = ["*"]
  }
}

resource "aws_iam_policy" "readonly" {
  count = var.create_readonly_role ? 1 : 0

  name        = "${var.name_prefix}-${var.environment}-readonly"
  path        = "/platform/"
  description = "ReadOnly policy for ${var.environment} — view-only access across all AWS services"
  policy      = data.aws_iam_policy_document.readonly.json
  tags        = merge(local.tags, { Policy = "readonly" })
}
