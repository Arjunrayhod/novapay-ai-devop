# ---------------------------------------------------------------------------
# Platform Admin Policy
#
# Scope: Full infrastructure management across all services.
# Bounded by Permission Boundary — no IAM privilege escalation.
#
# Permissions:
#   - ec2:*       — Full EC2 management (instances, security groups, VPC)
#   - s3:*        — Full S3 management (buckets, objects, policies)
#   - rds:*       — Full RDS management (instances, snapshots, subnets)
#   - eks:*       — Full EKS management (clusters, node groups, addons)
#   - lambda:*    — Full Lambda management (functions, versions, aliases)
#   - dynamodb:*  — Full DynamoDB management (tables, backups, streams)
#   - kms:*       — Full KMS management (keys, aliases, grants)
#   - logs:*      — Full CloudWatch Logs management (groups, streams, metrics)
#   - cloudwatch:*— Full CloudWatch management (alarms, dashboards, metrics)
#   - acm:*       — Full ACM management (certificates)
#   - route53:*   — Full Route53 management (zones, records)
#   - iam: Get/List/PassRole only — no IAM write beyond boundary
#
# Denied:
#   - IAM admin actions on privileged roles
#   - Organization management
#   - Account closure
#   - Security service disable
#   - User/group management
# ---------------------------------------------------------------------------

data "aws_iam_policy_document" "platform_admin" {
  # Allow: full EC2 management
  statement {
    sid    = "AllowEC2Full"
    effect = "Allow"
    actions = [
      "ec2:*",
    ]
    resources = ["*"]
  }

  # Allow: full S3 management
  statement {
    sid    = "AllowS3Full"
    effect = "Allow"
    actions = [
      "s3:*",
    ]
    resources = ["*"]
  }

  # Allow: full RDS management
  statement {
    sid    = "AllowRDSFull"
    effect = "Allow"
    actions = [
      "rds:*",
    ]
    resources = ["*"]
  }

  # Allow: full EKS management
  statement {
    sid    = "AllowEKSFull"
    effect = "Allow"
    actions = [
      "eks:*",
    ]
    resources = ["*"]
  }

  # Allow: full Lambda management
  statement {
    sid    = "AllowLambdaFull"
    effect = "Allow"
    actions = [
      "lambda:*",
    ]
    resources = ["*"]
  }

  # Allow: full DynamoDB management
  statement {
    sid    = "AllowDynamoDBFull"
    effect = "Allow"
    actions = [
      "dynamodb:*",
    ]
    resources = ["*"]
  }

  # Allow: full KMS management (key deletion bounded by permission boundary)
  statement {
    sid    = "AllowKMSFull"
    effect = "Allow"
    actions = [
      "kms:*",
    ]
    resources = ["*"]
  }

  # Allow: CloudWatch and logging
  statement {
    sid    = "AllowCloudWatchAndLogs"
    effect = "Allow"
    actions = [
      "logs:*",
      "cloudwatch:*",
      "autoscaling:*",
      "application-autoscaling:*",
    ]
    resources = ["*"]
  }

  # Allow: networking and load balancing
  statement {
    sid    = "AllowNetworkingAndLB"
    effect = "Allow"
    actions = [
      "elasticloadbalancing:*",
      "ec2:*",  # Covers VPC, subnets, security groups, etc.
    ]
    resources = ["*"]
  }

  # Allow: DNS and certificates
  statement {
    sid    = "AllowDNSAndCerts"
    effect = "Allow"
    actions = [
      "acm:*",
      "route53:*",
      "route53domains:*",
    ]
    resources = ["*"]
  }

  # Allow: secrets and SSM
  statement {
    sid    = "AllowSecretsAndSSM"
    effect = "Allow"
    actions = [
      "secretsmanager:*",
      "ssm:*",
    ]
    resources = ["*"]
  }

  # Allow: messaging
  statement {
    sid    = "AllowMessaging"
    effect = "Allow"
    actions = [
      "sqs:*",
      "sns:*",
    ]
    resources = ["*"]
  }

  # Allow: container services
  statement {
    sid    = "AllowContainerServices"
    effect = "Allow"
    actions = [
      "ecr:*",
      "ecs:*",
    ]
    resources = ["*"]
  }

  # Allow: caching
  statement {
    sid    = "AllowCaching"
    effect = "Allow"
    actions = [
      "elasticache:*",
    ]
    resources = ["*"]
  }

  # Allow: IAM read and PassRole (write bounded by permission boundary)
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

  # Allow: S3 object lambda and batch operations
  statement {
    sid    = "AllowStorageExtensions"
    effect = "Allow"
    actions = [
      "s3-object-lambda:*",
      "s3-outposts:*",
    ]
    resources = ["*"]
  }

  # Allow: CloudFront
  statement {
    sid    = "AllowCDN"
    effect = "Allow"
    actions = [
      "cloudfront:*",
    ]
    resources = ["*"]
  }
}

resource "aws_iam_policy" "platform_admin" {
  count = var.create_platform_admin_role ? 1 : 0

  name        = "${var.name_prefix}-${var.environment}-admin"
  path        = "/platform/"
  description = "Platform admin policy for ${var.environment} — full infrastructure management. No IAM write, no org management, no user/group operations."
  policy      = data.aws_iam_policy_document.platform_admin.json
  tags        = merge(local.tags, { Policy = "platform-admin" })
}
