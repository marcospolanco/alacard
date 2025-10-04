import { ModelCard } from '@/types'

export const POPULAR_MODELS: ModelCard[] = [
  {
    id: 'meta-llama/Llama-3.1-8B-Instruct',
    modelId: 'meta-llama/Llama-3.1-8B-Instruct',
    name: 'Llama-3.1-8B-Instruct',
    description: 'Meta\'s advanced conversational AI model',
    pipeline_tag: 'text-generation',
    downloads: 1250000,
    likes: 2340,
    tags: ['text-generation', 'llama', 'conversational'],
    license: 'llama3.1'
  },
  {
    id: 'microsoft/DialoGPT-medium',
    modelId: 'microsoft/DialoGPT-medium',
    name: 'DialoGPT Medium',
    description: 'Microsoft\'s conversational AI model',
    pipeline_tag: 'conversational',
    downloads: 890000,
    likes: 1560,
    tags: ['conversational', 'dialogue'],
    license: 'mit'
  },
  {
    id: 'distilbert-base-uncased',
    modelId: 'distilbert-base-uncased',
    name: 'DistilBERT Base',
    description: 'Lightweight BERT model for text classification',
    pipeline_tag: 'classification',
    downloads: 2100000,
    likes: 3200,
    tags: ['classification', 'bert', 'lightweight'],
    license: 'apache-2.0'
  },
  {
    id: 'facebook/bart-large-cnn',
    modelId: 'facebook/bart-large-cnn',
    name: 'BART Large CNN',
    description: 'Text summarization model',
    pipeline_tag: 'summarization',
    downloads: 1450000,
    likes: 1890,
    tags: ['summarization', 'seq2seq'],
    license: 'apache-2.0'
  },
  {
    id: 'google/flan-t5-base',
    modelId: 'google/flan-t5-base',
    name: 'FLAN-T5 Base',
    description: 'Instruction-tuned language model',
    pipeline_tag: 'text2text-generation',
    downloads: 980000,
    likes: 1670,
    tags: ['text2text-generation', 'instruction-tuned'],
    license: 'apache-2.0'
  }
]

export const DEFAULT_MODEL = POPULAR_MODELS[0].modelId

export const MODEL_CATEGORIES = [
  { id: 'text-generation', value: 'text-generation', label: 'Text Generation', name: 'Text Generation', icon: '💬' },
  { id: 'classification', value: 'classification', label: 'Classification', name: 'Classification', icon: '🏷️' },
  { id: 'summarization', value: 'summarization', label: 'Summarization', name: 'Summarization', icon: '📝' },
  { id: 'translation', value: 'translation', label: 'Translation', name: 'Translation', icon: '🌐' },
  { id: 'question-answering', value: 'question-answering', label: 'Question Answering', name: 'Question Answering', icon: '❓' },
  { id: 'conversational', value: 'conversational', label: 'Conversational', name: 'Conversational', icon: '🗣️' },
  { id: 'text2text-generation', value: 'text2text-generation', label: 'Text-to-Text', name: 'Text-to-Text', icon: '🔄' }
]