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

    // Increment download count
    await supabase
      .from('notebooks')
      .update({ download_count: (notebook.download_count || 0) + 1 })
      .eq('share_id', shareId)

    // Create filename based on model name
    const modelName = notebook.hf_model_id.split('/').pop() || 'model'
    const filename = `alacard-${modelName}-${Date.now()}.ipynb`

    // Set headers for file download
    const headers = new Headers()
    headers.set('Content-Type', 'application/json')
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