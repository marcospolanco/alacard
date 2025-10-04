# AI Model Cookbook Generator - PRD

## Overview
A platform that ingests GitHub repositories corresponding to Hugging Face models, stores them in user workspaces, and generates customized Jupyter notebook cookbooks to help users effectively use these models.

## Core Features

### 1. Repository Ingestion System
- Connect to GitHub repositories
- Parse repository structure and content
- Link repositories to Hugging Face models

### 2. User Workspace Management
- Personal workspaces for each user
- Repository organization within workspaces
- User authentication and authorization

### 3. Hugging Face Integration
- Fetch comprehensive model metadata:
  - Model info: modelId, author, sha, createdAt, lastModified, downloads, likes, tags
  - Model card data: description, usage, limitations, license, citation
  - Pipeline information: supported tasks, input/output formats
  - File structure: model files, configuration files, examples
  - Community metrics: downloads, likes, discussion activity
- Extract model capabilities, usage patterns, and examples
- Parse README and model card for implementation details
- Store model information in Supabase with proper relationships

### 4. Cookbook Generation
- Interactive UI for prompt input
- AI-powered Jupyter notebook generation with step-by-step coding agent instructions
- Environment setup guidance with secure API key management
- Incremental complexity progression from basic to advanced usage
- Validation steps to ensure model setup works correctly

## Technical Stack
- **Frontend**: React/Next.js
- **Backend**: Node.js/Python
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **File Storage**: Supabase Storage
- **AI Integration**: Hugging Face API, OpenAI/Claude for generation

## User Flow
1. User authenticates and creates workspace
2. User connects GitHub repository or searches for HF models
3. System ingests repo and extracts model information
4. User enters prompt describing their use case
5. System generates customized Jupyter notebook
6. User can view, edit, and download the notebook

## Data Model

### Users
- id (uuid), email, created_at, updated_at, subscription_tier

### Workspaces
- id (uuid), user_id, name, description, created_at, updated_at

### Environment Variables
- id (uuid), user_id, workspace_id, key_name, encrypted_value, created_at, updated_at

### Repositories
- id (uuid), workspace_id, github_url, hf_model_id, repo_name, description, parsed_data (jsonb), ingestion_status, created_at, updated_at

### Models (from Hugging Face)
- id (uuid), hf_model_id, model_id, author, sha, created_at, last_modified, downloads, likes, tags (jsonb), pipeline_tag, siblings (jsonb), model_card (jsonb), config (jsonb), created_at, updated_at

### Cookbooks
- id (uuid), user_id, model_id, workspace_id, title, prompt, notebook_content (jsonb), template_used, generation_metadata (jsonb), created_at, updated_at

### Usage Tracking
- id (uuid), user_id, model_id, action_type, created_at

## Detailed Features

### Repository Analysis Engine
- Clone and analyze GitHub repository structure
- Identify model files, configuration, and documentation
- Extract code examples and usage patterns
- Detect dependencies and requirements
- Parse Jupyter notebooks for existing examples

### Intelligent Notebook Generation
- Template-based generation with customizable sections
- AI-driven content creation based on user prompts
- Include model setup, configuration, and usage examples
- Add best practices and troubleshooting sections
- Support for different model types (LLMs, Computer Vision, Audio, etc.)

### User Interface Components
- Dashboard with workspace overview
- Repository browser with search and filtering
- Model exploration interface
- Prompt engineering workspace
- Environment variables management (secure API key storage)
- Model validation and testing interface
- Step-by-step guidance with incremental complexity
- Notebook preview and editor
- Export options (download, copy, share)

## Technical Implementation Details

### API Endpoints
- `POST /api/repositories/ingest` - Start repository ingestion
- `GET /api/models/search` - Search Hugging Face models
- `POST /api/cookbooks/generate` - Generate notebook from prompt
- `GET /api/workspaces/{id}/repositories` - List workspace repositories
- `GET /api/models/{id}/metadata` - Get detailed model information

### Generation Pipeline
1. Parse user prompt and extract intent
2. Retrieve model-specific information from Supabase (cached reference library)
3. Select appropriate notebook template and assess model features
4. Generate step-by-step coding agent instructions in markdown format
5. **Environment Setup Phase:**
   - Guide users to add environment variables securely (no API keys in chat)
   - Provide pip install instructions and dependency setup
6. **Validation Phase:**
   - Include minimal model invocation to test setup
   - Iterate until model runs successfully
7. **Incremental Usage Phase:**
   - Determine reasonable path of incremental complexity
   - Generate examples from basic to advanced usage
   - Explain each step clearly to the user
8. Format and return as downloadable Jupyter notebook

### Supabase Schema Design
- Row Level Security (RLS) for user data isolation
- Database functions for complex queries
- Triggers for usage tracking
- Storage buckets for repository files and generated notebooks

## Open Questions & Considerations
- How to handle private repositories and authentication?
- Notebook generation strategy and template system?
- Rate limiting and API quotas for Hugging Face?
- User pricing tiers and usage limits?
- Model caching and update strategies?
- Handling large model files and storage costs?
- Support for different programming languages in notebooks?
- Collaboration features for shared workspaces?