variable "project_name" {
  description = "Project name for resource naming"
  type        = string
}

variable "environment" {
  description = "Environment name (e.g., prod, staging)"
  type        = string
}

variable "aws_region" {
  description = "AWS region"
  type        = string
}

variable "private_app_subnet_ids" {
  description = "IDs of private application subnets for ECS tasks"
  type        = list(string)
}

variable "security_group_id" {
  description = "Security group ID for ECS tasks"
  type        = string
}

variable "target_group_arn" {
  description = "ARN of the ALB target group"
  type        = string
}

variable "ecr_repository_url" {
  description = "URL of the ECR repository"
  type        = string
}

variable "ecr_image_tag" {
  description = "Docker image tag"
  type        = string
  default     = "latest"
}

variable "cpu" {
  description = "CPU units for the task (1 vCPU = 1024)"
  type        = number
  default     = 512
}

variable "memory" {
  description = "Memory in MB for the task"
  type        = number
  default     = 1024
}

variable "container_port" {
  description = "Container port"
  type        = number
  default     = 8000
}

variable "desired_count" {
  description = "Desired number of ECS tasks"
  type        = number
  default     = 1
}

variable "log_group_name" {
  description = "CloudWatch log group name"
  type        = string
}

variable "s3_bucket_arn" {
  description = "ARN of the S3 menu images bucket"
  type        = string
}

variable "db_password_secret_arn" {
  description = "ARN of the DB password secret in Secrets Manager"
  type        = string
}

variable "jwt_secret_arn" {
  description = "ARN of the JWT secret in Secrets Manager"
  type        = string
}

variable "db_host" {
  description = "RDS database host"
  type        = string
}

variable "db_port" {
  description = "RDS database port"
  type        = number
  default     = 5432
}

variable "db_name" {
  description = "Database name"
  type        = string
}

variable "db_username" {
  description = "Database username"
  type        = string
}

variable "s3_bucket_name" {
  description = "Name of the S3 menu images bucket"
  type        = string
}

variable "cors_origins" {
  description = "Comma-separated list of allowed CORS origins"
  type        = string
  default     = "*"
}

variable "tags" {
  description = "Common tags for all resources"
  type        = map(string)
  default     = {}
}
