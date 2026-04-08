################################################################################
# Terraform Configuration
################################################################################

terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.5"
    }
  }

  # S3 backend for remote state — uncomment and configure before first apply
  # backend "s3" {
  #   bucket         = "table-order-terraform-state"
  #   key            = "prod/terraform.tfstate"
  #   region         = "ap-northeast-2"
  #   dynamodb_table = "terraform-state-lock"
  #   encrypt        = true
  # }
}

################################################################################
# Provider
################################################################################

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = var.project_name
      Environment = var.environment
      ManagedBy   = "terraform"
    }
  }
}

################################################################################
# Data Sources
################################################################################

data "aws_availability_zones" "available" {
  state = "available"
}

################################################################################
# Local Values
################################################################################

locals {
  azs = slice(data.aws_availability_zones.available.names, 0, 2)

  common_tags = {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "terraform"
  }
}

################################################################################
# Modules
################################################################################

# --- Networking ---

module "vpc" {
  source = "./modules/vpc"

  project_name             = var.project_name
  environment              = var.environment
  vpc_cidr                 = "10.0.0.0/16"
  public_subnet_cidrs      = ["10.0.1.0/24", "10.0.2.0/24"]
  private_app_subnet_cidrs = ["10.0.3.0/24", "10.0.4.0/24"]
  private_db_subnet_cidrs  = ["10.0.5.0/24", "10.0.6.0/24"]
  availability_zones       = local.azs
  container_port           = var.container_port
  tags                     = local.common_tags
}

# --- Logs (must exist before ECS) ---

module "logs" {
  source = "./modules/logs"

  project_name      = var.project_name
  environment       = var.environment
  retention_in_days = 90
  tags              = local.common_tags
}

# --- Secrets (must exist before RDS and ECS) ---

module "secrets" {
  source = "./modules/secrets"

  project_name = var.project_name
  environment  = var.environment
  tags         = local.common_tags
}

# --- ECR ---

module "ecr" {
  source = "./modules/ecr"

  project_name       = var.project_name
  environment        = var.environment
  image_count_to_keep = 10
  tags               = local.common_tags
}

# --- ALB ---

module "alb" {
  source = "./modules/alb"

  project_name      = var.project_name
  environment       = var.environment
  vpc_id            = module.vpc.vpc_id
  public_subnet_ids = module.vpc.public_subnet_ids
  security_group_id = module.vpc.alb_security_group_id
  container_port    = var.container_port
  health_check_path = "/health"
  certificate_arn   = var.certificate_arn
  tags              = local.common_tags
}

# --- RDS ---

module "rds" {
  source = "./modules/rds"

  project_name          = var.project_name
  environment           = var.environment
  private_db_subnet_ids = module.vpc.private_db_subnet_ids
  security_group_id     = module.vpc.rds_security_group_id
  instance_class        = var.db_instance_class
  allocated_storage     = var.db_allocated_storage
  db_name               = var.db_name
  db_username           = var.db_username
  db_password           = module.secrets.db_password
  tags                  = local.common_tags
}

# --- ECS ---

module "ecs" {
  source = "./modules/ecs"

  project_name           = var.project_name
  environment            = var.environment
  aws_region             = var.aws_region
  private_app_subnet_ids = module.vpc.private_app_subnet_ids
  security_group_id      = module.vpc.ecs_security_group_id
  target_group_arn       = module.alb.target_group_arn
  ecr_repository_url     = module.ecr.repository_url
  ecr_image_tag          = var.ecr_image_tag
  cpu                    = var.ecs_cpu
  memory                 = var.ecs_memory
  container_port         = var.container_port
  desired_count          = var.ecs_desired_count
  log_group_name         = module.logs.log_group_name
  s3_bucket_arn          = module.s3.bucket_arn
  s3_bucket_name         = module.s3.bucket_name
  db_password_secret_arn = module.secrets.db_password_secret_arn
  jwt_secret_arn         = module.secrets.jwt_secret_arn
  db_host                = module.rds.db_instance_address
  db_port                = module.rds.db_instance_port
  db_name                = var.db_name
  db_username            = var.db_username
  cors_origins           = join(",", var.cors_origins)
  tags                   = local.common_tags
}

# --- S3 (no dependency on ECS — bucket policy applied separately below) ---

module "s3" {
  source = "./modules/s3"

  project_name = var.project_name
  environment  = var.environment
  tags         = local.common_tags
}

################################################################################
# S3 Bucket Policy — applied after both S3 and ECS modules are created
# Grants access only to the ECS task role (defense in depth alongside IAM policy)
################################################################################

resource "aws_s3_bucket_policy" "menu_images_ecs_access" {
  bucket = module.s3.bucket_name

  depends_on = [module.s3, module.ecs]

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowECSTaskRoleAccess"
        Effect = "Allow"
        Principal = {
          AWS = module.ecs.task_role_arn
        }
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject",
          "s3:ListBucket"
        ]
        Resource = [
          module.s3.bucket_arn,
          "${module.s3.bucket_arn}/*"
        ]
      }
    ]
  })
}
