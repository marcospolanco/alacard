# Alacard - Technical Strategy (AI Manuals for AI Models)

## 1. Overview
This document outlines the technical strategy for building "Alacard," a card-based recipe builder that generates customized, educational Jupyter notebooks for any Hugging Face model. This strategy is derived from the [latest PRD](alacard/alacard-prd_2025.10.04.1420.md) and focuses on delivering a revolutionary platform that makes AI model adoption trivially easy through interactive, runnable code notebooks.

## 2. Core Architecture & Technical Stack
The platform is built as a card-based recipe builder with a scalable architecture focused on community-driven notebook generation.

### Frontend Layer
- **Next.js 14 (App Router)** - Modern React framework with server components
- **React Server Components** - Optimized rendering and data fetching
- **Tailwind CSS** - Responsive UI components with card-based design system
- **TypeScript** - Type-safe development and better developer experience
- **Figma Make** - Rapid prototyping for card UI components

### Backend Layer
- **Next.js API Routes** - Server-side API endpoints for recipe building and notebook generation
- **Hugging Face API Integration** - Model metadata retrieval and README content fetching
- **Advanced Template Engine** - Custom notebook generation based on recipe cards
- **Background Processing** - Celery + Redis for long-running generation tasks (Future)

### Database Layer
- **Supabase (PostgreSQL)** - Serverless database for storing recipes, notebooks, and community data
- **JSON Storage** - Recipe configurations and notebook content stored as JSON
- **Community Analytics** - Tracking views, downloads, remixes, and trending content
- **User Management** - Supabase Auth for user accounts and personal notebooks (Post-MVP)

### External Integrations
- **Hugging Face Model API** - Fetch model metadata, descriptions, and model search
- **Hugging Face Files API** - Retrieve model README files and extract code examples
- **Hugging Face Hub API** - Get model card information and usage statistics
- **OpenAI/Anthropic (Optional)** - AI-powered notebook customization and content enhancement

## 3. Database Schema Design

### Core Tables

#### `notebooks` - Main notebook storage
```sql
CREATE TABLE IF NOT EXISTS public.notebooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  share_id TEXT UNIQUE NOT NULL,

  -- Recipe data
  recipe JSONB NOT NULL,  -- { model_card, prompt_cards, topic, difficulty, ui_component }
  hf_model_id TEXT NOT NULL,

  -- Generated content
  notebook_content JSONB NOT NULL,  -- Full .ipynb JSON

  -- Metadata
  metadata JSONB,  -- { model_info, source_readme, generated_by, forked_from }

  -- Community metrics
  view_count INTEGER DEFAULT 0,
  download_count INTEGER DEFAULT 0,
  remix_count INTEGER DEFAULT 0,

  -- User association (post-MVP)
  user_id UUID REFERENCES auth.users(id),
  is_public BOOLEAN DEFAULT true
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS notebooks_share_idx ON public.notebooks(share_id);
CREATE INDEX IF NOT EXISTS notebooks_model_idx ON public.notebooks(hf_model_id);
CREATE INDEX IF NOT EXISTS notebooks_remix_idx ON public.notebooks(remix_count DESC);
CREATE INDEX IF NOT EXISTS notebooks_user_idx ON public.notebooks(user_id);
CREATE INDEX IF NOT EXISTS notebooks_created_idx ON public.notebooks(created_at DESC);
```

#### `card_presets` - Curated card options
```sql
CREATE TABLE IF NOT EXISTS public.card_presets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_type TEXT NOT NULL,  -- 'model', 'prompt', 'topic', 'difficulty', 'ui_component'
  card_data JSONB NOT NULL,
  is_featured BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Card type indexes
CREATE INDEX IF NOT EXISTS card_presets_type_idx ON public.card_presets(card_type);
CREATE INDEX IF NOT EXISTS card_presets_featured_idx ON public.card_presets(is_featured, sort_order);
```

#### `collections` - User notebook organization (Post-MVP)
```sql
CREATE TABLE IF NOT EXISTS public.collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  notebook_ids UUID[] DEFAULT array[]::uuid[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS collections_user_idx ON public.collections(user_id);
```

