#!/bin/bash

# Alacard Development Environment Startup Script
# This script starts all required services: Redis, Celery, FastAPI, and Next.js

set -e

echo "🚀 Starting Alacard Development Environment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Kill any processes using our required ports (except Redis)
echo -e "${BLUE}🧹 Clearing ports 3000 and 8000...${NC}"
pkill -f "next dev" 2>/dev/null || true
pkill -f "uvicorn" 2>/dev/null || true
# DISABLED: pkill -f "celery worker" 2>/dev/null || true

# Force kill processes using specific ports (except Redis)
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
lsof -ti:8000 | xargs kill -9 2>/dev/null || true

echo -e "${GREEN}✅ Ports cleared (Redis left running)${NC}"

# Function to check if a service is running
check_service() {
    local service_pattern="$1"
    local service_name="$2"

    if pgrep -f "$service_pattern" > /dev/null; then
        if [ -n "$service_name" ]; then
            echo -e "${GREEN}✅ $service_name is running${NC}"
        else
            echo -e "${GREEN}✅ $service_pattern is running${NC}"
        fi
        return 0
    else
        if [ -n "$service_name" ]; then
            echo -e "${RED}❌ $service_name is not running${NC}"
        else
            echo -e "${RED}❌ $service_pattern is not running${NC}"
        fi
        return 1
    fi
}

# DISABLED: Function to check Celery worker health specifically
# check_celery_health() {
#     cd packages/backend
#     source venv/bin/activate
#
#     # Check if Celery responds to ping
#     if celery -A app.core.celery_app inspect ping > /dev/null 2>&1; then
#         echo -e "${GREEN}✅ Celery worker is healthy and responding${NC}"
#         cd ../..
#         return 0
#     else
#         echo -e "${RED}❌ Celery worker is not responding${NC}"
#         cd ../..
#         return 1
#     fi
# }

# Function to wait for service to be ready
wait_for_service() {
    local service_name=$1
    local host=$2
    local port=$3
    local max_attempts=30
    local attempt=1

    echo -e "${YELLOW}⏳ Waiting for $service_name to be ready...${NC}"

    while [ $attempt -le $max_attempts ]; do
        if nc -z "$host" "$port" 2>/dev/null; then
            echo -e "${GREEN}✅ $service_name is ready!${NC}"
            return 0
        fi
        echo -e "${YELLOW}Attempt $attempt/$max_attempts: $service_name not ready yet...${NC}"
        sleep 2
        attempt=$((attempt + 1))
    done

    echo -e "${RED}❌ $service_name failed to start within timeout${NC}"
    return 1
}

# Check if required tools are installed
echo -e "${BLUE}🔧 Checking dependencies...${NC}"

if ! command -v redis-server &> /dev/null; then
    echo -e "${RED}❌ Redis is not installed. Please install Redis:${NC}"
    echo "  macOS: brew install redis"
    echo "  Ubuntu: sudo apt-get install redis-server"
    exit 1
fi

if ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ Python 3 is not installed${NC}"
    exit 1
fi

if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    exit 1
fi

if ! command -v pnpm &> /dev/null; then
    echo -e "${RED}❌ pnpm is not installed. Please install pnpm:${NC}"
    echo "  npm install -g pnpm"
    exit 1
fi

# Function to cleanup background processes
cleanup() {
    echo -e "${YELLOW}🧹 Cleaning up background processes...${NC}"

    # DISABLED: Kill Celery worker
    # pkill -f "celery worker" 2>/dev/null || true

    # Kill FastAPI server
    pkill -f "uvicorn app.main:app" 2>/dev/null || true

    # Kill Redis (if we started it)
    if [ "$REDIS_STARTED" = "true" ]; then
        pkill -f "redis-server" 2>/dev/null || true
    fi

    # Kill Next.js development server
    pkill -f "next dev" 2>/dev/null || true

    echo -e "${GREEN}✅ Cleanup completed${NC}"
}

# Set up signal handlers
trap cleanup EXIT INT TERM

# Start Redis
echo -e "${BLUE}📦 Starting Redis...${NC}"
if check_service "redis-server" "Redis"; then
    echo -e "${GREEN}✅ Redis is already running${NC}"
else
    redis-server --daemonize yes --port 6379
    REDIS_STARTED="true"
    wait_for_service "Redis" "localhost" 6379
fi

