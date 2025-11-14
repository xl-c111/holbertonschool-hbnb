#!/bin/bash
# Deployment script for EC2 instance
# Run this script ON THE EC2 INSTANCE after initial setup

set -e  # Exit on error

echo "🚀 Starting HBnB Backend Deployment..."

# Configuration
APP_DIR="/home/ubuntu/holbertonschool-hbnb/backend"
VENV_DIR="$APP_DIR/venv"
SERVICE_NAME="hbnb"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Check if running on EC2
if [ ! -d "/home/ubuntu" ]; then
    print_error "This script should be run on an EC2 instance as ubuntu user"
    exit 1
fi

# Navigate to app directory
cd "$APP_DIR" || {
    print_error "App directory not found: $APP_DIR"
    exit 1
}

print_status "Pulling latest code from git..."
git pull origin main

print_status "Activating virtual environment..."
source "$VENV_DIR/bin/activate"

print_status "Installing/updating dependencies..."
pip install --upgrade pip
pip install -r requirements-prod.txt

# Check if .env exists
if [ ! -f ".env" ]; then
    print_warning ".env file not found. Creating template..."
    cat > .env << 'EOF'
FLASK_ENV=production
SECRET_KEY=CHANGE_THIS
JWT_SECRET_KEY=CHANGE_THIS
DATABASE_URL=mysql+mysqlconnector://admin:password@rds-endpoint/hbnb_db
ALLOWED_ORIGINS=https://your-cloudfront-url
EOF
    print_error "Please update .env with your actual values!"
    exit 1
fi

print_status "Running database migrations..."
python init_db.py

print_status "Testing configuration..."
python -c "from app import create_app; app = create_app('config.ProductionConfig'); print('Config OK')"

print_status "Restarting application service..."
sudo systemctl restart "$SERVICE_NAME"

# Wait a moment for service to start
sleep 2

# Check service status
if sudo systemctl is-active --quiet "$SERVICE_NAME"; then
    print_status "Service is running!"
else
    print_error "Service failed to start. Checking logs..."
    sudo journalctl -u "$SERVICE_NAME" -n 20 --no-pager
    exit 1
fi

print_status "Restarting nginx..."
sudo systemctl restart nginx

print_status "Checking service health..."
curl -f http://localhost:5000/api/v1/ > /dev/null 2>&1 && \
    print_status "Health check passed!" || \
    print_warning "Health check failed - check logs"

echo ""
print_status "Deployment complete! 🎉"
echo ""
echo "Useful commands:"
echo "  View logs:           sudo journalctl -u $SERVICE_NAME -f"
echo "  Check status:        sudo systemctl status $SERVICE_NAME"
echo "  Restart service:     sudo systemctl restart $SERVICE_NAME"
echo "  Test endpoint:       curl http://localhost/api/v1/"
echo ""
