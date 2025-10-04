import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { TrendingRequest, TrendingResponse } from '@/types'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const timeframe = searchParams.get('timeframe') || 'week'
    const model = searchParams.get('model')
    const topic = searchParams.get('topic')
    const difficulty = searchParams.get('difficulty')
    const limit = parseInt(searchParams.get('limit') || '20')

    // Build query for trending notebooks
    let query = supabase
      .from('notebooks')
      .select('*')
      .eq('is_public', true)

    // Apply timeframe filter
    const now = new Date()
    let filterDate: Date

    switch (timeframe) {
      case 'day':
        filterDate = new Date(now.getTime() - 24 * 60 * 60 * 1000)
        break
      case 'week':
        filterDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case 'month':
        filterDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      default: // 'all'
        filterDate = new Date(0) // Beginning of time
    }

    query = query.gte('created_at', filterDate.toISOString())

    // Apply filters
    if (model) {
      query = query.eq('hf_model_id', model)
    }

    if (topic) {
      // Filter by topic in recipe
      query = query.contains('recipe->topicCard->id', `"${topic}"`)
    }

    if (difficulty) {
      // Filter by difficulty in recipe
      query = query.contains('recipe->difficultyCard->level', difficulty)
    }

    // Order by trending score (combination of remixes, downloads, and views)
    // For now, we'll use remix_count as the primary trending metric
    query = query
      .order('remix_count', { ascending: false })
      .order('download_count', { ascending: false })
      .order('view_count', { ascending: false })
      .limit(limit)

    const { data: notebooks, error } = await query

    if (error) {
      console.error('Error fetching trending notebooks:', error)
      return NextResponse.json(
        { error: 'Failed to fetch trending notebooks' },
        { status: 500 }
      )
    }

    // Calculate trending scores and sort
    const notebooksWithScores = notebooks?.map(notebook => {
      // Simple trending score: weighted combination of metrics
      const remixWeight = 10
      const downloadWeight = 3
      const viewWeight = 1
      const recencyWeight = timeframe === 'all' ? 0 :
        Math.max(0, 1 - (now.getTime() - new Date(notebook.created_at).getTime()) /
          (now.getTime() - filterDate.getTime()))

      const trendingScore =
        (notebook.remix_count * remixWeight) +
        (notebook.download_count * downloadWeight) +
        (notebook.view_count * viewWeight) +
        (recencyWeight * 100) // Boost for recency

      return {
        ...notebook,
        trending_score: trendingScore
      }
    }) || []

    // Sort by trending score
    notebooksWithScores.sort((a, b) => b.trending_score - a.trending_score)

    const response: TrendingResponse = {
      notebooks: notebooksWithScores
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Trending API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}