#!/bin/bash
# Frontend Deployment Script
# Usage: ./deploy-frontend.sh

set -e  # Exit on error

echo "🚀 Starting frontend deployment..."

# Navigate to frontend directory
cd "$(dirname "$0")/frontend"

# Build the frontend
echo "📦 Building frontend..."
npm run build

# Deploy to S3
echo "☁️  Uploading to S3..."
aws s3 sync dist/ s3://hbnb-frontend/ --delete

# Invalidate CloudFront cache
echo "🔄 Invalidating CloudFront cache..."
INVALIDATION_ID=$(aws cloudfront create-invalidation \
  --distribution-id E1G4F0IQPBP8RJ \
  --paths "/*" \
  --query 'Invalidation.Id' \
  --output text)

echo "✅ Frontend deployed successfully!"
echo "📝 CloudFront invalidation ID: $INVALIDATION_ID"
echo "🌐 Frontend URL: https://d2gfqpg21nkiyl.cloudfront.net"
echo ""
echo "⏳ Note: CloudFront invalidation may take 2-3 minutes to complete"
