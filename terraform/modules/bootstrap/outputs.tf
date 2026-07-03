output "state_bucket_id" {
  description = "Name of the S3 bucket created for Terraform state storage"
  value       = aws_s3_bucket.state.id
}

output "state_bucket_arn" {
  description = "ARN of the S3 bucket created for Terraform state storage"
  value       = aws_s3_bucket.state.arn
}

output "state_bucket_regional_domain_name" {
  description = "Regional domain name of the state bucket"
  value       = aws_s3_bucket.state.bucket_regional_domain_name
}

output "lock_table_id" {
  description = "Name of the DynamoDB table created for state locking"
  value       = aws_dynamodb_table.state_lock.id
}

output "lock_table_arn" {
  description = "ARN of the DynamoDB table created for state locking"
  value       = aws_dynamodb_table.state_lock.arn
}

output "kms_key_id" {
  description = "ID (UUID) of the KMS key used for state encryption"
  value       = aws_kms_key.state.key_id
}

output "kms_key_alias" {
  description = "Alias of the KMS key used for state encryption"
  value       = aws_kms_alias.state.name
}

output "kms_key_arn" {
  description = "ARN of the KMS key used for state encryption"
  value       = aws_kms_key.state.arn
}
