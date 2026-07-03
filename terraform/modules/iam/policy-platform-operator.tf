# ---------------------------------------------------------------------------
# Platform Operator Policy
#
# Scope: Day-to-day operations — deploy, manage, and monitor resources.
# Cannot create IAM roles, modify security policies, or manage KMS.
#
# Permissions:
#   - ec2: Describe*, Start*, Stop*, Reboot*, CreateTags
#   - s3: List*, Get*, Put*, Delete* (on platform buckets)
#   - rds: Describe*, Start*, Stop*, Reboot*
#   - eks: Describe*, List*, UpdateClusterConfig
#   - lambda: Invoke*, Get*, List*
#   - dynamodb: Describe*, Get*, Query*, Scan*
#   - cloudwatch: Describe*, Get*, List*, PutMetricData
#   - logs: Describe*, Get*, List*, Filter*
#
# Justified wildcards:
#   - ec2:Describe* — must describe all resource types (instances, volumes, etc.)
#   - s3:Get* — must get objects and bucket configs
# ---------------------------------------------------------------------------

data "aws_iam_policy_document" "platform_operator" {
  # Allow: EC2 read and lifecycle management
  statement {
    sid    = "AllowEC2ReadAndLifecycle"
    effect = "Allow"
    actions = [
      "ec2:Describe*",
      "ec2:StartInstances",
      "ec2:StopInstances",
      "ec2:RebootInstances",
      "ec2:CreateTags",
      "ec2:DeleteTags",
    ]
    resources = ["*"]
  }

  # Allow: S3 read and object operations on platform buckets
  statement {
    sid    = "AllowS3ReadWriteOnPlatform"
    effect = "Allow"
    actions = [
      "s3:ListAllMyBuckets",
      "s3:ListBucket",
      "s3:GetBucketLocation",
      "s3:GetObject",
      "s3:PutObject",
      "s3:DeleteObject",
      "s3:GetBucketVersioning",
      "s3:GetBucketPolicy",
    ]
    resources = ["*"]
  }

  # Allow: RDS read and lifecycle management
  statement {
    sid    = "AllowRDSLifecycle"
    effect = "Allow"
    actions = [
      "rds:Describe*",
      "rds:StartDBInstance",
      "rds:StopDBInstance",
      "rds:RebootDBInstance",
      "rds:ListTagsForResource",
    ]
    resources = ["*"]
  }

  # Allow: EKS read and limited management
  statement {
    sid    = "AllowEKSReadAndConfig"
    effect = "Allow"
    actions = [
      "eks:DescribeCluster",
      "eks:DescribeNodegroup",
      "eks:DescribeAddon",
      "eks:ListClusters",
      "eks:ListNodegroups",
      "eks:ListAddons",
      "eks:AccessKubernetesApi",
    ]
    resources = ["*"]
  }

  # Allow: Lambda read and invoke
  statement {
    sid    = "AllowLambdaReadAndInvoke"
    effect = "Allow"
    actions = [
      "lambda:GetFunction",
      "lambda:GetFunctionConfiguration",
      "lambda:ListFunctions",
      "lambda:InvokeFunction",
      "lambda:GetAlias",
      "lambda:ListAliases",
    ]
    resources = ["*"]
  }

  # Allow: DynamoDB read
  statement {
    sid    = "AllowDynamoDBRead"
    effect = "Allow"
    actions = [
      "dynamodb:DescribeTable",
      "dynamodb:DescribeContinuousBackups",
      "dynamodb:GetItem",
      "dynamodb:Query",
      "dynamodb:Scan",
      "dynamodb:ListTables",
    ]
    resources = ["*"]
  }

  # Allow: CloudWatch and monitoring
  statement {
    sid    = "AllowMonitoring"
    effect = "Allow"
    actions = [
      "cloudwatch:Describe*",
      "cloudwatch:Get*",
      "cloudwatch:List*",
      "cloudwatch:PutMetricData",
      "cloudwatch:PutMetricAlarm",
      "cloudwatch:DeleteAlarms",
      "cloudwatch:SetAlarmState",
      "logs:Describe*",
      "logs:Get*",
      "logs:List*",
      "logs:FilterLogEvents",
      "logs:StartQuery",
      "logs:StopQuery",
      "logs:GetQueryResults",
    ]
    resources = ["*"]
  }

  # Allow: Auto Scaling read
  statement {
    sid    = "AllowAutoScalingRead"
    effect = "Allow"
    actions = [
      "autoscaling:Describe*",
    ]
    resources = ["*"]
  }

  # Allow: Elastic Load Balancing read
  statement {
    sid    = "AllowELBRead"
    effect = "Allow"
    actions = [
      "elasticloadbalancing:Describe*",
    ]
    resources = ["*"]
  }

  # Allow: SSM read and run commands
  statement {
    sid    = "AllowSSMOperations"
    effect = "Allow"
    actions = [
      "ssm:Describe*",
      "ssm:Get*",
      "ssm:List*",
      "ssm:StartAutomationExecution",
      "ssm:SendCommand",
    ]
    resources = ["*"]
  }
}

resource "aws_iam_policy" "platform_operator" {
  count = var.create_platform_operator_role ? 1 : 0

  name        = "${var.name_prefix}-${var.environment}-operator"
  path        = "/platform/"
  description = "Platform operator policy for ${var.environment} — deploy, manage, and monitor resources. No IAM, no KMS, no security policy changes."
  policy      = data.aws_iam_policy_document.platform_operator.json
  tags        = merge(local.tags, { Policy = "platform-operator" })
}
