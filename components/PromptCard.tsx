'use client'

import { PromptCard as PromptCardType } from '@/types'
import { useState } from 'react'

interface PromptCardProps {
  prompt: PromptCardType
  onUpdate: (id: string, text: string) => void
  disabled?: boolean
}

export default function PromptCard({ prompt, onUpdate, disabled = false }: PromptCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedText, setEditedText] = useState(prompt.text)

  const handleSave = () => {
    onUpdate(prompt.id, editedText)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditedText(prompt.text)
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSave()
    } else if (e.key === 'Escape') {
      handleCancel()
    }
  }

  return (
    <div className={`
      p-3 rounded-lg border transition-all duration-200
      ${disabled ? 'border-gray-200 bg-gray-50' : 'border-gray-200 bg-white hover:border-gray-300'}
      min-w-[300px] max-w-[400px]
    `}>
      <div className="flex items-start justify-between mb-2">
        <span className="text-xl">{prompt.emoji}</span>

        {!disabled && (
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            title={isEditing ? 'Cancel' : 'Edit prompt'}
          >
            {isEditing ? '✕' : '✏️'}
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-2">
          <textarea
            value={editedText}
            onChange={(e) => setEditedText(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full p-2 border border-gray-300 rounded text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={2}
            placeholder="Enter your prompt..."
            autoFocus
          />
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
            >
              Save
            </button>
            <button
              onClick={handleCancel}
              className="px-3 py-1 bg-gray-300 text-gray-700 text-xs rounded hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-gray-700 line-clamp-3">
          {prompt.text}
        </p>
      )}

      {isEditing && (
        <div className="mt-2 text-xs text-gray-500">
          Press Enter to save, Esc to cancel
        </div>
      )}
    </div>
  )
}