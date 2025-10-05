import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { Recipe, ModelCard, PromptCardPack, TopicCard, DifficultyCard, UIComponentCard } from '@/types'

// Popular models for shuffle (weighted by popularity)
const POPULAR_MODELS: ModelCard[] = [
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

// Get compatible cards based on model pipeline tag
function getCompatiblePromptCards(pipelineTag: string): PromptCardPack[] {
  const basePromptCards: PromptCardPack[] = [
    {
      id: 'quick_start',
      name: '🚀 Quick Start',
      description: 'Basic hello world examples',
      category: 'basics',
      prompts: ['Hello, how are you?', 'Introduce yourself', 'What can you do?']
    },
    {
      id: 'real_world',
      name: '🌍 Real World',
      description: 'Practical everyday use cases',
      category: 'practical',
      prompts: ['Summarize this text', 'Analyze this data', 'Help me decide']
    },
    {
      id: 'creative',
      name: '✨ Creative',
      description: 'Fun and imaginative prompts',
      category: 'creative',
      prompts: ['Write a story about', 'Create a poem about', 'Imagine a world where']
    },
    {
      id: 'technical',
      name: '🔧 Technical',
      description: 'Programming and technical tasks',
      category: 'technical',
      prompts: ['Debug this code', 'Explain this concept', 'Optimize this function']
    }
  ]

  // Filter prompts based on pipeline tag
  if (pipelineTag === 'text-generation' || pipelineTag === 'conversational') {
    return basePromptCards.filter(card =>
      ['quick_start', 'real_world', 'creative'].includes(card.id)
    )
  } else if (pipelineTag === 'classification') {
    return basePromptCards.filter(card =>
      ['real_world', 'technical'].includes(card.id)
    )
  } else if (pipelineTag === 'summarization') {
    return basePromptCards.filter(card =>
      ['real_world'].includes(card.id)
    )
  }

  return basePromptCards
}

function getCompatibleUIComponents(pipelineTag: string): UIComponentCard[] {
  const baseUIComponents: UIComponentCard[] = [
    {
      type: 'chat_interface',
      name: '💬 Chat Interface',
      description: 'Conversational UI with message history',
      features: ['message_history', 'streaming'],
      complexity: 'moderate'
    },
    {
      type: 'api_endpoint',
      name: '🔌 API Endpoint',
      description: 'FastAPI/Flask wrapper for model',
      features: ['rest_api', 'error_handling'],
      complexity: 'simple'
    },
    {
      type: 'gradio_demo',
      name: '🖥️ Gradio Demo',
      description: 'Interactive web UI',
      features: ['web_interface', 'real_time'],
      complexity: 'simple'
    },
    {
      type: 'streamlit_app',
      name: '📊 Streamlit App',
      description: 'Full dashboard application',
      features: ['dashboard', 'data_viz'],
      complexity: 'complex'
    }
  ]

  // Filter UI components based on pipeline tag
  if (pipelineTag === 'text-generation' || pipelineTag === 'conversational') {
    return baseUIComponents.filter(comp =>
      ['chat_interface', 'api_endpoint', 'gradio_demo'].includes(comp.type)
    )
  } else if (pipelineTag === 'classification' || pipelineTag === 'summarization') {
    return baseUIComponents.filter(comp =>
      ['api_endpoint', 'gradio_demo'].includes(comp.type)
    )
  }

  return baseUIComponents
}

// Weighted random selection
function weightedRandom<T>(items: T[], weights: number[]): T {
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0)
  let random = Math.random() * totalWeight

  for (let i = 0; i < items.length; i++) {
    random -= weights[i]
    if (random <= 0) {
      return items[i]
    }
  }

  return items[items.length - 1]
}

// Generate a random but sensible recipe
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const lockedCardsParam = searchParams.get('locked_cards')
    const lockedCards = lockedCardsParam ? lockedCardsParam.split(',') : []

    // Get available cards from database
    const { data: topics, error: topicsError } = await supabase
      .from('card_presets')
      .select('card_data')
      .eq('card_type', 'topic')
      .order('sort_order')

    const { data: difficulties, error: difficultiesError } = await supabase
      .from('card_presets')
      .select('card_data')
      .eq('card_type', 'difficulty')
      .order('sort_order')

    if (topicsError || difficultiesError) {
      console.error('Error fetching cards:', topicsError || difficultiesError)
      // Fallback to hardcoded cards
    }

    const topicCards: TopicCard[] = topics?.map(t => t.card_data as TopicCard) || [
      {
        id: 'sourdough',
        name: '🍞 Sourdough Bread Making',
        description: 'Baking instructions and recipe analysis',
        examples: ['recipe analysis', 'baking instructions'],
        icon: '🍞'
      },
      {
        id: 'healthcare',
        name: '🏥 Healthcare',
        description: 'Medical Q&A and health analysis',
        examples: ['medical analysis', 'health Q&A'],
        icon: '🏥'
      },
      {
        id: 'gamedev',
        name: '🎮 Game Development',
        description: 'Game design and interactive storytelling',
        examples: ['game design', 'story creation'],
        icon: '🎮'
      }
    ]

    const difficultyCards: DifficultyCard[] = difficulties?.map(d => d.card_data as DifficultyCard) || [
      {
        level: 'beginner',
        name: '🌱 Beginner',
        description: 'Lots of comments, step-by-step explanations',
        commentDensity: 0.8,
        explanationDepth: 'high'
      },
      {
        level: 'intermediate',
        name: '🌿 Intermediate',
        description: 'Moderate comments, assumes basic knowledge',
        commentDensity: 0.4,
        explanationDepth: 'medium'
      },
      {
        level: 'advanced',
        name: '🌳 Advanced',
        description: 'Minimal comments, production patterns',
        commentDensity: 0.1,
        explanationDepth: 'low'
      }
    ]

    // Build recipe
    const recipe: Partial<Recipe> = {}

    // Select model (weighted by popularity)
    if (!lockedCards.includes('modelCard')) {
      const weights = POPULAR_MODELS.map(model => Math.log(model.downloads))
      recipe.modelCard = weightedRandom(POPULAR_MODELS, weights)
    }

    // Select compatible prompt cards
    if (!lockedCards.includes('promptCards') && recipe.modelCard) {
      const compatiblePrompts = getCompatiblePromptCards(recipe.modelCard.pipeline_tag)
      recipe.promptCards = compatiblePrompts[Math.floor(Math.random() * compatiblePrompts.length)]
    }

    // Select random topic
    if (!lockedCards.includes('topicCard')) {
      recipe.topicCard = topicCards[Math.floor(Math.random() * topicCards.length)]
    }

    // Select difficulty (weighted toward beginner)
    if (!lockedCards.includes('difficultyCard')) {
      const difficultyWeights = [0.5, 0.3, 0.2] // beginner, intermediate, advanced
      recipe.difficultyCard = weightedRandom(difficultyCards, difficultyWeights)
    }

    // Select compatible UI component
    if (!lockedCards.includes('uiComponentCard') && recipe.modelCard) {
      const compatibleUI = getCompatibleUIComponents(recipe.modelCard.pipeline_tag)
      recipe.uiComponentCard = compatibleUI[Math.floor(Math.random() * compatibleUI.length)]
    }

    // Validate that we have all required cards
    if (!recipe.modelCard || !recipe.promptCards || !recipe.topicCard ||
        !recipe.difficultyCard || !recipe.uiComponentCard) {
      return NextResponse.json(
        { error: 'Unable to generate complete recipe' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      recipe
    })

  } catch (error) {
    console.error('Shuffle error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}