data "aws_iam_policy_document" "dynamodb_lock" {
  statement {
    sid    = "RootAccountFullAccess"
    effect = "Allow"

    principals {
      type        = "AWS"
      identifiers = ["arn:aws:iam::${local.account_id}:root"]
    }

    actions   = ["dynamodb:*"]
    resources = [aws_dynamodb_table.state_lock.arn]
  }

  dynamic "statement" {
    for_each = length(var.iam_principals_arn) > 0 ? [1] : []

    content {
      sid    = "AllowPrincipalLockOperations"
      effect = "Allow"

      principals {
        type        = "AWS"
        identifiers = var.iam_principals_arn
      }

      actions = [
        "dynamodb:GetItem",
        "dynamodb:PutItem",
        "dynamodb:DeleteItem",
        "dynamodb:DescribeTable",
      ]

      resources = [aws_dynamodb_table.state_lock.arn]
    }
  }
}

resource "aws_dynamodb_table" "state_lock" {
  name         = local.table_name
  billing_mode = var.lock_table_billing_mode
  hash_key     = "LockID"
  table_class  = "STANDARD"
  tags         = local.merged_tags

  attribute {
    name = "LockID"
    type = "S"
  }

  dynamic "server_side_encryption" {
    for_each = var.enable_dynamodb_encryption ? [1] : []

    content {
      enabled     = true
      kms_key_arn = aws_kms_key.state.arn
    }
  }

  dynamic "point_in_time_recovery" {
    for_each = var.enable_dynamodb_pitr ? [1] : []

    content {
      enabled = true
    }
  }
}

resource "aws_dynamodb_resource_policy" "state_lock" {
  resource_arn = aws_dynamodb_table.state_lock.arn
  policy       = data.aws_iam_policy_document.dynamodb_lock.json
}
