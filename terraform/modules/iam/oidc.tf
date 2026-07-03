# ---------------------------------------------------------------------------
# GitHub OIDC Identity Provider
#
# Enables GitHub Actions workflows to assume IAM roles directly
# without storing long-lived AWS credentials as secrets.
#
# The OIDC provider is created once per account. Multiple roles
# (CI/CD, Terraform Execution) reference it in their trust policies.
# ---------------------------------------------------------------------------

data "aws_iam_policy_document" "github_oidc_thumbprint" {
  # Used to fetch the OIDC provider thumbprint via the http provider.
  # This is handled by the AWS provider automatically when
  # `thumbprint_list` is not specified (uses computed thumbprint).
}

resource "aws_iam_openid_connect_provider" "github" {
  count = var.create_github_oidc_provider ? 1 : 0

  url            = "https://${var.github_oidc_provider_url}"
  client_id_list = [var.github_oidc_audience]

  # AWS automatically computes the thumbprint when the list is empty.
  # For production, pin to a known thumbprint from GitHub's OIDC provider.
  thumbprint_list = []

  tags = merge(local.tags, { Provider = "github-oidc" })
}
