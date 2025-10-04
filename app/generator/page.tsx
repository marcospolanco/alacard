'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import ModelCard from '@/components/ModelCard'
import GenerateButton from '@/components/GenerateButton'
import CategoryFilter from '@/components/CategoryFilter'
import LoadingSpinner from '@/components/LoadingSpinner'
import NotebookResult from '@/components/NotebookResult'
import { POPULAR_MODELS, DEFAULT_MODEL } from '@/lib/presets'
import { BackendAPI } from '@/lib/backend-api'
import { useWebSocketProgress } from '@/hooks/useWebSocketProgress'
import { ModelCard as ModelCardType, NotebookGenerationResponse, TaskStatus } from '@/types'

export default function Generator() {
  const searchParams = useSearchParams()
  const [selectedModel, setSelectedModel] = useState<ModelCardType | null>(null)
  const [popularModels, setPopularModels] = useState<ModelCardType[]>([])
  const [filteredModels, setFilteredModels] = useState<ModelCardType[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationResult, setGenerationResult] = useState<NotebookGenerationResponse | null>(null)
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null)
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

  // WebSocket progress tracking
  const { progress, isConnected, usePolling } = useWebSocketProgress(currentTaskId)

  // Handle progress updates
  useEffect(() => {
    if (progress) {
      if (progress.status === 'completed' && progress.share_id) {
        setIsGenerating(false)
        setGenerationResult({
          shareId: progress.share_id,
          modelId: selectedModel?.modelId || '',
          modelInfo: selectedModel
        })
        setCurrentTaskId(null)
      } else if (progress.status === 'failed') {
        setIsGenerating(false)
        setError(progress.error || 'Generation failed')
        setCurrentTaskId(null)
      }
    }
  }, [progress, selectedModel])

  const loadPopularModels = async () => {
    try {
      const models = await BackendAPI.getPopularModels()
      setPopularModels(models)
      setFilteredModels(models)

      // Select default model if none selected
      if (!selectedModel) {
        const defaultModel = models.find(m => m.modelId === DEFAULT_MODEL)
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

  const handleCategoryChange = async (category: string | null) => {
    setSelectedCategory(category)

    if (category) {
      try {
        const models = await BackendAPI.searchModels(category)
        setFilteredModels(models)
      } catch (error) {
        console.error('Error searching models:', error)
        // Fall back to client-side filtering
        const filtered = popularModels.filter(model =>
          model.pipeline_tag === category ||
          model.tags.includes(category)
        )
        setFilteredModels(filtered)
      }
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
      const taskResponse = await BackendAPI.generateNotebook(selectedModel.modelId)
      setCurrentTaskId(taskResponse.task_id)

    } catch (error) {
      console.error('Error generating notebook:', error)
      setError('Failed to generate notebook. Please try again.')
      setIsGenerating(false)
      setCurrentTaskId(null)
    }
  }

  const handleDownload = async () => {
    if (generationResult) {
      try {
        await BackendAPI.downloadNotebook(generationResult.shareId)
      } catch (error) {
        console.error('Error downloading notebook:', error)
        setError('Failed to download notebook')
      }
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
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
              <span className="text-blue-700 font-medium">
                Generating notebook...
                {isConnected && (
                  <span className="text-green-600 ml-2 text-sm">
                    ● Connected via WebSocket
                  </span>
                )}
                {usePolling && (
                  <span className="text-orange-600 ml-2 text-sm">
                    ● Using polling fallback
                  </span>
                )}
              </span>
            </div>

            {progress && (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-blue-600">
                    {progress.current_step || 'Processing...'}
                  </span>
                  <span className="text-sm text-blue-600 font-medium">
                    {progress.progress}%
                  </span>
                </div>

                <div className="w-full bg-blue-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${progress.progress}%` }}
                  ></div>
                </div>

                {progress.message && (
                  <p className="text-sm text-blue-600">{progress.message}</p>
                )}

                {progress.error && (
                  <p className="text-sm text-red-600">{progress.error}</p>
                )}
              </div>
            )}
          </div>
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