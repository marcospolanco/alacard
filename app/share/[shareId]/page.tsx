'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Notebook } from '@/types'

export default function SharePage() {
  const params = useParams()
  const router = useRouter()
  const shareId = params.shareId as string

  const [notebook, setNotebook] = useState<Notebook | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (shareId) {
      loadNotebook()
    }
  }, [shareId])

  const loadNotebook = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/notebook/${shareId}`)

      if (!response.ok) {
        if (response.status === 404) {
          setError('Notebook not found')
        } else {
          setError('Failed to load notebook')
        }
        return
      }

      const data = await response.json()
      setNotebook(data)
    } catch (err) {
      setError('Failed to load notebook')
      console.error('Error loading notebook:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = () => {
    if (notebook) {
      window.open(`/api/notebook/download/${shareId}`, '_blank')
    }
  }

  const handleGenerateNew = () => {
    if (notebook) {
      router.push(`/generator?model=${encodeURIComponent(notebook.hf_model_id)}`)
    }
  }

  const copyShareLink = () => {
    const shareUrl = `${window.location.origin}/share/${shareId}`
    window.navigator.clipboard.writeText(shareUrl)
    alert('Share link copied to clipboard!')
  }

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading notebook...</p>
        </div>
      </div>
    )
  }

  if (error || !notebook) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Notebook Not Found</h1>
          <p className="text-gray-600 mb-6">{error || 'This notebook link may be expired or incorrect.'}</p>
          <button
            onClick={() => router.push('/generator')}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Create New Notebook
          </button>
        </div>
      </div>
    )
  }

  const modelInfo = notebook.metadata?.model_info

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Generated Notebook</h1>
          <p className="text-gray-600">Share ID: {shareId}</p>
        </div>

        {/* Model Information */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {modelInfo?.name || notebook.hf_model_id}
              </h2>
              <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                <span className="bg-gray-100 px-2 py-1 rounded">
                  {modelInfo?.pipeline_tag || 'text-generation'}
                </span>
                <span>Created: {new Date(notebook.created_at).toLocaleDateString()}</span>
                <span>Downloads: {notebook.download_count || 0}</span>
              </div>
              {modelInfo?.description && (
                <p className="text-gray-700 mb-4">{modelInfo.description}</p>
              )}
            </div>
          </div>

          {/* Model Stats */}
          {modelInfo && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {formatDownloads(modelInfo.downloads)}
                </div>
                <div className="text-sm text-gray-600">Downloads</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {formatLikes(modelInfo.likes)}
                </div>
                <div className="text-sm text-gray-600">Likes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {notebook.download_count}
                </div>
                <div className="text-sm text-gray-600">Notebook Downloads</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {modelInfo.tags.length}
                </div>
                <div className="text-sm text-gray-600">Tags</div>
              </div>
            </div>
          )}

          {/* Tags */}
          {modelInfo?.tags && modelInfo.tags.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Tags:</h4>
              <div className="flex flex-wrap gap-2">
                {modelInfo.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Notebook Preview */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">About This Notebook</h3>
          <div className="space-y-3 text-sm text-gray-700">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-600 font-bold text-xs">1</span>
              </div>
              <div>
                <strong>Environment Setup:</strong> Installs required packages (transformers, huggingface_hub)
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-600 font-bold text-xs">2</span>
              </div>
              <div>
                <strong>Hello Cell:</strong> Verifies model access with a minimal test
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-600 font-bold text-xs">3</span>
              </div>
              <div>
                <strong>Real Example:</strong> Code extracted from the model's README
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-600 font-bold text-xs">4</span>
              </div>
              <div>
                <strong>Documentation:</strong> Model information and next steps
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleDownload}
            className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download Notebook (.ipynb)
          </button>

          <button
            onClick={handleGenerateNew}
            className="flex-1 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Generate New with Same Model
          </button>

          <button
            onClick={copyShareLink}
            className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Copy Share Link
          </button>

          <button
            onClick={() => router.push('/generator')}
            className="flex-1 px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Create Different Notebook
          </button>
        </div>

        {/* Attribution */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            Generated by Alacard • Model ID: {notebook.hf_model_id}
          </p>
          <p className="mt-2">
            This notebook was automatically generated from the model's README using Alacard's notebook generation pipeline.
          </p>
        </div>
      </div>
    </div>
  )
}