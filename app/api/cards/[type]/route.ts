import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: { type: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const category = searchParams.get('category')
    const featured = searchParams.get('featured')
    const limit = parseInt(searchParams.get('limit') || '20')
    const cardType = params.type

    // Validate card type
    const validCardTypes = ['model', 'prompt', 'topic', 'difficulty', 'ui_component']
    if (!validCardTypes.includes(cardType)) {
      return NextResponse.json(
        { error: 'Invalid card type' },
        { status: 400 }
      )
    }

    let query = supabase
      .from('card_presets')
      .select('*')
      .eq('card_type', cardType)

    // Apply filters
    if (featured === 'true') {
      query = query.eq('is_featured', true)
    }

    if (search) {
      query = query.ilike('card_data->>name', `%${search}%`)
    }

    // For prompt cards, filter by category
    if (cardType === 'prompt' && category) {
      query = query.contains('card_data->>category', category)
    }

    query = query
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false })
      .limit(limit)

    const { data: cards, error, count } = await query

    if (error) {
      console.error('Error fetching cards:', error)
      return NextResponse.json(
        { error: 'Failed to fetch cards' },
        { status: 500 }
      )
    }

    // Special handling for model cards - fetch from HF API
    let modelCards = cards?.map(card => card.card_data) || []
    if (cardType === 'model') {
      // If we need more model cards or search is specific, fetch from HF API
      if (search || modelCards.length < 5) {
        try {
          const hfResponse = await fetch(
            `https://huggingface.co/api/models?search=${search || ''}&limit=${limit}&sort=downloads&direction=-1`
          )

          if (hfResponse.ok) {
            const hfModels = await hfResponse.json()
            modelCards = hfModels.map((model: any) => ({
              id: model.id,
              modelId: model.id,
              name: model.modelId || model.id.split('/').pop(),
              description: model.description || '',
              pipeline_tag: model.pipelineTag || 'text-generation',
              downloads: model.downloads || 0,
              likes: model.likes || 0,
              tags: model.tags || [],
              license: model.license || '',
              category: model.pipelineTag || 'custom'
            }))
          }
        } catch (hfError) {
          console.error('Error fetching from HF API:', hfError)
          // Fall back to cached cards
        }
      }
    }

    return NextResponse.json({
      cards: modelCards,
      total: count || modelCards.length
    })

  } catch (error) {
    console.error('Cards API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}