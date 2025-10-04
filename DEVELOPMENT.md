# Development Guide

## Local Development Setup

This guide covers how to set up the Alacard development environment with the FastAPI backend.

### Prerequisites

- Node.js (v18+)
- Python 3.9+
- Redis
- PostgreSQL (Supabase)
- pnpm

### Quick Start

1. **Clone and install dependencies:**
   ```bash
   # Install Node.js dependencies
   pnpm install

   # Install Python dependencies
   cd packages/backend
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   cd ../..
   ```

2. **Set up environment variables:**
   ```bash
   # Frontend environment
   cp .env.local.example .env.local
   # Edit .env.local with your Supabase credentials

   # Backend environment
   cp packages/backend/.env.example packages/backend/.env
   # Edit packages/backend/.env with your credentials
   ```

3. **Start all services:**
   ```bash
   ./start.sh
   ```

   This will start:
   - Redis (localhost:6379)
   - Celery worker (background tasks)
   - FastAPI backend (localhost:8000)
   - Next.js frontend (localhost:3000)

### Manual Service Startup

If you prefer to start services manually:

1. **Start Redis:**
   ```bash
   redis-server --port 6379
   ```

2. **Start Celery worker:**
   ```bash
   cd packages/backend
   source venv/bin/activate
   celery -A app.core.celery_app worker --loglevel=info --pool=solo
   ```

3. **Start FastAPI backend:**
   ```bash
   cd packages/backend
   source venv/bin/activate
   uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```

4. **Start Next.js frontend:**
   ```bash
   pnpm dev
   ```

### API Documentation

Once the FastAPI server is running, you can access:
- **API Docs**: http://localhost:8000/docs
- **OpenAPI Schema**: http://localhost:8000/openapi.json

### Development Workflow

#### FastAPI Backend

The FastAPI backend is located in `packages/backend/`:

```
packages/backend/
├── app/
│   ├── api/v1/          # API routes
│   ├── core/            # Configuration and database
│   ├── models/          # Pydantic models
│   ├── services/        # Business logic
│   ├── tasks/           # Celery background tasks
│   └── main.py          # FastAPI application
├── requirements.txt     # Python dependencies
└── .env.example        # Environment variables
```

#### Adding New API Endpoints

1. Define Pydantic models in `app/models/`
2. Create service logic in `app/services/`
3. Add routes in `app/api/v1/endpoints/`
4. Register the router in `app/api/v1/__init__.py`

#### Adding New Background Tasks

1. Define the task function in `app/tasks/`
2. Import and use the task in your API endpoints
3. Track progress using `ProgressTracker` service

### Testing

#### Backend Tests
```bash
cd packages/backend
source venv/bin/activate
pytest
```

#### Frontend Tests
```bash
pnpm test
```

### Database Management

#### Running Migrations
The database schema is managed through Supabase. Run migrations in the Supabase SQL editor.

#### Local Database
For local development, you can use the provided SQL scripts in `supabase/migrations/`.

### Debugging

#### FastAPI Debugging
- Use `print()` statements for quick debugging
- Check the terminal output from the start script
- Monitor Celery logs for background task issues

#### WebSocket Debugging
- Use browser dev tools to inspect WebSocket connections
- Check the Network tab for WebSocket connection status
- Monitor progress updates in real-time

### Common Issues

#### Redis Connection Issues
```bash
# Check if Redis is running
redis-cli ping

# Start Redis manually
redis-server --port 6379
```

#### Celery Worker Issues
```bash
# Check Celery worker status
celery -A app.core.celery_app inspect active

# Restart Celery worker
pkill -f "celery worker"
celery -A app.core.celery_app worker --loglevel=info --pool=solo
```

#### Port Conflicts
```bash
# Check what's running on ports
lsof -i :3000  # Next.js
lsof -i :8000  # FastAPI
lsof -i :6379  # Redis
```

### Production Deployment

For production deployment, see the main README.md for deployment instructions.

### Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test your changes thoroughly
5. Submit a pull request

### Getting Help

- Check the API documentation at http://localhost:8000/docs
- Review the logs in the terminal output
- Check the browser console for frontend issues
- Ensure all environment variables are set correctly