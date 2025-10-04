# Alacard - Notebook Generator Platform

A 3-hour sprint implementation of a notebook generation platform that creates downloadable Jupyter notebooks from Hugging Face models with real code examples.

## Features

- **Model Selection**: Browse and select from popular Hugging Face models
- **Automated Notebook Generation**: Extracts code examples from model READMEs
- **Downloadable Notebooks**: Get ready-to-run `.ipynb` files
- **Shareable Results**: Generate share links for generated notebooks
- **Model Categories**: Filter models by task type (Text Generation, Classification, etc.)
- **Real Examples**: Uses actual code from model documentation

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

### 4. Run Development Server

```bash
npm run dev
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

### FastAPI Backend (Planned)
- `GET /api/v1/models/popular` - Get popular HF models
- `GET /api/v1/models/search` - Search models by category
- `POST /api/v1/notebook/generate` - Start notebook generation task
- `GET /api/v1/notebook/task/{task_id}` - Get task status and progress
- `GET /api/v1/notebook/{share_id}` - Get notebook metadata
- `GET /api/v1/notebook/download/{share_id}` - Download `.ipynb` file
- `WebSocket /ws/progress/{task_id}` - Real-time progress updates

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

### FastAPI Backend (Planned)
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
├── app/
│   ├── api/                 # API routes
│   │   ├── models/          # Model discovery endpoints
│   │   └── notebook/        # Notebook generation endpoints
│   ├── generator/           # Model selection interface
│   ├── share/[shareId]/     # Share page for notebooks
│   └── layout.tsx           # Root layout
├── components/              # React components
│   ├── ModelCard.tsx
│   ├── GenerateButton.tsx
│   ├── CategoryFilter.tsx
│   ├── LoadingSpinner.tsx
│   └── NotebookResult.tsx
├── lib/                     # Utilities and presets
│   ├── supabase.ts
│   ├── presets.ts
│   └── notebook-generator.ts
├── types/                   # TypeScript definitions
└── public/                  # Static assets
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

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Node.js
- **Database**: Supabase (PostgreSQL)
- **External APIs**: Hugging Face Model API, Hugging Face Files API
- **Styling**: Tailwind CSS with custom components

## Limitations & Future Work

### Current Limitations
- No user authentication (anonymous access only)
- Limited to predefined popular models
- Basic notebook template structure
- No notebook customization options

### Future Enhancements
- User accounts for personal notebook libraries
- Enhanced model search and filtering
- Notebook customization options
- Integration with Google Colab
- Background processing for large models
- Advanced template variations

## License

MIT License - see LICENSE file for details.