'use client'

import { NotebookGenerationResponse } from '@/types'

interface NotebookResultProps {
  notebook: NotebookGenerationResponse
}

export default function NotebookResult({ notebook }: NotebookResultProps) {
  const shareUrl = typeof window !== 'undefined' ?
    `${window.location.origin}/share/${notebook.share_id}` : ''
  const downloadUrl = `/api/notebook/download/${notebook.share_id}`

  const copyShareLink = async () => {
    if (shareUrl) {
      try {
        await window.navigator.clipboard.writeText(shareUrl)
        // Show success feedback
        const button = document.getElementById('copy-link-btn')
        if (button) {
          const originalText = button.textContent
          button.textContent = '✅ Copied!'
          setTimeout(() => {
            button.textContent = originalText
          }, 2000)
        }
      } catch (error) {
        console.error('Failed to copy link:', error)
        alert('Failed to copy link. Please copy manually.')
      }
    }
  }

  const handleDownload = async () => {
    try {
      const response = await fetch(downloadUrl)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = response.headers.get('Content-Disposition')?.split('filename=')[1]?.replace(/"/g, '') || 'notebook.ipynb'
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error('Download failed:', error)
      alert('Download failed. Please try again.')
    }
  }

  return (
    <div className="bg-white rounded-xl p-8 shadow-lg border border-green-200">
      {/* Success Header */}
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          🎉 Notebook Generated Successfully!
        </h2>
        <p className="text-gray-600">
          Your custom Jupyter notebook is ready to download and share.
        </p>
      </div>

      {/* Recipe Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-gray-900 mb-3">Recipe Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
          <div>
            <div className="text-2xl mb-1">🦙</div>
            <div className="text-sm font-medium text-gray-900">{notebook.model_info.name}</div>
            <div className="text-xs text-gray-600 truncate">{notebook.model_info.pipeline_tag}</div>
          </div>
          <div>
            <div className="text-2xl mb-1">💬</div>
            <div className="text-sm font-medium text-gray-900">Prompts</div>
            <div className="text-xs text-gray-600">Ready to use</div>
          </div>
          <div>
            <div className="text-2xl mb-1">🎯</div>
            <div className="text-sm font-medium text-gray-900">Topic</div>
            <div className="text-xs text-gray-600">Customized</div>
          </div>
          <div>
            <div className="text-2xl mb-1">📚</div>
            <div className="text-sm font-medium text-gray-900">Level</div>
            <div className="text-xs text-gray-600">Ready</div>
          </div>
          <div>
            <div className="text-2xl mb-1">🖥️</div>
            <div className="text-sm font-medium text-gray-900">UI</div>
            <div className="text-xs text-gray-600">Included</div>
          </div>
        </div>
      </div>

      {/* Model Information */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h4 className="font-medium text-gray-900 mb-3">📊 Model Details</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Type:</span>
            <span className="ml-2 font-medium">{notebook.model_info.pipeline_tag}</span>
          </div>
          <div>
            <span className="text-gray-500">Downloads:</span>
            <span className="ml-2 font-medium">
              {notebook.model_info.downloads.toLocaleString()}
            </span>
          </div>
          <div>
            <span className="text-gray-500">Likes:</span>
            <span className="ml-2 font-medium">{notebook.model_info.likes.toLocaleString()}</span>
          </div>
          <div>
            <span className="text-gray-500">License:</span>
            <span className="ml-2 font-medium">{notebook.model_info.license || 'Unknown'}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <button
          onClick={handleDownload}
          className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Download .ipynb
        </button>

        <button
          id="copy-link-btn"
          onClick={copyShareLink}
          className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium flex items-center justify-center gap-2"
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
          className="flex-1 px-6 py-3 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors font-medium text-center flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          View Share Page
        </a>
      </div>

      {/* Share Info */}
      <div className="text-center text-sm text-gray-500">
        <p>Share ID: <code className="bg-gray-100 px-2 py-1 rounded">{notebook.share_id}</code></p>
        <p className="mt-2">
          Share this notebook so others can remix and learn from it! 🔄
        </p>
      </div>

      {/* Next Steps */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h4 className="font-medium text-gray-900 mb-3">🚀 Next Steps</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="font-medium text-blue-900 mb-1">🏃‍♂️ Try Your Notebook</div>
            <div className="text-blue-700">
              Open in Jupyter or VS Code to run your custom notebook
            </div>
          </div>
          <div className="bg-green-50 rounded-lg p-3">
            <div className="font-medium text-green-900 mb-1">🔄 Remix & Share</div>
            <div className="text-green-700">
              Others can remix your notebook to create new variations
            </div>
          </div>
          <div className="bg-purple-50 rounded-lg p-3">
            <div className="font-medium text-purple-900 mb-1">🎨 Create More</div>
            <div className="text-purple-700">
              Try different recipes to explore various use cases
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}