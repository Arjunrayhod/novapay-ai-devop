variable "aws_region" {
  description = "AWS region for all resources"
  type        = string
  default     = "ap-south-1"
}

variable "aws_assume_role_arn" {
  description = "ARN of IAM role to assume for this environment"
  type        = string
  default     = ""
}

variable "owner" {
  description = "Team or individual owning these resources"
  type        = string
  default     = "platform-engineering"
}

variable "cost_center" {
  description = "Cost center identifier"
  type        = string
  default     = "cc-staging"
}

variable "tags" {
  description = "Additional tags to merge"
  type        = map(string)
  default     = {}
}

variable "vpc_cidr" {
  description = "CIDR block for the VPC"
  type        = string
  default     = "10.200.0.0/16"

  validation {
    condition     = can(cidrhost(var.vpc_cidr, 0))
    error_message = "VPC CIDR must be a valid IPv4 CIDR notation (e.g., 10.200.0.0/16)."
  }
}

variable "availability_zones" {
  description = "List of availability zones to use"
  type        = list(string)
  default     = ["ap-south-1a", "ap-south-1b", "ap-south-1c"]
}

variable "enable_nat_gateway" {
  description = "Enable NAT gateway for private subnets"
  type        = bool
  default     = true
}

variable "single_nat_gateway" {
  description = "Use a single NAT gateway"
  type        = bool
  default     = false
}

variable "enable_vpn_gateway" {
  description = "Enable VPN gateway"
  type        = bool
  default     = false
}

variable "cluster_version" {
  description = "Kubernetes version for EKS cluster"
  type        = string
  default     = "1.30"
}

variable "node_group_desired_size" {
  description = "Desired node count in EKS node group"
  type        = number
  default     = 3
}

variable "node_group_min_size" {
  description = "Minimum node count in EKS node group"
  type        = number
  default     = 2
}

variable "node_group_max_size" {
  description = "Maximum node count in EKS node group"
  type        = number
  default     = 6
}

variable "node_instance_types" {
  description = "EC2 instance types for EKS node group"
  type        = list(string)
  default     = ["t3.large", "t3.xlarge"]
}
