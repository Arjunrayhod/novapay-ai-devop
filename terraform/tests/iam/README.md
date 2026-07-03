# IAM Module Tests

Validates that the IAM module creates all expected roles with correct configuration.

## Test Cases

| Test | Description | Verification |
|------|-------------|-------------|
| Roles created | All 5 enabled roles produce non-null ARNs | `terraform_data.validate_roles_count` |
| Cross-account not created | Role not created when flag is `false` | `terraform_data.validate_cross_account_not_created` |
| OIDC not created | Provider not created when flag is `false` | `terraform_data.validate_oidc_not_created` |
| Permission boundary | Boundary policy is created | `terraform_data.validate_permission_boundary` |

## Run

```bash
cd terraform/tests/iam
terraform init
terraform validate
terraform plan -out=test.tfplan
terraform apply test.tfplan
```

## Cleanup

```bash
terraform destroy
```
