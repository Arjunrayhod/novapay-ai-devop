# Terraform State Bootstrap

Creates the foundational backend infrastructure required before any other Terraform can be applied.

**This is the first thing you deploy in a new AWS account.**

---

## State Architecture

```
+------------------------------------------------------------------+
|                        AWS Account                                |
|                                                                  |
|   +---------------------------+   +---------------------------+  |
|   |   KMS Key                 |   |   S3 Bucket               |  |
|   |   alias/terraform-state-  |   |   aegisai-terraform-state |  |
|   |   key                     |   |   -{account_id}            |  |
|   |                           |   |                           |  |
|   |   - Symmetric encryption  |   |   - Versioning: Enabled   |  |
|   |   - Automatic rotation    |   |   - SSE-KMS encryption    |  |
|   |   - 30-day deletion win.  |   |   - Bucket key: Enabled   |  |
|   |   - Root admin policy     |   |   - Public access: BLOCK  |  |
|   +-----------+---------------+   +-----------+---------------+  |
|               |                               |                  |
|               | Encrypts at                   | Stores state    |
|               | rest                          | files (.tfstate)|
|               |                               |                  |
|               |   +---------------------------+                  |
|               |   |   DynamoDB Table          |                  |
|               |   |   aegisai-terraform-locks |                  |
|               |   |                           |                  |
|               +->|   - LockID (hash key)      |                  |
|                   |   - PAY_PER_REQUEST       |                  |
|                   |   - SSE-KMS encryption    |                  |
|                   |   - Point-in-time recover |                  |
|                   +---------------------------+                  |
+------------------------------------------------------------------+

                          Terraform Backend Config:
                          backend "s3" {
                            bucket         = "aegisai-terraform-state-{account_id}"
                            key            = "{env}/terraform.tfstate"
                            region         = "ap-south-1"
                            encrypt        = true
                            kms_key_id     = "alias/terraform-state-key"
                            dynamodb_table = "aegisai-terraform-locks"
                          }
```

---

## Bootstrap Workflow

### Prerequisites

- AWS CLI installed and configured (`aws configure`)
- IAM user/role with permissions:
  - `kms:CreateKey`, `kms:CreateAlias`, `kms:PutKeyPolicy`
  - `s3:CreateBucket`, `s3:PutBucketPolicy`, `s3:PutBucketVersioning`, `s3:PutEncryptionConfiguration`
  - `dynamodb:CreateTable`, `dynamodb:PutResourcePolicy`
- Terraform >= 1.9.0

### Step 1: Initialize (local state)

```bash
cd terraform/bootstrap
terraform init
```

This uses **local state** — the backend doesn't exist yet.

### Step 2: Plan

```bash
terraform plan -out=bootstrap.tfplan
```

Review the plan to verify:
- 1 KMS key + 1 alias
- 1 S3 bucket + versioning + encryption + policy + lifecycle + public access block
- 1 DynamoDB table

### Step 3: Apply

```bash
terraform apply bootstrap.tfplan
```

### Step 4: Migrate to Remote State

```bash
# After bootstrap creates the S3/DynamoDB backend:
terraform init -migrate-state \
  -backend-config="bucket=$(terraform output -raw state_bucket_id)" \
  -backend-config="key=bootstrap/terraform.tfstate" \
  -backend-config="region=$(terraform output -raw aws_region)" \
  -backend-config="encrypt=true" \
  -backend-config="kms_key_id=$(terraform output -raw kms_key_alias)" \
  -backend-config="dynamodb_table=$(terraform output -raw lock_table_id)"
```

Type `yes` when prompted to copy local state to the new backend.

### Step 5: Verify

```bash
terraform state list
# Should show the bootstrap resources
terraform plan
# Should show no changes
```

---

## Outputs

After apply, use these outputs to configure environment backends:

```bash
terraform output backend_config
{
  "bucket"         = "aegisai-terraform-state-123456789012"
  "key"            = "terraform.tfstate"
  "region"         = "ap-south-1"
  "encrypt"        = true
  "kms_key_id"     = "alias/terraform-state-key"
  "dynamodb_table" = "aegisai-terraform-locks"
}
```

Individual outputs:

```bash
terraform output state_bucket_id   # S3 bucket name
terraform output lock_table_id     # DynamoDB table name
terraform output kms_key_id        # KMS key ARN
```

---

## Validation Checklist

