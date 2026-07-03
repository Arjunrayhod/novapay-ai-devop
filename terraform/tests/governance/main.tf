# ---------------------------------------------------------------------------
# Governance Module — Precondition Validation Tests
# ---------------------------------------------------------------------------
# These tests validate that governance preconditions fire correctly.
# They use terraform_data with precondition blocks to test boundary
# conditions without creating actual resources.
#
# Run: terraform plan -var-file="test-cases/production.tfvars"
# ---------------------------------------------------------------------------

terraform {
  required_version = ">= 1.9.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.80"
    }
    terraform = {
      source  = "hashicorp/terraform"
      version = "~> 1.9"
    }
  }
}

provider "aws" {
  region = "ap-south-1"
}

# ---------------------------------------------------------------------------
# Test 1: Standard workload — minimum viable governance
# ---------------------------------------------------------------------------

module "governance_minimal" {
  source = "../../modules/governance"

  environment = "dev"
  workload    = "test-minimal"
  owner       = "platform-engineering"
  cost_center = "cc-platform"
}

resource "terraform_data" "test_minimal" {
  triggers_replace = {
    naming_base = module.governance_minimal.naming_base
    tag_count   = length(module.governance_minimal.merged_tags)
  }

  lifecycle {
    postcondition {
      condition     = length(module.governance_minimal.merged_tags) >= 10
      error_message = "Minimal governance must produce at least 10 tags"
    }
  }

  lifecycle {
    postcondition {
      condition     = can(regex("^aegisai-dev-", module.governance_minimal.naming_base))
      error_message = "Naming base must start with 'aegisai-dev-' for dev environment with default prefix"
    }
  }
}

# ---------------------------------------------------------------------------
# Test 2: Production workload with compliance
# ---------------------------------------------------------------------------

module "governance_production" {
  source = "../../modules/governance"

  environment                    = "prod"
  workload                       = "test-production"
  owner                          = "security-team"
  cost_center                    = "cc-security"
  data_classification            = "restricted"
  compliance_frameworks          = ["pci-dss", "soc2", "rbi"]
  resource_criticality           = "critical"
  environment_tier               = "production"
  requires_encryption_at_rest    = true
  requires_encryption_in_transit = true
  requires_backup                = true
}

resource "terraform_data" "test_production" {
  triggers_replace = {
    frameworks = join(",", keys(module.governance_production.selected_controls))
  }

  lifecycle {
    postcondition {
      condition     = module.governance_production.has_compliance_requirements
      error_message = "Production workload with compliance_frameworks must have compliance requirements"
    }
  }

  lifecycle {
    postcondition {
      condition     = length(module.governance_production.selected_controls) == 3
      error_message = "Production workload with 3 compliance frameworks must have 3 selected controls"
    }
  }
}

# ---------------------------------------------------------------------------
# Test 3: Ephemeral workload with expiration
# ---------------------------------------------------------------------------

module "governance_ephemeral" {
  source = "../../modules/governance"

  environment          = "dev"
  workload             = "test-ephemeral"
  owner                = "developer-team"
  cost_center          = "cc-engineering"
  environment_tier     = "ephemeral"
  expiration_date      = "2026-12-31"
  resource_criticality = "low"
}

resource "terraform_data" "test_ephemeral" {
  triggers_replace = {
    expires_on = module.governance_ephemeral.merged_tags["ExpiresOn"]
  }

  lifecycle {
    postcondition {
      condition     = module.governance_ephemeral.merged_tags["ExpiresOn"] == "2026-12-31"
      error_message = "Ephemeral workload must have ExpiresOn tag set to the expiration date"
    }
  }

  lifecycle {
    postcondition {
      condition     = module.governance_ephemeral.resource_classification.is_ephemeral
      error_message = "Ephemeral workload must be classified as ephemeral"
    }
  }
}

# ---------------------------------------------------------------------------
# Test 4: Multi-region naming
# ---------------------------------------------------------------------------

module "governance_us_east" {
  source = "../../modules/governance"

  environment = "prod"
  workload    = "test-global"
  owner       = "platform-engineering"
  cost_center = "cc-platform"
  aws_region  = "us-east-1"
}

resource "terraform_data" "test_region_naming" {
  triggers_replace = {
    naming_base = module.governance_us_east.naming_base
  }

  lifecycle {
    postcondition {
      condition     = can(regex("ue1", module.governance_us_east.naming_base))
      error_message = "US East naming must contain 'ue1' region code"
    }
  }
}

# ---------------------------------------------------------------------------
# Test 5: Compliance controls structure
# ---------------------------------------------------------------------------

resource "terraform_data" "test_compliance_structure" {
  triggers_replace = {
    pci_framework  = module.governance_production.compliance_controls["pci-dss"].framework
    soc2_framework = module.governance_production.compliance_controls["soc2"].framework
    rbi_framework  = module.governance_production.compliance_controls["rbi"].framework
  }

  lifecycle {
    postcondition {
      condition     = module.governance_production.compliance_controls["pci-dss"].framework == "PCI-DSS v4"
      error_message = "PCI-DSS framework name must match"
    }
  }

  lifecycle {
    postcondition {
      condition     = length(module.governance_production.compliance_controls["pci-dss"].controls) >= 5
      error_message = "PCI-DSS must have at least 5 control definitions"
    }
  }
}

# ---------------------------------------------------------------------------
# Test 6: Cost allocation output
# ---------------------------------------------------------------------------

resource "terraform_data" "test_cost_allocation" {
  triggers_replace = {
    cost_center = module.governance_production.cost_allocation.cost_center
    budget_code = module.governance_production.cost_allocation.budget_code
  }

  lifecycle {
    postcondition {
      condition     = module.governance_production.cost_allocation.chargeback_enabled
      error_message = "Cost allocation must have chargeback enabled when cost center is set"
    }
  }

  lifecycle {
    postcondition {
      condition     = module.governance_production.cost_allocation.budget_code == "bg-cc-security"
      error_message = "Budget code must be auto-generated from cost center when not explicitly set"
    }
  }
}
