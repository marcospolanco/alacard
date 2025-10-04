'use client'

interface ComparisonResult {
  prompt: string
  a: string
  b: string
  a_ms: number
  b_ms: number
  emoji?: string
}

interface ComparisonResultsProps {
  results: ComparisonResult[]
  modelA: string
  modelB: string
  onWinnerSelect: (winner: 'A' | 'B' | 'tie') => void
  selectedWinner: 'A' | 'B' | 'tie' | null
  loading?: boolean
}

export default function ComparisonResults({
  results,
  modelA,
  modelB,
  onWinnerSelect,
  selectedWinner,
  loading = false
}: ComparisonResultsProps) {
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center text-gray-500">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          Running model comparison...
        </div>
      </div>
    )
  }

  if (results.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        No results yet. Run a comparison to see results here.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Winner Selection */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-3">Select Winner</h3>
        <div className="flex gap-3">
          <button
            onClick={() => onWinnerSelect('A')}
            className={`
              px-4 py-2 rounded-lg font-medium transition-colors
              ${selectedWinner === 'A'
                ? 'bg-blue-500 text-white'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }
            `}
          >
            Model A Wins
          </button>
          <button
            onClick={() => onWinnerSelect('B')}
            className={`
              px-4 py-2 rounded-lg font-medium transition-colors
              ${selectedWinner === 'B'
                ? 'bg-purple-500 text-white'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }
            `}
          >
            Model B Wins
          </button>
          <button
            onClick={() => onWinnerSelect('tie')}
            className={`
              px-4 py-2 rounded-lg font-medium transition-colors
              ${selectedWinner === 'tie'
                ? 'bg-gray-500 text-white'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }
            `}
          >
            Tie
          </button>
        </div>
      </div>

      {/* Comparison Results */}
      {results.map((result, index) => (
        <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
            <h4 className="font-medium text-gray-900">
              {result.emoji && <span className="mr-2">{result.emoji}</span>}
              Prompt {index + 1}
            </h4>
            <p className="text-sm text-gray-600 mt-1">{result.prompt}</p>
          </div>

          <div className="grid grid-cols-2 divide-x divide-gray-200">
            {/* Model A Result */}
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h5 className="font-medium text-blue-600">Model A</h5>
                <span className="text-xs text-gray-500">{result.a_ms}ms</span>
              </div>
              <div className="text-sm text-gray-700 whitespace-pre-wrap bg-blue-50 rounded p-3">
                {result.a}
              </div>
            </div>

            {/* Model B Result */}
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h5 className="font-medium text-purple-600">Model B</h5>
                <span className="text-xs text-gray-500">{result.b_ms}ms</span>
              </div>
              <div className="text-sm text-gray-700 whitespace-pre-wrap bg-purple-50 rounded p-3">
                {result.b}
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Actions */}
      <div className="flex gap-3 justify-center pt-4">
        <button
          onClick={() => window.navigator.clipboard.writeText(window.location.href)}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Copy Share Link
        </button>
        <button
          onClick={() => {
            const shareId = window.location.pathname.split('/').pop()
            window.open(`/api/notebook?hf_model=${modelB}&share_id=${shareId}`, '_blank')
          }}
          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
        >
          Run as Notebook
        </button>
      </div>
    </div>
  )
}