# Install Python dependencies
echo -e "${BLUE}🐍 Installing Python dependencies...${NC}"
if [ ! -d "packages/backend/venv" ]; then
    cd packages/backend
    python3 -m venv venv
    cd ../..
fi
cd packages/backend
source venv/bin/activate
pip install -r requirements-minimal.txt
cd ../..

# Install Node.js dependencies
echo -e "${BLUE}📦 Installing Node.js dependencies...${NC}"
pnpm install

# DISABLED: Start Celery worker (using direct invocation instead)
# echo -e "${BLUE}🔄 Starting Celery worker...${NC}"
# cd packages/backend
# source venv/bin/activate
# # Generate unique worker name with timestamp
# WORKER_NAME="celery-worker-$(date +%s)-$$"
# celery -A app.core.celery_app worker --loglevel=debug --pool=solo -n ${WORKER_NAME}@%h > celery.log 2>&1 &
# CELERY_PID=$!
# cd ../..
#
# # Wait a moment for Celery to start and initialize
# sleep 8

# Start FastAPI server
echo -e "${BLUE}🚀 Starting FastAPI server...${NC}"
cd packages/backend
source venv/bin/activate
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload &
FASTAPI_PID=$!
cd ../..

# Wait for FastAPI to be ready
wait_for_service "FastAPI" "localhost" 8000

# Start Next.js development server
echo -e "${BLUE}⚛️ Starting Next.js development server...${NC}"
pnpm dev &
NEXTJS_PID=$!

# Wait for Next.js to be ready
wait_for_service "Next.js" "localhost" 3000

echo ""
echo -e "${GREEN}🎉 All services are running!${NC}"
echo ""
echo -e "${BLUE}📱 Services:${NC}"
echo -e "  • Next.js Frontend: ${GREEN}http://localhost:3000${NC}"
echo -e "  • FastAPI Backend:  ${GREEN}http://localhost:8000${NC}"
echo -e "  • FastAPI Docs:    ${GREEN}http://localhost:8000/docs${NC}"
echo -e "  • Redis:           ${GREEN}localhost:6379${NC}"
echo -e "  • Celery Worker:   ${YELLOW}DISABLED (using direct invocation)${NC}"
echo ""
echo -e "${YELLOW}💡 Tips:${NC}"
echo -e "  • Press Ctrl+C to stop all services"
echo -e "  • Check FastAPI API docs at http://localhost:8000/docs"
echo -e "  • Notebook generation uses FastAPI background tasks (no Celery)"
echo -e "  • Frontend will auto-reload on file changes"
echo ""

# Keep script running and monitor services
while true; do
    sleep 10

    # Check if all services are still running (Celery disabled)
    if ! check_service "redis-server" "Redis" || \
       ! check_service "uvicorn.*app.main:app" "FastAPI" || \
       ! check_service "next dev" "Next.js"; then
        echo -e "${RED}❌ One or more services stopped unexpectedly${NC}"
        echo -e "${YELLOW}🔄 Attempting to restart services...${NC}"

        # Restart failed services
        if ! check_service "redis-server" "Redis"; then
            echo -e "${YELLOW}🔄 Restarting Redis...${NC}"
            redis-server --daemonize yes --port 6379
            wait_for_service "Redis" "localhost" 6379
        fi

        # DISABLED: Celery worker restart (using direct invocation)
        # if ! check_celery_health; then
        #     echo -e "${YELLOW}🔄 Restarting Celery worker...${NC}"
        #     cd packages/backend
        #     source venv/bin/activate
        #     # Generate unique worker name with timestamp for restart
        #     WORKER_NAME="celery-worker-$(date +%s)-$$"
        #     celery -A app.core.celery_app worker --loglevel=info --pool=solo -n ${WORKER_NAME}@%h > celery.log 2>&1 &
        #     cd ../..
        #     # Give Celery more time to initialize
        #     sleep 8
        # fi

        if ! check_service "uvicorn.*app.main:app" "FastAPI"; then
            echo -e "${YELLOW}🔄 Restarting FastAPI server...${NC}"
            cd packages/backend
            source venv/bin/activate
            uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload &
            cd ../..
            wait_for_service "FastAPI" "localhost" 8000
        fi

        if ! check_service "next dev" "Next.js"; then
            echo -e "${YELLOW}🔄 Restarting Next.js server...${NC}"
            pnpm dev &
            wait_for_service "Next.js" "localhost" 3000
        fi

        echo -e "${GREEN}✅ Services restarted successfully${NC}"
    fi
done