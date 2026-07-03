module "iam" {
  source = "../../modules/iam"

  environment = "dev"
  name_prefix = "aegisai"

  # Enable all roles
  create_platform_admin_role      = true
  create_platform_operator_role   = true
  create_cicd_role                = true
  create_readonly_role            = true
  create_terraform_execution_role = true
  create_cross_account_role       = false

  # Session durations
  platform_admin_session_duration      = 28800
  platform_operator_session_duration   = 28800
  cicd_session_duration                = 3600
  readonly_session_duration            = 43200
  terraform_execution_session_duration = 3600

  # GitHub OIDC
  create_github_oidc_provider = true
  github_repositories = [
    "aegisai-platform/infra:ref:refs/heads/main",
    "aegisai-platform/infra:ref:refs/heads/dev",
    "aegisai-platform/app-backend:ref:refs/heads/main",
  ]

  # Permission boundary
  create_permission_boundary = true
  allowed_iam_role_paths     = ["/platform/", "/workloads/", "/terraform/"]
  allowed_pass_role_paths    = ["/platform/", "/workloads/", "/terraform/"]

  tags = {
    Environment = "dev"
    Project     = "aegisai-platform"
    ManagedBy   = "terraform"
  }
}
