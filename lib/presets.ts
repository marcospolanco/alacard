import { ModelCard, PromptCard } from '@/types'

export const DEFAULT_MODELS: ModelCard[] = [
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    provider: 'openai',
    description: 'Fast and efficient',
    emoji: '⚡',
    modelId: 'gpt-4o-mini'
  },
  {
    id: 'llama-3.1-8b',
    name: 'Llama 3.1 8B',
    provider: 'hf',
    description: 'Open source powerhouse',
    emoji: '🦙',
    modelId: 'meta-llama/Llama-3.1-8B-Instruct'
  }
]

export const DEFAULT_PROMPTS: PromptCard[] = [
  {
    id: 'rag-explain',
    text: 'Explain RAG in one paragraph for a product manager.',
    emoji: '📚'
  },
  {
    id: 'json-schema',
    text: 'Write a JSON schema for a blog post with title, body, tags.',
    emoji: '🧩'
  },
  {
    id: 'llm-risks',
    text: 'List 5 risks of LLM evaluations and a quick mitigation for each.',
    emoji: '⚠️'
  }
]

export const DEFAULT_SYSTEM_PROMPT = 'Helpful assistant; answer concisely.'

export const RECIPE_TEMPLATES = [
  {
    title: 'Speed vs Smarts',
    emoji: '⚡🧠',
    description: 'Compare speed-focused vs capability-focused models'
  },
  {
    title: 'Structured Output Showdown',
    emoji: '🧩',
    description: 'Test JSON and structured data generation'
  },
  {
    title: 'Security Lens',
    emoji: '🛡️',
    description: 'Evaluate security awareness and responses'
  }
]