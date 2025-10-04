# Alacard Design System Guidelines

Use these rules when generating Alacard UI, marketing collateral, or documentation. They align with the Notebook Generator PRD and the cards-driven brand system.

## Experience Pillars
- **Card-first thinking**: Every flow revolves around choosing Model, Prompt, Topic, Difficulty, and UI Component cards. Always surface selected cards in a persistent summary bar.
- **Fast hand-offs**: Designs should feel "dealable." Make it obvious how to shuffle, select, remix, and share recipes.
- **Runnable confidence**: Copy and visuals must convince users the generated notebook will run without edits. Highlight clarity and pragmatism over flourish.
- **YC-ready polish**: Minimal, confident layout with restrained motion and strong contrast. Cute mascots or emojis can appear, but keep them secondary to the cards.

## Layout & Density
- Base grid: multiples of 8px for spacing; 24px padding on page edges, 16px inside cards.
- Max content width for desktop generator pages: 1200px.
- Use responsive multi-column layouts (3 or 4 columns) for card galleries. Collapse to 1 column on mobile.
- Keep a persistent Recipe Bar pinned to top or bottom with compact card chips and the primary CTA.
- Cards stack in logical groups: Model -> Prompt -> Topic -> Difficulty -> UI Component.

## Typography
- Font family everywhere: Inter (variable). Weight 600 for headings, 500 for labels/CTAs, 400 body.
- Use tabular numerals for metrics, tokens, and counts (`font-variant-numeric: tabular-nums`).
- Typographic scale (desktop):
  - Display/hero: 48/56, weight 600.
  - Section headings: 28/36, weight 600.
  - Card titles: 18/26, weight 600.
  - Body copy: 16/24, weight 400.
  - Helper text / metadata: 14/20, weight 400 with `--ink-subtle` color.

## Color & Theme
- Neutral surface: light theme `#FFFFFF`, dark theme `#0B0F14`. Never use pure black.
- Neutral text: light theme `#0F172A`, dark theme `#E2E8F0`. Subtle text uses `#334155` / `#94A3B8`.
- Focus ring: `#2563EB` at 1-2px; maintain on keyboard focus.
- Card header/badge colors must use the defined palettes below. Pair them with neutral bodies.

### Card Palettes (Light)
- **Model**: header `#EDF3FF`, border `#C7D6FF`, accent text/icons `#2E6BFF`.
- **Components**: header `#FFF3E7`, border `#FFD8B0`, accent `#FF7A1A`.
- **Complexity**:
  - Easy: header `#E8F8F0`, border `#BFEAD8`, accent `#2ECF8D`.
  - Medium: header `#FFF6E5`, border `#FFE2A8`, accent `#FF9D00`.
  - Hard: header `#FDEBEC`, border `#F6C2C6`, accent `#E5484D`.

### Card Palettes (Dark)
- **Model**: header `#0B1224`, border `#1E2B55`, accent `#6D9BFF`.
- **Components**: header `#22150A`, border `#3C2613`, accent `#FF9A4D`.
- **Complexity**:
  - Easy: header `#0E1A16`, border `#19392D`, accent `#66E3B1`.
  - Medium: header `#1D1608`, border `#3C2C10`, accent `#FFB454`.
  - Hard: header `#261113`, border `#4C2125`, accent `#FF7077`.

## Card Anatomy & Patterns
- Shell: 8px radius, 1px neutral border, subtle elevation (shadow 0 6px 20px -12px rgba(15,23,42,0.4)).
- Header strip (40-48px tall) uses the card palette background and accent color for title/icon.
- Body content: neutral background; include primary label, supporting description, optional metadata list.
- Footer (if needed): chips/badges for capabilities or counts.
- Include emoji or simple icon aligned left of header text to support quick scanning.

### Specific Card Rules
- **Model Card**: show vendor:id in code style (`font-family: ui-monospace`) below the label. Include downloads or capability tag.
- **Prompt Card**: preview 2-3 prompt bullets; keep to two lines each. Use accent icon representing pack theme.
- **Topic Card**: large emoji + short label (<=20 characters). Background stays neutral; use accent border only.
- **Difficulty Card**: three fixed levels. Reinforce level with emoji (seedling/herb/tree) and a one-sentence description tuned to notebook guidance.
- **UI Component Card**: include component name, underlying tech (Gradio/Streamlit/etc.), and preview snippet or small diagram.
- Selection states: increase border width to 2px using accent color and add subtle 8px glow (`box-shadow: 0 0 0 4px` of accent at 12% opacity).

## Controls & CTAs
- Primary CTA color: reuse Model accent `#2E6BFF` light, `#6D9BFF` dark.
- Secondary CTA: outlined button with 1px neutral border and text in `--ink` / `--ink-subtle`.
- Shuffle button: pill shape (radius 999px), accent `#FF7A1A`, icon of shuffle/playing cards.
- Share/Remix actions live near the Recipe Bar, grouped with the primary CTA.

## Motion & States
- Hover: lift cards by 4px, increase shadow, keep border intact.
- Press: return card to rest elevation with 95% scale for 120ms.
- Shuffle interaction: animate cards riffle (short 150ms ease-out). Avoid excessive motion.
- Provide skeleton states when loading cards or notebooks; use neutral shimmer blocks.

## Copy & Tone
- Voice: confident, helpful, slightly playful. Avoid jargon when describing steps.
- Replace generic "AI" terms with concrete actions ("Generate notebook", "Deal me a hand").
- In tooltips and helper text, explain why a choice matters (e.g., "Medium complexity adds evaluation cells").

## Accessibility
- Maintain AA contrast for all text; verify card header text vs. background.
- Ensure all interactive elements have 44px min touch targets.
- Provide keyboard focus order following card grouping. Shuffle and Generate buttons must be reachable via keyboard alone.
- Pair emojis with text labels for screen readers.

