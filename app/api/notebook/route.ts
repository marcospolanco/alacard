import { NextRequest, NextResponse } from 'next/server'
import { generateNotebookFromRecipe } from '@/lib/notebook-generator'
import { Recipe, ModelCard, PromptCardPack, TopicCard, DifficultyCard, UIComponentCard } from '@/types'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const hfModel = searchParams.get('hf_model')
    const shareId = searchParams.get('share_id')
    const task = searchParams.get('task') || 'chat'

    if (!hfModel) {
      return NextResponse.json(
        { error: 'hf_model parameter is required' },
        { status: 400 }
      )
    }

    // Generate notebook - create a default recipe for now
    const defaultModel: ModelCard = {
      id: hfModel,
      modelId: hfModel,
      name: hfModel.split('/')[1] || hfModel,
      description: 'Default model for notebook generation',
      pipeline_tag: 'text-generation',
      downloads: 1000000,
      likes: 1000,
      tags: ['text-generation'],
      license: 'mit'
    }

    const defaultPromptPack: PromptCardPack = {
      id: 'default-prompts',
      name: 'Default Prompts',
      description: 'Basic prompt pack',
      category: 'general',
      prompts: [
        'Hello, how are you?',
        'Tell me a joke'
      ]
    }

    const defaultTopic: TopicCard = {
      id: 'general',
      name: 'General Conversation',
      description: 'General chat topics',
      examples: ['How is the weather?', 'What are your hobbies?'],
      icon: '💬'
    }

    const defaultDifficulty: DifficultyCard = {
      level: 'beginner',
      name: 'Beginner',
      description: 'Easy to understand responses',
      commentDensity: 0.8,
      explanationDepth: 'high'
    }

    const defaultUIComponent: UIComponentCard = {
      type: 'chat_interface',
      name: 'Chat Interface',
      description: 'Simple chat UI',
      features: ['Message display', 'Input field'],
      complexity: 'simple'
    }

    const recipe: Recipe = {
      modelCard: defaultModel,
      promptCards: defaultPromptPack,
      topicCard: defaultTopic,
      difficultyCard: defaultDifficulty,
      uiComponentCard: defaultUIComponent
    }

    const notebook = await generateNotebookFromRecipe(recipe, hfModel)

    // Set headers for file download
    const headers = new Headers()
    headers.set('Content-Type', 'application/json')
    headers.set('Content-Disposition', `attachment; filename="alacard-${hfModel.replace('/', '-')}-${Date.now()}.ipynb"`)

    return new NextResponse(JSON.stringify(notebook, null, 2), {
      status: 200,
      headers
    })

  } catch (error) {
    console.error('Notebook generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate notebook' },
      { status: 500 }
    )
  }
}