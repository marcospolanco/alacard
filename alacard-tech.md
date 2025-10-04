# Alacard - Technical Strategy (Notebook Generator)

## 1. Overview
This document outlines the technical strategy for building "Alacard," a notebook generation platform that creates downloadable Jupyter notebooks from Hugging Face models. This strategy is derived from the [latest PRD](alacard/alacard-prd_2025.10.04.1555.md) and focuses on delivering a working demo with HF model selection, automated notebook generation, and sharing capabilities.

## 2. Core Architecture & Technical Stack
The platform is built for a 3-hour demo sprint with a lean, focused architecture.

### Frontend Layer
- **React/Next.js** - Single-page application with model selection and notebook generation interface
- **Tailwind CSS** - Responsive UI components with clean design
- **TypeScript** - Type-safe development and better developer experience

### Backend Layer
- **Node.js API Routes** - Server-side API endpoints for model fetching and notebook generation
- **Hugging Face API Integration** - Model metadata retrieval and README content fetching
- **Template Engine** - Server-side `.ipynb` generation from README code snippets

### Database Layer
- **Supabase (PostgreSQL)** - Serverless database for storing generated notebooks and share metadata
- **JSON Storage** - Notebook content stored as JSON for efficient retrieval
- **Public Access** - No authentication required for demo (anonymous access)

### External Integrations
- **Hugging Face Model API** - Fetch model metadata, descriptions, and popular model lists
- **Hugging Face Files API** - Retrieve model README files and extract code examples
- **Hugging Face Hub API** - Get model card information and usage statistics

## 3. Database Schema Design

### Primary Table: `notebooks`
```sql
CREATE TABLE IF NOT EXISTS public.notebooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  share_id TEXT UNIQUE NOT NULL,
  hf_model_id TEXT NOT NULL,
  notebook_content JSONB NOT NULL,
  metadata JSONB,
  download_count INTEGER DEFAULT 0
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS notebooks_share_idx ON public.notebooks(share_id);
CREATE INDEX IF NOT EXISTS notebooks_model_idx ON public.notebooks(hf_model_id);
CREATE INDEX IF NOT EXISTS notebooks_created_idx ON public.notebooks(created_at DESC);
```

### Schema Rationale
- **Single Table Design**: Simplifies architecture for 3-hour sprint
- **JSON Storage**: Notebook content stored as JSON for flexible structure
- **Share IDs**: Publicly accessible identifiers for sharing notebooks
- **Metadata**: Rich context about model source and generation parameters
- **Analytics**: Download counting for popular model identification

## 4. API Endpoints Specification

### 4.1 Notebook Generation Endpoints

#### `POST /api/notebook/generate`
Creates a new notebook for a specified Hugging Face model.

**Request Body:**
```json
{
  "hf_model_id": "meta-llama/Llama-3.1-8B-Instruct"
}
```

**Response:**
```json
{
  "share_id": "abc12345",
  "notebook_url": "/api/notebook/download/abc12345",
  "model_info": {
    "name": "Llama-3.1-8B-Instruct",
    "pipeline_tag": "text-generation",
    "downloads": 1250000,
    "likes": 2340
  }
}
```

#### `GET /api/notebook/:shareId`
Retrieves notebook metadata and model information.

**Response:**
```json
{
  "id": "uuid-here",
  "share_id": "abc12345",
  "hf_model_id": "meta-llama/Llama-3.1-8B-Instruct",
  "created_at": "2024-01-15T10:30:00Z",
  "download_count": 15,
  "metadata": {
    "model_info": {...},
    "source_readme_sha": "commit-sha-here",
    "generated_by": "alacard"
  }
}
```

#### `GET /api/notebook/download/:shareId`
Downloads the generated notebook as a `.ipynb` file.

**Headers:**
- `Content-Type: application/json`
- `Content-Disposition: attachment; filename="alacard-model-name.ipynb"`

### 4.2 Model Discovery Endpoints

#### `GET /api/models/popular`
Returns a curated list of popular Hugging Face models.

**Response:**
```json
{
  "models": [
    {
      "id": "meta-llama/Llama-3.1-8B-Instruct",
      "name": "Llama-3.1-8B-Instruct",
      "description": "Meta's Llama 3.1 model with 8B parameters",
      "pipeline_tag": "text-generation",
      "downloads": 1250000,
      "likes": 2340,
      "tags": ["text-generation", "llama", "conversational"]
    }
  ]
}
```

