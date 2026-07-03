output "state_bucket_id" {
  description = "Name of the S3 bucket created for Terraform state"
  value       = module.bootstrap.state_bucket_id
}

output "state_bucket_arn" {
  description = "ARN of the S3 bucket created for Terraform state"
  value       = module.bootstrap.state_bucket_arn
}

output "lock_table_id" {
  description = "Name of the DynamoDB table created for state locking"
  value       = module.bootstrap.lock_table_id
}

output "lock_table_arn" {
  description = "ARN of the DynamoDB table created for state locking"
  value       = module.bootstrap.lock_table_arn
}

output "kms_key_id" {
  description = "ID of the KMS key used for state encryption"
  value       = module.bootstrap.kms_key_id
}

output "kms_key_alias" {
  description = "Alias of the KMS key used for state encryption"
  value       = module.bootstrap.kms_key_alias
}

output "aws_region" {
  description = "AWS region where bootstrap resources were created"
  value       = var.aws_region
}

output "backend_config" {
  description = "Terraform backend configuration block for use in environment configs"
  value = {
    bucket         = module.bootstrap.state_bucket_id
    key            = "terraform.tfstate"
    region         = var.aws_region
    encrypt        = true
    kms_key_id     = module.bootstrap.kms_key_alias
    dynamodb_table = module.bootstrap.lock_table_id
  }
  sensitive = false
}
