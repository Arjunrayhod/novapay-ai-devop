data "aws_iam_policy_document" "kms_key" {
  statement {
    sid    = "EnableRootAdminPermissions"
    effect = "Allow"

    principals {
      type        = "AWS"
      identifiers = ["arn:aws:iam::${local.account_id}:root"]
    }

    actions = [
      "kms:*",
    ]

    resources = ["*"]
  }

  dynamic "statement" {
    for_each = length(var.iam_principals_arn) > 0 ? [1] : []

    content {
      sid    = "AllowPrincipalUsage"
      effect = "Allow"

      principals {
        type        = "AWS"
        identifiers = var.iam_principals_arn
      }

      actions = [
        "kms:Encrypt",
        "kms:Decrypt",
        "kms:ReEncrypt*",
        "kms:GenerateDataKey",
        "kms:DescribeKey",
      ]

      resources = ["*"]
    }
  }

  statement {
    sid    = "AllowS3Service"
    effect = "Allow"

    principals {
      type        = "Service"
      identifiers = ["s3.amazonaws.com"]
    }

    actions = [
      "kms:Decrypt",
      "kms:GenerateDataKey",
    ]

    resources = ["*"]

    condition {
      test     = "StringEquals"
      variable = "aws:SourceAccount"
      values   = [local.account_id]
    }
  }

  statement {
    sid    = "AllowDynamoDBService"
    effect = "Allow"

    principals {
      type        = "Service"
      identifiers = ["dynamodb.amazonaws.com"]
    }

    actions = [
      "kms:Decrypt",
      "kms:GenerateDataKey",
    ]

    resources = ["*"]

    condition {
      test     = "StringEquals"
      variable = "aws:SourceAccount"
      values   = [local.account_id]
    }
  }
}

resource "aws_kms_key" "state" {
  description             = "KMS key for Terraform state encryption — ${var.environment}"
  deletion_window_in_days = var.kms_deletion_window
  enable_key_rotation     = var.enable_kms_key_rotation
  policy                  = data.aws_iam_policy_document.kms_key.json
  tags                    = local.merged_tags
}

resource "aws_kms_alias" "state" {
  name          = local.kms_key_alias
  target_key_id = aws_kms_key.state.key_id
}
