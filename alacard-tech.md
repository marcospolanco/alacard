# Alacard - Technical Strategy (3-Hour Supabase Sprint)

## 1. Overview
This document outlines the technical strategy for building "Alacard," a model comparison arena and notebook generation platform for a 3-hour demo sprint. This strategy is derived from the [latest PRD](./alacard-prd_2025.10.04.1420.md) and focuses on delivering a live demo with model comparison, shareable results, and notebook generation.

## 2. Core Architecture & Technical Stack (Sprint-Focused)
The platform is built for a 3-hour demo sprint with a lean, single-path architecture.

- **Frontend**: **React/Next.js** - Single-page application with Arena and Share pages.
- **Backend**: **Node.js API Routes** - Server-side calls to OpenAI and Hugging Face Inference APIs.
- **Database**: **Supabase (PostgreSQL)** - Single table `matches` with JSON payloads for simplicity.
- **AI & External Integrations**:
    - **OpenAI API**: For model comparison (`gpt-4o-mini` vs `gpt-4o`).
    - **Hugging Face Inference API**: For OSS model comparison (e.g., `meta-llama/Llama-3.1-8B-Instruct`).
    - **Hugging Face Model API**: For fetching model metadata and README examples for notebook generation.
- **Authentication**: **Disabled for sprint** - Anonymous writes with service key only.
- **Notebook Generation**: Server-side template-based `.ipynb` generation from HF sources.

## 3. Minimal Supabase Schema (Sprint Implementation)
Single table design to reduce complexity and enable rapid development.

```sql
create extension if not exists pgcrypto;

create table if not exists public.matches (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  share_id text unique not null,
  model_a text not null,
  model_b text not null,
  system_prompt text,
  prompts jsonb not null,
  outputs jsonb,           -- { items: [{prompt, a, b, a_ms, b_ms}] }
  scoring jsonb,           -- { winner: 'A'|'B'|'tie', votes: {...}, rubric: {...} }
  meta jsonb               -- { client_version, notes, recipe: { models: [model_a, model_b], prompts: [p1,p2,p3], title, emoji } }
);

create index if not exists matches_share_idx on public.matches(share_id);
```

**Key Design Decisions:**
- **No RLS for sprint** - Only server writes using service role key
- **JSON payloads** - Store prompts, outputs, and metadata as JSON to avoid joins
- **Share ID** - Unique identifier for public sharing and remixing
- **Recipe metadata** - Complete card selection stored in `meta.recipe` for remix functionality

## 4. Core API Endpoints (Sprint Implementation)

### Match Management
- `POST /api/match` → Create and run model comparison
  - Request: `{ model_a, model_b, system_prompt, prompts: [string] }`
  - Response: `{ share_id, outputs: [{prompt, a, b, a_ms, b_ms}] }`

- `POST /api/match/:share_id/score` → Store winner selection
  - Request: `{ winner: 'A'|'B'|'tie', votes?: {...}, rubric?: {...} }`
  - Response: `{ ok: true }`

- `GET /api/match/:share_id` → Fetch match results
  - Response: Full match row JSON including recipe metadata

### Notebook Generation
- `GET /api/notebook?hf_model={org/name}&task=chat&share_id=...` → Download `.ipynb`
  - Fetches HF model metadata and README
  - Extracts first suitable Python snippet or widget example
  - Falls back to generic snippet based on `pipeline_tag`
  - Returns runnable notebook with:
    - Environment setup cell
    - Hello cell (minimal verification)
    - HF sample section
    - Recipe metadata (if share_id provided)

## 5. Model Comparison Arena Flow

### 5.1. Card Deck Interface
- **Model Cards**: Selectable tiles showing `gpt-4o-mini` vs `gpt-4o` or HF models
- **Prompt Cards**: 3-pack of predefined prompts with inline editing
- **Recipe Bar**: Visual summary of selected models and prompts

### 5.2. Comparison Execution
1. Client sends selected models and prompts to `/api/match`
2. Server calls OpenAI/HF Inference APIs in parallel
3. Results stored with latency metrics and token counts
4. Side-by-side display with performance badges

### 5.3. Sharing & Remixing
- **Share Page**: Read-only view with results and recipe summary
- **Remix Button**: Opens Arena with pre-selected cards from `meta.recipe`
- **Persistent Links**: Shareable URLs that load identical results

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

### 6.3. Template Categories
- **"Speed vs Smarts"** ⚡🧠: `gpt-4o-mini` vs `Llama-3.1-8B-Instruct`
- **"Structured Output Showdown"** 🧩: JSON-focused prompts
- **"Security Lens"** 🛡️: Security-focused prompt variations

## 7. Sprint Timeline (3-Hour Implementation)

### 0:00–0:20: Setup & Infrastructure
- Create Supabase table with schema
- Set environment variables (Supabase, OpenAI, HF tokens)
- Scaffold routes: `/arena`, `/share/[share_id]`, `/api/*`

### 0:20–1:05: Arena Happy Path
- Implement hardcoded model presets
- Build `POST /api/match` with OpenAI/HF Inference API calls
- Create Model/Prompt Card UI components
- Wire selection state to request payload and `meta.recipe` serialization
- Display side-by-side outputs with performance metrics

### 1:05–1:50: Notebook Generator
- Implement `GET /api/notebook` endpoint
- HF API integration for model metadata and README fetching
- Template-based `.ipynb` generation
- Hello cell verification (dry run validation)

### 1:50–2:20: Share Page & Remixing
- Implement `GET /api/match/:share_id` endpoint
- Build `/share/[share_id]` page with recipe summary
- Add "Remix" CTA linking to `/arena?from={share_id}`

### 2:20–2:45: Figma Polish & Demo Prep
- Align Figma frames to working UI
- Add Model/Prompt card visuals and Recipe bar
- Script 90-second demo narrative

### 2:45–3:00: Buffer & Fail-safes
- Add static fallback outputs for API failures
- Pre-generate sample share link and notebook file
- Final testing and demo rehearsal

## 8. Environment Variables & Configuration

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# AI APIs
OPENAI_API_KEY=your-openai-key
HF_API_TOKEN=your-huggingface-token

# Presets (hardcoded for sprint)
DEFAULT_MODELS=["openai:gpt-4o-mini", "hf:meta-llama/Llama-3.1-8B-Instruct"]
DEFAULT_SYSTEM_PROMPT="Helpful assistant; answer concisely."
DEFAULT_PROMPTS=[
  "Explain RAG in one paragraph for a product manager.",
  "Write a JSON schema for a blog post with title, body, tags.",
  "List 5 risks of LLM evaluations and a quick mitigation for each."
]
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
