'use client'

import { NotebookGenerationResponse } from '@/types'

interface NotebookResultProps {
  result: NotebookGenerationResponse | null
  onDownload: () => void
  onShare: () => void
}

export default function NotebookResult({ result, onDownload, onShare }: NotebookResultProps) {
  if (!result) {
    return null
  }

  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/share/${result.share_id}` : ''

  const copyShareLink = () => {
    if (shareUrl) {
      window.navigator.clipboard.writeText(shareUrl)
      alert('Share link copied to clipboard!')
    }
  }

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div>
          <h3 className="font-semibold text-green-800">Notebook Generated Successfully!</h3>
          <p className="text-sm text-green-700">
            Model: {result.model_info.name}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg p-4 mb-4">
        <h4 className="font-medium text-gray-900 mb-2">Model Information</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Pipeline Type:</span>
            <span className="ml-2 font-medium">{result.model_info.pipeline_tag}</span>
          </div>
          <div>
            <span className="text-gray-500">Downloads:</span>
            <span className="ml-2 font-medium">
              {result.model_info.downloads.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={onDownload}
          className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Download Notebook
        </button>

        <button
          onClick={copyShareLink}
          className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          Copy Share Link
        </button>

        <a
          href={shareUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors font-medium text-center"
        >
          View Share Page
        </a>
      </div>

      <div className="mt-4 text-xs text-gray-500">
        <p>Share ID: {result.share_id}</p>
      </div>
    </div>
  )
}