### Schema Rationale
- **Recipe-Based Storage**: Cards are stored as JSON, enabling infinite combinations
- **Community Features**: Built-in tracking for views, downloads, and remixes
- **Scalable Design**: Supports both anonymous and authenticated usage patterns
- **Curation System**: Card presets allow for featured content and quality control
- **Future-Ready**: Schema supports advanced features like collections and workspaces

## 4. API Endpoints Specification

### 4.1 Recipe Building Endpoints

#### `GET /api/shuffle`
Generate a random but sensible recipe combination (removes analysis paralysis).

**Query Parameters:**
- `locked_cards`: Optional array of card types to keep fixed

**Response:**
```json
{
  "recipe": {
    "model_card": {
      "id": "meta-llama/Llama-3.1-8B-Instruct",
      "name": "Llama-3.1-8B-Instruct",
      "pipeline_tag": "text-generation"
    },
    "prompt_cards": [
      {"type": "quick_start", "prompts": ["Hello world", "Basic usage"]},
      {"type": "real_world", "prompts": ["Summarize this text", "Q&A"]}
    ],
    "topic": {
      "id": "sourdough",
      "name": "Sourdough Bread Making",
      "examples": ["recipe analysis", "baking instructions"]
    },
    "difficulty": {
      "level": "beginner",
      "description": "Extensive comments and explanations"
    },
    "ui_component": {
      "type": "chat_interface",
      "features": ["message history", "streaming"]
    }
  }
}
```

#### `GET /api/cards/:type`
Retrieve available cards of a specific type.

**Query Parameters:**
- `search`: Filter cards by name or description
- `category`: Filter by category (for model cards)
- `featured`: Return only featured cards
- `limit`: Number of results (default 20)

**Response:**
```json
{
  "cards": [
    {
      "id": "beginner",
      "name": "🌱 Beginner",
      "description": "Lots of comments, step-by-step explanations",
      "card_type": "difficulty",
      "is_featured": true
    }
  ],
  "total": 15
}
```

### 4.2 Notebook Generation Endpoints

#### `POST /api/notebook/generate`
Creates a new notebook based on recipe cards.

**Request Body:**
```json
{
  "recipe": {
    "model_card": {...},
    "prompt_cards": [...],
    "topic": {...},
    "difficulty": {...},
    "ui_component": {...}
  }
}
```

**Response:**
```json
{
  "share_id": "abc12345",
  "notebook_url": "/api/notebook/download/abc12345",
  "share_url": "/share/abc12345",
  "model_info": {
    "name": "Llama-3.1-8B-Instruct",
    "pipeline_tag": "text-generation",
    "downloads": 1250000,
    "likes": 2340
  }
}
```

#### `GET /api/notebook/:shareId`
Retrieves notebook metadata and recipe information.

**Response:**
```json
{
  "id": "uuid-here",
  "share_id": "abc12345",
  "recipe": {...},
  "hf_model_id": "meta-llama/Llama-3.1-8B-Instruct",
  "created_at": "2024-01-15T10:30:00Z",
  "view_count": 150,
  "download_count": 15,
  "remix_count": 3,
  "metadata": {
    "model_info": {...},
    "source_readme_sha": "commit-sha-here",
    "generated_by": "alacard",
    "forked_from": "xyz987"
  }
}
```

#### `GET /api/notebook/download/:shareId`
Downloads the generated notebook as a `.ipynb` file.

**Headers:**
- `Content-Type: application/x-ipynb+json`
- `Content-Disposition: attachment; filename="alacard-model-name.ipynb"`

### 4.3 Community & Remix Endpoints

#### `POST /api/notebook/:shareId/remix`
Create a new notebook based on an existing one with modified recipe.

**Request Body:**
```json
{
  "modified_recipe": {
    "model_card": {...},
    "prompt_cards": [...],
    "topic": {...},
    "difficulty": {"level": "advanced"},
    "ui_component": {...}
  }
}
```

**Response:**
```json
{
  "share_id": "def67890",
  "notebook_url": "/api/notebook/download/def67890",
  "forked_from": "abc12345"
}
```

#### `GET /api/trending`
Get trending notebooks based on community engagement.

**Query Parameters:**
- `timeframe`: day, week, month, all
- `model`: Filter by specific model
- `topic`: Filter by topic
- `difficulty`: Filter by difficulty level
- `limit`: Number of results (default 20)

