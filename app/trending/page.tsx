'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Notebook } from '@/types'
import LoadingSpinner from '@/components/LoadingSpinner'

export default function Trending() {
  const [trendingNotebooks, setTrendingNotebooks] = useState<Notebook[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeframe, setTimeframe] = useState('week')
  const [filters, setFilters] = useState({
    model: '',
    topic: '',
    difficulty: ''
  })

  useEffect(() => {
    fetchTrendingNotebooks()
  }, [timeframe, filters])

  const fetchTrendingNotebooks = async () => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        timeframe,
        ...(filters.model && { model: filters.model }),
        ...(filters.topic && { topic: filters.topic }),
        ...(filters.difficulty && { difficulty: filters.difficulty }),
        limit: '20'
      })

      const response = await fetch(`/api/trending?${params}`)
      if (response.ok) {
        const data = await response.json()
        setTrendingNotebooks(data.notebooks)
      } else {
        setError('Failed to load trending notebooks')
      }
    } catch (error) {
      console.error('Error fetching trending notebooks:', error)
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (filterType: string, value: string) => {
    setFilters(prev => ({ ...prev, [filterType]: value }))
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    })
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🔥 Trending Notebooks
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover the most popular and remixed notebooks from the community.
            See what recipes others are creating and find inspiration for your own.
          </p>
        </div>

        {/* Back to Generator */}
        <div className="text-center mb-8">
          <Link
            href="/generator"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
          >
            🎲 Create Your Own
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Filter Trending</h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Timeframe */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Timeframe
              </label>
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="day">Last 24 Hours</option>
                <option value="week">Last Week</option>
                <option value="month">Last Month</option>
                <option value="all">All Time</option>
              </select>
            </div>

            {/* Model Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Model
              </label>
              <input
                type="text"
                value={filters.model}
                onChange={(e) => handleFilterChange('model', e.target.value)}
                placeholder="Filter by model..."
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Topic Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Topic
              </label>
              <select
                value={filters.topic}
                onChange={(e) => handleFilterChange('topic', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Topics</option>
                <option value="sourdough">🍞 Sourdough</option>
                <option value="healthcare">🏥 Healthcare</option>
                <option value="gamedev">🎮 Game Dev</option>
                <option value="finance">💼 Finance</option>
                <option value="education">🎓 Education</option>
              </select>
            </div>

            {/* Difficulty Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Difficulty
              </label>
              <select
                value={filters.difficulty}
                onChange={(e) => handleFilterChange('difficulty', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Levels</option>
                <option value="beginner">🌱 Beginner</option>
                <option value="intermediate">🌿 Intermediate</option>
                <option value="advanced">🌳 Advanced</option>
              </select>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <LoadingSpinner />
            <p className="text-gray-600 mt-4">Loading trending notebooks...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <div className="flex items-center justify-center gap-3">
              <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-red-700">{error}</span>
            </div>
            <button
              onClick={fetchTrendingNotebooks}
              className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Trending Notebooks */}
        {!loading && !error && (
          <>
            {trendingNotebooks.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📭</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No trending notebooks found
                </h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your filters or be the first to create a notebook!
                </p>
                <Link
                  href="/generator"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                >
                  🎲 Create First Notebook
                </Link>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {trendingNotebooks.map((notebook) => (
                    <div key={notebook.share_id} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                      {/* Recipe Summary */}
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex gap-2">
                          {notebook.recipe?.modelCard && (
                            <span className="text-2xl">🦙</span>
                          )}
                          {notebook.recipe?.topicCard && (
                            <span className="text-2xl">{notebook.recipe.topicCard.icon}</span>
                          )}
                          {notebook.recipe?.difficultyCard && (
                            <span className="text-2xl">{notebook.recipe.difficultyCard.name.split(' ')[0]}</span>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-gray-500">
                            {formatDate(notebook.created_at)}
                          </div>
                        </div>
                      </div>

                      {/* Title */}
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                        {notebook.recipe?.modelCard?.name} - {notebook.recipe?.topicCard?.name}
                      </h3>

                      {/* Recipe Details */}
                      <div className="text-sm text-gray-600 mb-4 space-y-1">
                        <div>🎯 {notebook.recipe?.topicCard?.name}</div>
                        <div>📚 {notebook.recipe?.difficultyCard?.level}</div>
                        <div>🖥️ {notebook.recipe?.uiComponentCard?.name}</div>
                      </div>

                      {/* Model Info */}
                      <div className="text-xs text-gray-500 mb-4">
                        Model: {notebook.hf_model_id.split('/').pop()}
                      </div>

                      {/* Metrics */}
                      <div className="flex justify-between items-center text-sm text-gray-600 mb-4">
                        <div className="flex gap-4">
                          <span>📈 {formatNumber(notebook.remix_count)}</span>
                          <span>⬇️ {formatNumber(notebook.download_count)}</span>
                          <span>👁️ {formatNumber(notebook.view_count)}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Link
                          href={`/share/${notebook.share_id}`}
                          className="flex-1 px-3 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors text-center"
                        >
                          View
                        </Link>
                        <button
                          onClick={() => window.open(`/api/notebook/download/${notebook.share_id}`, '_blank')}
                          className="flex-1 px-3 py-2 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-colors"
                        >
                          Download
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Load More */}
                <div className="text-center mt-8">
                  <button
                    onClick={() => {
                      // In a real implementation, this would load more notebooks
                      alert('Load more functionality would be implemented here')
                    }}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                  >
                    Load More Notebooks
                  </button>
                </div>
              </>
            )}
          </>
        )}

        {/* Stats */}
        {!loading && !error && trendingNotebooks.length > 0 && (
          <div className="mt-12 bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Community Stats</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {trendingNotebooks.reduce((sum, nb) => sum + nb.remix_count, 0)}
                </div>
                <div className="text-sm text-gray-600">Total Remixes</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {trendingNotebooks.reduce((sum, nb) => sum + nb.download_count, 0)}
                </div>
                <div className="text-sm text-gray-600">Total Downloads</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {trendingNotebooks.reduce((sum, nb) => sum + nb.view_count, 0)}
                </div>
                <div className="text-sm text-gray-600">Total Views</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">
                  {trendingNotebooks.length}
                </div>
                <div className="text-sm text-gray-600">Active Notebooks</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}