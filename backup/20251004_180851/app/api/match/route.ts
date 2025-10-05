import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { v4 as uuidv4 } from 'uuid'
import { Match } from '@/types'

async function callOpenAI(prompt: string, model: string): Promise<{ response: string; duration: number }> {
  const startTime = Date.now()

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: model,
      messages: [
        {
          role: 'system',
          content: process.env.DEFAULT_SYSTEM_PROMPT || 'Helpful assistant; answer concisely.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 500,
      temperature: 0.7,
    }),
  })

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.statusText}`)
  }

  const data = await response.json()
  const duration = Date.now() - startTime

  return {
    response: data.choices[0].message.content,
    duration
  }
}

async function callHuggingFace(prompt: string, model: string): Promise<{ response: string; duration: number }> {
  const startTime = Date.now()

  const response = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.HF_API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      inputs: `<|im_start|>user\n${prompt}<|im_end|>\n<|im_start|>assistant\n`,
      parameters: {
        max_new_tokens: 500,
        temperature: 0.7,
        do_sample: true,
      }
    }),
  })

  if (!response.ok) {
    throw new Error(`Hugging Face API error: ${response.statusText}`)
  }

  const data = await response.json()
  const duration = Date.now() - startTime

  // Extract the assistant's response from the generated text
  const generatedText = data[0]?.generated_text || ''
  const assistantResponse = generatedText.split('<|im_start|>assistant\n').pop()?.split('<|im_end|>')[0] || generatedText

  return {
    response: assistantResponse.trim(),
    duration
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { model_a, model_b, system_prompt, prompts } = body

    if (!model_a || !model_b || !prompts || !Array.isArray(prompts)) {
      return NextResponse.json(
        { error: 'Missing required fields: model_a, model_b, prompts' },
        { status: 400 }
      )
    }

    // Generate unique share ID
    const shareId = uuidv4().slice(0, 8)

    // Prepare match data
    const matchData: Partial<Match> = {
      share_id: shareId,
      model_a,
      model_b,
      system_prompt: system_prompt || process.env.DEFAULT_SYSTEM_PROMPT,
      prompts,
      meta: {
        recipe: {
          models: [model_a, model_b],
          prompts,
          title: 'Custom Comparison',
          emoji: '🔄'
        }
      }
    }

    // Run comparisons for each prompt
    const outputs = []

    for (const prompt of prompts) {
      const results = await Promise.allSettled([
        callOpenAI(prompt, model_a.replace('openai:', '')),
        callOpenAI(prompt, model_b.replace('openai:', ''))
      ])

      const aResult = results[0]
      const bResult = results[1]

      // Handle failures gracefully
      const aResponse = aResult.status === 'fulfilled' ? aResult.value.response : 'Error: API call failed'
      const bResponse = bResult.status === 'fulfilled' ? bResult.value.response : 'Error: API call failed'
      const aDuration = aResult.status === 'fulfilled' ? aResult.value.duration : 0
      const bDuration = bResult.status === 'fulfilled' ? bResult.value.duration : 0

      outputs.push({
        prompt,
        a: aResponse,
        b: bResponse,
        a_ms: aDuration,
        b_ms: bDuration
      })
    }

    // Update match data with outputs
    matchData.outputs = { items: outputs }

    // Save to Supabase
    const { data: savedMatch, error } = await supabase
      .from('matches')
      .insert(matchData)
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      // Return results even if database save fails
      return NextResponse.json({
        share_id: shareId,
        outputs: outputs,
        warning: 'Results generated but not saved to database'
      })
    }

    return NextResponse.json({
      share_id: shareId,
      outputs: outputs
    })

  } catch (error) {
    console.error('Match creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}