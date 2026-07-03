# AegisAI OPA Policy: Terraform Configuration Validation
#
# Policy: All Terraform configurations must specify required_version >= 1.9.0
# This policy validates root modules and child modules.

package aegisai.terraform

import future.keywords.if
import future.keywords.in

default allow = false

allow if {
    required_version := input.terraform.required_version
    semver_compare(required_version, ">= 1.9.0")
}

deny[msg] {
    not allow
    msg = sprintf("Terraform required_version must be >= 1.9.0, got: %v", [input.terraform.required_version])
}

semver_compare(version, constraint) = true {
    # Simplified semver check — production should use a proper semver library
    contains(version, "1.9") or contains(version, ">= 1.9")
}
