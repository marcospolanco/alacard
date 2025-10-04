# Alacard — Notebook Generator (3‑Hour Demo PRD)

This is a time‑boxed plan to ship a working demo today using Supabase for persistence and a Figma Make prototype for flows. It trims scope to a single, reliable path and defines concrete deliverables we can show live at the end of the sprint.

## Objective (Done = Demoable End‑to‑End)

- **Notebook Generator**: Simple UI where users select an HF model and generate a downloadable `.ipynb` notebook with real code examples from the model's README.
- **Supabase persistence**: store generated notebooks and share metadata; share page reads from Supabase by `share_id`.
- **"Run as Notebook" button**: generates and downloads a runnable `.ipynb` that pulls the latest samples from Hugging Face for the selected HF model (README snippets or widget examples) and includes a verified hello cell.
- **Figma prototype**: click‑through of the broader experience (model selection → notebook generation → share → download), matching the live demo UI.
- **Shareable notebooks**: users can click "Share" on any generated notebook to create a shareable link that allows others to download the same notebook.

Non‑goals for the sprint

- No agentic multi‑step notebook synthesis; we do direct templating using HF sources.
- No complex multi‑task support; text‑generation/text‑to‑text only.
- No auth/RLS; if needed, simple anon writes with a service key on server only.

## Demo Script (What we will show)

1) Open Figma and narrate the flow (60–90s), highlighting the model selection interface with popular HF models and their descriptions.
2) Open the live notebook generator page, select a model (e.g., `meta-llama/Llama-3.1-8B-Instruct`), click "Generate Notebook", and watch as the system fetches the model's README and extracts code examples.
3) Download the generated `.ipynb` file, open it locally (Jupyter/VS Code), and run the cells to show a working example with the selected model.
4) Copy share link, open it in a fresh tab and see the model selection and notebook generation interface pre‑filled with the same model.

## Thin Architecture (Today)

- Frontend: single‑page Notebook Generator + Share using Next.js/React.
- API routes: server‑side calls to Hugging Face API for model metadata and README fetching.
- Supabase: one table for notebooks with JSON payloads to avoid joins. Store the selected model and generation metadata.
- Notebook generator: server endpoint that fetches latest HF samples (README and/or widget examples) and injects them into a `.ipynb` template; verifies a hello cell locally by simulating a minimal call (string presence or dry run) before returning.

## Minimal Supabase Schema (SQL)

Use a single table to reduce complexity; store notebook metadata as JSON.

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

RLS: disabled for sprint. Only server writes using service key.

## Endpoints (Shape only)

- `POST /api/notebook` → generate + save
  - body: `{ hf_model_id: string }`
  - returns: `{ share_id, notebook_url: "/api/notebook/download/{share_id}" }`

- `GET /api/notebook/:share_id` → fetch
  - returns: full `notebook` row JSON with metadata

- `GET /api/notebook/download/:share_id` → download `.ipynb`
  - returns: downloadable Jupyter notebook file (.ipynb format)
  - Behavior: fetch HF model metadata and README; extract first suitable Python snippet or widget text sample; fall back to generic snippet based on `pipeline_tag`.
  - returns: runnable notebook with env setup, HF sample section, and a hello cell.

- `GET /api/models/popular` → get popular models
  - returns: `[{ id: string, name: string, description: string, downloads: number, pipeline_tag: string }]`

- Share behavior (client‑side): Share page has a "Generate New" button that opens `/generator?model={hf_model_id}` pre‑filled with the same model.

## Components (UI + System)

UI — Sprint scope
- Arena: Model Cards, Prompt Cards, Recipe Bar; Run action; side‑by‑side Output Viewer with badges (ms, tokens); Winner selector; Share + Remix; Run as Notebook.
- Share Page: read‑only results (outputs, metrics, winner) and Recipe summary; primary CTA: Remix.
- Notebook Trigger: button in Arena that calls notebook generator and downloads `.ipynb`.

UI — Optional/next (if time allows)
- Chat UI (single model): model selector, system prompt, message thread with streaming; mini badges (ms/tokens); “Promote to Arena” to compare against another model using the last N messages as a Prompt Card pack.
- Presets Manager: simple JSON‑backed list for Model/Prompt Card presets; edit inline and save to `meta.recipe`.
- Evaluation Panel: lightweight rubric selector and votes UI that populates `scoring.rubric` and `votes`.

System modules
- Inference adapters: OpenAI and HF Inference API clients with a thin normalization layer (inputs/outputs + timing).
- Persistence: Supabase `matches` table holding prompts, outputs, scoring, and `meta.recipe`.
- Notebook generator: server endpoint that assembles a runnable `.ipynb` from HF metadata/README and recipe context.
- Presets registry: static JSON for sprint; later backed by DB with provenance (source `share_id`).
- Telemetry/logging (optional): request ids and basic timing to aid demo reliability.

Figma coverage
- Provide frames for Arena, Share, and a stub Chat UI. Keep visuals matched to the implemented card primitives and Recipe bar. See `alacard/figma-make-docs.md` for notes.

## Env Vars

- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` (server only)
- `HF_API_TOKEN` (for HF model API and rate‑limit friendly README fetch)

## Presets (Hardcoded for Speed)

- Popular models (Model Cards): Curated list of popular HF models for quick selection:
  - `meta-llama/Llama-3.1-8B-Instruct` (General purpose, 8B parameters)
  - `microsoft/DialoGPT-medium` (Conversational AI)
  - `distilbert-base-uncased` (Text classification/NER)
  - `facebook/bart-large-cnn` (Text summarization)
  - `google/flan-t5-base` (Instruction following)

- Default notebook target model: `meta-llama/Llama-3.1-8B-Instruct`

Model categories:
- **Chat & Dialogue**: conversational models, instruction-following models
- **Text Generation**: story writing, content creation models
- **Classification & NER**: text analysis, entity extraction models
- **Summarization**: long-form text summarization models
- **Code Generation**: programming and code completion models

## Notebook Template (Runnable, HF‑Sourced)

Cells (generated server‑side):
- Markdown title: “Alacard | {hf_model_id} Quickstart” with model license + link to HF card.
- Code: env setup; installs `transformers`, `huggingface_hub` (and `requests` if using Inference API).
- Code (hello cell): minimal call using HF Inference API or `transformers` pipeline chosen by `pipeline_tag` (text‑generation/text2text).
- Markdown: “Samples from Model Card” with the first extracted example prompt/code.
- Code: runnable sample adapted from README/widget (sanitized for keys/paths).
- Markdown: “Recipe used” showing selected models and prompts (if `share_id` set).
- Markdown: next steps + link back to share page.

Sourcing logic (order):
1) GET `https://huggingface.co/api/models/{hf_model_id}` to read `pipeline_tag`, `tags`, and commit SHA.
2) Fetch README at the latest commit (`.../resolve/{sha}/README.md`); extract the first Python fenced block; if none, extract the first code‑fenced text prompt.
3) If README lacks examples, fallback to a generic snippet based on `pipeline_tag`.
4) Inject model id and sample into the notebook cells.

## UI Deliverables (Today)

- Arena page (Card Deck): two Model Cards (selectable tiles with emoji + short blurb), a 3‑pack of Prompt Cards (chips with edit affordance), Run button, outputs side‑by‑side with mini badges (ms, tokens), Winner selector, “Share link,” “Remix,” and “Run as Notebook.”
- Share page: read‑only view of outputs and winner; copy link.
- Share page: read‑only view of outputs, winner, and a Recipe summary (cards rendered as tiles). Primary CTA: “Remix this recipe.”
- Figma: matching flow with simple visual polish, annotated with captions, including Model/Prompt card visuals and a Recipe summary bar.

Card primitives (for this sprint):
- Model Card: title, provider icon (OpenAI/HF), subtitle (e.g., “fast”/“open”), emoji, and selection state.
- Prompt Card: prompt text (single line truncation), emoji, and editable icon to tweak text inline.
- Recipe Bar: compact summary of 2 models + 3 prompts with a fun emoji and title.

## Timeline (Now → +3h)

- 0:00–0:20 Setup
  - Create Supabase table; seed one test match; set env vars.
  - Scaffold routes: `/arena`, `/share/[share_id]`, `/api/*`.

- 0:20–1:05 Arena “happy path”
  - Hardcode presets; implement `POST /api/match` calling OpenAI and/or HF Inference API.
  - Render Model/Prompt Cards (static tiles); wire selection state to request payload and also serialize into `meta.recipe`.
  - Render side‑by‑side outputs; compute latencies; allow winner select; save via `/score`.

- 1:05–1:50 Notebook generator (HF)
  - Implement `GET /api/notebook` to: fetch HF metadata, fetch README at latest commit, extract snippet, pick pipeline, inject model id, and return `.ipynb`.
  - Verify hello cell locally by constructing payload without sending keys (dry run or static validation).

- 1:50–2:20 Share page
  - Implement `GET /api/match/:share_id` + `/share/[share_id]` page.
  - Render Recipe summary and add “Remix” CTA linking to `/arena?from={share_id}`.

- 2:20–2:45 Figma polish + demo rehearsal
  - Align Figma frames to working UI; add captions; include card visuals and Recipe bar; script the 90‑second talk track.

- 2:45–3:00 Buffer & fail‑safes
  - Add static fallback outputs if APIs fail; pre‑generate one share link and one notebook file.

## Risks & Fast Fallbacks

- HF README lacks runnable snippet → fall back to generic `transformers` or Inference API snippet using `pipeline_tag`.
- Inference fails or rate‑limited → serve pre‑baked outputs; banner “live inference unavailable; showing cached result.”
- Supabase write fails → write to local memory (in‑process map) and continue demo; share link maps to memory fallback.
- Time crunch → remove winner voting; just display outputs and a static winner.
 - Card UI too heavy → fall back to dropdowns and textareas, but keep the Recipe summary and Remix link so the concept still demos.

## Success Criteria (Sprint)

- Live demo runs start‑to‑finish without manual data entry.
- One copy‑paste share link loads identical results on a fresh browser.
- Notebook opens and the hello cell returns a completion.
- “Remix” from a share page opens Arena with preselected Model/Prompt Cards.

## After Sprint (Next 1–2 days)

- Add RLS + simple auth; convert anon writes to user‑scoped writes.
- Add HF Inference adapter and one OSS model preset.
- Add basic evaluator rubric and export of an HTML report.
 - Community Recipes: publish, fork, and remix recipe cards; add lightweight provenance trail (source share_id) to `meta.recipe`.
 - Visual polish: animations for card selection, confetti on winner selection, themed palettes per recipe.

Reference: full product PRD lives at `alacard/alacard-prd.md`.
