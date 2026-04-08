################################################################################
# ALB
################################################################################

output "alb_dns_name" {
  description = "DNS name of the Application Load Balancer"
  value       = module.alb.alb_dns_name
}

################################################################################
# RDS
################################################################################

output "rds_endpoint" {
  description = "Connection endpoint of the RDS instance (host:port)"
  value       = module.rds.db_instance_endpoint
}

output "rds_address" {
  description = "Hostname of the RDS instance"
  value       = module.rds.db_instance_address
}

################################################################################
# S3
################################################################################

output "s3_bucket_name" {
  description = "Name of the S3 menu images bucket"
  value       = module.s3.bucket_name
}

################################################################################
# ECR
################################################################################

output "ecr_repository_url" {
  description = "URL of the ECR repository"
  value       = module.ecr.repository_url
}

################################################################################
# ECS
################################################################################

output "ecs_cluster_name" {
  description = "Name of the ECS cluster"
  value       = module.ecs.cluster_name
}

output "ecs_service_name" {
  description = "Name of the ECS service"
  value       = module.ecs.service_name
}

################################################################################
# CloudWatch Logs
################################################################################

output "log_group_name" {
  description = "Name of the CloudWatch log group"
  value       = module.logs.log_group_name
}

################################################################################
# Secrets
################################################################################

output "db_password_secret_arn" {
  description = "ARN of the DB password secret"
  value       = module.secrets.db_password_secret_arn
}

output "jwt_secret_arn" {
  description = "ARN of the JWT secret"
  value       = module.secrets.jwt_secret_arn
}

################################################################################
# VPC
################################################################################

output "vpc_id" {
  description = "ID of the VPC"
  value       = module.vpc.vpc_id
}
