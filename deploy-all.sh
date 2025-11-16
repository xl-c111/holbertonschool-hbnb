#!/bin/bash
# Full Deployment Script (Frontend + Backend)
# Usage: ./deploy-all.sh

set -e  # Exit on error

echo "🚀 Starting full deployment (Frontend + Backend)..."
echo ""

# Deploy Backend First
echo "═══════════════════════════════════════"
echo "  STEP 1: Deploying Backend to EC2"
echo "═══════════════════════════════════════"
./deploy-backend.sh

echo ""
echo "═══════════════════════════════════════"
echo "  STEP 2: Deploying Frontend to S3"
echo "═══════════════════════════════════════"
./deploy-frontend.sh

echo ""
echo "╔═══════════════════════════════════════╗"
echo "║   ✅ Full Deployment Complete!        ║"
echo "╚═══════════════════════════════════════╝"
echo ""
echo "🌐 Live URLs:"
echo "   Frontend: https://d2gfqpg21nkiyl.cloudfront.net"
echo "   Backend:  https://d145487492x221.cloudfront.net/api/v1/"
echo ""
echo "⏳ CloudFront cache invalidation in progress (2-3 min)"
