import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: { shareId: string } }
) {
  try {
    const { shareId } = params

    if (!shareId) {
      return NextResponse.json(
        { error: 'Share ID is required' },
        { status: 400 }
      )
    }

    const { data: notebook, error } = await supabase
      .from('notebooks')
      .select('*')
      .eq('share_id', shareId)
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Notebook not found' },
        { status: 404 }
      )
    }

    // Track view event
    await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/notebook/${shareId}/track`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ event: 'view' })
    }).catch(err => console.error('Failed to track view:', err))

    // Ensure backward compatibility for notebooks without recipe
    const responseNotebook = {
      ...notebook,
      recipe: notebook.recipe || {
        modelCard: notebook.metadata?.model_info || {
          id: notebook.hf_model_id,
          modelId: notebook.hf_model_id,
          name: notebook.hf_model_id.split('/').pop() || notebook.hf_model_id,
          description: notebook.metadata?.model_info?.description || 'Legacy notebook',
          pipeline_tag: notebook.metadata?.model_info?.pipeline_tag || 'text-generation',
          downloads: notebook.metadata?.model_info?.downloads || 0,
          likes: notebook.metadata?.model_info?.likes || 0,
          tags: notebook.metadata?.model_info?.tags || []
        },
        promptCards: {
          id: 'legacy',
          name: '📜 Legacy Prompts',
          description: 'Original notebook prompts',
          category: 'legacy',
          prompts: ['Default example prompt']
        },
        topicCard: {
          id: 'general',
          name: '📚 General',
          description: 'General purpose notebook',
          examples: ['General examples'],
          icon: '📚'
        },
        difficultyCard: {
          level: 'intermediate' as const,
          name: '🌿 Intermediate',
          description: 'Standard difficulty level',
          commentDensity: 0.4,
          explanationDepth: 'medium' as const
        },
        uiComponentCard: {
          type: 'api_endpoint' as const,
          name: '🔌 API Endpoint',
          description: 'Basic API wrapper',
          features: ['rest_api'],
          complexity: 'simple' as const
        }
      }
    }

    return NextResponse.json(responseNotebook)

  } catch (error) {
    console.error('Notebook retrieval error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}