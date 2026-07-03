# IAM Roles Example

Demonstrates how to use the `iam` module to create platform IAM roles with GitHub Actions OIDC.

## Usage

```bash
terraform init
terraform plan
terraform apply
```

## What gets created

- 5 IAM roles: Platform Admin, Platform Operator, CI/CD, ReadOnly, Terraform Execution
- 5 IAM policies (one per role)
- 1 permission boundary policy
- 1 GitHub OIDC identity provider
- Trust policies:
  - Account roles (Admin, Operator, ReadOnly): require MFA
  - CI/CD: assumes via GitHub OIDC (repository-scoped)
  - Terraform Execution: assumable by CI/CD role + account principals
