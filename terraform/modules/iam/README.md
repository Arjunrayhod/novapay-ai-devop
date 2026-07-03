# IAM Module

Creates platform IAM roles with least-privilege policies, permission boundaries, and OIDC-ready trust relationships for GitHub Actions.

## Roles

| Role | Trust | Session | Purpose |
|------|-------|---------|---------|
| Platform Admin | Account (MFA) | 8h | Full infrastructure management. No IAM write, no org management. |
| Platform Operator | Account (MFA) | 8h | Day-to-day operations: deploy, manage, monitor. No IAM, KMS, or security changes. |
| CI/CD | GitHub OIDC or Account | 1h | Pipeline execution. Terraform deployment via GitHub Actions. |
| ReadOnly | Account (MFA) | 12h | View-only across all services. |
| Terraform Execution | CI/CD role or Account | 1h | Full Terraform provisioning. S3 + DynamoDB state access. |
| Cross-Account | External accounts | 1h | Multi-account access (disabled by default). |

## Permission Matrix

| Service | Admin | Operator | CI/CD | ReadOnly | Terraform | Cross-Account |
|---------|-------|----------|-------|----------|-----------|---------------|
| EC2 | Full | Read + Lifecycle | Full | Read | Full | Full |
| S3 | Full | Read + Write | Full + State | Read | Full + State | Full |
| RDS | Full | Read + Lifecycle | Full | Read | Full | Full |
| EKS | Full | Read + Config | Full | Read | Full | Full |
| Lambda | Full | Read + Invoke | Full | Read | Full | Full |
| DynamoDB | Full | Read | Full + State | Read | Full + State | Full |
| KMS | Full | None | Full | Read | Full | Full |
| IAM | Read + Pass | None | Roles + Pass | Read | Roles + Pass | Read + Pass |
| CloudWatch | Full | Read + Alarms | Full | Read | Full | Read |
| Organizations | **Denied** | **Denied** | **Denied** | **Denied** | **Denied** | **Denied** |
| Account Mgmt | **Denied** | **Denied** | **Denied** | **Denied** | **Denied** | **Denied** |
| Users/Groups | **Denied** | **Denied** | **Denied** | **Denied** | **Denied** | **Denied** |

## Security Controls

| Control | Implementation |
|---------|---------------|
| No AdministratorAccess | Custom least-privilege policies with documented permissions |
| Permission Boundaries | All roles bounded. Prevents: IAM escalation, org mgmt, account closure, security service disable |
| MFA Enforcement | Account-based trust policies require `aws:MultiFactorAuthPresent` |
| OIDC Ready | GitHub Actions OIDC provider with repository-scoped trust |
| Session Duration | Configurable per role (1h for CI/CD, 8h for admin, 12h for readonly) |
| Path Isolation | All roles under `/platform/` path |
| Tagging | Consistent tags on all resources (Environment, Component, Role, Policy) |

## Usage

```hcl
module "iam" {
  source = "../modules/iam"

  environment   = var.environment
  name_prefix   = "aegisai"

  create_github_oidc_provider = true
  github_repositories = [
    "aegisai-platform/infra:ref:refs/heads/main",
    "aegisai-platform/infra:ref:refs/heads/dev",
  ]
}
```

## Inputs

See `variables.tf` for full documentation.

## Outputs

| Name | Description |
|------|-------------|
| platform_admin_role_arn | ARN of the Platform Admin role |
| platform_operator_role_arn | ARN of the Platform Operator role |
| cicd_role_arn | ARN of the CI/CD role |
| readonly_role_arn | ARN of the ReadOnly role |
| terraform_execution_role_arn | ARN of the Terraform Execution role |
| cross_account_role_arn | ARN of the Cross-Account role |
| permission_boundary_arn | ARN of the permission boundary |
| github_oidc_provider_arn | ARN of the GitHub OIDC provider |

## Future Extension Plan

### Phase 1 — Current
- 6 IAM roles with least-privilege policies
- Permission boundary with explicit deny for escalation paths
- GitHub Actions OIDC integration

### Phase 2 — AWS IAM Identity Center
- Migrate from IAM roles to IAM Identity Center (AWS SSO)
- Permission sets mapped to these policies
- SCIM provisioning for user lifecycle

### Phase 3 — Fine-grained resource policies
- Convert wildcard resource policies to tag-based
- Service Control Policies (SCPs) at organization level
- Attribute-based access control (ABAC)
