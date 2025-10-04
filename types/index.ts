export interface Notebook {
  id: string
  created_at: string
  share_id: string
  hf_model_id: string
  notebook_content: any
  metadata: {
    model_info?: ModelInfo
    source_readme_sha?: string
    generated_by: string
  }
  download_count: number
}

export interface ModelInfo {
  id: string
  modelId: string
  name: string
  description?: string
  pipeline_tag: string
  tags: string[]
  downloads: number
  likes: number
  createdAt?: string
  modelId?: string
}

export interface ModelCard {
  id: string
  modelId: string
  name: string
  description: string
  pipeline_tag: string
  downloads: number
  likes: number
  tags: string[]
  category?: string
}

export interface NotebookGenerationRequest {
  hf_model_id: string
}

export interface NotebookGenerationResponse {
  share_id: string
  notebook_url: string
  model_info: ModelInfo
}

export interface PopularModelsResponse {
  models: ModelCard[]
}