#### `GET /api/models/search`
Search for models by category or keyword.

**Query Parameters:**
- `category`: text-generation, classification, etc.
- `limit`: number of results (default 20)

## 5. Notebook Generation Pipeline

### 5.1 Data Retrieval Process

1. **Model Metadata Fetch**
   - GET `https://huggingface.co/api/models/{hf_model_id}`
   - Extract `pipeline_tag`, `tags`, `modelId`, `sha`
   - Get download counts, likes, and model information

2. **README Content Retrieval**
   - GET `https://huggingface.co/{hf_model_id}/raw/{sha}/README.md`
   - Parse markdown content for code blocks
   - Extract Python code examples and usage patterns

3. **Code Snippet Extraction Strategy**
   - **Priority 1**: First Python fenced block from README
   - **Priority 2**: First code block with any language
   - **Priority 3**: Generic template based on `pipeline_tag`
   - **Fallback**: Basic `transformers` pipeline example

### 5.2 Notebook Template Structure

Generated notebooks follow a consistent 7-cell structure:

```
Cell 1: Markdown - Title & Attribution
Cell 2: Code - Environment Setup (transformers, huggingface_hub)
Cell 3: Code - Hello Cell (model verification)
Cell 4: Markdown - Model Information
Cell 5: Code - Extracted README Example
Cell 6: Code - Generic Usage Example
Cell 7: Markdown - Next Steps & Resources
```

### 5.3 Template Customization by Model Type

**Text Generation Models:**
```python
from transformers import AutoTokenizer, AutoModelForCausalLM
tokenizer = AutoTokenizer.from_pretrained(model_id)
model = AutoModelForCausalLM.from_pretrained(model_id)
inputs = tokenizer("Your prompt here", return_tensors="pt")
outputs = model.generate(**inputs, max_length=100)
```

**Classification Models:**
```python
from transformers import pipeline
classifier = pipeline("text-classification", model=model_id)
result = classifier("This is a sample text for classification.")
```

**Translation Models:**
```python
from transformers import pipeline
translator = pipeline("translation", model=model_id)
result = translator("Hello, how are you?", src_lang="en", tgt_lang="es")
```

## 6. Frontend Architecture

### 6.1 Page Structure

#### Generator Page (`/generator`)
- **Model Selection Grid**: Popular models with cards showing name, description, downloads
- **Category Filters**: Browse models by task type (Text Gen, Classification, etc.)
- **Search Bar**: Direct model search functionality
- **Generate Button**: One-click notebook generation
- **Loading States**: Progress indicators during generation

#### Share Page (`/share/[shareId]`)
- **Model Information Display**: Model details, usage statistics
- **Download Button**: Direct notebook download
- **Generate New Button**: Create notebook with same model
- **Usage Statistics**: Download count and creation date

#### Home Page (`/`)
- **Landing Page**: Product overview and feature highlights
- **Quick Start**: Popular models for immediate notebook generation
- **How It Works**: Step-by-step process explanation

### 6.2 Component Architecture

```typescript
// Core Components
<ModelCard />          // Individual model selection card
<ModelGrid />           // Grid layout for model browsing
<CategoryFilter />      // Model category filtering
<SearchBar />           // Model search functionality
<GenerateButton />      // Notebook generation trigger
<LoadingSpinner />      // Generation progress indicator
<SharePreview />        // Notebook metadata display
```

### 6.3 State Management

```typescript
// Application State
interface AppState {
  selectedModel: Model | null;
  popularModels: Model[];
  isGenerating: boolean;
  generatedNotebook: Notebook | null;
  searchQuery: string;
  selectedCategory: string;
}
```

## 7. Error Handling & Fallbacks

### 7.1 API Failure Scenarios

**Hugging Face API Rate Limited:**
- Serve pre-generated popular notebooks
- Display "API temporarily unavailable" banner
- Queue requests for retry when available

**README Parsing Failed:**
- Use generic template based on model pipeline tag
- Include model metadata in notebook header
- Add note about source extraction failure

