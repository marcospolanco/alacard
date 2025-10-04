'use client'

import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-6xl mx-auto px-4 py-16">
        {/* Hero */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Alacard - AI Manuals for AI Models
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            The IKEA assembly layer for AI. Generate customized, educational Jupyter notebooks for any of the 2.1M+ models on Hugging Face through our card-based recipe builder.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/generator"
              className="px-8 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium text-lg"
            >
              🎲 Try Shuffle
            </Link>
            <Link
              href="/trending"
              className="px-8 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-lg"
            >
              🔥 Browse Trending
            </Link>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            No setup required • Generate notebooks in seconds • Free forever
          </p>
        </div>

        {/* Card System Preview */}
        <div className="bg-white rounded-xl p-8 shadow-sm mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Build Your Recipe with Cards</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-3xl mb-2">🦙</div>
              <h3 className="font-semibold text-gray-900 mb-1">Model Card</h3>
              <p className="text-sm text-gray-600">Choose from 2.1M+ HF models</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="text-3xl mb-2">💬</div>
              <h3 className="font-semibold text-gray-900 mb-1">Prompt Cards</h3>
              <p className="text-sm text-gray-600">Themed prompt packs</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="text-3xl mb-2">🎯</div>
              <h3 className="font-semibold text-gray-900 mb-1">Topic Card</h3>
              <p className="text-sm text-gray-600">Domain-specific examples</p>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="text-3xl mb-2">📚</div>
              <h3 className="font-semibold text-gray-900 mb-1">Difficulty</h3>
              <p className="text-sm text-gray-600">Beginner to Advanced</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="text-3xl mb-2">🖥️</div>
              <h3 className="font-semibold text-gray-900 mb-1">UI Component</h3>
              <p className="text-sm text-gray-600">Chat, API, or Dashboard</p>
            </div>
          </div>
        </div>

        {/* Features */}
        <div id="features" className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="text-center">
            <div className="text-4xl mb-4">🎲</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Shuffle & Discover</h3>
            <p className="text-gray-600">
              Remove analysis paralysis with one-click recipe generation
            </p>
          </div>

          <div className="text-center">
            <div className="text-4xl mb-4">🔄</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Remix & Share</h3>
            <p className="text-gray-600">
              Fork notebooks, modify recipes, and share with the community
            </p>
          </div>

          <div className="text-center">
            <div className="text-4xl mb-4">📈</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Trending & Quality</h3>
            <p className="text-gray-600">
              Community-driven curation surfaces the best notebooks
            </p>
          </div>
        </div>

        {/* How it works */}
        <div className="bg-white rounded-lg p-8 shadow-sm mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold">
                1
              </div>
              <h3 className="font-medium text-gray-900 mb-2">Shuffle Cards</h3>
              <p className="text-sm text-gray-600">Click "Shuffle" for instant recipe</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold">
                2
              </div>
              <h3 className="font-medium text-gray-900 mb-2">Customize</h3>
              <p className="text-sm text-gray-600">Swap cards or lock favorites</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold">
                3
              </div>
              <h3 className="font-medium text-gray-900 mb-2">Generate</h3>
              <p className="text-sm text-gray-600">Create customized notebook</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold">
                4
              </div>
              <h3 className="font-medium text-gray-900 mb-2">Share & Remix</h3>
              <p className="text-sm text-gray-600">Share and let others remix</p>
            </div>
          </div>
        </div>

        {/* Recipe Examples */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Popular Recipe Combinations</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg p-6 text-center shadow-sm border border-gray-200">
              <div className="flex justify-center gap-2 mb-3">
                <span className="text-2xl">🦙</span>
                <span className="text-2xl">🍞</span>
                <span className="text-2xl">🌱</span>
                <span className="text-2xl">💬</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Llama + Sourdough + Beginner</h3>
              <p className="text-sm text-gray-600 mb-3">Learn LLM basics with bread-making examples</p>
              <div className="text-xs text-gray-500">
                📈 234 remixes • ⬇️ 1.2K downloads
              </div>
            </div>
            <div className="bg-white rounded-lg p-6 text-center shadow-sm border border-gray-200">
              <div className="flex justify-center gap-2 mb-3">
                <span className="text-2xl">🤖</span>
                <span className="text-2xl">💼</span>
                <span className="text-2xl">🌳</span>
                <span className="text-2xl">🔌</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">DistilBERT + Business + Advanced</h3>
              <p className="text-sm text-gray-600 mb-3">Production API for text classification</p>
              <div className="text-xs text-gray-500">
                📈 156 remixes • ⬇️ 890 downloads
              </div>
            </div>
            <div className="bg-white rounded-lg p-6 text-center shadow-sm border border-gray-200">
              <div className="flex justify-center gap-2 mb-3">
                <span className="text-2xl">🎮</span>
                <span className="text-2xl">🎮</span>
                <span className="text-2xl">🌿</span>
                <span className="text-2xl">🖥️</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">FLAN-T5 + Gaming + Intermediate</h3>
              <p className="text-sm text-gray-600 mb-3">Interactive game development assistant</p>
              <div className="text-xs text-gray-500">
                📈 89 remixes • ⬇️ 567 downloads
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-16 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to make AI adoption trivial?
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Stop wasting hours on setup. Generate your first custom notebook in seconds and join the community making AI accessible to everyone.
          </p>
          <Link
            href="/generator"
            className="px-8 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium text-lg inline-block"
          >
            🎲 Shuffle Your First Recipe
          </Link>
          <p className="text-sm text-gray-500 mt-4">
            ✨ That was easy – guaranteed
          </p>
        </div>
      </div>
    </div>
  )
}