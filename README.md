# Alacard - Notebook Generator Platform

A scalable notebook generation platform that creates downloadable Jupyter notebooks from Hugging Face models with real code examples. Built with Next.js frontend and FastAPI backend with Celery background tasks.

## Features

- **Model Selection**: Browse and select from popular Hugging Face models
- **Asynchronous Notebook Generation**: Background processing with real-time progress updates
- **Notebook Validation**: Automated syntax checking and runtime validation to ensure notebooks actually run
- **Downloadable Notebooks**: Get ready-to-run `.ipynb` files
- **Shareable Results**: Generate share links for generated notebooks
- **Model Categories**: Filter models by task type (Text Generation, Classification, etc.)
- **Real Examples**: Uses actual code from model documentation
- **Real-time Progress**: WebSocket updates with polling fallback
- **Scalable Architecture**: FastAPI + Celery + Redis for long-running tasks

## Quick Start

### 1. Environment Setup

Copy `.env.local.example` to `.env.local`:

```bash
cp .env.local.example .env.local
```

Update the environment variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Hugging Face API
HF_API_TOKEN=your-huggingface-token
```

### 2. Database Setup

1. Create a Supabase project
2. Run the migration script:

```sql
-- Run this in your Supabase SQL Editor
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.notebooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  share_id TEXT UNIQUE NOT NULL,
  hf_model_id TEXT NOT NULL,
  notebook_content JSONB NOT NULL,
  metadata JSONB,
  download_count INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS notebooks_share_idx ON public.notebooks(share_id);
CREATE INDEX IF NOT EXISTS notebooks_model_idx ON public.notebooks(hf_model_id);
CREATE INDEX IF NOT EXISTS notebooks_created_idx ON public.notebooks(created_at DESC);

ALTER TABLE public.notebooks DISABLE ROW LEVEL SECURITY;

GRANT ALL ON public.notebooks TO authenticated;
GRANT ALL ON public.notebooks TO anon;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Install Python Dependencies

```bash
cd packages/backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements-minimal.txt
cd ../..
```

### 5. Run Development Server

**Option A: Quick Start (Recommended)**
```bash
./quick-start.sh
```

**Option B: Full Start Script**
```bash
./start.sh
```

