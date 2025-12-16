#!/bin/bash

# APRHS Setup Script
# This script sets up the complete APRHS development environment

set -e

echo "🏥 APRHS Setup Script"
echo "====================="
echo ""

# Check prerequisites
echo "📋 Checking prerequisites..."

command -v docker >/dev/null 2>&1 || { echo "❌ Docker is required but not installed. Aborting." >&2; exit 1; }
command -v docker-compose >/dev/null 2>&1 || { echo "❌ Docker Compose is required but not installed. Aborting." >&2; exit 1; }
command -v node >/dev/null 2>&1 || { echo "❌ Node.js is required but not installed. Aborting." >&2; exit 1; }
command -v python3 >/dev/null 2>&1 || { echo "❌ Python 3 is required but not installed. Aborting." >&2; exit 1; }

echo "✅ All prerequisites found"
echo ""

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_DIR"

# Setup frontend
echo "📦 Setting up frontend..."
cd frontend
if [ ! -d "node_modules" ]; then
    npm install
    echo "✅ Frontend dependencies installed"
else
    echo "✅ Frontend dependencies already installed"
fi
cd ..

# Setup backend
echo "🐍 Setting up backend..."
cd backend
if [ ! -d "venv" ]; then
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
    echo "✅ Backend dependencies installed"
else
    echo "✅ Backend virtual environment already exists"
fi
cd ..

# Create environment file
echo "⚙️  Creating environment configuration..."
if [ ! -f ".env" ]; then
    cat > .env << EOF
# API Settings
SECRET_KEY=dev-secret-key-change-in-production
COUCHDB_USER=admin
COUCHDB_PASSWORD=password

# Frontend
VITE_API_URL=http://localhost:8000/api
VITE_COUCHDB_URL=http://localhost:5984

# Feature Flags
ENABLE_AUTH=false
ENABLE_SYNC=true
ENABLE_NOTIFICATIONS=true
EOF
    echo "✅ Environment file created"
else
    echo "✅ Environment file already exists"
fi

# Start Docker services
echo "🐳 Starting Docker services..."
docker-compose up -d couchdb
echo "⏳ Waiting for CouchDB to be ready..."
sleep 10

# Initialize CouchDB databases
echo "💾 Initializing databases..."
curl -X PUT http://admin:password@localhost:5984/visits 2>/dev/null || echo "Database 'visits' may already exist"
curl -X PUT http://admin:password@localhost:5984/patients 2>/dev/null || echo "Database 'patients' may already exist"
echo "✅ Databases initialized"

echo ""
echo "🎉 Setup complete!"
echo ""
echo "To start the application:"
echo ""
echo "  Frontend:"
echo "    cd frontend"
echo "    npm run dev"
echo ""
echo "  Backend Services:"
echo "    docker-compose up -d"
echo ""
echo "  Or start everything:"
echo "    ./scripts/start.sh"
echo ""
echo "Access points:"
echo "  - Frontend: http://localhost:3000"
echo "  - Triage API: http://localhost:8001"
echo "  - Vision API: http://localhost:8002"
echo "  - NLU API: http://localhost:8003"
echo "  - CouchDB: http://localhost:5984/_utils"
echo ""
