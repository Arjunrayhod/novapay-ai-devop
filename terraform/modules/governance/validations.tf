# ---------------------------------------------------------------------------
# Governance preconditions and validation rules
# These are evaluated at plan time to catch governance violations early.
# ---------------------------------------------------------------------------

# Validate that ephemeral resources have expiration dates
resource "terraform_data" "validate_ephemeral_expiration" {
  count = var.environment_tier == "ephemeral" && var.expiration_date == "" ? 1 : 0

  lifecycle {
    precondition {
      condition     = var.expiration_date != ""
      error_message = <<-EOT
        Ephemeral resources must have an expiration date set via var.expiration_date.
        Resources in environment_tier "ephemeral" require automatic cleanup scheduling.
        Set var.expiration_date to a valid YYYY-MM-DD date.
      EOT
    }
  }
}

# Validate that production resources have compliance frameworks specified
resource "terraform_data" "validate_production_compliance" {
  count = var.environment_tier == "production" && !local.has_compliance_requirements ? 1 : 0

  lifecycle {
    precondition {
      condition     = local.has_compliance_requirements
      error_message = <<-EOT
        Production resources must specify applicable compliance frameworks via var.compliance_frameworks.
        At least one framework (pci-dss, soc2, iso27001, rbi, hipaa, gdpr) must be selected.
        Use ["none"] only for non-production or experimental workloads.
      EOT
    }
  }
}

# Validate that production resources are not ephemeral
resource "terraform_data" "validate_production_not_ephemeral" {
  count = var.environment_tier == "production" && var.expiration_date != "" ? 1 : 0

  lifecycle {
    precondition {
      condition     = var.expiration_date == ""
      error_message = <<-EOT
        Production resources must not have an expiration date.
        var.expiration_date must be empty for environment_tier "production".
        Ephemeral resources are only permitted in non-production tiers.
      EOT
    }
  }
}

# Validate that restricted data classification requires encryption
resource "terraform_data" "validate_restricted_encryption" {
  count = var.data_classification == "restricted" && !var.requires_encryption_at_rest ? 1 : 0

  lifecycle {
    precondition {
      condition     = var.requires_encryption_at_rest
      error_message = <<-EOT
        Resources with data_classification "restricted" must have encryption at rest enabled.
        Set var.requires_encryption_at_rest = true for restricted data workloads.
      EOT
    }
  }
}

# Validate that critical resources require backup
resource "terraform_data" "validate_critical_backup" {
  count = var.resource_criticality == "critical" && !var.requires_backup ? 1 : 0

  lifecycle {
    precondition {
      condition     = var.requires_backup
      error_message = <<-EOT
        Resources with resource_criticality "critical" must have automated backup enabled.
        Set var.requires_backup = true for critical workloads.
      EOT
    }
  }
}

# Validate cost center format for chargeback
resource "terraform_data" "validate_cost_center" {
  count = var.cost_center == "" ? 1 : 0

  lifecycle {
    precondition {
      condition     = var.cost_center != ""
      error_message = <<-EOT
        A cost center must be specified for all resources. Set var.cost_center to a valid
        cost center identifier (e.g., "cc-platform", "cc-novapay", "cc-paysecure").
        Every resource must have a cost allocation owner for chargeback tracking.
      EOT
    }
  }
}

# Validate naming base length
resource "terraform_data" "validate_naming_length" {
  count = length(local.naming_base) > 48 ? 1 : 0

  lifecycle {
    precondition {
      condition     = length(local.naming_base) <= 48
      error_message = <<-EOT
        The naming base prefix is too long (${length(local.naming_base)} characters, max 48).
        Shorten var.name_prefix, var.environment, or var.workload values to ensure
        generated resource names fit within AWS 63-character limits.
      EOT
    }
  }
}

# Validate that naming base contains no invalid characters
resource "terraform_data" "validate_naming_characters" {
  count = can(regex("^[a-z0-9-]+$", local.naming_base)) ? 0 : 1

  lifecycle {
    precondition {
      condition     = can(regex("^[a-z0-9-]+$", local.naming_base))
      error_message = <<-EOT
        The naming base prefix contains invalid characters. Only lowercase letters,
        numbers, and the configured delimiter (${var.naming_delimiter}) are permitted.
        Current value: "${local.naming_base}"
      EOT
    }
  }
}
