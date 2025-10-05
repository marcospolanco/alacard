import { NextRequest, NextResponse } from 'next/server'
import { POPULAR_MODELS } from '@/lib/presets'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const limit = parseInt(searchParams.get('limit') || '20')

    let filteredModels = POPULAR_MODELS

    // Filter by category if specified
    if (category) {
      filteredModels = filteredModels.filter(model =>
        model.category === category ||
        model.tags.includes(category) ||
        model.pipeline_tag === category
      )
    }

    // Limit results
    const limitedModels = filteredModels.slice(0, limit)

    return NextResponse.json({
      models: limitedModels,
      total: filteredModels.length
    })
  } catch (error) {
    console.error('Error searching models:', error)
    return NextResponse.json(
      { error: 'Failed to search models' },
      { status: 500 }
    )
  }
}