**Supabase Write Failed:**
- Generate notebook client-side for immediate download
- Store in browser localStorage as backup
- Display "Share feature temporarily unavailable" message

### 7.2 Fallback Notebook Templates

Pre-built templates for common model types:
- **Text Generation**: Basic generation pipeline
- **Classification**: Zero-shot classification example
- **Translation**: Language translation pipeline
- **Summarization**: Document summarization example

## 8. Implementation Timeline (3-Hour Sprint)

### Phase 1: Infrastructure (0:00–0:30)
- Set up Supabase database with notebooks table
- Configure environment variables (Supabase, HF API)
- Create Next.js project structure
- Set up basic routing (`/generator`, `/share/[shareId]`)

### Phase 2: Backend API (0:30–1:30)
- Implement `GET /api/models/popular` endpoint
- Create `POST /api/notebook/generate` endpoint
- Build notebook template generation logic
- Implement README parsing and code extraction
- Add error handling and fallbacks

### Phase 3: Frontend Interface (1:30–2:15)
- Create model selection grid with popular models
- Implement notebook generation UI
- Build loading states and progress indicators
- Add search and category filtering

### Phase 4: Share & Download Flow (2:15–2:45)
- Implement share page with model information
- Create download functionality for `.ipynb` files
- Add "Generate New" button for same model
- Implement sharing and analytics

### Phase 5: Polish & Testing (2:45–3:00)
- Add responsive design and UI polish
- Test error scenarios and fallbacks
- Prepare demo flow and talking points
- Generate sample notebooks for testing

## 9. Environment Configuration

### 9.1 Required Environment Variables

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Hugging Face API
HF_API_TOKEN=your-huggingface-token

# Application Configuration
NODE_ENV=development
PORT=3000
```

### 9.2 Popular Models Configuration

```typescript
// Popular models for quick access
const POPULAR_MODELS = [
  {
    id: "meta-llama/Llama-3.1-8B-Instruct",
    name: "Llama-3.1-8B-Instruct",
    category: "text-generation",
    description: "Meta's advanced conversational AI model"
  },
  {
    id: "microsoft/DialoGPT-medium",
    name: "DialoGPT Medium",
    category: "conversational",
    description: "Microsoft's conversational AI model"
  },
  {
    id: "distilbert-base-uncased",
    name: "DistilBERT Base",
    category: "classification",
    description: "Lightweight BERT model for text classification"
  }
];
```

## 10. Success Criteria & Validation

### 10.1 Functional Requirements
✅ **Core Feature Completion:**
- Model selection interface with popular models
- Automated notebook generation from README sources
- Downloadable `.ipynb` files with working code examples
- Shareable links for generated notebooks

✅ **Performance Requirements:**
- Notebook generation completes within 15 seconds
- Share page loads within 2 seconds
- Model browsing and search are responsive
- Error handling provides graceful fallbacks

### 10.2 Technical Validation
✅ **API Endpoints:**
- All endpoints respond correctly with proper error codes
- Notebook generation handles various model types
- Database operations complete successfully
- File downloads work across browsers

✅ **User Experience:**
- Intuitive model selection interface
- Clear feedback during generation process
- Successful notebook execution in Jupyter/VS Code
- Mobile-responsive design

## 11. Next-Phase Architecture: FastAPI Backend

### 11.1 Why FastAPI Backend?

#### Current Limitations
- **Next.js API Routes**: 10-second execution limit for serverless functions
- **Long-running Tasks**: Notebook generation often exceeds time limits
- **Concurrent Users**: Limited scalability for simultaneous generation requests
- **Background Processing**: No native support for async task queues

#### FastAPI Advantages
- **No Time Limits**: Long-running notebook generation
- **Async/Await**: Native async support for concurrent API calls
- **Background Tasks**: Celery + Redis for job queuing
- **Performance**: Better CPU-intensive operation handling
- **WebSocket Support**: Real-time progress updates
- **Type Safety**: Full TypeScript-like support with Pydantic

### 11.2 Monorepo Architecture

#### New Directory Structure
```
alacard/
├── apps/
│   ├── web/                 # Next.js frontend
│   │   ├── pages/
│   │   ├── components/
│   │   ├── lib/
│   │   └── package.json
│   └── api/                 # FastAPI backend
│       ├── app/
│       ├── routers/
│       ├── services/
│       ├── models/
│       ├── workers/
│       └── requirements.txt
├── packages/
│   ├── shared/              # Shared types and utilities
│   │   ├── types/
│   │   ├── utils/
│   │   └── package.json
│   ├── database/            # Database schemas and migrations
│   │   ├── models/
│   │   ├── migrations/
│   │   └── package.json
│   └── config/              # Configuration management
│       ├── environment/
│       └── package.json
├── docker-compose.yml
├── docker-compose.dev.yml
├── package.json             # Workspace root
├── pnpm-workspace.yaml
└── .env.example
```

#### Package Manager Configuration
```yaml
# pnpm-workspace.yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

