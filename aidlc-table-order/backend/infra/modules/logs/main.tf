################################################################################
# CloudWatch Log Group for ECS
################################################################################

resource "aws_cloudwatch_log_group" "ecs" {
  name              = "/ecs/${var.project_name}-${var.environment}"
  retention_in_days = var.retention_in_days

  tags = merge(var.tags, {
    Name = "/ecs/${var.project_name}-${var.environment}"
  })
}