## Architecture Snapshot
- **Frontend (Next.js)**: Generator page (model selection and notebook generation interface), Share page (view and download generated notebooks), Home page (landing page with feature overview).
- **Backend (Next.js API routes)**: `/api/models/popular`, `/api/models/search`, `/api/notebook/generate`, `/api/notebook/[shareId]`, `/api/notebook/download/[shareId]` support the legacy synchronous workflow.
- **FastAPI backend**: `/api/v1/models/popular`, `/api/v1/models/search`, `POST /api/v1/notebook/generate`, `GET /api/v1/notebook/task/{task_id}`, `GET /api/v1/notebook/{share_id}`, `GET /api/v1/notebook/download/{share_id}`, `GET /api/v1/notebook/{share_id}/validation`, plus WebSocket `/ws/progress/{task_id}` for real-time progress updates.
- **Celery background tasks**:
  - Task Queue: Redis-based distributed task processing.
  - Progress Tracking: Real-time progress updates via Redis pub/sub.
  - Error Handling: Comprehensive error management and retry logic.
  - Async Integration: Seamless async/await support for background processing.
- **Database (Supabase)**:
  - `notebooks` table — store generated notebooks and metadata.
  - Public access for demo (no authentication).
  - Share IDs for public notebook access.

### API Endpoint Details
- **Next.js API routes (current)**
  - `GET /api/models/popular` — popular Hugging Face models.
  - `GET /api/models/search?category=text-generation` — search models by category.
  - `POST /api/notebook/generate` — synchronous notebook generation.
  - `GET /api/notebook/[shareId]` — notebook metadata.
  - `GET /api/notebook/download/[shareId]` — downloadable `.ipynb`.
- **FastAPI backend (implemented)**
  - `GET /api/v1/models/popular` — popular models.
  - `GET /api/v1/models/search?category=text-generation` — category search.
  - `POST /api/v1/notebook/generate` — body `{ "hf_model_id": "meta-llama/Llama-3.1-8B-Instruct" }` returns `{ "task_id": "uuid", "estimated_time": 30 }`.
  - `GET /api/v1/notebook/task/{task_id}` — returns `status`, `progress`, `current_step`, `share_id` (when complete).
  - `GET /api/v1/notebook/{share_id}` — notebook metadata.
  - `GET /api/v1/notebook/download/{share_id}` — notebook file.
  - `GET /api/v1/notebook/{share_id}/validation` — validation results.
  - `WebSocket /ws/progress/{task_id}` — emits `{ type: "progress", data: { progress, current_step, message } }`.

### WebSocket Progress Updates
- The FastAPI backend streams real-time progress via WebSocket `/ws/progress/{task_id}`.
- Sample payload:
```
{
  "type": "progress",
  "data": {
    "progress": 45,
    "current_step": "Generating notebook cells",
    "message": "Processing model README..."
  }
}
```

### Supported Model Categories
- Text Generation, Chat & Dialogue, Classification & NER, Summarization, Instruction Following, Translation, Code Generation.

### Notebook Template Structure (7 cells)
Generated notebooks follow a consistent 7-cell structure:
1. Title & Attribution — model information and links.
2. Environment Setup — install required packages.
3. Hello Cell — basic model verification.
4. Model Information — pipeline details and usage.
5. README Example — real code from model documentation.
6. Generic Example — fallback template.
7. Next Steps — additional resources and links.

### Development Structure
```
alacard/
├── packages/backend/
│   ├── app/
│   │   ├── api/v1/
│   │   │   ├── endpoints/
│   │   │   └── __init__.py
│   │   ├── core/
│   │   │   ├── config.py
│   │   │   ├── database.py
│   │   │   └── celery_app.py
│   │   ├── models/
│   │   │   └── notebook.py
│   │   ├── services/
│   │   │   ├── huggingface.py
│   │   │   ├── notebook_generator.py
│   │   │   └── progress_tracker.py
│   │   ├── tasks/
│   │   │   └── notebook_tasks.py
│   │   └── main.py
│   ├── requirements-minimal.txt
│   └── .env.example
├── app/
│   ├── api/
│   ├── generator/
│   ├── share/[shareId]/
│   └── layout.tsx
├── components/
│   ├── ModelCard.tsx
│   ├── GenerateButton.tsx
│   ├── CategoryFilter.tsx
│   ├── LoadingSpinner.tsx
│   └── NotebookResult.tsx
├── lib/
│   ├── backend-api.ts
│   ├── presets.ts
│   ├── supabase.ts
│   └── hooks/
│       └── useWebSocketProgress.ts
├── types/
├── quick-start.sh
├── start.sh
└── pnpm-workspace.yaml
```

### Ops Notes
- **Adding new models**:
  - Update `lib/presets.ts` with new model entries.
  - Add category if needed.
  - Update notebook generation logic if a model requires special handling.
- **Customizing notebook templates** (edit `lib/notebook-generator.ts`):
  - Cell structure and content.
  - Template variations by model type.
  - Code extraction strategies.

## Assets & Illustration
- Favor flat vector mascot or simple glyphs tied to cards. Avoid photorealism.
- Icons should be 20-24px line or duotone style with accent color. Keep them consistent across cards.

## Handoff Notes for Figma Make
- Store card primitives as components with variants for type and state (default, hover, selected, disabled).
- Use auto layout for card lists and the Recipe Bar to support responsive behavior.
- Document token variables according to `globals.css`; reference CSS variable names in layer descriptions.
- Include example screens: Generator (desktop + mobile), Share page, Remix modal, Notebook download toast.
- Attach brand swatches and typography styles in the Figma library for quick reuse.
