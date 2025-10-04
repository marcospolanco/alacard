'use client'

import LoadingSpinner from './LoadingSpinner'

interface GenerateButtonProps {
  onClick: () => void
  disabled?: boolean
  loading?: boolean
}

export default function GenerateButton({ onClick, disabled = false, loading = false }: GenerateButtonProps) {
  const isDisabled = disabled || loading

  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      className={`
        px-8 py-4 rounded-lg font-medium transition-all duration-200
        ${isDisabled
          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
          : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 shadow-lg hover:shadow-xl transform hover:scale-105'
        }
        min-w-[250px]
        flex items-center justify-center gap-2
      `}
    >
      {loading ? (
        <>
          <LoadingSpinner />
          <span>Generating Notebook...</span>
        </>
      ) : (
        <>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>🧪 Generate Notebook</span>
        </>
      )}
    </button>
  )
}