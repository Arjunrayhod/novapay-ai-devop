# ---------------------------------------------------------------------------
# Region abbreviation mapping
# ---------------------------------------------------------------------------

locals {
  region_short = {
    ap-south-1      = "aps1"
    ap-southeast-1  = "apse1"
    ap-southeast-2  = "apse2"
    ap-northeast-1  = "apne1"
    eu-west-1       = "ew1"
    eu-west-2       = "ew2"
    eu-central-1    = "ec1"
    us-east-1       = "ue1"
    us-east-2       = "ue2"
    us-west-1       = "uw1"
    us-west-2       = "uw2"
    sa-east-1       = "sae1"
    ca-central-1    = "cac1"
  }

  region_code = try(local.region_short[var.aws_region], "other")

# ---------------------------------------------------------------------------
# Tagging — mandatory base tags
# ---------------------------------------------------------------------------

  mandatory_tags = {
    Environment     = var.environment
    ManagedBy       = "terraform"
    Platform        = var.name_prefix
    Project         = "${var.name_prefix}-platform"
    Workload        = var.workload
    WorkloadType    = var.workload_type
    Owner           = var.owner
    CostCenter      = var.cost_center
    Provisioner     = "terraform"
    Repository      = "github.com/aegisai/aegisai-platform"
  }

# ---------------------------------------------------------------------------
# Tagging — data classification
# ---------------------------------------------------------------------------

  data_classification_tags = {
    DataClassification   = var.data_classification
    ComplianceFrameworks = join(",", var.compliance_frameworks)
  }

# ---------------------------------------------------------------------------
# Tagging — environment tier and lifecycle
# ---------------------------------------------------------------------------

  lifecycle_tags = {
    EnvironmentTier    = var.environment_tier
    ResourceCriticality = var.resource_criticality
  }

# ---------------------------------------------------------------------------
# Tagging — encryption and security posture
# ---------------------------------------------------------------------------

  security_tags = {
    RequiresEncryptionAtRest    = var.requires_encryption_at_rest ? "true" : "false"
    RequiresEncryptionInTransit = var.requires_encryption_in_transit ? "true" : "false"
    RequiresBackup              = var.requires_backup ? "true" : "false"
  }

# ---------------------------------------------------------------------------
# Tagging — cost allocation
# ---------------------------------------------------------------------------

  cost_tags = {
    CostCenter = var.cost_center
    BudgetCode = var.budget_code != "" ? var.budget_code : "bg-${var.cost_center}"
  }

# ---------------------------------------------------------------------------
# Tagging — expiration
# ---------------------------------------------------------------------------

  expiration_tags = var.expiration_date != "" ? {
    ExpiresOn = var.expiration_date
  } : {}

# ---------------------------------------------------------------------------
# Complete merged tag set
# ---------------------------------------------------------------------------

  merged_tags = merge(
    local.mandatory_tags,
    local.data_classification_tags,
    local.lifecycle_tags,
    local.security_tags,
    local.cost_tags,
    local.expiration_tags,
    var.additional_tags
  )

# ---------------------------------------------------------------------------
# Naming convention base
#   Pattern: {name_prefix}-{environment}-{region_code}-{workload}
#   Example: aegisai-dev-aps1-data-api
# ---------------------------------------------------------------------------

  naming_base = join(var.naming_delimiter, compact([
    var.name_prefix,
    var.environment,
    local.region_code,
    var.workload,
  ]))

# ---------------------------------------------------------------------------
# Naming map — common resource type patterns
# Consumers use: local.naming_map["eks_cluster"]
# Example output: aegisai-dev-aps1-data-api-eks-cluster
# ---------------------------------------------------------------------------

  naming_map = {
    base              = local.naming_base
    delimiter         = var.naming_delimiter
    max_length        = var.resource_name_max_length
    vpc               = "${local.naming_base}${var.naming_delimiter}vpc"
    subnet_public     = "${local.naming_base}${var.naming_delimiter}subnet-public"
    subnet_private    = "${local.naming_base}${var.naming_delimiter}subnet-private"
    subnet_data       = "${local.naming_base}${var.naming_delimiter}subnet-data"
    nat_gateway       = "${local.naming_base}${var.naming_delimiter}ngw"
    internet_gateway  = "${local.naming_base}${var.naming_delimiter}igw"
    vpc_endpoint      = "${local.naming_base}${var.naming_delimiter}vpce"
    security_group    = "${local.naming_base}${var.naming_delimiter}sg"
    eks_cluster       = "${local.naming_base}${var.naming_delimiter}eks-cluster"
    eks_node_group    = "${local.naming_base}${var.naming_delimiter}eks-node"
    s3_bucket         = "${local.naming_base}${var.naming_delimiter}s3"
    dynamodb_table    = "${local.naming_base}${var.naming_delimiter}dynamodb"
    rds_instance      = "${local.naming_base}${var.naming_delimiter}rds"
    elasticache       = "${local.naming_base}${var.naming_delimiter}elasticache"
    ecr_repository    = "${local.naming_base}${var.naming_delimiter}ecr"
    kms_key           = "${local.naming_base}${var.naming_delimiter}kms"
    iam_role          = "${local.naming_base}${var.naming_delimiter}iam-role"
    iam_policy        = "${local.naming_base}${var.naming_delimiter}iam-policy"
    log_group         = "${local.naming_base}${var.naming_delimiter}logs"
    certificate       = "${local.naming_base}${var.naming_delimiter}cert"
    hosted_zone       = "${local.naming_base}${var.naming_delimiter}zone"
    load_balancer     = "${local.naming_base}${var.naming_delimiter}lb"
    queue             = "${local.naming_base}${var.naming_delimiter}queue"
    topic             = "${local.naming_base}${var.naming_delimiter}topic"
    function          = "${local.naming_base}${var.naming_delimiter}fn"
    api_gateway       = "${local.naming_base}${var.naming_delimiter}api"
  }

# ---------------------------------------------------------------------------
# Compliance framework control definitions
# ---------------------------------------------------------------------------

  compliance_controls = {
    pci-dss = {
      framework = "PCI-DSS v4"
      controls = [
        "1.1 Establish and maintain network security controls",
        "1.2 Secure configuration of network components",
        "2.1 Secure configuration of system components",
        "4.1 Encrypt cardholder data in transit",
        "7.1 Restrict access to cardholder data by business need-to-know",
        "8.1 Authentication for system access",
        "10.1 Audit logging for system components",
        "10.2 Automated audit log review",
      ]
      platform_coverage = {
        NetworkSegregation       = "NetworkPolicies, Security Groups, NACLs"
        AccessControl            = "IAM roles with permission boundaries, OPA policies"
        Encryption               = "KMS encryption at rest, TLS 1.3 in transit"
        AuditLogging             = "CloudTrail, Kubernetes audit logs, structured logging"
        VulnerabilityManagement  = "Container scanning, SAST/SCA pipeline gates"
      }
    }
    soc2 = {
      framework = "SOC 2 Type II"
      controls = [
        "CC1.1 Control Environment — Accountability",
        "CC2.1 Communication and Information",
        "CC3.1 Risk Assessment",
        "CC4.1 Monitoring Activities",
        "CC5.1 Control Activities — Policies",
        "CC6.1 Logical and Physical Access",
        "CC7.1 System Operations",
        "CC8.1 Change Management",
      ]
      platform_coverage = {
        AccessControls     = "IAM, OIDC, RBAC, IRSA"
        Monitoring         = "Prometheus, Grafana, structured logging, distributed tracing"
        IncidentResponse   = "Alertmanager, PagerDuty integration, runbooks"
        ChangeManagement   = "GitOps, PR-based changes, CI/CD gates, approval workflows"
        Encryption         = "KMS, TLS 1.3, encryption at rest"
      }
    }
    iso27001 = {
      framework = "ISO 27001"
      controls = [
        "A.5 Information security policies",
        "A.6 Organization of information security",
        "A.7 Human resource security",
        "A.8 Asset management",
        "A.9 Access control",
        "A.10 Cryptography",
        "A.12 Operations security",
        "A.13 Communications security",
        "A.16 Incident management",
        "A.17 Business continuity management",
      ]
      platform_coverage = {
        AssetManagement      = "Tagging enforcement, resource inventory"
        AccessControl        = "IAM, OIDC, RBAC, permission boundaries"
        Cryptography         = "KMS, TLS 1.3, encryption at rest and in transit"
        OperationsSecurity   = "CI/CD pipelines, change management, vulnerability management"
        IncidentManagement   = "Alerting, PagerDuty, runbooks, post-incident reviews"
        BusinessContinuity   = "Multi-AZ, backup policies, DR runbooks"
      }
    }
    rbi = {
      framework = "RBI Master Directions on IT Governance"
      controls = [
        "ITG-1 IT Governance Framework",
        "ITG-2 Information Security Policy",
        "ITG-3 Business Continuity Planning",
        "ITG-4 IT Operations",
        "ITG-5 Audit and Compliance",
        "IS-1 Data Classification and Protection",
        "IS-2 Access Controls",
        "IS-3 Network Security",
        "IS-4 Encryption and Key Management",
        "BCP-1 Disaster Recovery",
      ]
      platform_coverage = {
        DataLocalization     = "Region-restricted resources, data residency enforcement"
        BusinessContinuity   = "Multi-region DR, automated failover, backup policies"
        AccessControl        = "IAM, RBAC, MFA enforcement, audit logging"
        Encryption           = "KMS with region-restricted keys, TLS 1.3"
        AuditCompliance      = "CloudTrail, Config, automated evidence collection"
      }
    }
  }

# ---------------------------------------------------------------------------
# Selected compliance controls (filtered by user-specified frameworks)
# ---------------------------------------------------------------------------

  selected_frameworks = length(var.compliance_frameworks) > 0 && !contains(var.compliance_frameworks, "none") ? var.compliance_frameworks : []

  selected_controls = {
    for f in local.selected_frameworks :
    f => local.compliance_controls[f]
  }

  has_compliance_requirements = length(local.selected_frameworks) > 0

# ---------------------------------------------------------------------------
# Resource classification map
# ---------------------------------------------------------------------------

  resource_classification = {
    criticality_level     = var.resource_criticality
    data_classification   = var.data_classification
    environment_tier      = var.environment_tier
    requires_encryption   = var.requires_encryption_at_rest || var.requires_encryption_in_transit
    requires_backup       = var.requires_backup
    is_ephemeral          = var.expiration_date != ""
    is_production         = var.environment_tier == "production"
    compliance_applicable = local.has_compliance_requirements
  }

# ---------------------------------------------------------------------------
# Cost allocation metadata
# ---------------------------------------------------------------------------

  cost_allocation = {
    cost_center       = var.cost_center
    budget_code       = var.budget_code != "" ? var.budget_code : "bg-${var.cost_center}"
    owner             = var.owner
    workload          = var.workload
    environment       = var.environment
    chargeback_enabled = var.cost_center != "" ? true : false
    allocation_tags = {
      CostCenter = var.cost_center
      BudgetCode = var.budget_code != "" ? var.budget_code : "bg-${var.cost_center}"
      Owner      = var.owner
      Workload   = var.workload
    }
  }

# ---------------------------------------------------------------------------
# AWS Organizations integration points (future)
# ---------------------------------------------------------------------------

  organizations_config = {
    enabled                    = false
    organization_id            = ""
    organization_root_id       = ""
    security_account_id        = ""
    logging_account_id         = ""
    shared_services_account_id = ""
    workload_account_ou_path   = []
    scp_attachments            = []
  }

# ---------------------------------------------------------------------------
# SCP templates (future — for AWS Organizations)
# ---------------------------------------------------------------------------

  scp_templates = {
    restrict_iam_privilege_escalation = {
      name        = "RestrictIAMPrivilegeEscalation"
      description = "Prevents IAM actions that could be used for privilege escalation"
      effect      = "Deny"
      actions = [
        "iam:CreatePolicy",
        "iam:AttachRolePolicy",
        "iam:PutRolePolicy",
        "iam:UpdateAssumeRolePolicy",
      ]
      resources = ["*"]
      condition = {}
    }
    restrict_account_leave = {
      name        = "RestrictAccountLeave"
      description = "Prevents leaving the AWS Organization"
      effect      = "Deny"
      actions = [
        "organizations:LeaveOrganization",
      ]
      resources = ["*"]
      condition = {}
    }
    enforce_encryption = {
      name        = "EnforceEncryption"
      description = "Requires encryption at rest for supported services"
      effect      = "Deny"
      actions = [
        "s3:PutBucketPublicAccessBlock",
        "ec2:RunInstances",
        "rds:CreateDBInstance",
      ]
      resources = ["*"]
      condition = {}
    }
    restrict_unrestricted_network = {
      name        = "RestrictUnrestrictedNetwork"
      description = "Denies operations that allow unrestricted network access"
      effect      = "Deny"
      actions = [
        "ec2:AuthorizeSecurityGroupIngress",
        "ec2:AuthorizeSecurityGroupEgress",
      ]
      resources = ["*"]
      condition = {
        test     = "StringEquals"
        variable = "ec2:cidr"
        values   = ["0.0.0.0/0"]
      }
    }
  }
}