### 11.3 FastAPI Backend Architecture

#### Core Services
```python
# apps/api/app/services/notebook_service.py
class NotebookService:
    async def generate_notebook(self, hf_model_id: str) -> str:
        # Background task implementation
        task = generate_notebook_task.delay(hf_model_id)
        return task.id

    async def get_generation_status(self, task_id: str) -> dict:
        # Check Celery task status
        task = AsyncResult(task_id)
        return {
            "task_id": task_id,
            "status": task.state,
            "result": task.result if task.ready() else None,
            "error": str(task.info) if task.failed() else None
        }
```

#### API Endpoints (FastAPI)
```python
# apps/api/app/routers/notebooks.py
@router.post("/generate")
async def generate_notebook(
    request: NotebookGenerationRequest,
    background_tasks: BackgroundTasks
):
    """Initiate notebook generation in background"""
    task_id = str(uuid.uuid())

    # Start background task
    background_tasks.add_task(
        generate_notebook_task,
        task_id,
        request.hf_model_id
    )

    return {
        "task_id": task_id,
        "status": "processing",
        "estimated_time": "15-30 seconds"
    }

@router.get("/{task_id}/status")
async def get_generation_status(task_id: str):
    """Check notebook generation progress"""
    status = await notebook_service.get_generation_status(task_id)
    return status

@router.get("/{task_id}/download")
async def download_notebook(task_id: str):
    """Download completed notebook"""
    notebook = await notebook_service.get_completed_notebook(task_id)
    return FileResponse(
        notebook.file_path,
        filename=f"alacard-{notebook.model_name}.ipynb"
    )
```

### 11.4 Background Task Implementation

#### Celery Configuration
```python
# apps/api/app/workers/celery_app.py
from celery import Celery

celery_app = Celery(
    "alacard",
    broker="redis://localhost:6379/0",
    backend="redis://localhost:6379/0",
    include=["app.workers.notebook_tasks"]
)

@celery_app.task
def generate_notebook_task(task_id: str, hf_model_id: str):
    """Background notebook generation"""
    try:
        # Step 1: Fetch model metadata
        model_info = await hf_service.get_model_info(hf_model_id)

        # Step 2: Fetch README content
        readme_content = await hf_service.get_readme_content(hf_model_id, model_info.sha)

        # Step 3: Extract code snippets
        code_snippets = await notebook_parser.extract_code_snippets(readme_content)

        # Step 4: Generate notebook
        notebook_content = notebook_generator.create_notebook(
            model_info, code_snippets
        )

        # Step 5: Save to database
        notebook = await notebook_service.save_notebook(
            task_id=task_id,
            hf_model_id=hf_model_id,
            content=notebook_content,
            metadata=model_info
        )

        return {
            "status": "completed",
            "notebook_id": notebook.id,
            "share_id": notebook.share_id
        }

    except Exception as e:
        return {
            "status": "failed",
            "error": str(e)
        }
```

### 11.5 Real-Time Progress Updates

#### WebSocket Support
```python
# apps/api/app/routers/websocket.py
@router.websocket("/ws/{task_id}")
async def websocket_endpoint(websocket: WebSocket, task_id: str):
    await websocket.accept()

    # Monitor task progress
    while True:
        status = await notebook_service.get_generation_status(task_id)
        await websocket.send_json(status)

        if status["status"] in ["completed", "failed"]:
            break

        await asyncio.sleep(2)  # Poll every 2 seconds
```

