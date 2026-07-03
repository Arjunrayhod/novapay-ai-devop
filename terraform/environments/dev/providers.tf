provider "aws" {
  region = var.aws_region

  default_tags {
    tags = local.common_tags
  }

  assume_role {
    role_arn     = var.aws_assume_role_arn
    session_name = "aegisai-terraform-dev"
  }
}
