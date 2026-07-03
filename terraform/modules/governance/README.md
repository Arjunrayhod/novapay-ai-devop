# AegisAI Governance Foundation Module

## Overview

The Governance module provides a **centralized, reusable governance layer** that every Terraform module in the AegisAI platform inherits. It codifies enterprise tagging, naming, compliance, and cost allocation standards into a single data source that produces computed values for consumption by all other modules and root configurations.

**Module Type:** Data-only (no cloud resources created)

## Tagging Strategy

The module enforces a layered tagging strategy with five tag categories that are merged into a single `merged_tags` map:

### Mandatory Tags (always applied)

| Tag | Source | Example |
|-----|--------|---------|
| `Environment` | `var.environment` | `dev`, `prod` |
| `ManagedBy` | Fixed | `terraform` |
| `Platform` | `var.name_prefix` | `aegisai` |
| `Project` | Computed | `aegisai-platform` |
| `Workload` | `var.workload` | `data-api` |
| `WorkloadType` | `var.workload_type` | `web-service` |
| `Owner` | `var.owner` | `platform-engineering` |
| `CostCenter` | `var.cost_center` | `cc-platform` |
| `Provisioner` | Fixed | `terraform` |
| `Repository` | Fixed | `github.com/aegisai/aegisai-platform` |

### Data Classification Tags

| Tag | Source | Values |
|-----|--------|--------|
| `DataClassification` | `var.data_classification` | `public`, `internal`, `confidential`, `restricted` |
| `ComplianceFrameworks` | `var.compliance_frameworks` | `pci-dss,soc2` (comma-separated) |

### Lifecycle Tags

| Tag | Source | Values |
|-----|--------|--------|
| `EnvironmentTier` | `var.environment_tier` | `development`, `testing`, `staging`, `production`, `sandbox`, `ephemeral` |
| `ResourceCriticality` | `var.resource_criticality` | `critical`, `high`, `medium`, `low` |

### Security Posture Tags

| Tag | Value |
|-----|-------|
| `RequiresEncryptionAtRest` | `true` / `false` |
| `RequiresEncryptionInTransit` | `true` / `false` |
| `RequiresBackup` | `true` / `false` |

### Cost Allocation Tags

| Tag | Source |
|-----|--------|
| `CostCenter` | `var.cost_center` |
| `BudgetCode` | `var.budget_code` or auto-generated from cost center |

### Expiration Tags

| Tag | Condition |
|-----|-----------|
| `ExpiresOn` | Only added when `var.expiration_date` is set |

## Naming Standard

The naming convention follows the pattern:

```
{name_prefix}-{environment}-{region_code}-{workload}-{resource_type}
```

**Example:** `aegisai-dev-aps1-data-api-s3-bucket`

### Region Codes

| Region | Code |
|--------|------|
| ap-south-1 | `aps1` |
| us-east-1 | `ue1` |
| eu-west-1 | `ew1` |
| ap-southeast-1 | `apse1` |
| ap-southeast-2 | `apse2` |
| eu-central-1 | `ec1` |
| us-west-2 | `uw2` |

### Pre-computed Resource Names

The `naming_map` output provides pre-computed names for 25+ resource types (vpc, eks_cluster, s3_bucket, iam_role, security_group, etc.).

## Governance Model

### Precondition Validations

The module enforces these governance rules at plan time via `terraform_data` preconditions:

| Validation | Condition | Error On |
|------------|-----------|----------|
| Ephemeral expiration | `environment_tier == "ephemeral"` requires `expiration_date` | Missing expiration |
| Production compliance | `environment_tier == "production"` requires compliance frameworks | Missing frameworks |
| Production ephemeral | Production resources must not expire | Conflicting config |
| Restricted encryption | `data_classification == "restricted"` requires encryption at rest | Missing encryption |
| Critical backup | `resource_criticality == "critical"` requires backup | Missing backup |
| Cost center | All resources require a cost center | Empty cost center |
| Naming length | Base naming prefix must be ≤ 48 characters | Long name base |
| Naming characters | Only lowercase, numbers, and delimiter permitted | Invalid characters |

## Resource Classification

Resources are classified across five dimensions:

| Dimension | Values | Impact |
|-----------|--------|--------|
| Criticality | critical, high, medium, low | Monitoring SLAs, backup frequency |
| Data Classification | public, internal, confidential, restricted | Encryption requirements, access controls |
| Environment Tier | development, testing, staging, production, sandbox, ephemeral | Lifecycle management, cleanup policies |
| Encryption | true/false | At-rest and in-transit requirements |
| Backup | true/false | Backup policy, retention period |

## Compliance Mapping

The module includes control mappings for four compliance frameworks:

| Framework | Controls | Platform Coverage |
|-----------|----------|-------------------|
| PCI-DSS v4 | 8 controls | Network segregation, access control, encryption, audit logging, vulnerability management |
| SOC 2 Type II | 8 controls | Access controls, monitoring, incident response, change management |
| ISO 27001 | 10 controls | Asset management, access control, cryptography, operations security |
| RBI Master Directions | 10 controls | Data localization, business continuity, access control, encryption |