**Option C: Manual Start**
```bash
# Start Redis (if not running)
redis-server --daemonize yes --port 6379

# Start Celery worker
cd packages/backend
source venv/bin/activate
celery -A app.core.celery_app worker --loglevel=info --pool=solo &
cd ../..

# Start FastAPI backend
cd packages/backend
source venv/bin/activate
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload &
cd ../..

# Start Next.js frontend
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Architecture

### Frontend (Next.js)
- **Generator Page**: Model selection and notebook generation interface
- **Share Page**: View and download generated notebooks
- **Home Page**: Landing page with feature overview

### Backend (Next.js API Routes)
- `/api/models/popular` - Get popular HF models
- `/api/models/search` - Search models by category
- `/api/notebook/generate` - Generate notebooks from models (legacy)
- `/api/notebook/[shareId]` - Fetch notebook metadata
- `/api/notebook/download/[shareId]` - Download notebook files

### FastAPI Backend (Implemented)
- `GET /api/v1/models/popular` - Get popular HF models
- `GET /api/v1/models/search` - Search models by category
- `POST /api/v1/notebook/generate` - Start asynchronous notebook generation task
- `GET /api/v1/notebook/task/{task_id}` - Get task status and progress
- `GET /api/v1/notebook/{share_id}` - Get notebook metadata
- `GET /api/v1/notebook/download/{share_id}` - Download `.ipynb` file
- `GET /api/v1/notebook/{share_id}/validation` - Get notebook validation results
- `WebSocket /ws/progress/{task_id}` - Real-time progress updates

### Celery Background Tasks
- **Task Queue**: Redis-based distributed task processing
- **Progress Tracking**: Real-time progress updates via Redis pub/sub
- **Error Handling**: Comprehensive error management and retry logic
- **Async Integration**: Seamless async/await support for background processing

### Database (Supabase)
- **notebooks** table - Store generated notebooks and metadata
- Public access for demo (no authentication)
- Share IDs for public notebook access

## API Endpoints

### Next.js API Routes (Current)
- `GET /api/models/popular` - Get popular HF models
- `GET /api/models/search?category=text-generation` - Search models by category
- `POST /api/notebook/generate` - Generate notebook from model (synchronous)
- `GET /api/notebook/[shareId]` - Get notebook metadata
- `GET /api/notebook/download/[shareId]` - Download `.ipynb` file

### FastAPI Backend (Implemented)
- `GET /api/v1/models/popular` - Get popular HF models
- `GET /api/v1/models/search?category=text-generation` - Search models by category
- `POST /api/v1/notebook/generate` - Start asynchronous notebook generation
  ```json
  {
    "hf_model_id": "meta-llama/Llama-3.1-8B-Instruct"
  }
  ```
  Response: `{"task_id": "uuid", "estimated_time": 30}`

- `GET /api/v1/notebook/task/{task_id}` - Get task status
  ```json
  {
    "status": "processing|completed|failed",
    "progress": 75,
    "current_step": "Extracting code from README",
    "share_id": "abc123" (only when completed)
  }
  ```

- `GET /api/v1/notebook/{share_id}` - Get notebook metadata
- `GET /api/v1/notebook/download/{share_id}` - Download `.ipynb` file
- `WebSocket /ws/progress/{task_id}` - Real-time progress updates

### WebSocket Progress Updates
The FastAPI backend provides real-time progress updates via WebSockets:
```json
{
  "type": "progress",
  "data": {
    "progress": 45,
    "current_step": "Generating notebook cells",
    "message": "Processing model README..."
  }
}
```

## Supported Model Categories

- **Text Generation**: Story writing, content creation models
- **Chat & Dialogue**: Conversational AI, instruction following
- **Classification & NER**: Text analysis, entity extraction
- **Summarization**: Long-form text summarization
- **Instruction Following**: Complex instruction comprehension
- **Translation**: Multi-language translation models
- **Code Generation**: Programming and code completion

## Notebook Template Structure

Generated notebooks follow a consistent 7-cell structure:

1. **Title & Attribution** - Model information and links
2. **Environment Setup** - Install required packages
3. **Hello Cell** - Basic model verification
4. **Model Information** - Pipeline details and usage
5. **README Example** - Real code from model documentation
6. **Generic Example** - Fallback template
7. **Next Steps** - Additional resources and links

## Development

### Project Structure

```
alacard/
├── packages/backend/                    # FastAPI backend package
│   ├── app/
│   │   ├── api/v1/                      # API routes
│   │   │   ├── endpoints/              # Individual endpoints
│   │   │   └── __init__.py            # API router
│   │   ├── core/                        # Core configuration
│   │   │   ├── config.py               # Settings and config
│   │   │   ├── database.py             # Database layer
│   │   │   └── celery_app.py           # Celery configuration
│   │   ├── models/                      # Pydantic models
│   │   │   └── notebook.py             # API data models
│   │   ├── services/                    # Business logic
│   │   │   ├── huggingface.py          # HF API integration
│   │   │   ├── notebook_generator.py  # Notebook generation
│   │   │   └── progress_tracker.py     # Progress tracking
│   │   ├── tasks/                       # Celery tasks
│   │   │   └── notebook_tasks.py       # Background tasks
│   │   └── main.py                      # FastAPI application
│   ├── requirements-minimal.txt         # Python dependencies
│   └── .env.example                    # Environment template
├── app/                                # Next.js frontend
│   ├── api/                            # Legacy Next.js API routes
│   ├── generator/                      # Model selection interface
│   ├── share/[shareId]/               # Share page for notebooks
│   └── layout.tsx                      # Root layout
├── components/                         # React components
│   ├── ModelCard.tsx
│   ├── GenerateButton.tsx
│   ├── CategoryFilter.tsx
│   ├── LoadingSpinner.tsx
│   └── NotebookResult.tsx
├── lib/                               # Frontend utilities
│   ├── backend-api.ts                 # FastAPI client
│   ├── presets.ts                     # Model presets
│   ├── supabase.ts                    # Supabase client
│   └── hooks/                          # React hooks
│       └── useWebSocketProgress.ts     # WebSocket progress hook
├── types/                             # TypeScript definitions
├── quick-start.sh                     # Quick start script
├── start.sh                           # Full start script
└── pnpm-workspace.yaml               # Monorepo configuration
```

### Adding New Models

1. Update `lib/presets.ts` with new model entries
2. Add category if needed
3. Update notebook generation logic if model requires special handling

### Customizing Notebook Templates

Edit the notebook generation logic in `lib/notebook-generator.ts` to customize:
- Cell structure and content
- Template variations by model type
- Code extraction strategies

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy

### Manual Deployment

1. Build the application: `npm run build`
2. Start the production server: `npm start`
3. Set up reverse proxy (nginx, etc.)
4. Configure SSL certificates

## Demo Script

1. **Open Generator**: Browse popular models and select one
2. **Generate Notebook**: Click "Generate Notebook" and watch the process
3. **Download Results**: Get the `.ipynb` file and open in Jupyter
4. **Share Notebook**: Copy share link and open in fresh browser
5. **Generate More**: Use "Generate New" button for same model

## Technology Stack

### Frontend
- **Next.js 14**: React framework with TypeScript
- **Tailwind CSS**: Utility-first CSS framework
- **WebSocket Client**: Real-time progress tracking with fallback

### Backend
- **FastAPI**: Modern Python web framework
- **Celery**: Distributed task queue
- **Redis**: Message broker and caching
- **Pydantic**: Data validation and serialization

### Database & Storage
- **Supabase**: PostgreSQL database with real-time features
- **PostgreSQL**: Primary data storage for notebooks

### External APIs
- **Hugging Face**: Model discovery and metadata
- **Hugging Face Files API**: README content extraction

### Development Tools
- **pnpm**: Package manager with monorepo support
- **Poetry**: Python dependency management
- **Docker**: Containerization support (optional)

## Limitations & Future Work

### Current Implementation
- ✅ **Asynchronous Processing**: FastAPI + Celery for long-running tasks
- ✅ **Real-time Progress**: WebSocket updates with polling fallback
- ✅ **Scalable Architecture**: Monorepo with separate backend service
- ✅ **Modern Tech Stack**: FastAPI, Celery, Redis, Next.js 14
- ✅ **Notebook Validation**: Automated syntax and runtime validation
- ✅ **Quality Assurance**: Ensures generated notebooks actually execute successfully

### Current Limitations
- No user authentication (anonymous access only)
- Limited to predefined popular models (easily extensible)
- Basic notebook template structure (functional but could be enhanced)

### Future Enhancements
- User accounts for personal notebook libraries
- Enhanced model search and filtering
- Notebook customization options
- Integration with Google Colab
- Advanced template variations for different model types
- Model fine-tuning support

## License

MIT License - see LICENSE file for details.