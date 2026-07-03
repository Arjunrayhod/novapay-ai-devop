terraform {
  backend "s3" {
    # Bucket name is required via -backend-config. After bootstrap:
    #   terraform init -backend-config="bucket=$(terraform -chdir=bootstrap output -raw state_bucket_id)"
    key            = "terraform.tfstate"
    region         = "ap-south-1"
    encrypt        = true
    kms_key_id     = "alias/terraform-state-key"
    dynamodb_table = "aegisai-terraform-locks"


    # Full backend config is supplied per environment via CI/CD pipeline.
    # See terraform/bootstrap/README.md for the bootstrap workflow.
  }
}
