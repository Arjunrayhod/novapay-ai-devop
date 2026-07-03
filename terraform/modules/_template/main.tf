# Module: _template
#
# This is a template module showing the standard structure.
# Copy this directory to create new modules:
#   cp -r modules/_template modules/<new-module-name>
#
# Then implement resources following these patterns:
#
# 1. Use local.resource_name for naming
# 2. Use local.tags for all taggable resources
# 3. Use for_each not count for conditional creation
# 4. Set encryption on all storage resources
# 5. Use data.aws_iam_policy_document for IAM

# Example pattern (replace with actual resources):
# resource "aws_example" "this" {
#   name        = local.resource_name
#   description = "Managed by Terraform - AegisAI ${var.environment}"
#   tags        = local.tags
# }
