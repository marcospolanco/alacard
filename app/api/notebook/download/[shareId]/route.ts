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

    if (error || !notebook) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Notebook not found' },
        { status: 404 }
      )
    }

    // Track download event
    await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/notebook/${shareId}/track`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ event: 'download' })
    }).catch(err => console.error('Failed to track download:', err))

    // Create filename based on model name and recipe details
    let modelName = 'model'
    if (notebook.recipe?.modelCard?.name) {
      modelName = notebook.recipe.modelCard.name.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()
    } else {
      modelName = notebook.hf_model_id.split('/').pop() || 'model'
    }

    // Add topic to filename if available
    let topicSuffix = ''
    if (notebook.recipe?.topicCard?.id) {
      topicSuffix = `-${notebook.recipe.topicCard.id}`
    }

    const filename = `alacard-${modelName}${topicSuffix}-${Date.now()}.ipynb`

    // Set headers for file download with proper content type
    const headers = new Headers()
    headers.set('Content-Type', 'application/x-ipynb+json')
    headers.set('Content-Disposition', `attachment; filename="${filename}"`)

    return new NextResponse(JSON.stringify(notebook.notebook_content, null, 2), {
      status: 200,
      headers
    })

  } catch (error) {
    console.error('Notebook download error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}