import { NextResponse } from 'next/server'
import { POPULAR_MODELS } from '@/lib/presets'

export async function GET() {
  try {
    // For the sprint, return hardcoded popular models
    // In production, this would call the Hugging Face API
    return NextResponse.json({
      models: POPULAR_MODELS
    })
  } catch (error) {
    console.error('Error fetching popular models:', error)
    return NextResponse.json(
      { error: 'Failed to fetch popular models' },
      { status: 500 }
    )
  }
}