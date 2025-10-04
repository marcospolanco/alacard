'use client'

import { ModelCard } from '@/types'

interface GenerateButtonProps {
  selectedModel: ModelCard | null
  isGenerating: boolean
  onGenerate: () => void
}

export default function GenerateButton({ selectedModel, isGenerating, onGenerate }: GenerateButtonProps) {
  const isDisabled = !selectedModel || isGenerating

  return (
    <button
      onClick={onGenerate}
      disabled={isDisabled}
      className={`
        px-8 py-4 rounded-lg font-medium transition-all duration-200
        ${isDisabled
          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
          : 'bg-blue-500 text-white hover:bg-blue-600 shadow-lg hover:shadow-xl transform hover:scale-105'
        }
        min-w-[200px]
        flex items-center justify-center gap-2
      `}
    >
      {isGenerating ? (
        <>
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          <span>Generating...</span>
        </>
      ) : (
        <>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Generate Notebook</span>
        </>
      )}
    </button>
  )
}