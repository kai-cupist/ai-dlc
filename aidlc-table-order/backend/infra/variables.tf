################################################################################
# General
################################################################################

variable "project_name" {
  description = "Project name used for resource naming and tagging"
  type        = string
  default     = "table-order"
}

variable "environment" {
  description = "Environment name (e.g., prod, staging)"
  type        = string
  default     = "prod"
}

variable "aws_region" {
  description = "AWS region for all resources"
  type        = string
  default     = "ap-northeast-2"
}

################################################################################
# RDS
################################################################################

variable "db_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t3.micro"
}

variable "db_allocated_storage" {
  description = "RDS allocated storage in GB"
  type        = number
  default     = 20
}

variable "db_name" {
  description = "Name of the default database"
  type        = string
  default     = "tableorder"
}

variable "db_username" {
  description = "Master username for RDS"
  type        = string
  default     = "tableorder_admin"
}

################################################################################
# ECS
################################################################################

variable "ecs_cpu" {
  description = "CPU units for ECS task (1 vCPU = 1024)"
  type        = number
  default     = 512
}

variable "ecs_memory" {
  description = "Memory in MB for ECS task"
  type        = number
  default     = 1024
}

variable "ecs_desired_count" {
  description = "Desired number of ECS tasks"
  type        = number
  default     = 1
}

variable "container_port" {
  description = "Container port for the FastAPI application"
  type        = number
  default     = 8000
}

variable "ecr_image_tag" {
  description = "Docker image tag to deploy"
  type        = string
  default     = "latest"
}

################################################################################
# Application
################################################################################

variable "cors_origins" {
  description = "List of allowed CORS origins"
  type        = list(string)
  default     = ["*"]
}

################################################################################
# ALB
################################################################################

variable "certificate_arn" {
  description = "ARN of the ACM certificate for HTTPS. Leave empty to use HTTP only (MVP)."
  type        = string
  default     = ""
}
