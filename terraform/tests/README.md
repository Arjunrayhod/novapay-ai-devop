# AegisAI Terraform Tests

Terraform testing strategy for modules and environments.

## Test Types

| Type | Tool | Scope | When |
|------|------|-------|------|
| Static Analysis | `terraform fmt -check` | All .tf files | Pre-commit, CI |
| Syntax Validation | `terraform validate` | Modules, Environments | Pre-commit, CI |
| Linting | `tflint` | All .tf files | CI |
| Security Scanning | `checkov`, `tfsec` | All .tf files | CI |
| Unit Tests | `terraform test` | Modules | CI |
| Integration Tests | Terratest | Environments | CI (staging) |

## Running Tests

```bash
# Validate all modules
for dir in modules/*/; do
  cd $dir && terraform init -backend=false && terraform validate && cd -
done

# Check formatting
terraform fmt -check -recursive

# Run tflint
tflint --recursive

# Run checkov
checkov --directory . --framework terraform

# Run terraform test (Terraform 1.6+)
cd modules/vpc
terraform init && terraform test
```

## Test Directory

```
tests/
├── README.md          # This file
└── fixtures/          # Test fixture configurations
    └── (future)       # Module-specific test fixtures
```

Terraform 1.6+ built-in `terraform test` files live inside each module as `tests/*.tftest.hcl`.
