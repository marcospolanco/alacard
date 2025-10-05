'use client'

import { Recipe } from '@/types'

interface RecipeBarProps {
  recipe: Recipe | null
  loading?: boolean
}

export default function RecipeBar({ recipe, loading = false }: RecipeBarProps) {
  if (loading) {
    return (
      <div className="bg-gray-100 border border-gray-200 rounded-lg p-4">
        <div className="animate-pulse space-y-2">
          <div className="h-4 bg-gray-300 rounded w-1/4"></div>
          <div className="h-3 bg-gray-300 rounded w-1/2"></div>
        </div>
      </div>
    )
  }

  if (!recipe) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center text-gray-500">
        🎲 Shuffle your cards or build your recipe to get started
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Your Recipe</h3>
        <div className="flex gap-2">
          {[
            { card: recipe.modelCard, icon: '🦙', label: 'Model' },
            { card: recipe.promptCards, icon: '💬', label: 'Prompts' },
            { card: recipe.topicCard, icon: recipe.topicCard.icon, label: 'Topic' },
            { card: recipe.difficultyCard, icon: recipe.difficultyCard.name.split(' ')[0], label: 'Level' },
            { card: recipe.uiComponentCard, icon: recipe.uiComponentCard.name.split(' ')[0], label: 'UI' }
          ].map(({ card, icon, label }) => (
            <div key={label} className="text-center">
              <div className="text-2xl mb-1">{icon}</div>
              <div className="text-xs text-gray-600">{label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-600 w-16">Model:</span>
            <div className="flex items-center gap-1">
              <span className="text-sm font-semibold text-gray-900">{recipe.modelCard.name}</span>
              <span className="text-xs text-gray-500">({recipe.modelCard.pipeline_tag})</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-600 w-16">Topic:</span>
            <div className="flex items-center gap-1">
              <span>{recipe.topicCard.icon}</span>
              <span className="text-sm text-gray-900">{recipe.topicCard.name}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-600 w-16">Difficulty:</span>
            <div className="flex items-center gap-1">
              <span>{recipe.difficultyCard.name.split(' ')[0]}</span>
              <span className="text-sm text-gray-900">{recipe.difficultyCard.level}</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-start gap-2">
            <span className="text-sm font-medium text-gray-600 w-16">Prompts:</span>
            <div className="flex-1">
              <div className="text-sm text-gray-900 font-medium">{recipe.promptCards.name}</div>
              <div className="text-xs text-gray-600">
                {recipe.promptCards.prompts.slice(0, 2).map((prompt, index) => (
                  <span key={index}>
                    "{prompt.slice(0, 20)}{prompt.length > 20 ? '...' : ''}"
                    {index < Math.min(1, recipe.promptCards.prompts.length - 1) && ' • '}
                  </span>
                ))}
                {recipe.promptCards.prompts.length > 2 && ` +${recipe.promptCards.prompts.length - 2} more`}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-600 w-16">UI:</span>
            <div className="flex items-center gap-1">
              <span>{recipe.uiComponentCard.name.split(' ')[0]}</span>
              <span className="text-sm text-gray-900">{recipe.uiComponentCard.type.replace('_', ' ')}</span>
              <span className="text-xs text-gray-500">({recipe.uiComponentCard.complexity})</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-blue-200">
        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-600">
            Recipe ready for generation • Click "Generate Notebook" below
          </div>
          <div className="flex gap-2">
            <button className="text-xs text-gray-500 hover:text-gray-700">
              🔄 Remix
            </button>
            <button className="text-xs text-gray-500 hover:text-gray-700">
              🔒 Lock Cards
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}