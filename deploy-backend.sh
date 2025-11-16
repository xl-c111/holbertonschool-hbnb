#!/bin/bash
# Backend Deployment Script
# Usage: ./deploy-backend.sh

set -e  # Exit on error

EC2_IP="98.82.136.20"
SSH_KEY="$HOME/.ssh/hbnb-backend-key.pem"

echo "🚀 Starting backend deployment to EC2..."

# SSH into EC2 and deploy
echo "📡 Connecting to EC2 instance ($EC2_IP)..."
ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no ubuntu@$EC2_IP << 'ENDSSH'
  set -e

  echo "📂 Navigating to project directory..."
  cd /home/ubuntu/holbertonschool-hbnb

  echo "🔄 Stashing local changes..."
  git stash

  echo "⬇️  Pulling latest code from main..."
  git pull origin main

  echo "📦 Installing/updating dependencies..."
  cd backend
  source venv/bin/activate
  pip install -r requirements.txt --quiet

  echo "🔄 Reloading systemd and restarting service..."
  sudo systemctl daemon-reload
  sudo systemctl restart hbnb

  echo "⏳ Waiting for service to start..."
  sleep 3

  echo "✅ Checking service status..."
  sudo systemctl status hbnb --no-pager | head -15
ENDSSH

echo ""
echo "✅ Backend deployed successfully!"
echo "🌐 Backend API: http://$EC2_IP/api/v1/"
echo "🌐 Backend CloudFront: https://d145487492x221.cloudfront.net/api/v1/"
