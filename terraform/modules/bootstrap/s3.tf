resource "aws_s3_bucket" "state" {
  bucket        = local.bucket_name
  force_destroy = var.force_destroy_bucket
  tags          = local.merged_tags
}

resource "aws_s3_bucket_versioning" "state" {
  bucket = aws_s3_bucket.state.id

  versioning_configuration {
    status = var.enable_bucket_versioning ? "Enabled" : "Suspended"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "state" {
  bucket = aws_s3_bucket.state.id

  rule {
    apply_server_side_encryption_by_default {
      kms_master_key_id = aws_kms_key.state.arn
      sse_algorithm     = "aws:kms"
    }
    bucket_key_enabled = var.enable_bucket_key
  }
}

resource "aws_s3_bucket_public_access_block" "state" {
  bucket = aws_s3_bucket.state.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_ownership_controls" "state" {
  bucket = aws_s3_bucket.state.id

  rule {
    object_ownership = "BucketOwnerEnforced"
  }
}

resource "aws_s3_bucket_lifecycle_configuration" "state" {
  bucket = aws_s3_bucket.state.id

  dynamic "rule" {
    for_each = var.lifecycle_transition_days > 0 || var.lifecycle_expiration_days > 0 ? [1] : []

    content {
      id     = "state-lifecycle"
      status = "Enabled"

      dynamic "transition" {
        for_each = var.lifecycle_transition_days > 0 ? [1] : []

        content {
          days          = var.lifecycle_transition_days
          storage_class = "GLACIER"
        }
      }

      dynamic "expiration" {
        for_each = var.lifecycle_expiration_days > 0 ? [1] : []

        content {
          days                         = var.lifecycle_expiration_days
          expired_object_delete_marker = false
        }
      }

      noncurrent_version_transition {
        noncurrent_days = var.noncurrent_version_transition_days
        storage_class   = "GLACIER"
      }

      dynamic "noncurrent_version_expiration" {
        for_each = var.noncurrent_version_expiration_days > 0 ? [1] : []

        content {
          noncurrent_days = var.noncurrent_version_expiration_days
        }
      }
    }
  }

  rule {
    id     = "abort-incomplete-multipart-uploads"
    status = "Enabled"

    abort_incomplete_multipart_upload {
      days_after_initiation = 7
    }
  }
}
