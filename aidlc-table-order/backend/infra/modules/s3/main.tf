################################################################################
# S3 Bucket for Menu Images
################################################################################

resource "aws_s3_bucket" "menu_images" {
  bucket        = "${var.project_name}-menu-images-${var.environment}"
  force_destroy = true

  tags = merge(var.tags, {
    Name = "${var.project_name}-menu-images-${var.environment}"
  })
}

################################################################################
# Server-Side Encryption (SSE-S3 / AES-256)
################################################################################

resource "aws_s3_bucket_server_side_encryption_configuration" "menu_images" {
  bucket = aws_s3_bucket.menu_images.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
    bucket_key_enabled = true
  }
}

################################################################################
# Block ALL Public Access
################################################################################

resource "aws_s3_bucket_public_access_block" "menu_images" {
  bucket = aws_s3_bucket.menu_images.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# Versioning: not enabled for MVP (menu images are replaceable).
# To enable, add aws_s3_bucket_versioning with status = "Enabled".