| # | Check | Command | Expected |
|---|-------|---------|----------|
| 1 | Terraform format | `terraform fmt -check` | No diffs |
| 2 | Terraform validate | `terraform validate` | Success |
| 3 | S3 bucket exists | `aws s3 ls s3://$(terraform output -raw state_bucket_id)` | Bucket accessible |
| 4 | S3 versioning enabled | `aws s3api get-bucket-versioning --bucket $(terraform output -raw state_bucket_id)` | `"Status": "Enabled"` |
| 5 | S3 encryption enabled | `aws s3api get-bucket-encryption --bucket $(terraform output -raw state_bucket_id)` | SSE algorithm `aws:kms` |
| 6 | S3 public access blocked | `aws s3api get-public-access-block --bucket $(terraform output -raw state_bucket_id)` | All 4 settings `true` |
| 7 | S3 bucket policy enforced | `aws s3api get-bucket-policy --bucket $(terraform output -raw state_bucket_id)` | TLS + KMS enforcement |
| 8 | DynamoDB exists | `aws dynamodb describe-table --table-name $(terraform output -raw lock_table_id)` | Active |
| 9 | DynamoDB encryption | `aws dynamodb describe-table --table-name $(terraform output -raw lock_table_id) \| jq .Table.SSEDescription` | `"Status": "ENABLED"` |
| 10 | DynamoDB PITR | `aws dynamodb describe-continuous-backups --table-name $(terraform output -raw lock_table_id)` | `"PointInTimeRecoveryStatus": "ENABLED"` |
| 11 | KMS key exists | `aws kms describe-key --key-id $(terraform output -raw kms_key_id)` | Enabled, rotation enabled |
| 12 | KMS rotation enabled | `aws kms get-key-rotation-status --key-id $(terraform output -raw kms_key_id)` | `"KeyRotationEnabled": true` |
| 13 | Remote state works | `terraform init -reconfigure <backend-params>` | Backend initialized |
| 14 | State lock works | `terraform plan` (run 2nd instance concurrently) | Lock acquisition error |
| 15 | Disaster recovery dry run | Restore from backup or PITR | State recovered |

---

## Rollback Procedure

### Scenario: Bootstrap apply succeeded but you need to tear down

```bash
# 1. If using local state (step 1-3):
terraform destroy

# 2. If already migrated to remote state:
terraform init -migrate-state -backend=false   # Back to local
terraform state rm module.bootstrap            # Remove from state
terraform destroy                              # Destroy resources

# 3. Manual cleanup (if Terraform state is lost):
aws s3 rm s3://<bucket> --recursive
aws s3 rb s3://<bucket> --force
aws dynamodb delete-table --table-name <table>
aws kms schedule-key-deletion --key-id <key-id> --pending-window-in-days 7
```

### Scenario: State file corrupted

```bash
# Restore previous version from S3 versioning
aws s3api list-object-versions \
  --bucket $(terraform output -raw state_bucket_id) \
  --prefix bootstrap/terraform.tfstate

# Copy the prior version back as current
aws s3api get-object \
  --bucket $(terraform output -raw state_bucket_id) \
  --key bootstrap/terraform.tfstate \
  --version-id <prior-version-id> \
  /tmp/restored.tfstate

aws s3api put-object \
  --bucket $(terraform output -raw state_bucket_id) \
  --key bootstrap/terraform.tfstate \
  --body /tmp/restored.tfstate
```

### Scenario: State lock stuck

```bash
# Force unlock (use only after confirming no operation in progress)
terraform force-unlock <lock-id>
```

---

## Disaster Recovery Considerations

### Backup Strategy

| Component | Backup Method | RPO | RTO |
|-----------|--------------|-----|-----|
| S3 state files | S3 Versioning (automatic) | Real-time | < 5 min |
| DynamoDB lock table | Point-in-Time Recovery | 35 days | < 15 min |
| KMS key | AWS managed backup | N/A | N/A |

### Recovery Plan

1. **Account loss**: The bootstrap module is designed to be re-applied in a new account. Bucket names include account ID to prevent conflicts.

2. **Region failure**: If the primary region fails:
   - Deploy bootstrap in a secondary region
   - Configure cross-region replication on the state bucket (optional)
   - Update all environment backend configs to point to the DR region bucket

3. **State file corruption**:
   - Restore via S3 versioning (Step 3 of rollback)
   - If versioning was disabled (not recommended), restore from DynamoDB PITR is not applicable — use manual backup

4. **KMS key deletion**:
   - KMS has a 30-day deletion window (configurable)
   - Cancel deletion with `aws kms cancel-key-deletion`
   - After deletion, state files become permanently undecryptable

5. **Multi-account strategy**:
   - Each AWS account gets its own bootstrap deployment
   - Use Terraform Workspaces or separate backend configs per account
   - Consider a centralized state account for organization-wide management

### Prevention

- Always enable S3 Versioning (default: `true`)
- Always enable DynamoDB PITR (default: `true`)
- Always enable KMS key rotation (default: `true`)
- Restrict `force_destroy_bucket = true` to bootstrap-only scenarios
- Store bootstrap outputs in a secure location (vault, parameter store)

---

## File Structure

```
terraform/bootstrap/
├── versions.tf              # Terraform + AWS provider version constraints
├── providers.tf              # AWS provider configuration
├── variables.tf              # Input variables
├── outputs.tf                # Output values (including backend_config)
├── locals.tf                 # Common tags
├── main.tf                   # Module call
├── terraform.tfvars.example  # Example variable values
└── README.md                 # This file
```

## Module Structure

```
terraform/modules/bootstrap/
├── versions.tf               # Version constraints
├── variables.tf              # All module inputs
├── outputs.tf                # Module outputs
├── locals.tf                 # Account ID lookup, naming, tags
├── kms.tf                    # KMS key + alias + key policy
├── s3.tf                     # S3 bucket + versioning + encryption + lifecycle
├── dynamodb.tf               # DynamoDB table + encryption + PITR
├── policies.tf               # S3 bucket policy (TLS + KMS enforcement)
└── README.md                 # Module documentation
```
