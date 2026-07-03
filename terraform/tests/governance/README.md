# Governance Module Tests

## Overview

These tests validate the governance module's precondition logic, tagging outputs, naming conventions, compliance mappings, and cost allocation.

## Test Cases

| Test | Description | Validates |
|------|-------------|-----------|
| `governance_minimal` | Minimum viable governance config | Tag count >= 10, naming base format |
| `governance_production` | Production with PCI-DSS + SOC2 + RBI | Compliance requirements flag, selected controls count |
| `governance_ephemeral` | Ephemeral with expiration | ExpiresOn tag, is_ephemeral classification |
| `governance_us_east` | Multi-region naming | Region code in naming base |
| `test_compliance_structure` | Compliance control mappings | Framework name, control count |
| `test_cost_allocation` | Cost allocation metadata | Chargeback enabled, budget code auto-generation |

## Running Tests

```bash
# From terraform/tests/governance/
terraform init
terraform plan
```

The tests use `terraform_data` with `postcondition` blocks to validate governance outputs. These conditions are evaluated during `terraform plan`, so no actual resources are created.

## Test Validation

Successful plan output indicates all postconditions passed. If a test fails, the error message will indicate which condition was violated.
