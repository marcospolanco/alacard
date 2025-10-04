import { ModelCard } from '@/types'

export const POPULAR_MODELS: ModelCard[] = [
  {
    id: 'meta-llama/Llama-3.1-8B-Instruct',
    modelId: 'meta-llama/Llama-3.1-8B-Instruct',
    name: 'Llama-3.1-8B-Instruct',
    description: 'Meta\'s advanced conversational AI model with 8B parameters',
    pipeline_tag: 'text-generation',
    downloads: 1250000,
    likes: 2340,
    tags: ['text-generation', 'llama', 'conversational'],
    category: 'text-generation'
  },
  {
    id: 'microsoft/DialoGPT-medium',
    modelId: 'microsoft/DialoGPT-medium',
    name: 'DialoGPT Medium',
    description: 'Microsoft\'s conversational AI model for dialogue generation',
    pipeline_tag: 'text-generation',
    downloads: 890000,
    likes: 1560,
    tags: ['conversational', 'text-generation', 'dialogue'],
    category: 'conversational'
  },
  {
    id: 'distilbert-base-uncased',
    modelId: 'distilbert-base-uncased',
    name: 'DistilBERT Base Uncased',
    description: 'Lightweight BERT model for text classification and NER',
    pipeline_tag: 'fill-mask',
    downloads: 2100000,
    likes: 3420,
    tags: ['classification', 'bert', 'ner'],
    category: 'classification'
  },
  {
    id: 'facebook/bart-large-cnn',
    modelId: 'facebook/bart-large-cnn',
    name: 'BART Large CNN',
    description: 'Facebook\'s model for abstractive text summarization',
    pipeline_tag: 'summarization',
    downloads: 1450000,
    likes: 2890,
    tags: ['summarization', 'text-generation'],
    category: 'summarization'
  },
  {
    id: 'google/flan-t5-base',
    modelId: 'google/flan-t5-base',
    name: 'FLAN-T5 Base',
    description: 'Google\'s instruction-following model for various tasks',
    pipeline_tag: 'text2text-generation',
    downloads: 780000,
    likes: 1230,
    tags: ['instruction-following', 'text2text-generation'],
    category: 'instruction-following'
  }
]

export const DEFAULT_MODEL = 'meta-llama/Llama-3.1-8B-Instruct'

export const MODEL_CATEGORIES = [
  { id: 'text-generation', name: 'Text Generation', description: 'Generate creative text and stories' },
  { id: 'conversational', name: 'Chat & Dialogue', description: 'Conversational AI and chatbots' },
  { id: 'classification', name: 'Classification & NER', description: 'Text analysis and entity extraction' },
  { id: 'summarization', name: 'Summarization', description: 'Long-form text summarization' },
  { id: 'instruction-following', name: 'Instruction Following', description: 'Follow complex instructions' },
  { id: 'translation', name: 'Translation', description: 'Multi-language translation' },
  { id: 'code-generation', name: 'Code Generation', description: 'Programming and code completion' }
]