import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { v4 as uuidv4 } from 'uuid'
import { RemixRequest, RemixResponse } from '@/types'

import { generateNotebookFromRecipe } from '@/lib/notebook-generator'

export async function POST(
  request: NextRequest,
  { params }: { params: { shareId: string } }
) {
  try {
    const shareId = params.shareId
    const body = await request.json() as RemixRequest
    const { modified_recipe } = body

    if (!modified_recipe) {
      return NextResponse.json(
        { error: 'modified_recipe is required' },
        { status: 400 }
      )
    }

    // Get original notebook to verify it exists
    const { data: originalNotebook, error: fetchError } = await supabase
      .from('notebooks')
      .select('*')
      .eq('share_id', shareId)
      .single()

    if (fetchError || !originalNotebook) {
      return NextResponse.json(
        { error: 'Original notebook not found' },
        { status: 404 }
      )
    }

    // Generate new share ID for remixed notebook
    const newShareId = uuidv4().slice(0, 8)

    // Generate notebook from modified recipe
    const notebook = await generateNotebookFromRecipe(modified_recipe, modified_recipe.modelCard.modelId)

    // Prepare remixed notebook data
    const remixedNotebookData = {
      share_id: newShareId,
      hf_model_id: modified_recipe.modelCard.modelId,
      recipe: modified_recipe,
      notebook_content: notebook,
      metadata: {
        model_info: modified_recipe.modelCard,
        generated_by: 'alacard',
        generated_at: new Date().toISOString(),
        forked_from: shareId
      },
      view_count: 0,
      download_count: 0,
      remix_count: 0,
      is_public: true
    }

    // Save remixed notebook
    const { data: savedNotebook, error: saveError } = await supabase
      .from('notebooks')
      .insert(remixedNotebookData)
      .select()
      .single()

    if (saveError) {
      console.error('Error saving remixed notebook:', saveError)
      return NextResponse.json(
        { error: 'Failed to save remixed notebook' },
        { status: 500 }
      )
    }

    // Increment remix count on original notebook
    const { error: updateError } = await supabase
      .from('notebooks')
      .update({ remix_count: originalNotebook.remix_count + 1 })
      .eq('share_id', shareId)

    if (updateError) {
      console.error('Error updating remix count:', updateError)
      // Don't fail the response, just log the error
    }

    const response: RemixResponse = {
      share_id: newShareId,
      notebook_url: `/api/notebook/download/${newShareId}`,
      forked_from: shareId
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Remix error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}