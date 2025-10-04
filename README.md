# Alacard Arena - AI Model Comparison Platform

A 3-hour sprint implementation of an AI model comparison arena with shareable results and notebook generation.

## Features

- **Model Comparison**: Compare AI models side-by-side with visual card interface
- **Prompt Cards**: Editable prompt cards for testing different scenarios
- **Shareable Results**: Generate share links for comparisons
- **Remix Functionality**: Allow others to remix and modify existing comparisons
- **Notebook Generation**: Export comparisons as runnable Jupyter notebooks
- **Real-time Results**: See performance metrics (latency, token counts)

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

# AI API Keys
OPENAI_API_KEY=your-openai-api-key
HF_API_TOKEN=your-huggingface-token
```

### 2. Database Setup

1. Create a Supabase project
2. Run the migration script:

```sql
-- Run this in your Supabase SQL editor
create extension if not exists pgcrypto;

create table if not exists public.matches (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  share_id text unique not null,
  model_a text not null,
  model_b text not null,
  system_prompt text,
  prompts jsonb not null,
  outputs jsonb,
  scoring jsonb,
  meta jsonb
);

create index if not exists matches_share_idx on public.matches(share_id);

alter table public.matches disable row level security;
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Architecture

### Frontend (Next.js)
- **Arena Page**: Model and prompt selection with comparison interface
- **Share Page**: Read-only results display with remix functionality
- **Home Page**: Landing page with feature overview

### Backend (Next.js API Routes)
- `/api/match` - Create and run model comparisons
- `/api/match/[shareId]` - Fetch comparison results
- `/api/match/[shareId]/score` - Save winner selection
- `/api/notebook` - Generate downloadable Jupyter notebooks

### Database (Supabase)
- Single `matches` table storing all comparison data
- JSON payloads for prompts, outputs, and metadata
- Share IDs for public access and remixing

## API Endpoints

### POST /api/match
Create and run a model comparison.

**Request:**
```json
{
  "model_a": "gpt-4o-mini",
  "model_b": "meta-llama/Llama-3.1-8B-Instruct",
  "prompts": ["Explain RAG in one paragraph..."]
}
```

**Response:**
```json
{
  "share_id": "abc12345",
  "outputs": [
    {
      "prompt": "Explain RAG...",
      "a": "RAG is a technique...",
      "b": "Retrieval-augmented generation...",
      "a_ms": 1250,
      "b_ms": 2100
    }
  ]
}
```

### GET /api/match/[shareId]
Fetch comparison results for display.

### POST /api/match/[shareId]/score
Save winner selection for a comparison.

### GET /api/notebook?hf_model={model}&share_id={id}
Generate and download a Jupyter notebook based on comparison.

## Default Models & Prompts

### Models
- **GPT-4o Mini** (OpenAI): Fast and efficient
- **Llama 3.1 8B** (Hugging Face): Open source powerhouse

### Prompt Templates
- **Speed vs Smarts** ⚡🧠: Compare performance vs capability
- **Structured Output Showdown** 🧩: Test JSON generation
- **Security Lens** 🛡️: Evaluate security awareness

## Development

### Project Structure

```
alacard/
├── app/
│   ├── api/                 # API routes
│   ├── arena/               # Model comparison interface
│   ├── share/[shareId]/     # Shared results page
│   └── layout.tsx           # Root layout
├── components/              # React components
│   ├── ModelCard.tsx
│   ├── PromptCard.tsx
│   ├── RecipeBar.tsx
│   └── ComparisonResults.tsx
├── lib/                     # Utilities and presets
│   ├── supabase.ts
│   ├── presets.ts
│   └── notebook-generator.ts
├── types/                   # TypeScript definitions
└── public/                  # Static assets
```

### Adding New Models

1. Update `lib/presets.ts` with new model entries
2. Add corresponding API handling in `/api/match/route.ts`
3. Update model card styling if needed

### Customizing Prompts

Edit the `DEFAULT_PROMPTS` array in `lib/presets.ts` to change default prompt templates.

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

1. **Open Arena**: Select 2 models and 3 prompts from the card deck
2. **Run Comparison**: Click "Run Comparison" and watch results populate
3. **Select Winner**: Choose the better response and save results
4. **Share Results**: Copy share link and open in new browser
5. **Remix Recipe**: Click "Remix" to modify the comparison
6. **Generate Notebook**: Download and run the generated Jupyter notebook

## Technology Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Node.js
- **Database**: Supabase (PostgreSQL)
- **AI APIs**: OpenAI API, Hugging Face Inference API
- **Styling**: Tailwind CSS with custom components

## Limitations & Future Work

### Current Limitations
- No user authentication (anonymous access only)
- Limited to text generation models
- Single comparison per session
- Basic error handling

### Future Enhancements
- User accounts and authentication
- Multi-model comparisons
- Advanced metrics and analytics
- Community recipe library
- Model fine-tuning integration
- Real-time streaming responses

## License

MIT License - see LICENSE file for details.