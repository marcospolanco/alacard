# Alacard - Technical Strategy (3-Hour Supabase Sprint)

## 1. Overview
This document outlines the technical strategy for building "Alacard," a notebook generation platform for a 3-hour demo sprint. This strategy is derived from the [latest PRD](./alacard-prd_2025.10.04.1420.md) and focuses on delivering a live demo with HF model selection, notebook generation, and sharing capabilities.

## 2. Core Architecture & Technical Stack (Sprint-Focused)
The platform is built for a 3-hour demo sprint with a lean, single-path architecture.

- **Frontend**: **React/Next.js** - Single-page application with Notebook Generator and Share pages.
- **Backend**: **Node.js API Routes** - Server-side calls to Hugging Face Model API for metadata and README fetching.
- **Database**: **Supabase (PostgreSQL)** - Single table `notebooks` with JSON payloads for simplicity.
- **AI & External Integrations**:
    - **Hugging Face Model API**: For fetching model metadata, README examples, and popular model lists.
    - **Hugging Face Files API**: For fetching model README files and code snippets.
- **Authentication**: **Disabled for sprint** - Anonymous writes with service key only.
- **Notebook Generation**: Server-side template-based `.ipynb` generation from HF README sources.

## 3. Minimal Supabase Schema (Sprint Implementation)
Single table design to reduce complexity and enable rapid development.

```sql
create extension if not exists pgcrypto;

create table if not exists public.notebooks (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  share_id text unique not null,
  hf_model_id text not null,
  notebook_content jsonb not null,
  metadata jsonb           -- { model_info: {...}, source_readme: string, generated_by: 'alacard' }
);

create index if not exists notebooks_share_idx on public.notebooks(share_id);
create index if not exists notebooks_model_idx on public.notebooks(hf_model_id);
```

**Key Design Decisions:**
- **No RLS for sprint** - Only server writes using service role key
- **JSON payloads** - Store notebook content and metadata as JSON to avoid joins
- **Share ID** - Unique identifier for public sharing notebooks
- **Model metadata** - Store model information and README source for provenance

## 4. Core API Endpoints (Sprint Implementation)

### Notebook Generation
- `POST /api/notebook` → Generate and save notebook
  - Request: `{ hf_model_id: string }`
  - Response: `{ share_id, notebook_url: "/api/notebook/download/{share_id}" }`

- `GET /api/notebook/:share_id` → Fetch notebook metadata
  - Response: Full notebook row JSON with model information

- `GET /api/notebook/download/:share_id` → Download `.ipynb`
  - Returns downloadable Jupyter notebook file (.ipynb format)
  - Fetches HF model metadata and README
  - Extracts first suitable Python snippet or widget example
  - Falls back to generic snippet based on `pipeline_tag`

### Model Management
- `GET /api/models/popular` → Get popular models list
  - Response: `[{ id: string, name: string, description: string, downloads: number, pipeline_tag: string }]`
  - Predefined curated list of popular HF models for quick selection

## 5. Notebook Generation Flow

### 5.1. Model Selection Interface
- **Popular Models Grid**: Curated list of popular HF models with descriptions and download counts
- **Model Categories**: Organized by task type (Chat, Text Generation, Classification, etc.)
- **Model Details**: Shows model info, pipeline tag, and description when selected

### 5.2. Notebook Generation Process
1. Client sends selected `hf_model_id` to `/api/notebook`
2. Server fetches model metadata from Hugging Face Model API
3. Server retrieves README content and extracts code snippets
4. Notebook is generated with:
   - Environment setup cell
   - Model-specific hello cell
   - Extracted code example from README
   - Model metadata and attribution

### 5.3. Sharing & Downloading
- **Share Page**: Read-only view with model info and download button
- **Generate New Button**: Opens generator with same model pre-selected
- **Direct Download**: `.ipynb` file ready for Jupyter/VS Code execution

## 6. Notebook Generation Pipeline (Template-Based)

### 6.1. HF Model Sourcing Logic
1. **Model Metadata**: GET `https://huggingface.co/api/models/{hf_model_id}`
2. **README Extraction**: Fetch README at latest commit SHA
3. **Code Snippet Extraction**:
   - First Python fenced block from README
   - Fallback to first code-fenced text prompt
   - Final fallback to generic `pipeline_tag` snippet

