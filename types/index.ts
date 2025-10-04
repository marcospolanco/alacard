// Core Notebook Interface (Updated)
export interface Notebook {
  id: string
  created_at: string
  share_id: string
  hf_model_id: string
  recipe: Recipe
  notebook_content: any
  metadata: {
    model_info?: ModelInfo
    source_readme_sha?: string
    generated_by: string
    forked_from?: string
  }
  view_count: number
  download_count: number
  remix_count: number
  user_id?: string
  is_public: boolean
}

// Recipe System (New)
export interface Recipe {
  modelCard: ModelCard
  promptCards: PromptCardPack
  topicCard: TopicCard
  difficultyCard: DifficultyCard
  uiComponentCard: UIComponentCard
}

export interface RecipeState {
  modelCard: ModelCard | null
  promptCards: PromptCardPack | null
  topicCard: TopicCard | null
  difficultyCard: DifficultyCard | null
  uiComponentCard: UIComponentCard | null
  lockedCards: string[] // Card types to keep fixed during shuffle
}

// Card Type Definitions (New)
export interface ModelCard {
  id: string
  modelId: string
  name: string
  description: string
  pipeline_tag: string
  downloads: number
  likes: number
  tags: string[]
  license?: string
  category?: string
}

export interface PromptCardPack {
  id: string
  name: string
  description: string
  category: string
  prompts: string[]
  isCustom?: boolean
}

export interface TopicCard {
  id: string
  name: string
  description: string
  examples: string[]
  icon: string
}

export interface DifficultyCard {
  level: 'beginner' | 'intermediate' | 'advanced'
  name: string
  description: string
  commentDensity: number
  explanationDepth: 'high' | 'medium' | 'low'
}

export interface UIComponentCard {
  type: 'chat_interface' | 'api_endpoint' | 'gradio_demo' | 'streamlit_app'
  name: string
  description: string
  features: string[]
  complexity: 'simple' | 'moderate' | 'complex'
}

// Model Info (Updated)
export interface ModelInfo {
  id: string
  modelId: string
  name: string
  description?: string
  pipeline_tag: string
  tags: string[]
  downloads: number
  likes: number
  license?: string
  createdAt?: string
}

// API Request/Response Types (Updated)
export interface NotebookGenerationRequest {
  recipe: Recipe
}

export interface NotebookGenerationResponse {
  share_id: string
  notebook_url: string
  share_url: string
  model_info: ModelInfo
}

export interface ShuffleRequest {
  locked_cards?: string[]
}

export interface ShuffleResponse {
  recipe: Recipe
}

export interface CardsResponse {
  cards: any[]
  total: number
}

export interface RemixRequest {
  modified_recipe: Recipe
}

export interface RemixResponse {
  share_id: string
  notebook_url: string
  forked_from: string
}

export interface TrendingRequest {
  timeframe?: 'day' | 'week' | 'month' | 'all'
  model?: string
  topic?: string
  difficulty?: string
  limit?: number
}

export interface TrendingResponse {
  notebooks: Notebook[]
}

export interface TrackRequest {
  event: 'view' | 'download' | 'remix'
}

export interface PopularModelsResponse {
  models: ModelCard[]
}

export interface ModelSearchRequest {
  q?: string
  task?: string
  sort?: 'downloads' | 'likes' | 'trending' | 'created'
  limit?: number
}

export interface ModelSearchResponse {
  models: ModelCard[]
  total: number
}

// Legacy Types (for backward compatibility)
export interface LegacyRecipe {
  emoji?: string
  title?: string
  models?: ModelCard[]
  prompts?: Array<{ id: string; text: string; emoji?: string }>
}