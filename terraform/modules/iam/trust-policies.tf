# ---------------------------------------------------------------------------
# Account-level trust policy (with optional MFA)
# Used by: Platform Admin, Operator, ReadOnly
# ---------------------------------------------------------------------------

data "aws_iam_policy_document" "trust_account" {
  statement {
    sid    = "AllowAccountPrincipals"
    effect = "Allow"

    principals {
      type        = "AWS"
      identifiers = ["arn:aws:iam::${local.account_id}:root"]
    }

    actions = ["sts:AssumeRole"]

    dynamic "condition" {
      for_each = var.require_mfa ? [1] : []
      content {
        test     = "Bool"
        variable = "aws:MultiFactorAuthPresent"
        values   = ["true"]
      }
    }
  }
}

# ---------------------------------------------------------------------------
# CI/CD OIDC trust policy
# Used by: CI/CD Role (when OIDC + repositories are configured)
# ---------------------------------------------------------------------------

data "aws_iam_policy_document" "trust_cicd_oidc" {
  count = var.create_github_oidc_provider && length(var.github_repositories) > 0 ? 1 : 0

  statement {
    sid    = "AllowGitHubOIDC"
    effect = "Allow"

    principals {
      type        = "Federated"
      identifiers = [aws_iam_openid_connect_provider.github[0].arn]
    }

    actions = ["sts:AssumeRoleWithWebIdentity"]

    condition {
      test     = "StringEquals"
      variable = "${var.github_oidc_provider_url}:aud"
      values   = [var.github_oidc_audience]
    }

    condition {
      test     = "StringLike"
      variable = "${var.github_oidc_provider_url}:sub"
      values   = local.oidc_subjects
    }
  }
}

# ---------------------------------------------------------------------------
# Terraform Execution trust policy
# Trusts: CI/CD role (if created) + account principals
# ---------------------------------------------------------------------------

data "aws_iam_policy_document" "trust_terraform" {
  count = var.create_cicd_role ? 1 : 0

  statement {
    sid    = "AllowCI/CDRole"
    effect = "Allow"

    principals {
      type        = "AWS"
      identifiers = [aws_iam_role.cicd[0].arn]
    }

    actions = ["sts:AssumeRole"]
  }

  statement {
    sid    = "AllowAccountPrincipals"
    effect = "Allow"

    principals {
      type        = "AWS"
      identifiers = ["arn:aws:iam::${local.account_id}:root"]
    }

    actions = ["sts:AssumeRole"]

    dynamic "condition" {
      for_each = var.require_mfa ? [1] : []
      content {
        test     = "Bool"
        variable = "aws:MultiFactorAuthPresent"
        values   = ["true"]
      }
    }
  }
}

# ---------------------------------------------------------------------------
# Cross-account trust policy
# Used by: Cross-Account Role
# ---------------------------------------------------------------------------

data "aws_iam_policy_document" "trust_cross_account" {
  count = var.create_cross_account_role ? 1 : 0

  statement {
    sid    = "AllowCrossAccountAccess"
    effect = "Allow"

    principals {
      type = "AWS"
      identifiers = length(var.cross_account_source_role_names) > 0 ? [
        for role in var.cross_account_source_role_names :
        "arn:aws:iam::${var.cross_account_source_accounts[0]}:role/${role}"
        ] : [
        for account in var.cross_account_source_accounts :
        "arn:aws:iam::${account}:root"
      ]
    }

    actions = ["sts:AssumeRole"]

    dynamic "condition" {
      for_each = var.require_mfa ? [1] : []
      content {
        test     = "Bool"
        variable = "aws:MultiFactorAuthPresent"
        values   = ["true"]
      }
    }
  }
}
