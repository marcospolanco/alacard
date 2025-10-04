import { NextRequest, NextResponse } from 'next/server'
import { generateNotebook } from '@/lib/notebook-generator'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const hfModel = searchParams.get('hf_model')
    const shareId = searchParams.get('share_id')
    const task = searchParams.get('task') || 'chat'

    if (!hfModel) {
      return NextResponse.json(
        { error: 'hf_model parameter is required' },
        { status: 400 }
      )
    }

    // Generate notebook
    const notebook = await generateNotebook(hfModel, shareId || undefined)

    // Set headers for file download
    const headers = new Headers()
    headers.set('Content-Type', 'application/json')
    headers.set('Content-Disposition', `attachment; filename="alacard-${hfModel.replace('/', '-')}-${Date.now()}.ipynb"`)

    return new NextResponse(JSON.stringify(notebook, null, 2), {
      status: 200,
      headers
    })

  } catch (error) {
    console.error('Notebook generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate notebook' },
      { status: 500 }
    )
  }
}