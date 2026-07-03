# Terraform Module: \_template

Template module for creating new AegisAI Terraform modules.

## Usage

```hcl
module "template_example" {
  source = "../modules/_template"

  aws_region  = "ap-south-1"
  environment = "dev"
  name        = "example-resource"
}
```

## Requirements

| Name | Version |
|------|---------|
| Terraform | >= 1.9.0 |
| AWS Provider | ~> 5.80 |

## Inputs

| Name | Description | Type | Default | Required |
|------|-------------|------|---------|----------|
| aws_region | AWS region | `string` | — | yes |
| environment | Environment name | `string` | — | yes |
| name | Module instance name | `string` | — | yes |
| owner | Resource owner | `string` | `"platform-engineering"` | no |
| cost_center | Cost center | `string` | `"cc-platform"` | no |
| tags | Additional tags | `map(string)` | `{}` | no |

## Outputs

| Name | Description |
|------|-------------|
| resource_name | Generated resource name |
| tags | Complete tag map |
| environment | Target environment |
