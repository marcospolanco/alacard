#!/bin/bash

# Quick Start Script for Alacard
# This script starts the essential services for development

set -e

echo "🚀 Alacard Quick Start..."

# Kill any processes using our required ports (except Redis)
echo "🧹 Clearing ports 3000 and 8000..."
pkill -f "next dev" 2>/dev/null || true
pkill -f "uvicorn" 2>/dev/null || true
pkill -f "celery worker" 2>/dev/null || true

# Force kill processes using specific ports (except Redis)
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
lsof -ti:8000 | xargs kill -9 2>/dev/null || true
echo "✅ Ports cleared (Redis left running)"

# Check if Redis is running
if ! redis-cli ping > /dev/null 2>&1; then
    echo "📦 Starting Redis..."
    redis-server --daemonize yes --port 6379
    sleep 2
    echo "✅ Redis started"
else
    echo "✅ Redis is already running"
fi

# Start FastAPI backend
echo "🚀 Starting FastAPI backend..."
cd packages/backend
source venv/bin/activate
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload &
FASTAPI_PID=$!
cd ../..

# Wait for FastAPI to be ready
sleep 3

# Start Celery worker
echo "🔄 Starting Celery worker..."
cd packages/backend
source venv/bin/activate
celery -A app.core.celery_app worker --loglevel=info --pool=solo &
CELERY_PID=$!
cd ../..

# Start Next.js frontend
echo "⚛️ Starting Next.js frontend..."
pnpm dev &
NEXTJS_PID=$!

echo ""
echo "🎉 Services started successfully!"
echo ""
echo "📱 Services available at:"
echo "  • Next.js Frontend: http://localhost:3000"
echo "  • FastAPI Backend:  http://localhost:8000"
echo "  • API Docs:        http://localhost:8000/docs"
echo ""
echo "💡 Stop all services with Ctrl+C"
echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🧹 Stopping services..."
    kill $FASTAPI_PID $CELERY_PID $NEXTJS_PID 2>/dev/null || true
    echo "✅ Services stopped"
    exit 0
}

# Set up signal handlers
trap cleanup INT TERM

# Keep script running
wait