**Response:**
```json
{
  "notebooks": [
    {
      "share_id": "abc12345",
      "recipe": {...},
      "hf_model_id": "meta-llama/Llama-3.1-8B-Instruct",
      "view_count": 1500,
      "download_count": 250,
      "remix_count": 45,
      "created_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

#### `POST /api/notebook/:shareId/track`
Track user interactions for analytics.

**Request Body:**
```json
{
  "event": "view" | "download" | "remix"
}
```

### 4.4 Model Discovery Endpoints

#### `GET /api/models/search`
Search for models across the entire Hugging Face catalog.

**Query Parameters:**
- `q`: Search query
- `task`: Filter by task type (text-generation, classification, etc.)
- `sort`: Sort by downloads, likes, trending, created
- `limit`: Number of results (default 20)

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
      "tags": ["text-generation", "llama", "conversational"],
      "license": "llama3.1"
    }
  ],
  "total": 2100000
}

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
- **Recipe Builder Interface**: Card-based UI with 5 slots for different card types
- **Shuffle Button**: "Deal me a hand" feature for random recipes
- **Card Selection Areas**:
  - Model Cards: Browse or search 2.1M+ HF models
  - Prompt Card Packs: Themed sets of 3-5 prompts
  - Topic Cards: Domain-specific theming (sourdough, healthcare, etc.)
  - Difficulty Cards: Beginner, Intermediate, Advanced levels
  - UI Component Cards: Chat interface, API endpoint, Gradio demo, etc.
- **Recipe Bar**: Visual summary of current card selection
- **Generate Button**: Prominent CTA for notebook generation
- **Loading States**: Real-time progress tracking during generation

#### Share Page (`/share/[shareId]`)
- **Recipe Summary**: Visual display of cards used to generate notebook
- **Model Information**: Detailed model stats, usage information
- **Download Button**: Direct notebook download with proper naming
- **Remix Button**: Pre-fills generator with current recipe for modification
- **Community Metrics**: Views, downloads, remix count
- **Fork Chain**: Visual representation of remix history

#### Trending Page (`/trending`)
- **Notebook Gallery**: Grid of most remixed/shared notebooks
- **Filter Options**: By model, topic, difficulty, timeframe
- **Sort Options**: By remixes, downloads, views, recency
- **Preview Cards**: Recipe summary + key metrics

#### Home Page (`/`)
- **Hero Section**: "AI Manuals for AI Models" value proposition
- **Quick Shuffle**: One-click recipe generation for immediate discovery
- **Featured Notebooks**: Curated examples of best recipes
- **How It Works**: Step-by-step visual explanation of card system

### 6.2 Component Architecture

```typescript
// Core Card Components
<ModelCard />          // Individual model selection card with stats
<RecipeSlot />         // Droppable slot for each card type
<PromptCardPack />     // Expandable pack of themed prompts
<TopicCard />          // Domain/topic selection card
<DifficultyCard />     // Complexity level selector
<UIComponentCard />    // Interface type selector

// Recipe Building
<RecipeBar />          // Visual summary of selected cards
<ShuffleButton />      // Random recipe generation
<CardGrid />           // Browseable grid for each card type
<CardSearch />         // Search within card collections
<GenerateButton />     // Primary CTA with loading states

// Community & Sharing
<NotebookPreview />    // Recipe + metrics in share page
<RemixButton />        // Fork and modify existing recipes
<TrendingCard />       // Notebook in trending gallery
<ForkChain />          // Visual remix history
<MetricBadge />        // View/download/remix counts

// Layout & Navigation
<Header />             // Navigation with shuffle/search
<Sidebar />            // Filter panels and card categories
<LoadingStates />      // Progress indicators for generation
<ErrorBoundary />      // Graceful error handling
```

### 6.3 State Management

```typescript
// Recipe State
interface RecipeState {
  modelCard: ModelCard | null;
  promptCards: PromptCardPack | null;
  topicCard: TopicCard | null;
  difficultyCard: DifficultyCard | null;
  uiComponentCard: UIComponentCard | null;
  lockedCards: string[]; // Card types to keep fixed during shuffle
}

// Application State
interface AppState {
  // Recipe Building
  currentRecipe: RecipeState;
  availableCards: {
    models: ModelCard[];
    prompts: PromptCardPack[];
    topics: TopicCard[];
    difficulties: DifficultyCard[];
    uiComponents: UIComponentCard[];
  };

