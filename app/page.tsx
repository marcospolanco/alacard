'use client'

import React, { useState } from 'react';
import { Shuffle, Download, Share } from 'lucide-react';
import { useAlacardGenerator } from '@/lib/hooks/useAlacardGenerator';
import { BackendAPI } from '@/lib/backend-api';
import ModelCard from '@/components/ModelCard';
import GenerateButton from '@/components/GenerateButton';
import LoadingSpinner from '@/components/LoadingSpinner';
import Link from 'next/link';

export default function Home() {
  const {
    selectedCards,
    models,
    isShuffling,
    showShuffleToast,
    showSharePage,
    showGenerator,
    generationState,
    canGenerate,
    handleCardSelect,
    handleShuffle,
    handleGenerate,
    resetGeneration,
    setShowShuffleToast,
    setShowSharePage,
    setShowGenerator,
    loadModels
  } = useAlacardGenerator();

  // State for custom model input
  const [customModelInput, setCustomModelInput] = useState('');
  const [modelValidation, setModelValidation] = useState<{
    isValid: boolean;
    message: string;
    isValidating: boolean;
  }>({ isValid: false, message: '', isValidating: false });

  // Validate HuggingFace model ID format
  const validateModelId = (modelId: string): boolean => {
    // Basic validation: should contain at least one slash and alphanumeric characters
    const modelIdRegex = /^[a-zA-Z0-9_-]+\/[a-zA-Z0-9_.-]+$/;
    return modelIdRegex.test(modelId);
  };

  // Validate model exists on HuggingFace
  const validateModelExists = async (modelId: string): Promise<boolean> => {
    try {
      const response = await fetch(`https://huggingface.co/api/models/${modelId}`, {
        method: 'HEAD', // Just check if it exists
        mode: 'no-cors' // Avoid CORS issues
      });
      return true; // If we can make the request, assume it exists
    } catch (error) {
      return false;
    }
  };

  // Handle custom model input
  const handleCustomModelSubmit = async () => {
    const modelId = customModelInput.trim();
    if (!modelId) return;

    setModelValidation({ isValid: false, message: '', isValidating: true });

    // Basic format validation
    if (!validateModelId(modelId)) {
      setModelValidation({
        isValid: false,
        message: 'Invalid format. Use format like "username/model-name"',
        isValidating: false
      });
      return;
    }

    // Create custom model object
    const customModel = {
      id: modelId,
      modelId: modelId,
      name: modelId.split('/').pop() || modelId,
      description: `Custom model: ${modelId}`,
      pipeline_tag: 'text-generation', // Default assumption
      downloads: 0,
      likes: 0,
      tags: ['custom']
    };

    // Select the model
    handleCardSelect('model', customModel);
    setCustomModelInput('');
    setModelValidation({
      isValid: true,
      message: `✅ Custom model selected: ${modelId}`,
      isValidating: false
    });
  };

  // Show share page if requested
  if (showSharePage && generationState.taskId) {
    // Create a simple share page view
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              🎉 Notebook Generated Successfully!
            </h1>
            <p className="text-gray-600 mb-6">
              Your notebook for {selectedCards.model?.name} has been created.
            </p>
            {generationState.validationSummary && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="text-green-800 font-semibold mb-2">Validation Results</h3>
                <div className="text-sm text-green-700">
                  <p>Status: {generationState.validationSummary.overall_status}</p>
                  <p>Cells Validated: {generationState.validationSummary.cells_validated}</p>
                  <p>Syntax Errors: {generationState.validationSummary.syntax_errors}</p>
                  <p>Runtime Errors: {generationState.validationSummary.runtime_errors}</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-4 justify-center">
            <button
              onClick={() => {
                setShowSharePage(false);
                resetGeneration();
              }}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
            >
              🎲 Generate Another
            </button>
            <Link
              href="/"
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              🏠 Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Show generator screen if requested
  if (showGenerator) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              🤖 Model Browser
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              Browse and select from popular Hugging Face models
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {models.map(model => (
              <ModelCard
                key={model.id}
                model={model}
                isSelected={selectedCards.model?.id === model.id}
                onSelect={() => handleCardSelect('model', model)}
              />
            ))}
          </div>

          <div className="text-center mt-8">
            <button
              onClick={() => setShowGenerator(false)}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              ← Back to Recipe Builder
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <header className="border-b bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-2xl font-semibold text-gray-900">
                🃏 alacard
              </div>
              <div className="text-sm text-gray-600">
                IKEA assembly layer for AI
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleShuffle}
                disabled={isShuffling}
                className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                type="button"
              >
                <Shuffle size={16} />
                {isShuffling ? 'Shuffling...' : 'Deal me a hand'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Build Your AI Recipe
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Select cards to create your perfect AI learning recipe. Shuffle for instant inspiration or customize each component yourself.
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={handleShuffle}
              disabled={isShuffling}
              className="px-8 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors font-medium text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isShuffling ? (
                <>
                  <LoadingSpinner />
                  <span className="ml-2">Shuffling Cards...</span>
                </>
              ) : (
                <>
                  <Shuffle size={20} />
                  <span>Shuffle Recipe</span>
                </>
              )}
            </button>
            <button
              onClick={() => setShowGenerator(true)}
              className="px-8 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium text-lg"
            >
              🤖 Browse All Models
            </button>
          </div>
        </div>

        {/* Selected Cards Display */}
        <div className="mb-8 p-6 bg-white rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Your Recipe</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="text-center p-4 bg-purple-50 rounded-lg border-2 border-purple-200">
              <div className="text-2xl mb-2">🤖</div>
              <div className="font-medium text-purple-900">
                {selectedCards.model?.name || 'Choose a Model'}
              </div>
              {selectedCards.model && (
                <div className="text-sm text-purple-700 mt-1">
                  {selectedCards.model.pipeline_tag}
                </div>
              )}
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
              <div className="text-2xl mb-2">💭</div>
              <div className="font-medium text-blue-900">
                {selectedCards.prompt?.name || 'Pick a Prompt'}
              </div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg border-2 border-green-200">
              <div className="text-2xl mb-2">🎯</div>
              <div className="font-medium text-green-900">
                {selectedCards.topic?.name || 'Select a Topic'}
              </div>
              {selectedCards.topic && (
                <div className="text-lg mt-1">{selectedCards.topic.icon}</div>
              )}
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg border-2 border-yellow-200">
              <div className="text-2xl mb-2">📊</div>
              <div className="font-medium text-yellow-900">
                {selectedCards.difficulty?.name || 'Choose Complexity'}
              </div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg border-2 border-red-200">
              <div className="text-2xl mb-2">🔧</div>
              <div className="font-medium text-red-900">
                {selectedCards.component?.name || 'Add Components'}
              </div>
            </div>
          </div>
        </div>

        {/* Model Selection */}
        <section className="mb-12">
          <h2 className="text-3xl font-semibold text-gray-900 mb-6">
            🤖 Choose a Model
          </h2>
          
          {/* Custom Model Input */}
          <div className="mb-8 p-6 bg-white rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              🔧 Use Custom Model
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Enter any HuggingFace model ID to generate a notebook (e.g., "openai-community/gpt2", "microsoft/DialoGPT-medium")
            </p>
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="e.g., openai-community/gpt2"
                value={customModelInput}
                onChange={(e) => setCustomModelInput(e.target.value)}
                className={`flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  modelValidation.isValid ? 'border-green-300 bg-green-50' : 
                  modelValidation.message && !modelValidation.isValid ? 'border-red-300 bg-red-50' : 
                  'border-gray-300'
                }`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleCustomModelSubmit();
                  }
                }}
              />
              <button
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleCustomModelSubmit}
                disabled={!customModelInput.trim() || modelValidation.isValidating}
              >
                {modelValidation.isValidating ? (
                  <>
                    <LoadingSpinner />
                    <span className="ml-2">Validating...</span>
                  </>
                ) : (
                  'Add Model'
                )}
              </button>
            </div>
            
            {/* Validation Messages */}
            {modelValidation.message && (
              <div className={`mt-4 p-3 rounded-lg border ${
                modelValidation.isValid ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
              }`}>
                <div className={`text-sm ${
                  modelValidation.isValid ? 'text-green-800' : 'text-red-800'
                }`}>
                  {modelValidation.message}
                </div>
              </div>
            )}
            
            {/* Selected Custom Model Display */}
            {selectedCards.model?.tags?.includes('custom') && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="text-sm text-blue-800">
                  ✅ Custom model selected: <span className="font-mono">{selectedCards.model.modelId}</span>
                </div>
              </div>
            )}
          </div>

          {/* Popular Models */}
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              📚 Popular Models
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {models.map(model => (
                <ModelCard
                  key={model.id}
                  model={model}
                  isSelected={selectedCards.model?.id === model.id}
                  onSelect={() => handleCardSelect('model', model)}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Generate Section */}
        <div className="text-center mb-12">
          <GenerateButton
            onClick={handleGenerate}
            disabled={!canGenerate || generationState.isGenerating}
            loading={generationState.isGenerating}
          />
          <p className="mt-4 text-sm text-gray-500">
            {canGenerate
              ? 'Generate a runnable Jupyter notebook that you can download and use immediately.'
              : 'Select at least one model to start generating your notebook.'
            }
          </p>
        </div>

        {/* Generation Progress */}
        {generationState.isGenerating && (
          <div className="text-center">
            <div className="inline-block p-6 bg-white rounded-lg shadow-sm border border-gray-200">
              <LoadingSpinner />
              <div className="mt-4">
                <div className="text-lg font-medium text-gray-900 mb-2">
                  {generationState.currentStep}
                </div>
                <div className="w-64 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${generationState.progress}%` }}
                  />
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  {generationState.progress}% complete
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {generationState.error && (
          <div className="text-center">
            <div className="inline-block p-6 bg-red-50 border border-red-200 rounded-lg">
              <div className="text-red-700 font-medium">
                ❌ Generation Failed
              </div>
              <div className="text-red-600 text-sm mt-2">
                {generationState.error}
              </div>
              <button
                onClick={resetGeneration}
                className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
              >
                Try Again
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t bg-white mt-16">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-600">
              Making 2.1M+ Hugging Face models accessible through interactive notebooks
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowSharePage(true)}
                disabled={!generationState.taskId}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                type="button"
              >
                <Share size={16} />
                Share Recipe
              </button>
              <button className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium" type="button">
                <Download size={16} />
                Download
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Shuffle Toast */}
      {showShuffleToast && (
        <div className="fixed bottom-4 right-4 p-4 bg-white rounded-lg shadow-lg border border-gray-200 max-w-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900">Recipe Shuffled! 🎲</div>
              <div className="text-sm text-gray-600">
                Selected {Object.values(selectedCards).filter(Boolean).length} cards
              </div>
            </div>
            <button
              onClick={() => setShowShuffleToast(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}