#!/bin/bash
# Quick setup script for HBnB project

# Get the script's directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "🚀 Starting HBnB Setup..."
echo ""

# Check if venv exists
if [ ! -d "$PROJECT_ROOT/venv" ]; then
    echo "❌ Virtual environment not found!"
    echo "Please run: python3 -m venv venv"
    exit 1
fi

# Activate virtual environment
source "$PROJECT_ROOT/venv/bin/activate"

# Add sample data
echo "📦 Adding sample data (test user + places)..."
cd "$PROJECT_ROOT" && python3 scripts/add_sample_data.py

echo ""
echo "✅ Setup complete!"
echo ""
echo "📝 Test Accounts:"
echo "   Alice:"
echo "     Email: alice@example.com"
echo "     Password: Password123!"
echo "   Bob:"
echo "     Email: bob@example.com"
echo "     Password: Password123!"
echo ""
echo "💡 Login as Alice to review Bob's places, or vice versa!"
echo ""
echo "🌐 Starting backend server on http://127.0.0.1:5000"
echo "   Press Ctrl+C to stop"
echo ""

# Start Flask server
cd "$PROJECT_ROOT/backend" && python3 run.py
