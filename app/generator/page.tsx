'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import ModelCard from '@/components/ModelCard'
import GenerateButton from '@/components/GenerateButton'
import CategoryFilter from '@/components/CategoryFilter'
import LoadingSpinner from '@/components/LoadingSpinner'
import NotebookResult from '@/components/NotebookResult'
import { POPULAR_MODELS, DEFAULT_MODEL } from '@/lib/presets'
import { ModelCard as ModelCardType, NotebookGenerationResponse } from '@/types'

export default function Generator() {
  const searchParams = useSearchParams()
  const [selectedModel, setSelectedModel] = useState<ModelCardType | null>(null)
  const [popularModels, setPopularModels] = useState<ModelCardType[]>([])
  const [filteredModels, setFilteredModels] = useState<ModelCardType[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationResult, setGenerationResult] = useState<NotebookGenerationResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Load popular models on mount
  useEffect(() => {
    loadPopularModels()
  }, [])

  // Handle pre-selected model from URL params
  useEffect(() => {
    const modelId = searchParams.get('model')
    if (modelId && popularModels.length > 0) {
      const model = popularModels.find(m => m.modelId === modelId)
      if (model) {
        setSelectedModel(model)
      }
    }
  }, [searchParams, popularModels])

  const loadPopularModels = async () => {
    try {
      const response = await fetch('/api/models/popular')
      if (response.ok) {
        const data = await response.json()
        setPopularModels(data.models)
        setFilteredModels(data.models)

        // Select default model if none selected
        if (!selectedModel) {
          const defaultModel = data.models.find(m => m.modelId === DEFAULT_MODEL)
          if (defaultModel) {
            setSelectedModel(defaultModel)
          }
        }
      }
    } catch (error) {
      console.error('Error loading popular models:', error)
      setError('Failed to load models')
    }
  }

  const handleModelSelect = (model: ModelCardType) => {
    setSelectedModel(model)
    setGenerationResult(null)
    setError(null)
  }

  const handleCategoryChange = (category: string | null) => {
    setSelectedCategory(category)

    if (category) {
      const filtered = popularModels.filter(model =>
        model.category === category ||
        model.tags.includes(category) ||
        model.pipeline_tag === category
      )
      setFilteredModels(filtered)
    } else {
      setFilteredModels(popularModels)
    }
  }

  const handleGenerate = async () => {
    if (!selectedModel) return

    setIsGenerating(true)
    setError(null)
    setGenerationResult(null)

    try {
      const response = await fetch('/api/notebook/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          hf_model_id: selectedModel.modelId
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate notebook')
      }

      const data = await response.json()
      setGenerationResult(data)
    } catch (error) {
      console.error('Error generating notebook:', error)
      setError('Failed to generate notebook. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownload = () => {
    if (generationResult) {
      window.open(generationResult.notebook_url, '_blank')
    }
  }

  const handleShare = () => {
    if (generationResult) {
      const shareUrl = `${window.location.origin}/share/${generationResult.share_id}`
      window.open(shareUrl, '_blank')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Alacard Notebook Generator</h1>
          <p className="text-lg text-gray-600 mb-4">
            Generate Jupyter notebooks from Hugging Face models with real code examples
          </p>
        </div>

        {/* Generation Status */}
        {isGenerating && (
          <LoadingSpinner message="Generating notebook from model README..." />
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-red-700">{error}</span>
            </div>
          </div>
        )}

        {/* Generation Result */}
        {generationResult && !isGenerating && (
          <div className="mb-8">
            <NotebookResult
              result={generationResult}
              onDownload={handleDownload}
              onShare={handleShare}
            />
          </div>
        )}

        {!isGenerating && (
          <>
            {/* Category Filter */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Filter by Category</h2>
              <CategoryFilter
                selectedCategory={selectedCategory}
                onCategoryChange={handleCategoryChange}
              />
            </div>

            {/* Model Selection */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Select a Model {selectedCategory && `(${selectedCategory})`}
              </h2>

              {filteredModels.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No models found for this category.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredModels.map((model) => (
                    <ModelCard
                      key={model.id}
                      model={model}
                      isSelected={selectedModel?.id === model.id}
                      onSelect={() => handleModelSelect(model)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Generate Button */}
            <div className="text-center">
              <GenerateButton
                selectedModel={selectedModel}
                isGenerating={isGenerating}
                onGenerate={handleGenerate}
              />
            </div>
          </>
        )}

        {/* Instructions */}
        <div className="mt-12 bg-blue-50 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-3">How It Works</h3>
          <ol className="list-decimal list-inside space-y-2 text-blue-800">
            <li>Select a Hugging Face model from the options above</li>
            <li>Click "Generate Notebook" to create a Jupyter notebook</li>
            <li>The system fetches the model's README and extracts code examples</li>
            <li>Download your notebook with environment setup and working examples</li>
            <li>Share your notebook with others using the generated link</li>
          </ol>
        </div>
      </div>
    </div>
  )
}