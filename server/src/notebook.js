import fetch from 'node-fetch'

// Generate a minimal ipynb v4 notebook pulling latest samples from HF README
export async function generateNotebook({ hfModelId, task = 'chat' }) {
  const meta = await fetchModelMeta(hfModelId)
  const sha = meta?.sha
  const pipelineTag = meta?.pipeline_tag || inferPipelineFromTags(meta?.tags)
  const readme = await fetchReadme(hfModelId, sha)
  const sample = extractFirstPythonBlock(readme) || extractFirstCodeBlock(readme) || null

  const helloCell = codeHelloCell(hfModelId, pipelineTag)
  const sampleCells = sample ? markdownAndCodeFromSample(sample) : []

  const nb = baseNotebook({
    title: `Alacard | ${hfModelId} Quickstart`,
    hfModelId,
    pipelineTag,
    helloCell,
    sampleCells,
    meta
  })
  return nb
}

function inferPipelineFromTags(tags = []) {
  if (!Array.isArray(tags)) return 'text-generation'
  if (tags.includes('text2text-generation')) return 'text2text-generation'
  return 'text-generation'
}

async function fetchModelMeta(hfModelId) {
  const url = `https://huggingface.co/api/models/${encodeURIComponent(hfModelId)}`
  const res = await fetch(url, { headers: hfAuthHeaders() })
  if (!res.ok) return null
  return res.json()
}

async function fetchReadme(hfModelId, sha) {
  const paths = []
  if (sha) paths.push(`https://huggingface.co/${hfModelId}/resolve/${sha}/README.md`)
  paths.push(`https://huggingface.co/${hfModelId}/raw/main/README.md`)
  for (const url of paths) {
    try {
      const res = await fetch(url, { headers: hfAuthHeaders() })
      if (res.ok) return await res.text()
    } catch (_) {}
  }
  return ''
}

function hfAuthHeaders() {
  const token = process.env.HF_API_TOKEN || process.env.HUGGING_FACE_API_KEY || ''
  return token ? { Authorization: `Bearer ${token}` } : {}
}

function extractFirstPythonBlock(md) {
  if (!md) return null
  const re = /```python\n([\s\S]*?)```/m
  const m = md.match(re)
  return m ? m[1].trim() : null
}

function extractFirstCodeBlock(md) {
  if (!md) return null
  const re = /```[a-zA-Z0-9_-]*\n([\s\S]*?)```/m
  const m = md.match(re)
  return m ? m[1].trim() : null
}

function markdownAndCodeFromSample(sample) {
  return [
    {
      cell_type: 'markdown',
      metadata: {},
      source: [
        '## Sample from model card\n',
        'This sample was extracted from the Hugging Face model README. It may require minor tweaks depending on your environment.\n'
      ]
    },
    {
      cell_type: 'code',
      metadata: {},
      source: [sample + '\n']
    }
  ]
}

function codeHelloCell(modelId, pipelineTag) {
  // Prefer HF Inference API for universal availability; fall back to transformers
  const useInference = true
  if (useInference) {
    return [
      'import os, requests\n',
      `MODEL_ID = '${modelId}'\n`,
      "API_TOKEN = os.environ.get('HF_API_TOKEN') or os.environ.get('HUGGING_FACE_API_KEY', '')\n",
      "API_URL = f'https://api-inference.huggingface.co/models/{MODEL_ID}'\n",
      'headers = {"Authorization": f"Bearer {API_TOKEN}"} if API_TOKEN else {}\n',
      'payload = {"inputs": "Hello from Alacard!"}\n',
      'resp = requests.post(API_URL, headers=headers, json=payload, timeout=60)\n',
      'print(resp.status_code)\n',
      'print(resp.json())\n'
    ]
  } else {
    const pipelineName = pipelineTag === 'text2text-generation' ? 'text2text-generation' : 'text-generation'
    return [
      'from transformers import pipeline\n',
      `pipe = pipeline('${pipelineName}', model='${modelId}')\n`,
      'out = pipe("Hello from Alacard!", max_new_tokens=64)\n',
      'print(out)\n'
    ]
  }
}

function baseNotebook({ title, hfModelId, pipelineTag, helloCell, sampleCells, meta }) {
  const cells = []
  cells.push({
    cell_type: 'markdown',
    metadata: {},
    source: [`# ${title}\n`, `Model: ${hfModelId}  \n`, `Pipeline: ${pipelineTag || 'n/a'}  \n`, `Source: https://huggingface.co/${hfModelId}\n`]
  })
  cells.push({
    cell_type: 'code',
    metadata: {},
    source: [
      '# Optional: install deps if not already present\n',
      '!pip -q install transformers huggingface_hub requests\n'
    ]
  })
  cells.push({
    cell_type: 'markdown',
    metadata: {},
    source: ['## Hello model (quick smoke test)\n']
  })
  cells.push({ cell_type: 'code', metadata: {}, source: helloCell })
  for (const c of sampleCells) cells.push(c)
  cells.push({
    cell_type: 'markdown',
    metadata: {},
    source: [
      '---\n',
      'Next steps:\n',
      '- Edit the prompt and parameters above.\n',
      '- Add evaluation or export cells.\n'
    ]
  })
  return {
    cells,
    metadata: {
      kernelspec: { display_name: 'Python 3', language: 'python', name: 'python3' },
      language_info: { name: 'python', version: '3.x' }
    },
    nbformat: 4,
    nbformat_minor: 5
  }
}

