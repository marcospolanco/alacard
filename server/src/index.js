import express from 'express'
import morgan from 'morgan'
import fetch from 'node-fetch'
import { createClient } from '@supabase/supabase-js'
import { nanoid } from 'nanoid'
import { generateNotebook } from './notebook.js'

const app = express()
app.use(express.json({ limit: '1mb' }))
app.use(morgan('dev'))

// --- Supabase (optional) ---
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
  : null

// in-memory fallback store
const mem = { matches: new Map() }

// Utilities
function shortId() { return nanoid(10) }

// --- API: create + run a match ---
app.post('/api/match', async (req, res) => {
  try {
    const { model_a, model_b, system_prompt = 'Helpful assistant; answer concisely.', prompts = [] } = req.body || {}
    if (!model_a || !model_b || !Array.isArray(prompts) || prompts.length === 0) {
      return res.status(400).json({ error: 'model_a, model_b, prompts[] required' })
    }
    const share_id = shortId()

    const outputs = []
    for (const prompt of prompts) {
      const [a, b] = await Promise.all([
        runModel(model_a, system_prompt, prompt).catch(e => ({ error: e.message })),
        runModel(model_b, system_prompt, prompt).catch(e => ({ error: e.message }))
      ])
      outputs.push({ prompt, a: a.text || a.error || 'N/A', b: b.text || b.error || 'N/A', a_ms: a.ms || null, b_ms: b.ms || null })
    }

    const row = {
      share_id,
      model_a,
      model_b,
      system_prompt,
      prompts,
      outputs,
      scoring: null,
      meta: { created_with: 'alacard-server@0.1' }
    }

    await saveMatch(row)
    return res.json({ share_id, outputs })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'internal_error' })
  }
})

// --- API: score a match ---
app.post('/api/match/:share_id/score', async (req, res) => {
  const { share_id } = req.params
  const { winner, votes, rubric } = req.body || {}
  try {
    const existing = await loadMatch(share_id)
    if (!existing) return res.status(404).json({ error: 'not_found' })
    existing.scoring = { winner, votes: votes || null, rubric: rubric || null }
    await saveMatch(existing)
    return res.json({ ok: true })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'internal_error' })
  }
})

// --- API: fetch a match ---
app.get('/api/match/:share_id', async (req, res) => {
  const { share_id } = req.params
  try {
    const existing = await loadMatch(share_id)
    if (!existing) return res.status(404).json({ error: 'not_found' })
    return res.json(existing)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'internal_error' })
  }
})

// --- API: notebook generator ---
app.get('/api/notebook', async (req, res) => {
  const { hf_model: hfModelId, task = 'chat' } = req.query
  if (!hfModelId) return res.status(400).json({ error: 'hf_model required' })
  try {
    const nb = await generateNotebook({ hfModelId, task })
    const fname = `alacard_${String(hfModelId).replaceAll('/', '_')}.ipynb`
    res.setHeader('Content-Type', 'application/json; charset=utf-8')
    res.setHeader('Content-Disposition', `attachment; filename="${fname}"`)
    return res.send(JSON.stringify(nb, null, 2))
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'failed_to_generate_notebook' })
  }
})

// --- helpers: model runners ---
async function runModel(model, system, prompt) {
  const started = Date.now()
  if (model.startsWith('openai:')) {
    const name = model.split(':', 2)[1]
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) return { text: fallbackText(name, system, prompt), ms: Date.now() - started }
    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ model: name, messages: [ { role: 'system', content: system }, { role: 'user', content: prompt } ], temperature: 0.2 })
    })
    if (!resp.ok) return { text: fallbackText(name, system, prompt), ms: Date.now() - started }
    const data = await resp.json()
    const text = data?.choices?.[0]?.message?.content || ''
    return { text, ms: Date.now() - started }
  }
  if (model.startsWith('hf:')) {
    const repo = model.split(':', 2)[1]
    const token = process.env.HF_API_TOKEN || process.env.HUGGING_FACE_API_KEY
    const url = `https://api-inference.huggingface.co/models/${repo}`
    const headers = { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }
    const resp = await fetch(url, { method: 'POST', headers, body: JSON.stringify({ inputs: prompt }) })
    if (!resp.ok) return { text: fallbackText(repo, system, prompt), ms: Date.now() - started }
    const data = await resp.json()
    const text = Array.isArray(data) ? (data[0]?.generated_text || JSON.stringify(data)) : (data?.generated_text || JSON.stringify(data))
    return { text, ms: Date.now() - started }
  }
  return { text: fallbackText(model, system, prompt), ms: Date.now() - started }
}

function fallbackText(model, system, prompt) {
  return `[fallback:${model}] ${prompt}`
}

// --- helpers: persistence ---
async function saveMatch(row) {
  if (supabase) {
    const payload = {
      share_id: row.share_id,
      model_a: row.model_a,
      model_b: row.model_b,
      system_prompt: row.system_prompt,
      prompts: row.prompts,
      outputs: row.outputs,
      scoring: row.scoring,
      meta: row.meta
    }
    const { error } = await supabase.from('matches').upsert(payload, { onConflict: 'share_id' })
    if (error) console.warn('Supabase upsert failed:', error.message)
    return
  }
  mem.matches.set(row.share_id, JSON.parse(JSON.stringify(row)))
}

async function loadMatch(share_id) {
  if (supabase) {
    const { data, error } = await supabase.from('matches').select('*').eq('share_id', share_id).maybeSingle()
    if (error) {
      console.warn('Supabase select failed:', error.message)
      return null
    }
    return data
  }
  return mem.matches.get(share_id) || null
}

// --- Start server ---
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Alacard server listening on http://localhost:${PORT}`)
})

