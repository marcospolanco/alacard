import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { v4 as uuidv4 } from 'uuid'
import { generateNotebook } from '@/lib/notebook-generator'
import { POPULAR_MODELS } from '@/lib/presets'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { hf_model_id } = body

    if (!hf_model_id) {
      return NextResponse.json(
        { error: 'hf_model_id is required' },
        { status: 400 }
      )
    }

    // Generate unique share ID
    const shareId = uuidv4().slice(0, 8)

    // Get model info from presets or fetch from HF API
    const modelInfo = POPULAR_MODELS.find(m => m.modelId === hf_model_id)

    if (!modelInfo) {
      // For models not in our preset list, we could fetch from HF API
      // For now, return a basic model info structure
      const basicModelInfo = {
        id: hf_model_id,
        modelId: hf_model_id,
        name: hf_model_id.split('/').pop() || hf_model_id,
        description: 'Custom model from Hugging Face',
        pipeline_tag: 'text-generation',
        downloads: 0,
        likes: 0,
        tags: [],
        category: 'custom'
      }
    }

    // Generate notebook
    const notebook = await generateNotebook(hf_model_id)

    // Prepare notebook data for storage
    const notebookData = {
      share_id: shareId,
      hf_model_id,
      notebook_content: notebook,
      metadata: {
        model_info: modelInfo || basicModelInfo,
        generated_by: 'alacard',
        generated_at: new Date().toISOString()
      },
      download_count: 0
    }

    // Save to Supabase
    const { data: savedNotebook, error } = await supabase
      .from('notebooks')
      .insert(notebookData)
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      // Return results even if database save fails
      return NextResponse.json({
        share_id: shareId,
        notebook_url: `/api/notebook/download/${shareId}`,
        model_info: modelInfo || basicModelInfo,
        warning: 'Notebook generated but not saved to database'
      })
    }

    return NextResponse.json({
      share_id: shareId,
      notebook_url: `/api/notebook/download/${shareId}`,
      model_info: modelInfo || basicModelInfo
    })

  } catch (error) {
    console.error('Notebook generation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}