### 6.2. Notebook Template Structure
```
Cell 1: Markdown - "Alacard | {hf_model_id} Quickstart" + license + link
Cell 2: Code - Environment setup (transformers, huggingface_hub, requests)
Cell 3: Code - Hello cell (minimal API call verification)
Cell 4: Markdown - "Samples from Model Card"
Cell 5: Code - Runnable sample from README (sanitized)
Cell 6: Markdown - "Recipe used" (if share_id provided)
Cell 7: Markdown - Next steps + back to share link
```

### 6.3. Supported Model Categories
- **Text Generation**: Story writing, content creation models
- **Chat & Dialogue**: Conversational AI, instruction following
- **Classification & NER**: Text analysis, entity extraction
- **Summarization**: Long-form text summarization
- **Code Generation**: Programming and code completion
- **Translation**: Multi-language translation models

## 7. Sprint Timeline (3-Hour Implementation)

### 0:00–0:20: Setup & Infrastructure
- Create Supabase table with schema
- Set environment variables (Supabase, HF tokens)
- Scaffold routes: `/generator`, `/share/[shareId]`, `/api/*`

### 0:20–1:05: Notebook Generator Core
- Implement hardcoded popular model presets
- Build `POST /api/notebook` endpoint
- HF API integration for model metadata and README fetching
- Template-based `.ipynb` generation
- Model selection UI components

### 1:05–1:50: Share & Download Flow
- Implement `GET /api/notebook/:shareId` endpoint
- Build `GET /api/notebook/download/:shareId` for direct download
- Create `/share/[shareId]` page with model info
- Add "Generate New" button for same model selection

### 1:50–2:20: Popular Models Endpoint
- Implement `GET /api/models/popular` endpoint
- Create model category filtering
- Build model cards with descriptions and metadata

### 2:20–2:45: Figma Polish & Demo Prep
- Align Figma frames to working UI; add model cards and download flows
- Script the 90‑second demo narrative

### 2:45–3:00: Buffer & Fail-safes
- Add static fallback notebooks if HF APIs fail; pre-generate sample notebook files.
- Final testing and demo rehearsal

## 8. Environment Variables & Configuration

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# AI APIs
HF_API_TOKEN=your-huggingface-token

# Presets (hardcoded for sprint)
POPULAR_MODELS=["meta-llama/Llama-3.1-8B-Instruct", "microsoft/DialoGPT-medium", "distilbert-base-uncased"]
DEFAULT_MODEL="meta-llama/Llama-3.1-8B-Instruct"
```

## 9. Risk Mitigation & Fast Fallbacks

### API Failure Handling
- **HF README lacks runnable snippet** → Generic `transformers` or Inference API snippet
- **Inference rate-limited** → Pre-baked cached outputs with banner
- **Supabase write fails** → In-memory fallback for demo continuity

### UI Simplification Paths
- **Card UI too complex** → Dropdowns + textareas (keep Recipe summary)
- **Time constraints** → Remove winner voting, display static results
- **Notebook generation fails** → Static template download

## 10. Success Criteria (Demo Validation)

✅ **Live Demo Requirements:**
- End-to-end model comparison without manual data entry
- Shareable link loads identical results in fresh browser
- Downloaded notebook runs successfully with verified hello cell
- Remix functionality preserves complete recipe context

✅ **Technical Validation:**
- Arena API calls complete under 10 seconds total
- Share page loads in under 2 seconds
- Notebook generation completes in under 15 seconds
- All endpoints handle errors gracefully with fallbacks

## 11. Post-Sprint Roadmap (Next 1-2 Days)

### Immediate Enhancements
- Add RLS + simple authentication
- HF Inference adapter integration for more OSS models
- Basic evaluator rubric with HTML report export

### Feature Expansion
- Community Recipes: publish, fork, and remix with provenance
- Visual polish: card selection animations, themed palettes
- Advanced metrics: token usage, cost analysis, performance trends

### Scalability Planning
- Multi-user workspaces with proper RLS
- Environment variable management per user
- Advanced notebook templates with multi-task support
