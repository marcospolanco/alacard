'use client'

import { useState, useEffect } from 'react'
import { Recipe, RecipeState, ModelCard, PromptCardPack, TopicCard, DifficultyCard, UIComponentCard } from '@/types'
import RecipeBar from '@/components/RecipeBar'
import GenerateButton from '@/components/GenerateButton'
import LoadingSpinner from '@/components/LoadingSpinner'
import NotebookResult from '@/components/NotebookResult'
import Link from 'next/link'

export default function Generator() {
  const [recipe, setRecipe] = useState<Recipe | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedNotebook, setGeneratedNotebook] = useState<any>(null)
  const [isShuffling, setIsShuffling] = useState(false)
  const [selectedCardType, setSelectedCardType] = useState<string | null>(null)
  const [availableCards, setAvailableCards] = useState<any>({})
  const [error, setError] = useState<string | null>(null)

  // Initialize with a shuffled recipe on page load
  useEffect(() => {
    handleShuffle()
  }, [])

  const handleShuffle = async () => {
    setIsShuffling(true)
    setError(null)
    try {
      const response = await fetch('/api/shuffle')
      if (response.ok) {
        const data = await response.json()
        setRecipe(data.recipe)
      } else {
        setError('Failed to shuffle recipe. Please try again.')
      }
    } catch (error) {
      console.error('Error shuffling recipe:', error)
      setError('Network error. Please check your connection.')
    } finally {
      setIsShuffling(false)
    }
  }

  const handleGenerateNotebook = async () => {
    if (!recipe) return

    setIsGenerating(true)
    setError(null)
    try {
      const response = await fetch('/api/notebook/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ recipe }),
      })

      if (response.ok) {
        const data = await response.json()
        setGeneratedNotebook(data)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to generate notebook')
      }
    } catch (error) {
      console.error('Error generating notebook:', error)
      setError('Network error. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const fetchCards = async (cardType: string) => {
    try {
      const response = await fetch(`/api/cards/${cardType}`)
      if (response.ok) {
        const data = await response.json()
        setAvailableCards(prev => ({ ...prev, [cardType]: data.cards }))
      } else {
        setError(`Failed to fetch ${cardType} cards`)
      }
    } catch (error) {
      console.error(`Error fetching ${cardType} cards:`, error)
      setError(`Network error loading ${cardType} cards`)
    }
  }

  const handleCardSelect = (cardType: string, card: any) => {
    if (!recipe) return

    const updatedRecipe = { ...recipe }
    switch (cardType) {
      case 'model':
        updatedRecipe.modelCard = card
        break
      case 'prompt':
        updatedRecipe.promptCards = card
        break
      case 'topic':
        updatedRecipe.topicCard = card
        break
      case 'difficulty':
        updatedRecipe.difficultyCard = card
        break
      case 'ui_component':
        updatedRecipe.uiComponentCard = card
        break
    }

    setRecipe(updatedRecipe)
    setSelectedCardType(null)
  }

  const handleCardTypeClick = async (cardType: string) => {
    if (selectedCardType === cardType) {
      setSelectedCardType(null)
    } else {
      setSelectedCardType(cardType)
      setError(null)
      if (!availableCards[cardType]) {
        await fetchCards(cardType)
      }
    }
  }

  if (generatedNotebook) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              🎉 Notebook Generated Successfully!
            </h1>
            <p className="text-gray-600 mb-6">
              Your custom notebook has been created using the recipe below.
            </p>
          </div>

          <NotebookResult notebook={generatedNotebook} />

          <div className="mt-8 flex gap-4 justify-center">
            <button
              onClick={() => {
                setGeneratedNotebook(null)
                handleShuffle()
              }}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
            >
              🎲 Generate Another
            </button>
            <Link
              href="/"
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              🏠 Back to Home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🎲 Recipe Builder
          </h1>
          <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
            Mix and match cards to create your perfect AI learning recipe.
            Shuffle for instant inspiration or customize each card yourself.
          </p>
        </div>

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

        {/* Shuffle Button */}
        <div className="text-center mb-8">
          <button
            onClick={handleShuffle}
            disabled={isShuffling}
            className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all font-medium text-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isShuffling ? (
              <>
                <LoadingSpinner />
                <span className="ml-2">Shuffling Cards...</span>
              </>
            ) : (
              <>
                🎲 Shuffle Recipe
              </>
            )}
          </button>
          <p className="text-sm text-gray-500 mt-2">
            Get a random but sensible combination of cards
          </p>
        </div>

        {/* Recipe Display */}
        <div className="mb-8">
          <RecipeBar recipe={recipe} loading={isShuffling} />
        </div>

        {/* Card Selection */}
        {recipe && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 text-center">
              Customize Your Recipe
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[
                { type: 'model', label: '🤖 Model', current: recipe.modelCard.name },
                { type: 'prompt', label: '💬 Prompts', current: recipe.promptCards.name },
                { type: 'topic', label: '🎯 Topic', current: recipe.topicCard.name },
                { type: 'difficulty', label: '📚 Level', current: recipe.difficultyCard.name },
                { type: 'ui_component', label: '🖥️ UI', current: recipe.uiComponentCard.name }
              ].map(({ type, label, current }) => (
                <div key={type} className="text-center">
                  <button
                    onClick={() => handleCardTypeClick(type)}
                    className={`w-full p-3 rounded-lg border transition-all ${
                      selectedCardType === type
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-sm font-medium">{label}</div>
                    <div className="text-xs text-gray-500 mt-1 truncate">{current}</div>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Card Options */}
        {selectedCardType && availableCards[selectedCardType] && (
          <div className="mb-8 bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Choose {selectedCardType === 'model' ? 'Model' :
                       selectedCardType === 'prompt' ? 'Prompt Pack' :
                       selectedCardType === 'topic' ? 'Topic' :
                       selectedCardType === 'difficulty' ? 'Difficulty' : 'UI Component'}
              </h3>
              <button
                onClick={() => setSelectedCardType(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
              {availableCards[selectedCardType].map((card: any) => (
                <button
                  key={card.id || card.modelId}
                  onClick={() => handleCardSelect(selectedCardType, card)}
                  className="p-4 text-left border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all"
                >
                  {selectedCardType === 'model' ? (
                    <>
                      <div className="font-medium text-gray-900">{card.name}</div>
                      <div className="text-sm text-gray-600">{card.description}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {card.downloads?.toLocaleString()} downloads • {card.pipeline_tag}
                      </div>
                    </>
                  ) : selectedCardType === 'prompt' ? (
                    <>
                      <div className="font-medium text-gray-900">{card.name}</div>
                      <div className="text-sm text-gray-600">{card.description}</div>
                      <div className="text-xs text-gray-500 mt-1">{card.prompts.length} prompts</div>
                    </>
                  ) : selectedCardType === 'topic' ? (
                    <>
                      <div className="font-medium text-gray-900">
                        {card.icon} {card.name}
                      </div>
                      <div className="text-sm text-gray-600">{card.description}</div>
                    </>
                  ) : selectedCardType === 'difficulty' ? (
                    <>
                      <div className="font-medium text-gray-900">{card.name}</div>
                      <div className="text-sm text-gray-600">{card.description}</div>
                    </>
                  ) : (
                    <>
                      <div className="font-medium text-gray-900">{card.name}</div>
                      <div className="text-sm text-gray-600">{card.description}</div>
                      <div className="text-xs text-gray-500 mt-1">{card.complexity}</div>
                    </>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Generate Button */}
        {recipe && (
          <div className="text-center">
            <GenerateButton
              onClick={handleGenerateNotebook}
              disabled={isGenerating || !recipe}
              loading={isGenerating}
            />
            <p className="text-sm text-gray-500 mt-2">
              Generate a customized Jupyter notebook based on your recipe
            </p>
          </div>
        )}

        {/* Loading State */}
        {(isGenerating || isShuffling) && (
          <div className="mt-8 text-center">
            <div className="inline-flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-lg p-6">
              <LoadingSpinner />
              <div className="text-left">
                <div className="text-blue-700 font-medium">
                  {isGenerating ? 'Generating Notebook...' : 'Shuffling Recipe...'}
                </div>
                <div className="text-sm text-blue-600">
                  {isGenerating
                    ? 'Creating your custom notebook with README parsing and code generation'
                    : 'Finding the perfect combination of cards for your recipe'
                  }
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tips */}
        <div className="mt-12 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">💡 Pro Tips</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="text-left p-4 bg-white rounded-lg border border-gray-200">
              <div className="font-medium text-gray-900 mb-2">🎲 Try Shuffle First</div>
              <div className="text-sm text-gray-600">
                Get inspired by random combinations. You can always customize individual cards afterward.
              </div>
            </div>
            <div className="text-left p-4 bg-white rounded-lg border border-gray-200">
              <div className="font-medium text-gray-900 mb-2">🎯 Match Topic to Use Case</div>
              <div className="text-sm text-gray-600">
                Choose topics that match your intended application for the most relevant examples.
              </div>
            </div>
            <div className="text-left p-4 bg-white rounded-lg border border-gray-200">
              <div className="font-medium text-gray-900 mb-2">📚 Start with Beginner</div>
              <div className="text-sm text-gray-600">
                If you're new to a model type, begin with the beginner difficulty for the best learning experience.
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-12 text-center">
          <Link
            href="/trending"
            className="text-blue-600 hover:text-blue-700 underline text-sm"
          >
            🔥 Browse trending notebooks →
          </Link>
        </div>
      </div>
    </div>
  )
}