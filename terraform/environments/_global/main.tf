# Global Infrastructure
#
# Resources that span across all environments:
#   - DNS zones (Route53)
#   - Terraform state bucket + DynamoDB lock table
#   - Organization-level IAM roles and policies
#   - CloudTrail (organization trail)
#   - GuardDuty
#   - Security Hub
#   - Shared KMS keys
#
# These resources are deployed once and referenced by all environments.
# Apply with caution — changes here affect the entire platform.
