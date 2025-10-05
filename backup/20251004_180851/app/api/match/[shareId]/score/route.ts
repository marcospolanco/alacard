import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(
  request: NextRequest,
  { params }: { params: { shareId: string } }
) {
  try {
    const { shareId } = params
    const body = await request.json()
    const { winner, votes, rubric } = body

    if (!shareId) {
      return NextResponse.json(
        { error: 'Share ID is required' },
        { status: 400 }
      )
    }

    if (!winner || !['A', 'B', 'tie'].includes(winner)) {
      return NextResponse.json(
        { error: 'Winner must be A, B, or tie' },
        { status: 400 }
      )
    }

    // Update match with scoring data
    const scoringData = {
      winner,
      ...(votes && { votes }),
      ...(rubric && { rubric })
    }

    const { data: match, error } = await supabase
      .from('matches')
      .update({ scoring: scoringData })
      .eq('share_id', shareId)
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to update match scoring' },
        { status: 500 }
      )
    }

    return NextResponse.json({ ok: true })

  } catch (error) {
    console.error('Match scoring error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}