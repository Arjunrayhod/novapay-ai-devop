variable "environment" {
  description = "Deployment environment"
  type        = string
  default     = "dev"
}

variable "name_prefix" {
  description = "Resource name prefix"
  type        = string
  default     = "aegisai"
}
