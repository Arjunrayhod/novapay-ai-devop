locals {
  environment = var.environment

  name_prefix = var.name_prefix != "" ? var.name_prefix : "aegisai"

  region_short = {
    ap-south-1      = "aps1"
    us-east-1       = "ue1"
    eu-west-1       = "ew1"
    ap-southeast-1  = "apse1"
    ap-southeast-2  = "apse2"
  }

  common_tags = {
    Environment   = local.environment
    ManagedBy     = "terraform"
    Platform      = "aegisai"
    Project       = "aegisai-platform"
    Workload      = "aegisai-workloads"
    Owner         = var.owner
    CostCenter    = var.cost_center
    Provisioner   = "terraform"
    Repository    = "github.com/aegisai/aegisai-platform"
    TerraformRoot = basename(abspath(path.root))
  }

  # Naming convention: {environment}-{resource-type}-{name}
  # Example: dev-eks-cluster-main, prod-s3-bucket-logs
  naming_config = {
    delimiter     = "-"
    max_name_length = 63
    case            = "lower"
  }
}
