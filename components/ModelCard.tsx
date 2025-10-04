'use client'

import { ModelCard as ModelCardType } from '@/types'

interface ModelCardProps {
  model: ModelCardType
  isSelected: boolean
  onSelect: () => void
  disabled?: boolean
}

export default function ModelCard({ model, isSelected, onSelect, disabled = false }: ModelCardProps) {
  const formatDownloads = (downloads: number) => {
    if (downloads >= 1000000) {
      return `${(downloads / 1000000).toFixed(1)}M`
    } else if (downloads >= 1000) {
      return `${(downloads / 1000).toFixed(1)}K`
    }
    return downloads.toString()
  }

  const formatLikes = (likes: number) => {
    if (likes >= 1000) {
      return `${(likes / 1000).toFixed(1)}K`
    }
    return likes.toString()
  }

  return (
    <button
      onClick={onSelect}
      disabled={disabled}
      className={`
        relative p-4 rounded-lg border-2 transition-all duration-200 text-left
        ${isSelected
          ? 'border-blue-500 bg-blue-50 shadow-lg transform scale-105'
          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        w-full max-w-sm
      `}
    >
      {isSelected && (
        <div className="absolute -top-2 -right-2 bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">
          ✓
        </div>
      )}

      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-1">{model.name}</h3>
          <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded inline-block">
            {model.pipeline_tag}
          </div>
        </div>
      </div>

      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
        {model.description}
      </p>

      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            {formatDownloads(model.downloads)}
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            {formatLikes(model.likes)}
          </span>
        </div>
      </div>

      {model.tags && model.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {model.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
            >
              {tag}
            </span>
          ))}
          {model.tags.length > 3 && (
            <span className="text-xs text-gray-500">
              +{model.tags.length - 3} more
            </span>
          )}
        </div>
      )}

      {isSelected && (
        <div className="mt-3 pt-3 border-t border-blue-200">
          <div className="text-xs text-blue-600 font-medium">Selected for notebook generation</div>
        </div>
      )}
    </button>
  )
}