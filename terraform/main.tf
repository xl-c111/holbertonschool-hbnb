terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "us-east-1"
}

# S3 Bucket for Frontend
resource "aws_s3_bucket" "frontend" {
  bucket = "hbnb-frontend"

  tags = {
    Name        = "HBnB Frontend"
    Environment = "Production"
    Project     = "HBnB"
  }
}

# S3 Bucket Website Configuration
resource "aws_s3_bucket_website_configuration" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "index.html"
  }
}

# S3 Bucket Public Access Block
resource "aws_s3_bucket_public_access_block" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

# S3 Bucket Policy for Public Read
resource "aws_s3_bucket_policy" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "PublicReadGetObject"
        Effect    = "Allow"
        Principal = "*"
        Action    = "s3:GetObject"
        Resource  = "${aws_s3_bucket.frontend.arn}/*"
      }
    ]
  })
}

# CloudFront Distribution for Backend API
resource "aws_cloudfront_distribution" "backend" {
  enabled             = true
  comment             = "HBnB Backend API Distribution"
  price_class         = "PriceClass_100"

  origin {
    domain_name = "ec2-98-82-136-20.compute-1.amazonaws.com"
    origin_id   = "EC2-hbnb-backend"

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "http-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  default_cache_behavior {
    allowed_methods        = ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "EC2-hbnb-backend"
    viewer_protocol_policy = "redirect-to-https"
    compress               = true

    # Use managed policies for API (no caching, forward all)
    cache_policy_id          = "4135ea2d-6df8-44a3-9df3-4b5a84be39ad"  # Managed-CachingDisabled
    origin_request_policy_id = "216adef6-5c7f-47e4-b989-5492eafa07d3"  # Managed-AllViewer
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }

  tags = {
    Name        = "HBnB Backend CDN"
    Environment = "Production"
    Project     = "HBnB"
  }
}

# CloudFront Distribution for Frontend
resource "aws_cloudfront_distribution" "frontend" {
  enabled             = true
  default_root_object = "index.html"
  comment             = "HBnB Frontend Distribution"
  price_class         = "PriceClass_100"

  origin {
    domain_name = "${aws_s3_bucket.frontend.bucket}.s3-website-${data.aws_region.current.name}.amazonaws.com"
    origin_id   = "S3-hbnb-frontend"

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "http-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  default_cache_behavior {
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "S3-hbnb-frontend"
    viewer_protocol_policy = "redirect-to-https"
    compress               = true

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }

    min_ttl     = 0
    default_ttl = 86400
    max_ttl     = 31536000
  }

  custom_error_response {
    error_code         = 404
    response_code      = 200
    response_page_path = "/index.html"
    error_caching_min_ttl = 300
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }

  tags = {
    Name        = "HBnB Frontend CDN"
    Environment = "Production"
    Project     = "HBnB"
  }
}

# Data source for current region
data "aws_region" "current" {}

# Security Group for EC2 Backend
resource "aws_security_group" "backend" {
  name        = "launch-wizard-1"
  description = "launch-wizard-1 created 2025-11-15T02:51:26.091Z"
  vpc_id      = "vpc-0de8351da4d21a49c"

  ingress {
    description = ""
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "Allow HTTP traffic"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    description = ""
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  lifecycle {
    ignore_changes = [description]
  }
}

# Security Group for RDS Database
resource "aws_security_group" "database" {
  name        = " hbnb-db-sg"
  description = "Created by RDS management console"
  vpc_id      = "vpc-0de8351da4d21a49c"

  ingress {
    description = "Allow MySQL connections"
    from_port   = 3306
    to_port     = 3306
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    description = ""
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  lifecycle {
    ignore_changes = [description]
  }
}

# EC2 Instance for Backend
resource "aws_instance" "backend" {
  ami                    = "ami-0ecb62995f68bb549"
  instance_type          = "t3.micro"
  key_name               = "hbnb-backend-key"
  subnet_id              = "subnet-0bad8ba5a14cf231a"
  vpc_security_group_ids = [aws_security_group.backend.id]

  root_block_device {
    volume_type           = "gp3"
    volume_size           = 8
    delete_on_termination = true
  }

  tags = {
    Name        = "HBnB Backend"
    Environment = "Production"
    Project     = "HBnB"
  }
}

# RDS Database Instance
resource "aws_db_instance" "database" {
  identifier              = "hbnb-db"
  db_name                 = "hbnb_db"
  engine                  = "mysql"
  engine_version          = "8.0.43"
  instance_class          = "db.t3.micro"
  allocated_storage       = 20
  max_allocated_storage   = 1000
  storage_type            = "gp2"
  storage_encrypted       = true

  username                = "admin"
  # Password set during initial creation - managed outside Terraform

  lifecycle {
    ignore_changes = [password]
  }

  publicly_accessible     = true
  multi_az                = false

  vpc_security_group_ids  = [aws_security_group.database.id]
  db_subnet_group_name    = "default-vpc-0de8351da4d21a49c"

  backup_retention_period = 1
  skip_final_snapshot     = true

  tags = {
    Name        = "HBnB Database"
    Environment = "Production"
    Project     = "HBnB"
  }
}

# Outputs
output "s3_website_endpoint" {
  value       = aws_s3_bucket_website_configuration.frontend.website_endpoint
  description = "S3 website endpoint"
}

output "cloudfront_domain_name" {
  value       = aws_cloudfront_distribution.frontend.domain_name
  description = "CloudFront distribution domain name"
}

output "cloudfront_distribution_id" {
  value       = aws_cloudfront_distribution.frontend.id
  description = "CloudFront distribution ID"
}

output "backend_public_ip" {
  value       = aws_instance.backend.public_ip
  description = "Backend EC2 public IP address"
}

output "backend_public_dns" {
  value       = aws_instance.backend.public_dns
  description = "Backend EC2 public DNS"
}

output "database_endpoint" {
  value       = aws_db_instance.database.endpoint
  description = "RDS database endpoint"
}

output "database_address" {
  value       = aws_db_instance.database.address
  description = "RDS database address"
}

output "backend_cloudfront_domain" {
  value       = aws_cloudfront_distribution.backend.domain_name
  description = "Backend API CloudFront domain (HTTPS)"
}

output "backend_cloudfront_id" {
  value       = aws_cloudfront_distribution.backend.id
  description = "Backend CloudFront distribution ID"
}
