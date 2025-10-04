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
        Select models and prompts to create your recipe
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{recipe.emoji}</span>
          <h3 className="font-semibold text-gray-900">{recipe.title}</h3>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-600">Models:</span>
          <div className="flex items-center gap-1">
            <span className="text-sm text-gray-700">{recipe.models[0].emoji}</span>
            <span className="text-sm text-gray-700">{recipe.models[0].name}</span>
            <span className="text-gray-400">vs</span>
            <span className="text-sm text-gray-700">{recipe.models[1].emoji}</span>
            <span className="text-sm text-gray-700">{recipe.models[1].name}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-600">Prompts:</span>
          <div className="flex items-center gap-1">
            {recipe.prompts.map((prompt, index) => (
              <span key={prompt.id} className="text-sm text-gray-700">
                {prompt.emoji} {prompt.text.slice(0, 30)}{prompt.text.length > 30 ? '...' : ''}
                {index < recipe.prompts.length - 1 && ','}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}