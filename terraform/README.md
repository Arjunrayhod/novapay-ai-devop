# AegisAI Terraform Platform

Infrastructure as Code platform for the AegisAI Enterprise Autonomous DevSecOps Platform.

## Directory Structure

```
terraform/
├── bootstrap/                # Bootstrap backend (apply first — local state)
├── modules/                  # Reusable Terraform modules
│   ├── bootstrap/            # State backend module (S3 + DynamoDB + KMS)
│   ├── _template/            # Module creation template
│   ├── MODULE_STANDARDS.md   # Module development standards
│   └── README.md             # Module index
├── environments/             # Environment root configurations
│   ├── _global/              # Global/shared infrastructure
│   ├── dev/                  # Development environment
│   ├── staging/              # Staging environment
│   └── prod/                 # Production environment
├── tests/                    # Test configurations and fixtures
├── examples/                 # Usage examples for modules
├── policies/                 # Policy as Code (Checkov, OPA, Sentinel)
├── versions.tf               # Terraform and provider version constraints
├── providers.tf              # Provider configurations
├── backend.tf                # Remote state backend configuration
├── variables.tf              # Global input variables
├── outputs.tf                # Global output values
├── locals.tf                 # Local computed values, tags, naming
└── README.md                 # This file
```

## Provider Strategy

| Provider | Status | Version |
|----------|--------|---------|
| AWS | Primary | ~> 5.80 |
| Azure | Future | ~> 4.0 |
| GCP | Future | ~> 6.0 |

## Getting Started

### 1. Deploy Bootstrap Backend

```bash
cd bootstrap
terraform init
terraform plan -out=bootstrap.tfplan
terraform apply bootstrap.tfplan
terraform init -migrate-state \
  -backend-config="bucket=$(terraform output -raw state_bucket_id)" \
  -backend-config="key=bootstrap/terraform.tfstate" \
  -backend-config="region=ap-south-1" \
  -backend-config="encrypt=true" \
  -backend-config="kms_key_id=$(terraform output -raw kms_key_alias)" \
  -backend-config="dynamodb_table=$(terraform output -raw lock_table_id)"
```

### 2. Deploy Environments

```bash
cd environments/dev
terraform init
terraform validate
terraform plan -out=tfplan
terraform apply tfplan
```

## Standards

Refer to ENGINEERING_STANDARDS.md Section 6 (Terraform Standards) for mandatory IaC rules, MODULE_STANDARDS.md for module development, and policies/ for compliance rules.
