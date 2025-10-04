import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { v4 as uuidv4 } from 'uuid'
import { Recipe, NotebookGenerationRequest, NotebookGenerationResponse } from '@/types'
import { generateNotebookFromRecipe } from '@/lib/notebook-generator'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as NotebookGenerationRequest
    const { recipe } = body

    if (!recipe || !recipe.modelCard || !recipe.promptCards || !recipe.topicCard ||
        !recipe.difficultyCard || !recipe.uiComponentCard) {
      return NextResponse.json(
        { error: 'Complete recipe is required' },
        { status: 400 }
      )
    }

    // Generate unique share ID
    const shareId = uuidv4().slice(0, 8)

    // Generate notebook from recipe
    const notebook = await generateNotebookFromRecipe(recipe, recipe.modelCard.modelId)

    // Prepare notebook data for storage
    const notebookData = {
      share_id: shareId,
      hf_model_id: recipe.modelCard.modelId,
      recipe: recipe,
      notebook_content: notebook,
      metadata: {
        model_info: recipe.modelCard,
        generated_by: 'alacard',
        generated_at: new Date().toISOString()
      },
      view_count: 0,
      download_count: 0,
      remix_count: 0,
      is_public: true
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
        share_url: `/share/${shareId}`,
        model_info: recipe.modelCard,
        warning: 'Notebook generated but not saved to database'
      })
    }

    const response: NotebookGenerationResponse = {
      share_id: shareId,
      notebook_url: `/api/notebook/download/${shareId}`,
      share_url: `/share/${shareId}`,
      model_info: recipe.modelCard
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Notebook generation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}