'use client'

import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-4xl mx-auto px-4 py-16">
        {/* Hero */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Alacard Arena
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Compare AI models head-to-head with visual cards and shareable results
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/arena"
              className="px-8 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
            >
              Start Comparing
            </Link>
            <a
              href="#features"
              className="px-8 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Learn More
            </a>
          </div>
        </div>

        {/* Features */}
        <div id="features" className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="text-center">
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Fast Comparisons</h3>
            <p className="text-gray-600">
              Get side-by-side results from multiple AI models in seconds
            </p>
          </div>

          <div className="text-center">
            <div className="text-4xl mb-4">🎴</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Visual Card Interface</h3>
            <p className="text-gray-600">
              Intuitive card-based selection for models and prompts
            </p>
          </div>

          <div className="text-center">
            <div className="text-4xl mb-4">📓</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Notebook Generation</h3>
            <p className="text-gray-600">
              Export comparisons as runnable Jupyter notebooks
            </p>
          </div>
        </div>

        {/* How it works */}
        <div className="bg-white rounded-lg p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold">
                1
              </div>
              <h3 className="font-medium text-gray-900 mb-2">Select Models</h3>
              <p className="text-sm text-gray-600">Choose 2 models from the card deck</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold">
                2
              </div>
              <h3 className="font-medium text-gray-900 mb-2">Pick Prompts</h3>
              <p className="text-sm text-gray-600">Use preset prompts or create your own</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold">
                3
              </div>
              <h3 className="font-medium text-gray-900 mb-2">Compare Results</h3>
              <p className="text-sm text-gray-600">See side-by-side responses with metrics</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold">
                4
              </div>
              <h3 className="font-medium text-gray-900 mb-2">Share & Remix</h3>
              <p className="text-sm text-gray-600">Share results and let others remix</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to compare AI models?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Start building your comparison recipes today
          </p>
          <Link
            href="/arena"
            className="px-8 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
          >
            Get Started
          </Link>
        </div>
      </div>
    </div>
  )
}