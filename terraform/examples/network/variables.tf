variable "environment" {
  description = "Deployment environment"
  type        = string
  default     = "dev"
}

variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "ap-south-1"
}

variable "name_prefix" {
  description = "Prefix for all resource names"
  type        = string
  default     = "aegisai"
}

variable "vpc_cidr" {
  description = "CIDR block for the VPC"
  type        = string
  default     = "10.100.0.0/16"
}

variable "availability_zones" {
  description = "List of Availability Zones"
  type        = list(string)
  default     = ["ap-south-1a", "ap-south-1b"]
}

variable "public_subnet_cidrs" {
  description = "CIDR blocks for public subnets"
  type        = list(string)
  default     = ["10.100.1.0/24", "10.100.2.0/24"]
}

variable "private_app_subnet_cidrs" {
  description = "CIDR blocks for private application subnets"
  type        = list(string)
  default     = ["10.100.11.0/24", "10.100.12.0/24"]
}

variable "private_data_subnet_cidrs" {
  description = "CIDR blocks for private data subnets"
  type        = list(string)
  default     = ["10.100.21.0/24", "10.100.22.0/24"]
}

variable "isolated_subnet_cidrs" {
  description = "CIDR blocks for isolated subnets"
  type        = list(string)
  default     = []
}

variable "enable_igw" {
  description = "Enable Internet Gateway"
  type        = bool
  default     = true
}

variable "enable_nat_gateway" {
  description = "Enable NAT Gateway"
  type        = bool
  default     = true
}

variable "nat_gateway_strategy" {
  description = "NAT Gateway strategy: single or per_az"
  type        = string
  default     = "single"
}

variable "dhcp_domain_name" {
  description = "Custom DHCP domain name"
  type        = string
  default     = ""
}

variable "dhcp_domain_name_servers" {
  description = "Custom DNS servers"
  type        = list(string)
  default     = []
}

variable "enable_flow_logs" {
  description = "Enable VPC Flow Logs"
  type        = bool
  default     = true
}

variable "flow_logs_destination" {
  description = "Flow logs destination: cloudwatch or s3"
  type        = string
  default     = "cloudwatch"
}

variable "flow_logs_retention_in_days" {
  description = "Flow log retention in days"
  type        = number
  default     = 90
}

variable "flow_logs_traffic_type" {
  description = "Flow log traffic type"
  type        = string
  default     = "ALL"
}

variable "flow_logs_custom_format" {
  description = "Custom format for VPC flow logs"
  type        = string
  default     = <<-'EOF'
${version} ${account-id} ${interface-id} ${srcaddr} ${dstaddr} ${srcport} ${dstport} ${protocol} ${packets} ${bytes} ${start} ${end} ${action} ${log-status} ${vpc-id} ${subnet-id} ${instance-id} ${tcp-flags} ${type} ${pkt-srcaddr} ${pkt-dstaddr} ${region} ${az-id} ${sublocation-type} ${sublocation-id}
EOF
}

variable "enable_s3_gateway_endpoint" {
  description = "Create S3 Gateway Endpoint"
  type        = bool
  default     = true
}

variable "enable_dynamodb_gateway_endpoint" {
  description = "Create DynamoDB Gateway Endpoint"
  type        = bool
  default     = false
}

variable "enable_interface_endpoints" {
  description = "List of interface endpoint services"
  type        = list(string)
  default     = ["ssm", "ec2", "ecr.api", "logs", "monitoring"]
}

variable "environment_tier" {
  description = "Environment tier"
  type        = string
  default     = "development"
}

variable "compliance_frameworks" {
  description = "Compliance frameworks"
  type        = list(string)
  default     = []
}

variable "additional_tags" {
  description = "Additional tags"
  type        = map(string)
  default     = {}
}
