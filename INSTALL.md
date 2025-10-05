# Installation Guide

## Quick Setup

### 1. Prerequisites

- **Node.js** (v18+)
- **Python 3.9+** (3.13 also works)
- **Redis** server
- **PostgreSQL** database (Supabase recommended)

### 2. Environment Setup

```bash
# Clone the repository
git clone <your-repo-url>
cd alacard

# Set up frontend environment
cp .env.local.example .env.local
# Edit .env.local with your Supabase credentials

# Set up backend environment
cp packages/backend/.env.example packages/backend/.env
# Edit packages/backend/.env with your database credentials
```

### 3. Install Dependencies

```bash
# Install Node.js dependencies
pnpm install

# Install Python dependencies
cd packages/backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements-minimal.txt
cd ../..
```

### 4. Database Setup

1. Create a Supabase project
2. Run the migration in `supabase/migrations/20240101000001_notebooks_schema.sql`
3. Update your environment files with the Supabase credentials

### 5. Start Services

```bash
# Start all services at once
./start.sh
```

This will start:
- Redis server (localhost:6379)
- Celery background worker
- FastAPI backend (localhost:8000)
- Next.js frontend (localhost:3000)

### 6. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## Manual Service Startup

If you prefer to start services manually:

### Redis
```bash
redis-server --port 6379
```

### Celery Worker
```bash
cd packages/backend
source venv/bin/activate
celery -A app.core.celery_app worker --loglevel=info --pool=solo
```

### FastAPI Backend
```bash
cd packages/backend
source venv/bin/activate
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### Next.js Frontend
```bash
pnpm dev
```

## Troubleshooting

### Dependency Issues

If you encounter dependency conflicts, use the minimal requirements file:
```bash
cd packages/backend
source venv/bin/activate
pip install -r requirements-minimal.txt
```

### Port Conflicts

Check what's running on ports:
```bash
lsof -i :3000  # Next.js
lsof -i :8000  # FastAPI
lsof -i :6379  # Redis
```

### Database Connection Issues

1. Verify your Supabase credentials
2. Check that the notebooks table exists
3. Ensure proper permissions are set

## Environment Variables

### Frontend (.env.local)
```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Hugging Face API
HF_API_TOKEN=your-huggingface-token

# FastAPI Backend Configuration
NEXT_PUBLIC_API_URL=https://alacard.onrender.com
```

### Backend (packages/backend/.env)
```bash
# Database Configuration (Supabase)
DATABASE_URL=postgresql://postgres.your-password@aws-0-us-east-1.pooler.supabase.com:6543/postgres

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Redis Configuration
REDIS_URL=redis://localhost:6379/0

# Hugging Face API
HF_API_TOKEN=your-huggingface-token
```

## Development

For detailed development instructions, see [DEVELOPMENT.md](DEVELOPMENT.md).

## Production Deployment

For production deployment instructions, see the main README.md.