# Alacard — Supabase Sprint (3‑Hour Demo PRD)

This is a time‑boxed plan to ship a working demo today using Supabase for persistence and a Figma Make prototype for flows. It trims scope to a single, reliable path and defines concrete deliverables we can show live at the end of the sprint.

## Objective (Done = Demoable End‑to‑End)

- Live Arena demo (card deck): pick from visual cards for models and prompts, run a head‑to‑head chat on 3 preset prompts, show outputs side‑by‑side, choose a winner, and save a shareable link.
- Supabase persistence: store the match and results; share page reads from Supabase by `share_id`.
- “Run as Notebook” button: generates and downloads a runnable `.ipynb` that pulls the latest samples from Hugging Face for the selected HF model (README snippets or widget examples) and includes a verified hello cell.
- Figma prototype: click‑through of the broader experience (Arena setup → streaming → decision → share → notebook), matching the live demo UI.
- Remixable recipes: users can click “Remix” on any share page to open the Arena pre‑filled with the same card deck (models + prompts), tweak a card, and generate a new share link.

Non‑goals for the sprint

- No agentic multi‑step notebook synthesis; we do direct templating using HF sources.
- No complex multi‑task support; text‑generation/text‑to‑text only.
- No auth/RLS; if needed, simple anon writes with a service key on server only.

## Demo Script (What we will show)

1) Open Figma and narrate the flow (60–90s), highlighting the visual card deck: Model Cards on the left, Prompt Cards on the right, and a Recipe Bar summarizing the selection.
2) Open the live Arena page, choose two Model Cards (e.g., `openai:gpt-4o-mini` vs `openai:gpt-4o`) and a Prompt Card pack of 3. Run, watch outputs populate side‑by‑side with small per‑card badges (latency, token count).
3) Pick winner and see a score. Copy share link, open it in a fresh tab and see static results including the recipe summary. Click “Remix” to open Arena with the same cards pre‑selected; swap a Model Card and re‑run.
4) Click “Run as Notebook” → download `.ipynb` → open locally (Jupyter/VS Code) → run env cell + hello cell.

## Thin Architecture (Today)

- Frontend: single‑page Arena + Share using Next.js/React.
- API routes: server‑side calls OpenAI and/or HF Inference API; returns outputs (batch or SSE if time).
- Supabase: one table for matches with JSON payloads to avoid joins. Store the selected recipe (card choices) inside `meta.recipe`.
- Notebook generator: server endpoint that fetches latest HF samples (README and/or widget examples) and injects them into a `.ipynb` template; verifies a hello cell locally by simulating a minimal call (string presence or dry run) before returning.

## Minimal Supabase Schema (SQL)

Use a single table to reduce complexity; store prompts/outputs as JSON.

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

RLS: disabled for sprint. Only server writes using service key.

## Endpoints (Shape only)

- `POST /api/match` → create + run
  - body: `{ model_a, model_b, system_prompt, prompts: [string] }`
  - returns: `{ share_id, outputs: [{prompt, a, b, a_ms, b_ms}] }`

- `POST /api/match/:share_id/score` → store winner
  - body: `{ winner: 'A'|'B'|'tie', votes?: {...}, rubric?: {...} }`
  - returns: `{ ok: true }`

- `GET /api/match/:share_id` → fetch
  - returns: full `match` row JSON

- Remix behavior (client‑side): Share page has a “Remix” button that opens `/arena?from={share_id}`. The Arena reads `meta.recipe` from the fetched match JSON and pre‑selects the same Model and Prompt Cards.

- `GET /api/notebook?hf_model={org/name}&task=chat&share_id=...` → download `.ipynb`
  - Behavior: fetch HF model metadata and README; extract first suitable Python snippet or widget text sample; fall back to generic snippet based on `pipeline_tag`.
  - returns: runnable notebook with env setup, HF sample section, and a hello cell. If `share_id` provided, include a markdown cell describing the recipe used (model selection and prompt set) for traceability.

## Env Vars

- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` (server only)
- `OPENAI_API_KEY`
- `HF_API_TOKEN` (for HF Inference API and rate‑limit friendly README fetch if required)

## Presets (Hardcoded for Speed)

- Arena models (Model Cards): `openai:gpt-4o-mini` vs `hf:meta-llama/Llama-3.1-8B-Instruct` via HF Inference API (or swap to another stable instruct model).
- Notebook target model: default to the selected HF model for notebook generation.
- System prompt: “Helpful assistant; answer concisely.”
- Prompt Cards (3‑pack):
  1. “Explain RAG in one paragraph for a product manager.”
  2. “Write a JSON schema for a blog post with title, body, tags.”
  3. “List 5 risks of LLM evaluations and a quick mitigation for each.”

Recipe starters (visual + fun):
- “Speed vs Smarts” ⚡🧠: `gpt-4o-mini` vs `Llama‑3.1‑8B‑Instruct`, above 3 prompts.
- “Structured Output Showdown” 🧩: same models; replace prompt #2 with “Return JSON with keys title, tags, summary.”
- “Security Lens” 🛡️: swap prompt #3 with “Name 5 prompt‑injection vectors + mitigations.”

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
