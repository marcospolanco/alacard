import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { TrackRequest } from '@/types'

export async function POST(
  request: NextRequest,
  { params }: { params: { shareId: string } }
) {
  try {
    const shareId = params.shareId
    const body = await request.json() as TrackRequest
    const { event } = body

    if (!event || !['view', 'download', 'remix'].includes(event)) {
      return NextResponse.json(
        { error: 'Valid event type is required (view, download, remix)' },
        { status: 400 }
      )
    }

    // Get the notebook to verify it exists
    const { data: notebook, error: fetchError } = await supabase
      .from('notebooks')
      .select('*')
      .eq('share_id', shareId)
      .single()

    if (fetchError || !notebook) {
      return NextResponse.json(
        { error: 'Notebook not found' },
        { status: 404 }
      )
    }

    // Update the appropriate counter based on event type
    let updateData: any = {}

    switch (event) {
      case 'view':
        updateData.view_count = notebook.view_count + 1
        break
      case 'download':
        updateData.download_count = notebook.download_count + 1
        break
      case 'remix':
        // Remix count is handled in the remix endpoint
        updateData.remix_count = notebook.remix_count + 1
        break
    }

    // Update the notebook metrics
    const { error: updateError } = await supabase
      .from('notebooks')
      .update(updateData)
      .eq('share_id', shareId)

    if (updateError) {
      console.error('Error updating notebook metrics:', updateError)
      return NextResponse.json(
        { error: 'Failed to update metrics' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      event: event,
      share_id: shareId
    })

  } catch (error) {
    console.error('Track error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}