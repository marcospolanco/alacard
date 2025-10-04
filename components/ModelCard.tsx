'use client'

import { ModelCard as ModelCardType } from '@/types'

interface ModelCardProps {
  model: ModelCardType
  isSelected: boolean
  onSelect: () => void
  disabled?: boolean
}

export default function ModelCard({ model, isSelected, onSelect, disabled = false }: ModelCardProps) {
  return (
    <button
      onClick={onSelect}
      disabled={disabled}
      className={`
        relative p-4 rounded-lg border-2 transition-all duration-200
        ${isSelected
          ? 'border-blue-500 bg-blue-50 shadow-lg transform scale-105'
          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        min-w-[200px] max-w-[250px]
      `}
    >
      {isSelected && (
        <div className="absolute -top-2 -right-2 bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">
          ✓
        </div>
      )}

      <div className="text-2xl mb-2">{model.emoji}</div>

      <div className="text-sm text-gray-500 mb-1">{model.provider.toUpperCase()}</div>

      <div className="font-semibold text-gray-900 mb-2">{model.name}</div>

      <div className="text-xs text-gray-600">{model.description}</div>

      {isSelected && (
        <div className="mt-3 pt-3 border-t border-blue-200">
          <div className="text-xs text-blue-600 font-medium">Selected</div>
        </div>
      )}
    </button>
  )
}