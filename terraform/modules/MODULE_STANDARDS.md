# AegisAI Terraform Module Standards

All modules in `terraform/modules/` must conform to these standards.

## Module Structure

Every module must contain the following files:

```
modules/<module-name>/
├── versions.tf        # Terraform + provider version constraints
├── providers.tf       # Provider configuration (required_providers only)
├── variables.tf       # Input variables with type, description, validation
├── outputs.tf         # Output values with description
├── locals.tf          # Local computed values, name generation, tags
├── main.tf            # Primary resource definitions
├── outputs.tf         # Output values
├── README.md          # Module documentation
└── examples/          # Usage examples (optional, can be in terraform/examples/)
```

## File Requirements

### versions.tf
- Pin Terraform to `>= 1.9.0`
- Pin each provider with `version` constraint using pessimistic operator
- Only declare providers the module actually uses

```hcl
terraform {
  required_version = ">= 1.9.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.80"
    }
  }
}
```

### variables.tf
- Every variable must have `type`, `description`
- Every variable must have `validation` block where possible
- Secrets must have `sensitive = true` and no default
- Use `optional()` for variables with defaults
- Group related variables with comments

```hcl
variable "environment" {
  description = "Deployment environment"
  type        = string
  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Environment must be dev, staging, or prod"
  }
}

variable "vpc_cidr" {
  description = "CIDR block for the VPC"
  type        = string
  validation {
    condition     = can(cidrhost(var.vpc_cidr, 0))
    error_message = "VPC CIDR must be a valid IPv4 CIDR notation"
  }
}
```

### outputs.tf
- Every output must have `description`
- Sensitive outputs must have `sensitive = true`
- Output only what consumers actually need

```hcl
output "vpc_id" {
  description = "ID of the created VPC"
  value       = aws_vpc.this.id
}

output "database_password" {
  description = "Master password for the RDS instance"
  value       = random_password.master.result
  sensitive   = true
}
```

### locals.tf
- Accept `environment` and inherit common tags pattern
- Generate resource names using the naming convention
- Never hardcode environment-specific values

```hcl
locals {
  name_prefix = "${var.environment}-${var.module_name}"

  tags = merge(
    var.tags,
    {
      Module = var.module_name
    }
  )
}
```

### main.tf
- Resource blocks must have comments for non-obvious configuration
- Use `for_each` instead of `count` for conditional resources
- Use `data.aws_iam_policy_document` instead of inline IAM policies
- Security groups must have `description`
- All S3 buckets must have `server_side_encryption_configuration`

### README.md
- Module purpose and high-level description
- Usage example (copy-paste ready)
- Inputs table (auto-generated with terraform-docs recommended)
- Outputs table
- Dependencies
- Security considerations

## Versioning

Modules follow Semantic Versioning 2.0:

| Change | Version Bump |
|--------|-------------|
| Breaking input/output change | MAJOR |
| New feature (backward compatible) | MINOR |
| Bug fix | PATCH |

Module versions are tracked via Git tags: `modules/<name>/v1.2.3`

## Validation

Every module must pass before merge:
- `terraform fmt -check`
- `terraform validate`
- `tflint` with all checks
- `checkov --framework terraform`
- `tfsec` for security scanning

## Anti-Patterns

- Hardcoded account IDs, ARNs, or secrets — use variables
- `count` for conditional resources — use `for_each`
- `0.0.0.0/0` ingress — prohibited in all environments
- Missing provider `region` — always configure explicitly
- Local state — state must be remote with locking
- Module calling another module in the same directory — use composition in environments/
