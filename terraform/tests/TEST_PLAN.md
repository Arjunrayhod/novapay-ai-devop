# Terraform Test Plan

## Module Unit Tests

Each module must implement `terraform test` (Terraform 1.6+):

```hcl
# modules/vpc/tests/basic.tftest.hcl

provider "aws" {
  region = "ap-south-1"
}

run "basic_vpc_creation" {
  variables {
    environment = "test"
    vpc_cidr    = "10.0.0.0/16"
  }

  assert {
    condition     = output.vpc_id != ""
    error_message = "VPC ID should not be empty"
  }
}

run "vpc_cidr_validation" {
  variables {
    environment = "test"
    vpc_cidr    = "invalid"
  }

  expect_failures = [var.vpc_cidr]
}
```

## Environment Plan Validation

Every environment PR must produce a `terraform plan` that is reviewed:

```bash
terraform plan -out=tfplan
terraform show -json tfplan > plan.json
# Review: check for unintended resource destruction
# Review: verify tag propagation
# Review: confirm provider version pinning
```

## CI Integration

Test stages run in CI pipeline:

1. `terraform fmt -check -recursive` — Format compliance
2. `terraform validate` per module per environment — Syntax
3. `tflint --recursive` — Best practice linting
4. `checkov --directory . --framework terraform` — Security
5. `terraform test` per module — Functional testing
6. `terraform plan` on environment directories — Dry-run (requires credentials)

## Coverage Targets

- 100% of modules have `terraform test` files
- 100% of variables have validation blocks
- 100% of outputs have descriptions
- 0% CRITICAL/HIGH checkov findings