When `compliance_frameworks` is specified, only the selected frameworks' controls are included in the `selected_controls` output.

## Cost Allocation Strategy

Every resource is tagged for cost allocation with:

- **CostCenter:** Team or project identifier for chargeback
- **BudgetCode:** Budget tracking code (auto-generated if not specified)
- **Owner:** Responsible team or individual

The `cost_allocation` output provides structured metadata for:
- Chargeback reporting
- Budget tracking and forecasting
- Anomaly detection thresholds
- Resource right-sizing decisions

## Future AWS Organizations Integration

The module includes placeholder configuration for future multi-account support:

- **organizations_config:** Organization structure and account mappings
- **scp_templates:** Pre-defined SCP policies for account-level guardrails:
  - Restrict IAM privilege escalation
  - Restrict account leave
  - Enforce encryption
  - Restrict unrestricted network access

These are inert until AWS Organizations is adopted.

## Future SCP Integration

When AWS Organizations is enabled, the SCP templates in this module can be applied as Service Control Policies to prevent security-relevant actions across all accounts:

1. Restrict IAM privilege escalation (CreatePolicy, AttachRolePolicy, etc.)
2. Prevent accounts from leaving the organization
3. Enforce encryption requirements across all services
4. Block creation of security group rules with 0.0.0.0/0

## Usage

```hcl
module "governance" {
  source = "../modules/governance"

  environment     = var.environment
  workload        = "payment-api"
  owner           = "payments-team"
  cost_center     = "cc-payments"
  data_classification = "restricted"
  compliance_frameworks = ["pci-dss", "soc2"]
  resource_criticality  = "critical"

  requires_encryption_at_rest    = true
  requires_encryption_in_transit = true
  requires_backup                = true
}

# Apply tags to all resources
resource "aws_s3_bucket" "data" {
  bucket = module.governance.naming_map.s3_bucket
  tags   = module.governance.merged_tags
}
```

## Inputs

| Name | Description | Type | Default | Required |
|------|-------------|------|---------|----------|
| environment | Deployment environment | `string` | - | yes |
| workload | Workload or service name | `string` | - | yes |
| name_prefix | Resource name prefix | `string` | `"aegisai"` | no |
| aws_region | AWS region | `string` | `"ap-south-1"` | no |
| workload_type | Type of workload | `string` | `"platform-service"` | no |
| owner | Team or individual owner | `string` | `"platform-engineering"` | no |
| cost_center | Cost center identifier | `string` | `"cc-platform"` | no |
| budget_code | Budget tracking code | `string` | `""` | no |
| data_classification | Data classification level | `string` | `"internal"` | no |
| compliance_frameworks | Applicable compliance frameworks | `list(string)` | `[]` | no |
| resource_criticality | Business criticality level | `string` | `"medium"` | no |
| requires_encryption_at_rest | Require encryption at rest | `bool` | `true` | no |
| requires_encryption_in_transit | Require TLS 1.3 | `bool` | `true` | no |
| requires_backup | Require automated backup | `bool` | `true` | no |
| environment_tier | Environment lifecycle tier | `string` | `"development"` | no |
| expiration_date | Expiration for ephemeral resources | `string` | `""` | no |
| naming_delimiter | Delimiter for resource names | `string` | `"-"` | no |
| resource_name_max_length | Max resource name length | `number` | `63` | no |
| additional_tags | Extra tags to merge | `map(string)` | `{}` | no |

## Outputs

| Name | Description |
|------|-------------|
| merged_tags | Complete governance-enforced tag set |
| mandatory_tags | Base mandatory tags |
| data_classification_tags | Data classification and compliance tags |
| security_tags | Encryption and security posture tags |
| cost_tags | Cost allocation tags |
| lifecycle_tags | Lifecycle management tags |
| naming_base | Base naming prefix |
| naming_map | Pre-computed resource names by type |
| region_code | Short region abbreviation |
| compliance_controls | Full compliance framework definitions |
| selected_controls | Compliance controls for selected frameworks |
| has_compliance_requirements | Whether compliance frameworks are selected |
| resource_classification | Resource classification metadata |
| cost_allocation | Cost allocation metadata for chargeback |
| organizations_config | AWS Organizations placeholder config |
| scp_templates | Pre-defined SCP templates |
| governance_version | Module version identifier |

## Dependencies

- **Terraform:** >= 1.9.0
- **AWS Provider:** ~> 5.80
- **No cloud dependencies** — this module is data-only

## Security Considerations

1. **Tagging is informational, not enforcement.** Tags guide policy but do not prevent misconfiguration. Use OPA/Gatekeeper or AWS Config rules for runtime tag enforcement.
2. **Data classification tags** should be treated as metadata. Actual data protection must be enforced through encryption, access controls, and network policies.
3. **Compliance mappings** are reference documentation. Actual compliance requires evidence collection, audit logging, and policy validation beyond tagging.
4. **SCP templates** are placeholders. Before activating in AWS Organizations, review each SCP's impact on legitimate operations.
5. **Plan-time validations** can be bypassed with `-target`. Use CI/CD policy gates (Checkov, tfsec, OPA) for mandatory enforcement.
