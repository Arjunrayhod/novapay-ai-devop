# AegisAI Terraform Policies

Policy as Code for Terraform infrastructure.

## Policy Types

| Type | Tool | Purpose | Location |
|------|------|---------|----------|
| Static Analysis | Checkov | Pre-deploy security scanning | `policies/checkov/` |
| OPA/Gatekeeper | OPA | Kubernetes admission control | `policies/opa/` |
| Sentinel | Sentinel | HCP Terraform policy enforcement | _(future)_ |

## Checkov Policies

Custom Checkov policies extend the built-in rule set. Each custom policy is a Python file implementing the Checkov checkpoint interface.

### Built-in Rules Enforced

- `CKV_AWS_1` — IAM password policy
- `CKV_AWS_2` — EBS volume encryption
- `CKV_AWS_3` — EBS encryption by default
- `CKV_AWS_7` — S3 bucket logging
- `CKV_AWS_8` — S3 bucket public block
- `CKV_AWS_18` — S3 bucket SSE
- `CKV_AWS_21` — S3 bucket versioning
- `CKV_AWS_23` — SG not open to 0.0.0.0/0
- `CKV_AWS_24` — EC2 Nitro enforces IMDSv2
- `CKV_AWS_51` — ECR private
- `CKV_AWS_53` — S3 bucket block public policy
- `CKV_AWS_89` — DMS replication instance public
- `CKV_AWS_92` — ELB access logging
- `CKV_AWS_107` — EKS control plane logging
- `CKV_AWS_111` — EKS secrets encryption
- `CKV_AWS_130` — RDS encryption at rest
- `CKV_AWS_136` — ECR encryption at rest

### Running

```bash
# All checks
checkov --directory . --framework terraform

# Specific checks only
checkov --directory . --framework terraform --check CKV_AWS_23,CKV_AWS_107

# Custom policy directory
checkov --directory . --framework terraform --external-checks-dir policies/checkov
```

## OPA Policies

OPA policies for Kubernetes admission control (future):

- `policies/opa/require_ns_quotas.rego` — Namespace resource quotas required
- `policies/opa/deny_privileged_containers.rego` — No privileged containers
- `policies/opa/require_pod_antiaffinity.rego` — Pod anti-affinity required for HA

## Enforcement

Policies are enforced in CI/CD via:
1. Checkov — fail on CRITICAL and HIGH findings
2. tflint — fail on ERROR
3. OPA — dry-run in CI, enforce in-cluster
4. Sentinel — pre-apply in HCP Terraform

Refer to ENGINEERING_STANDARDS.md Section 6 (Terraform Standards) for the full list of mandatory IaC checks.
