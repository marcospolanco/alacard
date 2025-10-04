'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import ModelCard from '@/components/ModelCard'
import PromptCard from '@/components/PromptCard'
import RecipeBar from '@/components/RecipeBar'
import ComparisonResults from '@/components/ComparisonResults'
import { DEFAULT_MODELS, DEFAULT_PROMPTS, RECIPE_TEMPLATES } from '@/lib/presets'
import { ModelCard as ModelCardType, PromptCard as PromptCardType, Recipe } from '@/types'

export default function Arena() {
  const searchParams = useSearchParams()
  const fromShareId = searchParams.get('from')

  const [selectedModels, setSelectedModels] = useState<[ModelCardType | null, ModelCardType | null]>([null, null])
  const [prompts, setPrompts] = useState<PromptCardType[]>(DEFAULT_PROMPTS)
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any[]>([])
  const [selectedWinner, setSelectedWinner] = useState<'A' | 'B' | 'tie' | null>(null)
  const [shareId, setShareId] = useState<string | null>(null)
  const [currentRecipe, setCurrentRecipe] = useState<Recipe | null>(null)

  // Load recipe from share if coming from share page
  useEffect(() => {
    if (fromShareId) {
      loadRecipeFromShare(fromShareId)
    }
  }, [fromShareId])

  const loadRecipeFromShare = async (shareId: string) => {
    try {
      const response = await fetch(`/api/match/${shareId}`)
      if (response.ok) {
        const match = await response.json()
        const recipe = match.meta.recipe

        // Find the models in our default list or create temporary ones
        const modelA = DEFAULT_MODELS.find(m => m.modelId === recipe.models[0]) || {
          id: recipe.models[0],
          name: recipe.models[0],
          provider: recipe.models[0].startsWith('openai:') ? 'openai' : 'hf',
          description: 'Custom model',
          emoji: '🤖',
          modelId: recipe.models[0]
        }

        const modelB = DEFAULT_MODELS.find(m => m.modelId === recipe.models[1]) || {
          id: recipe.models[1],
          name: recipe.models[1],
          provider: recipe.models[1].startsWith('openai:') ? 'openai' : 'hf',
          description: 'Custom model',
          emoji: '🤖',
          modelId: recipe.models[1]
        }

        // Reconstruct prompts
        const reconstructedPrompts = recipe.prompts.map((text: string, index: number) => ({
          id: `prompt-${index}`,
          text,
          emoji: DEFAULT_PROMPTS[index]?.emoji || '💭'
        }))

        setSelectedModels([modelA, modelB])
        setPrompts(reconstructedPrompts)
        setCurrentRecipe({
          models: [modelA, modelB],
          prompts: reconstructedPrompts,
          title: recipe.title || 'Remixed Recipe',
          emoji: recipe.emoji || '🔄'
        })
      }
    } catch (error) {
      console.error('Error loading recipe:', error)
    }
  }

  const handleModelSelect = (model: ModelCardType, position: 0 | 1) => {
    const newSelected = [...selectedModels] as [ModelCardType | null, ModelCardType | null]
    newSelected[position] = model
    setSelectedModels(newSelected)
    updateCurrentRecipe(newSelected, prompts)
  }

  const handlePromptUpdate = (id: string, text: string) => {
    const updatedPrompts = prompts.map(p => p.id === id ? { ...p, text } : p)
    setPrompts(updatedPrompts)
    updateCurrentRecipe(selectedModels, updatedPrompts)
  }

  const updateCurrentRecipe = (models: [ModelCardType | null, ModelCardType | null], promptCards: PromptCardType[]) => {
    if (models[0] && models[1]) {
      setCurrentRecipe({
        models: [models[0], models[1]],
        prompts: promptCards,
        title: 'Custom Comparison',
        emoji: '🔄'
      })
    }
  }

  const runComparison = async () => {
    if (!selectedModels[0] || !selectedModels[1] || prompts.length === 0) {
      alert('Please select two models and at least one prompt')
      return
    }

    setLoading(true)
    setResults([])
    setSelectedWinner(null)

    try {
      const response = await fetch('/api/match', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model_a: selectedModels[0].modelId,
          model_b: selectedModels[1].modelId,
          prompts: prompts.map(p => p.text)
        }),
      })

      if (!response.ok) {
        throw new Error('Comparison failed')
      }

      const data = await response.json()
      setResults(data.outputs || [])
      setShareId(data.share_id)

      // Update URL
      window.history.pushState({}, '', `/arena`)

    } catch (error) {
      console.error('Error running comparison:', error)
      alert('Failed to run comparison. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleWinnerSelect = async (winner: 'A' | 'B' | 'tie') => {
    if (!shareId) return

    setSelectedWinner(winner)

    try {
      await fetch(`/api/match/${shareId}/score`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ winner }),
      })
    } catch (error) {
      console.error('Error saving winner:', error)
    }
  }

  const copyShareLink = () => {
    if (shareId) {
      const shareUrl = `${window.location.origin}/share/${shareId}`
      window.navigator.clipboard.writeText(shareUrl)
      alert('Share link copied to clipboard!')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Alacard Arena</h1>
          <p className="text-lg text-gray-600">Compare AI models head-to-head</p>
        </div>

        {/* Recipe Templates */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Start Templates</h2>
          <div className="flex gap-3 flex-wrap">
            {RECIPE_TEMPLATES.map((template) => (
              <button
                key={template.title}
                onClick={() => {
                  // Apply template logic here
                  setCurrentRecipe({
                    models: [DEFAULT_MODELS[0], DEFAULT_MODELS[1]],
                    prompts: DEFAULT_PROMPTS,
                    title: template.title,
                    emoji: template.emoji
                  })
                  setSelectedModels([DEFAULT_MODELS[0], DEFAULT_MODELS[1]])
                }}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
              >
                <span className="mr-2">{template.emoji}</span>
                {template.title}
              </button>
            ))}
          </div>
        </div>

        {/* Recipe Bar */}
        <div className="mb-8">
          <RecipeBar recipe={currentRecipe} loading={loading} />
        </div>

        {/* Model Selection */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Models</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Model A</h3>
              <div className="space-y-2">
                {DEFAULT_MODELS.map((model) => (
                  <ModelCard
                    key={model.id}
                    model={model}
                    isSelected={selectedModels[0]?.id === model.id}
                    onSelect={() => handleModelSelect(model, 0)}
                    disabled={selectedModels[1]?.id === model.id}
                  />
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Model B</h3>
              <div className="space-y-2">
                {DEFAULT_MODELS.map((model) => (
                  <ModelCard
                    key={model.id}
                    model={model}
                    isSelected={selectedModels[1]?.id === model.id}
                    onSelect={() => handleModelSelect(model, 1)}
                    disabled={selectedModels[0]?.id === model.id}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Prompt Cards */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Prompts</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {prompts.map((prompt) => (
              <PromptCard
                key={prompt.id}
                prompt={prompt}
                onUpdate={handlePromptUpdate}
                disabled={loading}
              />
            ))}
          </div>
        </div>

        {/* Run Button */}
        <div className="text-center mb-8">
          <button
            onClick={runComparison}
            disabled={!selectedModels[0] || !selectedModels[1] || loading}
            className={`
              px-8 py-3 rounded-lg font-medium transition-colors
              ${!selectedModels[0] || !selectedModels[1] || loading
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-500 text-white hover:bg-blue-600'
              }
            `}
          >
            {loading ? 'Running Comparison...' : 'Run Comparison'}
          </button>
        </div>

        {/* Results */}
        {results.length > 0 && (
          <ComparisonResults
            results={results}
            modelA={selectedModels[0]?.modelId || ''}
            modelB={selectedModels[1]?.modelId || ''}
            onWinnerSelect={handleWinnerSelect}
            selectedWinner={selectedWinner}
            loading={loading}
          />
        )}
      </div>
    </div>
  )
}