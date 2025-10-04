# AI Model Cookbook Generator - Technical Strategy

## 1. Overview
This document outlines the technical strategy for building the "AI Model Cookbook Generator," a platform that ingests GitHub repositories for Hugging Face models and generates customized Jupyter notebook "cookbooks." This strategy is derived from the [PRD](./alacard-prd.md) and details the architecture, data models, and implementation phases required to bring the product to life.

## 2. Core Architecture & Technical Stack
The platform will be built on a modern web stack designed for scalability, security, and rapid development.

- **Frontend**: **React/Next.js** - For a fast, server-rendered UI with excellent developer experience.
- **Backend**: A hybrid approach featuring:
    - **Node.js (Fastify/Express)**: For the primary public-facing API (handling user requests, workspace management, etc.).
    - **Python (FastAPI/Flask)**: A dedicated microservice for the AI generation pipeline, built specifically to leverage the **Claude Agent SDK for Python**.
- **Database**: **Supabase (PostgreSQL)** - Provides a robust database, authentication, file storage, and serverless functions, with Row Level Security (RLS) as a core security feature.
- **Authentication**: **Supabase Auth** - Manages user sign-up, login, and session management. It will also handle OAuth for GitHub.
- **File Storage**: **Supabase Storage** - For storing cloned repository files and generated notebooks securely, segregated by workspace and user.
- **AI & External Integrations**:
    - **Anthropic Claude Agent SDK**: The core engine for iteratively generating and testing the Jupyter notebooks.
    - **Hugging Face API**: For fetching model metadata and details.
    - **GitHub API**: For repository ingestion, requiring user authentication via OAuth.

## 3. Detailed Data Model (Supabase)
The database schema is designed to be secure and scalable, with RLS enforced on all tables to ensure data isolation.

| Table | Columns | Description |
|---|---|---|
| **users** | `id` (uuid), `email`, `auth_provider_token` (encrypted) | Stores user identity. GitHub OAuth tokens are encrypted at rest. |
| **workspaces** | `id` (uuid), `name`, `owner_id` (fk: users.id) | The primary organizational unit for a user's work. |
| **workspace_members** | `workspace_id` (fk), `user_id` (fk), `role` | **(Phase 3)** Join table to enable multi-user collaboration in shared workspaces. |
| **environment_variables**| `id` (uuid), `workspace_id` (fk), `key_name`, `encrypted_value` | Securely stores user API keys and other secrets, encrypted at rest. |
| **repositories** | `id` (uuid), `workspace_id` (fk), `github_url`, `hf_model_id` | Tracks ingested repositories linked to a workspace. |
| **models** | `id` (uuid), `hf_model_id`, `metadata` (jsonb), `cached_at` | Caches metadata from the Hugging Face API to reduce latency and API hits. |
| **cookbooks** | `id` (uuid), `repository_id` (fk), `prompt`, `notebook_content` (jsonb), `template` (text), `topic` (text), `complexity` (text), `is_public` (bool), `forked_from_id` (fk) | Stores generated notebooks, their recipe inputs, and community feature flags. |
| **usage_tracking** | `id` (uuid), `user_id` (fk), `action_type`, `metadata` (jsonb) | Tracks key user actions for analytics and future billing. |

## 4. Claude Agent-Based Generation Pipeline
The notebook generation process is an iterative, three-step process orchestrated by the Python backend service using the Claude Agent SDK.

### Step 1: Ingestion & Context Gathering
The system first collects all necessary context about the model. This involves:
- Cloning the specified GitHub repository.
- Parsing the repository to understand its structure, find example scripts, and identify dependencies (`requirements.txt`, etc.).
- Fetching comprehensive metadata for the linked Hugging Face model ID.

### Step 2: System Prompt Generation
A sophisticated "system prompt" is dynamically constructed to guide the Claude agent. This is a critical step that transforms the simple user request into a detailed set of instructions for the AI. This prompt will include:
- The ultimate goal (based on the user's high-level prompt).
- The chosen **recipe inputs**: the `template` (e.g., "A/B Arena"), `topic` (e.g., "sourdough bread"), and `complexity` level.
- The full context gathered in Step 1 (repo structure, HF metadata, code examples).
- A description of the tools available to the agent.

### Step 3: Iterative Generation & Testing
The Claude agent is invoked with the system prompt and a suite of tools that allow it to interact with a virtual Jupyter notebook environment.

**Agent Tools:**
- `create_cell(code: str, type: 'code' | 'markdown')`: Adds a new cell to the notebook.
- `execute_cell(cell_id: int) -> dict`: Executes the code in a specific cell and returns the result (`stdout`, `stderr`, `has_error`).
- `read_file_from_repo(path: str) -> str`: Allows the agent to read files from the ingested repository for context.
- `list_files_in_repo() -> list[str]`: Lets the agent see the file structure of the repository.

**Iterative Loop:**
1. The agent, guided by the system prompt, decides to use a tool (e.g., `create_cell` with installation code).
2. The Python service executes the tool and returns the result to the agent.
3. The agent then decides on the next action. For example, it might call `execute_cell` to test the installation.
4. If `execute_cell` returns an error, the agent is prompted to debug the problem, potentially by creating a new cell with corrected code.
5. This "create -> test -> reflect -> correct" loop continues until the agent has built a complete, working Jupyter notebook that fulfills the user's request.
6. The final, validated notebook content is saved to the `cookbooks` table.

## 5. Phased Implementation Plan (Milestones)

### Phase 1: Foundation & Ingestion
*   **Goal**: Establish core infrastructure and the ability to ingest public repositories.
*   **Features**:
    *   User authentication (email/password, GitHub OAuth).
    *   Workspace creation (single-user).
    *   Supabase schema setup.
    *   Backend service to ingest public GitHub repos and sync metadata from Hugging Face.

### Phase 2: Generation MVP
*   **Goal**: Deliver the core value proposition: generating a useful notebook via the Claude agent.
*   **Features**:
    *   Set up the Python generation service.
    *   Implement the **Claude Agent SDK** with a basic set of tools (`create_cell`, `execute_cell`).
    *   Build the System Prompt Generation logic, incorporating the new recipe inputs.
    *   Implement secure environment variable management.
    *   Build the UI for the "Recipe Builder" and notebook preview.

### Phase 3: Expansion & Collaboration
*   **Goal**: Enhance the generation process and introduce community features.
*   **Features**:
    *   Implement multi-user collaboration in shared workspaces.
    *   Implement cookbook sharing (`is_public`) and forking (`forked_from_id`).
    *   Expand the agent's toolset (e.g., file writing, more complex environment inspection).
    *   Introduce more sophisticated notebook templates.