#### Frontend WebSocket Client
```typescript
// apps/web/lib/websocket-client.ts
class WebSocketClient {
  constructor(taskId: string) {
    this.ws = new WebSocket(`ws://localhost:8000/ws/${taskId}`)
  }

  onProgress(callback: (status: any) => void) {
    this.ws.onmessage = (event) => {
      const status = JSON.parse(event.data)
      callback(status)
    }
  }
}
```

### 11.6 Development Environment Setup

#### Local Development Services

**Required Services:**
- **Redis** - Task queue and caching
- **PostgreSQL** - Database for notebooks
- **Python 3.9+** - For FastAPI backend
- **Node.js 18+** - For Next.js frontend

#### Environment Setup Commands
```bash
# Start Redis (install locally or use Homebrew)
redis-server --port 6379

# Start PostgreSQL (install locally or use Homebrew)
initdb -D /usr/local/var/postgres
createuser alacard
createdb alacard
psql alacard < setup_database.sql

# Start Celery Worker
celery -A app.workers.celery_app worker --loglevel=info

# Start FastAPI Server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# Start Next.js Frontend
npm run dev
```

#### Environment Configuration
```bash
# .env
DATABASE_URL=postgresql://alacard:password@localhost:5432/alacard
REDIS_URL=redis://localhost:6379/0
HF_API_TOKEN=your_huggingface_token
```

### 11.7 Migration Strategy

#### Phase 1: Infrastructure Setup
1. Set up monorepo with pnpm workspace
2. Create FastAPI backend structure
3. Configure Docker development environment
4. Set up Redis and PostgreSQL services

#### Phase 2: Backend Migration
1. Port API logic from Next.js to FastAPI
2. Implement Celery background tasks
3. Add async database operations
4. Create WebSocket support for progress updates

#### Phase 3: Frontend Updates
1. Update API client to use FastAPI endpoints
2. Implement WebSocket progress updates
3. Add error handling for long-running operations
4. Update TypeScript types to match backend

#### Phase 4: Testing & Deployment
1. End-to-end testing of notebook generation
2. Performance optimization for concurrent users
3. Manual production deployment (no Docker)
4. Monitoring and logging configuration

### 11.8 Performance Improvements

#### Concurrent Generation
- **Async Processing**: Multiple notebooks can generate simultaneously
- **Queue Management**: Celery prevents system overload
- **Resource Pooling**: Efficient resource utilization

#### Caching Strategy
- **Model Metadata**: Cache HF API responses
- **README Content**: Cache parsed README data
- **Generated Notebooks**: Cache frequently requested notebooks

#### Error Handling
- **Retry Logic**: Automatic retry for failed HF API calls
- **Graceful Degradation**: Fallback to template-based generation
- **Task Monitoring**: Track failed tasks and retry automatically

### 11.9 Implementation Timeline

**Week 1: Infrastructure & Basic Migration**
- Set up monorepo structure
- Implement basic FastAPI endpoints
- Migrate notebook generation logic
- Set up background task processing

**Week 2: Advanced Features**
- Implement WebSocket progress updates
- Add caching layers
- Optimize database queries
- Add comprehensive error handling

**Week 3: Production Readiness**
- Docker containerization
- Monitoring and logging
- Performance testing
- CI/CD pipeline setup

## 12. Post-Sprint Enhancement Roadmap

### 12.1 Immediate Improvements (Next 1-2 weeks)
- **Authentication**: Add user accounts for personal notebook libraries
- **Advanced Search**: Enhanced model filtering and sorting
- **Notebook Customization**: Allow users to modify generated notebooks
- **Analytics Dashboard**: Track popular models and usage patterns

### 12.2 Feature Expansion (Next 1-2 months)
- **Model Categories**: Expand to cover more specialized model types
- **Notebook Library**: Community collection of generated notebooks
- **Integration Options**: Export to Google Colab, Kaggle
- **Advanced Templates**: Multi-model notebooks and workflow templates

### 12.3 Scalability Planning (Next 2-3 months)
- **Multi-Region Deployment**: Global distribution for faster access
- **Enterprise Features**: Private model support and team collaboration
- **API Rate Limiting**: Prevent abuse and ensure fair usage
- **Cost Optimization**: Efficient resource usage and scaling

This enhanced architecture addresses the fundamental limitations of serverless functions while providing a robust foundation for scaling the notebook generation platform.
