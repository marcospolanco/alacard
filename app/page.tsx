'use client'

import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-4xl mx-auto px-4 py-16">
        {/* Hero */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Alacard Notebook Generator
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Generate Jupyter notebooks from Hugging Face models with real code examples
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/generator"
              className="px-8 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
            >
              Generate Notebook
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
            <div className="text-4xl mb-4">🤖</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">HF Model Integration</h3>
            <p className="text-gray-600">
              Connect with popular Hugging Face models automatically
            </p>
          </div>

          <div className="text-center">
            <div className="text-4xl mb-4">📓</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Notebook Generation</h3>
            <p className="text-gray-600">
              Create Jupyter notebooks with real code examples from READMEs
            </p>
          </div>

          <div className="text-center">
            <div className="text-4xl mb-4">🔗</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Share & Download</h3>
            <p className="text-gray-600">
              Share generated notebooks and download them instantly
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
              <h3 className="font-medium text-gray-900 mb-2">Select Model</h3>
              <p className="text-sm text-gray-600">Choose from popular HF models</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold">
                2
              </div>
              <h3 className="font-medium text-gray-900 mb-2">Generate</h3>
              <p className="text-sm text-gray-600">AI extracts code from model README</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold">
                3
              </div>
              <h3 className="font-medium text-gray-900 mb-2">Download</h3>
              <p className="text-sm text-gray-600">Get ready-to-run Jupyter notebook</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold">
                4
              </div>
              <h3 className="font-medium text-gray-900 mb-2">Share</h3>
              <p className="text-sm text-gray-600">Share with others using simple links</p>
            </div>
          </div>
        </div>

        {/* Popular Models */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Popular Models</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg p-6 text-center shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-2">Llama-3.1-8B</h3>
              <p className="text-sm text-gray-600 mb-4">Meta's advanced conversational AI</p>
              <div className="text-xs text-gray-500">
                1.2M+ downloads • Text Generation
              </div>
            </div>
            <div className="bg-white rounded-lg p-6 text-center shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-2">DistilBERT</h3>
              <p className="text-sm text-gray-600 mb-4">Lightweight BERT for classification</p>
              <div className="text-xs text-gray-500">
                2.1M+ downloads • Classification
              </div>
            </div>
            <div className="bg-white rounded-lg p-6 text-center shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-2">BART Large CNN</h3>
              <p className="text-sm text-gray-600 mb-4">Text summarization model</p>
              <div className="text-xs text-gray-500">
                1.4M+ downloads • Summarization
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to generate notebooks?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Select a model and generate your first notebook in seconds
          </p>
          <Link
            href="/generator"
            className="px-8 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
          >
            Get Started
          </Link>
        </div>
      </div>
    </div>
  )
}