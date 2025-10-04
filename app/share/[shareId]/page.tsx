'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { DEFAULT_MODELS } from '@/lib/presets'
import { Match } from '@/types'

export default function SharePage() {
  const params = useParams()
  const shareId = params.shareId as string

  const [match, setMatch] = useState<Match | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (shareId) {
      loadMatch()
    }
  }, [shareId])

  const loadMatch = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/match/${shareId}`)

      if (!response.ok) {
        if (response.status === 404) {
          setError('Comparison not found')
        } else {
          setError('Failed to load comparison')
        }
        return
      }

      const data = await response.json()
      setMatch(data)
    } catch (err) {
      setError('Failed to load comparison')
      console.error('Error loading match:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleRemix = () => {
    if (match) {
      window.location.href = `/arena?from=${shareId}`
    }
  }

  const handleCopyLink = () => {
    window.navigator.clipboard.writeText(window.location.href)
    alert('Link copied to clipboard!')
  }

  const handleDownloadNotebook = () => {
    if (match) {
      // Use Model B for notebook generation by default
      const hfModel = match.model_b.replace('openai:', '').replace('hf:', '')
      window.open(`/api/notebook?hf_model=${hfModel}&share_id=${shareId}`, '_blank')
    }
  }

  const getWinnerDisplay = () => {
    if (!match?.scoring?.winner) return null

    const winnerMap = {
      'A': { label: 'Model A', color: 'text-blue-600', bg: 'bg-blue-50' },
      'B': { label: 'Model B', color: 'text-purple-600', bg: 'bg-purple-50' },
      'tie': { label: 'Tie', color: 'text-gray-600', bg: 'bg-gray-50' }
    }

    const winner = winnerMap[match.scoring.winner]
    if (!winner) return null

    return (
      <div className={`${winner.bg} ${winner.color} px-4 py-2 rounded-lg font-medium`}>
        🏆 {winner.label}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading comparison...</p>
        </div>
      </div>
    )
  }

  if (error || !match) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Comparison Not Found</h1>
          <p className="text-gray-600 mb-6">{error || 'This comparison link may be expired or incorrect.'}</p>
          <a href="/arena" className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
            Create New Comparison
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Model Comparison Results</h1>
          <p className="text-gray-600">Share ID: {shareId}</p>
        </div>

        {/* Recipe Summary */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{match.meta.recipe?.emoji || '🔄'}</span>
              <h2 className="font-semibold text-gray-900">{match.meta.recipe?.title || 'Custom Comparison'}</h2>
            </div>
            {getWinnerDisplay()}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-2">Models Compared</h3>
              <div className="space-y-1">
                <div className="text-sm">
                  <span className="text-blue-600 font-medium">Model A:</span> {match.model_a}
                </div>
                <div className="text-sm">
                  <span className="text-purple-600 font-medium">Model B:</span> {match.model_b}
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-2">Test Date</h3>
              <div className="text-sm text-gray-700">
                {new Date(match.created_at).toLocaleDateString()} at{' '}
                {new Date(match.created_at).toLocaleTimeString()}
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-600 mb-2">Prompts Used</h3>
            <div className="space-y-1">
              {match.prompts.map((prompt, index) => (
                <div key={index} className="text-sm text-gray-700">
                  {index + 1}. {prompt}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-6 mb-8">
          {match.outputs?.items?.map((result, index) => (
            <div key={index} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                <h3 className="font-medium text-gray-900">Prompt {index + 1}</h3>
                <p className="text-sm text-gray-600 mt-1">{result.prompt}</p>
              </div>

              <div className="grid grid-cols-2 divide-x divide-gray-200">
                {/* Model A Result */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-blue-600">Model A</h4>
                    <span className="text-xs text-gray-500">{result.a_ms}ms</span>
                  </div>
                  <div className="text-sm text-gray-700 whitespace-pre-wrap bg-blue-50 rounded p-3">
                    {result.a}
                  </div>
                </div>

                {/* Model B Result */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-purple-600">Model B</h4>
                    <span className="text-xs text-gray-500">{result.b_ms}ms</span>
                  </div>
                  <div className="text-sm text-gray-700 whitespace-pre-wrap bg-purple-50 rounded p-3">
                    {result.b}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleRemix}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
          >
            🔄 Remix This Recipe
          </button>
          <button
            onClick={handleCopyLink}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            📋 Copy Link
          </button>
          <button
            onClick={handleDownloadNotebook}
            className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
          >
            📓 Run as Notebook
          </button>
          <a
            href="/arena"
            className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-center"
          >
            Create New Comparison
          </a>
        </div>
      </div>
    </div>
  )
}