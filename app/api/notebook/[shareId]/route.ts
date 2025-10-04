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

    // Increment download count
    await supabase
      .from('notebooks')
      .update({ download_count: (notebook.download_count || 0) + 1 })
      .eq('share_id', shareId)

    return NextResponse.json(notebook)

  } catch (error) {
    console.error('Notebook retrieval error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}