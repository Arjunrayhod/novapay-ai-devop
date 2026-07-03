# ---------------------------------------------------------------------------
# Governance Foundation Module
# ---------------------------------------------------------------------------
# This module provides a centralized governance layer for all AegisAI
# Terraform modules. It is a data-only module that produces computed
# values for tagging, naming, compliance, and cost allocation.
#
# No cloud resources are created by this module.
#
# Usage:
#   module "governance" {
#     source = "../modules/governance"
#
#     environment         = var.environment
#     workload            = "my-service"
#     owner               = "my-team"
#     cost_center         = "cc-my-team"
#     data_classification = "internal"
#     compliance_frameworks = ["soc2", "pci-dss"]
#   }
#
#   tags = module.governance.merged_tags
#   name = module.governance.naming_map.s3_bucket
# ---------------------------------------------------------------------------

# All governance logic is implemented in locals.tf and validations.tf.
# This file exists for module structure completeness and documentation.