  // Generation
  isGenerating: boolean;
  generationProgress: {
    stage: string;
    progress: number;
    estimatedTime: number;
  };

  // User Session
  generatedNotebooks: Notebook[];
  recentRecipes: RecipeState[];

  // UI State
  selectedCardType: string | null;
  searchQuery: string;
  filters: {
    category?: string;
    difficulty?: string;
    featured?: boolean;
  };

  // Community
  trendingNotebooks: Notebook[];
  userMetrics: {
    notebooksGenerated: number;
    notebooksShared: number;
    remixesCreated: number;
  };
}

// Card Type Definitions
interface ModelCard {
  id: string;
  name: string;
  description: string;
  pipeline_tag: string;
  downloads: number;
  likes: number;
  tags: string[];
  license: string;
}

interface PromptCardPack {
  id: string;
  name: string;
  description: string;
  prompts: string[];
  category: string;
  isCustom: boolean;
}

interface TopicCard {
  id: string;
  name: string;
  description: string;
  examples: string[];
  icon: string;
}

interface DifficultyCard {
  level: 'beginner' | 'intermediate' | 'advanced';
  name: string;
  description: string;
  commentDensity: number;
  explanationDepth: number;
}

interface UIComponentCard {
  type: 'chat_interface' | 'api_endpoint' | 'gradio_demo' | 'streamlit_app';
  name: string;
  description: string;
  features: string[];
  complexity: 'simple' | 'moderate' | 'complex';
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

### 10.1 Functional Requirements (MVP - Hackathon)
✅ **Core Recipe System:**
- Card-based recipe builder with 5 card types
- Shuffle feature for random but sensible combinations
- Notebook generation from recipe cards
- Downloadable `.ipynb` files with working code

✅ **Community Features:**
- Shareable links for generated notebooks
- Remix functionality for modifying recipes
- Basic trending page with view/download counts
- Recipe tracking and provenance

✅ **Model Integration:**
- Search across 2.1M+ Hugging Face models
- Popular model curation for quick access
- Model metadata display (downloads, likes, license)
- README parsing and code extraction

### 10.2 Performance Requirements
✅ **Speed & Responsiveness:**
- Shuffle operation completes within 2 seconds
- Notebook generation completes within 15 seconds
- Share page loads within 2 seconds
- Card browsing and search are responsive (<500ms)

✅ **Scalability:**
- Handle concurrent notebook generation
- Efficient card loading and filtering
- Smooth card animations and interactions
- Graceful degradation under load

### 10.3 Technical Validation
✅ **API Endpoints:**
- All endpoints respond correctly with proper error codes
- Recipe generation handles various card combinations
- Database operations complete successfully
- File downloads work across browsers

✅ **User Experience:**
- Intuitive card-based interface
- Clear feedback during generation process
- Successful notebook execution in Jupyter/VS Code
- Mobile-responsive design
- "That was easy" feeling for first-time users

### 10.4 Quality Metrics
✅ **Content Quality:**
- Generated notebooks run without syntax errors
- Code examples match model capabilities
- Explanations are appropriate for difficulty level
- Topic customization is meaningful and relevant

✅ **Community Engagement:**
- High remix rate (>10% of shared notebooks)
- Diverse model usage (not just top 10 models)
- Quality content rises to top organically
- User-generated card presets and topics

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
    this.ws = new WebSocket(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'https://alacard.onrender.com'}`.replace('https://', 'wss://').replace('http://', 'ws://') + `/ws/${taskId}`)
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

## 12. Implementation Roadmap & Success Metrics

### 12.1 MVP - Hackathon Launch (Week 1)
**Goal**: Validate core concept with working demo

**Core Features**:
- ✅ Card-based recipe builder with 5 card types
- ✅ Shuffle feature for removing analysis paralysis
- ✅ Notebook generation from Hugging Face models
- ✅ Share links and basic remix functionality
- ✅ 10-15 curated cards per type for initial variety

**Success Metrics**:
- 50+ unique users try the shuffle feature
- 100+ notebooks generated during hackathon
- 10+ notebooks shared publicly
- 5+ successful remixes
- Qualitative feedback: "This is actually useful"

**Technical Goals**:
- All API endpoints functional
- Database schema implemented
- Basic UI working smoothly
- Error handling covers edge cases

### 12.2 V1.0 - Community Launch (Weeks 2-4)
**Goal**: Build initial library and activate community features

**Feature Expansion**:
- 🔲 User authentication (Supabase Auth)
- 🔲 User dashboard (my notebooks, my recipes)
- 🔲 Trending page with filtering and sorting
- 🔲 Full model search across 2.1M+ HF models
- 🔲 Expanded card library (50+ options per type)
- 🔲 Remix tracking and provenance visualization
- 🔲 Basic analytics and usage tracking

**Community Seeding**:
- 🔲 Partner with 5-10 model creators for "official" notebooks
- 🔲 Create 20+ high-quality starter recipes
- 🔲 "Notebook of the Week" showcase
- 🔲 Social sharing integration

**Success Metrics**:
- 500+ notebooks generated
- 50+ shared notebooks
- 100+ remixes
- 1000+ unique visitors
- 30% week-over-week growth

### 12.3 V1.5 - Power User Features (Month 2)
**Goal**: Retain users and build habit formation

**Advanced Features**:
- 🔲 User collections and organization
- 🔲 Inline notebook editing before download
- 🔲 Custom card creation (user-defined prompts, topics)
- 🔲 Search and filter by recipe combinations
- 🔲 Email notifications for remixes and trending
- 🔲 Comments and basic social features
- 🔲 Export to Colab, Kaggle, Deepnote

**Quality Improvements**:
- 🔲 Advanced error handling and recovery
- 🔲 Notebook quality validation
- 🔲 Performance optimization for mobile
- 🔲 A/B testing for conversion optimization

**Success Metrics**:
- 5000+ notebooks generated
- 500+ shared notebooks
- 1000+ remixes
- 20% return user rate
- 2+ minute average session time

### 12.4 V2.0 - Platform Expansion (Month 3)
**Goal**: Establish market position and prepare for monetization

**Platform Features**:
- 🔲 Multi-model notebooks and comparisons
- 🔲 Advanced customization (edit templates)
- 🔲 API for programmatic notebook generation
- 🔲 Jupyter/VS Code extension
- 🔲 Team collaboration features
- 🔲 Advanced analytics dashboard

**Business Readiness**:
- 🔲 Freemium tier limits (10 notebooks/month)
- 🔲 Upgrade paths and pricing page
- 🔲 Enterprise feature pipeline
- 🔲 Monitoring and logging infrastructure

**Success Metrics**:
- 50,000+ notebooks generated
- 5000+ shared notebooks
- 10,000+ remixes
- 100+ paid users (if launched)
- 50,000+ unique visitors

### 12.5 V3.0+ - Market Leadership (Months 4-6)
**Goal**: Become the default way people learn and adopt AI models

**Advanced Capabilities**:
- 🔲 Fine-tuning recipes and dataset integration
- 🔲 Production deployment templates
- 🔲 Cost optimization analysis
- 🔲 Model recommendation engine
- 🔲 Enterprise SSO and private models
- 🔲 Global multi-region deployment

**Ecosystem Building**:
- 🔲 Developer API and integrations
- 🔲 Partner program for model creators
- 🔲 Educational content and certifications
- 🔲 Community marketplace for premium cards

**Success Metrics**:
- 500,000+ notebooks generated
- 50,000+ shared notebooks
- 100,000+ active users
- 1000+ paid customers
- $1M+ ARR

### 12.6 Key Success Indicators

**North Star Metric**: Notebooks Generated Per Week
- Leading indicator of value creation
- Measures both discovery and utility

**Health Metrics**:
- Shuffle to Generate conversion rate (>25%)
- Generate to Share conversion rate (>15%)
- Share to Remix conversion rate (>20%)
- User retention (7-day, 30-day, 90-day)
- Mobile usage percentage (>40%)

**Quality Metrics**:
- Notebook execution success rate (>95%)
- User satisfaction CSAT (>4.5/5)
- Support ticket volume (<2% of users)
- Model diversity index (usage beyond top 50 models)

**Business Metrics**:
- Free to paid conversion rate (>5%)
- Customer acquisition cost (CAC)
- Lifetime value (LTV)
- Monthly recurring revenue (MRR)
- Viral coefficient (k-factor >0.5)

This roadmap provides a clear path from hackathon demo to market-leading platform, with measurable milestones at each stage. The card-based recipe system creates infinite content variety while community features ensure sustainable growth through network effects.
