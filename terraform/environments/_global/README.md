# Global Environment

Cross-environment shared resources including DNS zones, Terraform state backend (S3 bucket + DynamoDB table), and IAM roles/policies.

## Purpose

Resources defined here are consumed by all other environments (dev, staging, prod). Changes in this directory affect the entire platform.

## Usage

```hcl
terraform init -backend-config="key=global/terraform.tfstate"
terraform plan
terraform apply
```

## Resources

- S3 bucket for Terraform state storage (KMS-encrypted)
- DynamoDB table for state locking
- Route53 DNS zones
- IAM roles for cross-account assume role
