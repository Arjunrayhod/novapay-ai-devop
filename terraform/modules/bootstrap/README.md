# Bootstrap Module

Creates the foundational Terraform state backend infrastructure: S3 bucket for state storage, DynamoDB table for state locking, and KMS key for encryption.

## Resources Created

| Resource          | Purpose                                          |
|-------------------|--------------------------------------------------|
| KMS Key           | Encrypts state files at rest in S3 and DynamoDB  |
| KMS Alias         | Human-readable alias for the KMS key             |
| S3 Bucket         | Terraform state storage (versioned, encrypted)   |
| S3 Bucket Policy  | Enforces TLS, KMS encryption, and access control |
| S3 Public Access  | Blocks all public access (4 settings)            |
| S3 Lifecycle      | Glacier transitions and noncurrent version mgmt  |
| DynamoDB Table    | State locking with point-in-time recovery        |

## Usage

```hcl
module "bootstrap" {
  source = "../modules/bootstrap"

  aws_region              = "ap-south-1"
  name_prefix             = "aegisai"
  enable_kms_key_rotation = true
}
```

## Inputs

| Name | Description | Type | Default | Required |
|------|-------------|------|---------|----------|
| environment | Deployment environment | `string` | `"_global"` | no |
| aws_region | AWS region | `string` | — | yes |
| name_prefix | Resource name prefix | `string` | `"aegisai"` | no |
| state_bucket_name | S3 bucket name (auto-generated if empty) | `string` | `""` | no |
| state_lock_table_name | DynamoDB table name (auto-generated if empty) | `string` | `""` | no |
| kms_key_alias | KMS key alias | `string` | `"alias/terraform-state-key"` | no |
| kms_deletion_window | KMS key deletion waiting period (days) | `number` | `30` | no |
| enable_kms_key_rotation | Automatic yearly KMS key rotation | `bool` | `true` | no |
| enable_bucket_versioning | S3 bucket versioning | `bool` | `true` | no |
| enable_bucket_encryption | S3 SSE-KMS encryption | `bool` | `true` | no |
| enable_dynamodb_encryption | DynamoDB SSE-KMS encryption | `bool` | `true` | no |
| enable_dynamodb_pitr | DynamoDB point-in-time recovery | `bool` | `true` | no |
| enable_bucket_key | S3 bucket key for KMS cost optimization | `bool` | `true` | no |
| force_destroy_bucket | Allow destroy even when non-empty | `bool` | `false` | no |
| lock_table_billing_mode | DynamoDB billing mode | `string` | `"PAY_PER_REQUEST"` | no |
| iam_principals_arn | IAM principals allowed to use KMS key | `list(string)` | `[]` | no |
| lifecycle_transition_days | Days to Glacier transition | `number` | `90` | no |
| lifecycle_expiration_days | Days to current version expiration (0=keep) | `number` | `0` | no |
| noncurrent_version_transition_days | Days to noncurrent Glacier transition | `number` | `30` | no |
| noncurrent_version_expiration_days | Days to noncurrent version deletion (0=keep) | `number` | `365` | no |
| tags | Additional resource tags | `map(string)` | `{}` | no |

## Outputs

| Name | Description |
|------|-------------|
| state_bucket_id | S3 bucket name |
| state_bucket_arn | S3 bucket ARN |
| state_bucket_regional_domain_name | Regional domain name |
| lock_table_id | DynamoDB table name |
| lock_table_arn | DynamoDB table ARN |
| kms_key_id | KMS key ARN |
| kms_key_alias | KMS key alias |
| kms_key_arn | KMS key ARN |

## Security Controls

- TLS enforcement (no HTTP access to state bucket)
- SSE-KMS encryption on all state objects
- KMS key policy scoped to root account + explicit IAM principals
- S3 public access fully blocked
- DynamoDB encryption at rest with KMS
- Point-in-time recovery enabled for DynamoDB
- Versioning enabled on state bucket (recover from accidental deletion)
- Lifecycle rules manage noncurrent version storage costs
