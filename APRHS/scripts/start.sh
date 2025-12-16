#!/bin/bash

# APRHS Start Script
# Starts all services

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_DIR"

echo "🏥 Starting APRHS..."
echo ""

# Start backend services with Docker
echo "🐳 Starting backend services..."
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 5

# Check service health
echo "🔍 Checking service health..."
services=("http://localhost:8001/health" "http://localhost:8002/health" "http://localhost:8003/health")
for service in "${services[@]}"; do
    if curl -s "$service" > /dev/null; then
        echo "  ✅ $service"
    else
        echo "  ❌ $service (may take a moment to start)"
    fi
done

echo ""
echo "🎉 APRHS is starting!"
echo ""
echo "Access points:"
echo "  - Frontend: http://localhost:3000 (run 'cd frontend && npm run dev')"
echo "  - Triage API: http://localhost:8001"
echo "  - Vision API: http://localhost:8002"
echo "  - NLU API: http://localhost:8003"
echo "  - CouchDB: http://localhost:5984/_utils"
echo ""
echo "View logs: docker-compose logs -f"
echo "Stop services: docker-compose down"
echo ""
