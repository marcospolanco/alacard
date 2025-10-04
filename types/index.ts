export interface Match {
  id: string
  created_at: string
  share_id: string
  model_a: string
  model_b: string
  system_prompt?: string
  prompts: string[]
  outputs?: {
    items: Array<{
      prompt: string
      a: string
      b: string
      a_ms: number
      b_ms: number
    }>
  }
  scoring?: {
    winner: 'A' | 'B' | 'tie'
    votes?: Record<string, any>
    rubric?: Record<string, any>
  }
  meta: {
    client_version?: string
    notes?: string
    recipe: {
      models: [string, string]
      prompts: string[]
      title?: string
      emoji?: string
    }
  }
}

export interface ModelCard {
  id: string
  name: string
  provider: 'openai' | 'hf'
  description: string
  emoji: string
  modelId: string
}

export interface PromptCard {
  id: string
  text: string
  emoji: string
}

export interface Recipe {
  models: [ModelCard, ModelCard]
  prompts: PromptCard[]
  title: string
  emoji: string
}