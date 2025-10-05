import React, { useState } from 'react';
import { Shuffle, Download, Share } from 'lucide-react';
import { LandingHero } from './components/LandingHero';
import { AdoptionCrisisSection } from './components/AdoptionCrisisSection';
import { PersonaCards } from './components/PersonaCards';
import { RecipeBuildingExplainer } from './components/RecipeBuildingExplainer';
import { GeneratorScreen } from './components/GeneratorScreen';
import { SharePage } from './components/SharePage';
import { RemixScreen } from './components/RemixScreen';
import { ModelCard } from './components/ModelCard';
import { PromptCard } from './components/PromptCard';
import { TopicCard } from './components/TopicCard';
import { DifficultyCard } from './components/DifficultyCard';
import { ComponentCard } from './components/ComponentCard';
import { RecipeBar } from './components/RecipeBar';
import { PlayingCardHand } from './components/PlayingCardHand';
import { ShuffleAnimation } from './components/ShuffleAnimation';
import { ShuffleToast } from './components/ShuffleToast';
import { GenerateButton } from './components/GenerateButton';
import { mockModels, mockPrompts, mockTopics, mockDifficulties, mockComponents } from './lib/mockData';

export interface SelectedCards {
  model?: any;
  prompt?: any;
  topic?: any;
  difficulty?: any;
  component?: any;
}

export default function App() {
  const [selectedCards, setSelectedCards] = useState<SelectedCards>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [showGenerator, setShowGenerator] = useState(false);
  const [showSharePage, setShowSharePage] = useState(false);
  const [showRemixScreen, setShowRemixScreen] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);
  const [showShuffleToast, setShowShuffleToast] = useState(false);

  const handleCardSelect = (type: keyof SelectedCards, card: any) => {
    setSelectedCards(prev => ({
      ...prev,
      [type]: prev[type]?.id === card.id ? undefined : card
    }));
  };

  const handleShuffle = () => {
    setIsShuffling(true);
  };

  const performShuffle = () => {
    const randomModel = mockModels[Math.floor(Math.random() * mockModels.length)];
    const randomPrompt = mockPrompts[Math.floor(Math.random() * mockPrompts.length)];
    const randomTopic = mockTopics[Math.floor(Math.random() * mockTopics.length)];
    const randomDifficulty = mockDifficulties[Math.floor(Math.random() * mockDifficulties.length)];
    const randomComponent = mockComponents[Math.floor(Math.random() * mockComponents.length)];

    setSelectedCards({
      model: randomModel,
      prompt: randomPrompt,
      topic: randomTopic,
      difficulty: randomDifficulty,
      component: randomComponent
    });
    setIsShuffling(false);
    setShowShuffleToast(true);
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    // Simulate notebook generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsGenerating(false);
    // In real app, this would generate and show the notebook
  };

  const canGenerate = selectedCards.model && selectedCards.prompt && selectedCards.topic && selectedCards.difficulty;

  // Show remix screen if requested
  if (showRemixScreen) {
    return <RemixScreen onBackToShare={() => setShowRemixScreen(false)} />;
  }

  // Show share page if requested
  if (showSharePage) {
    return <SharePage 
      onBackToGenerator={() => setShowSharePage(false)}
      onRemix={() => {
        setShowSharePage(false);
        setShowRemixScreen(true);
      }}
    />;
  }

  // Show generator screen if requested
  if (showGenerator) {
    return <GeneratorScreen />;
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--surface)', color: 'var(--ink)' }}>
      {/* Header */}
      <header className="border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-2xl font-semibold" style={{ fontWeight: '600' }}>
                🃏 alacard
              </div>
              <div className="text-sm" style={{ color: 'var(--ink-subtle)' }}>
                IKEA assembly layer for AI
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={handleShuffle}
                className="button shuffle"
                type="button"
              >
                <Shuffle size={16} />
                Deal me a hand
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Landing Hero */}
      <LandingHero 
        onShuffle={handleShuffle}
        onBrowseModels={() => {
          setShowGenerator(true);
        }}
      />

      {/* Adoption Crisis Section */}
      <AdoptionCrisisSection 
        onSeeExamples={() => {
          setShowGenerator(true);
        }}
      />

      {/* Persona Cards Section */}
      <PersonaCards 
        onSeeGeneratorFlow={() => {
          setShowGenerator(true);
        }}
      />

      {/* Recipe Building Explainer */}
      <RecipeBuildingExplainer 
        onGenerateNotebook={() => {
          setShowGenerator(true);
        }}
        onDealHand={handleShuffle}
      />

      <main className="max-w-7xl mx-auto px-6 py-8">

        {/* Playing Card Hand - Game-like display */}
        <PlayingCardHand 
          selectedCards={selectedCards}
          onShuffle={handleShuffle}
          showShuffleButton={true}
        />

        {/* Recipe Bar */}
        <div data-section="generator">
          <RecipeBar 
            selectedCards={selectedCards} 
            onGenerate={handleGenerate}
            canGenerate={canGenerate}
            isGenerating={isGenerating}
          />
        </div>

        {/* Card Selection Areas */}
        <div className="space-y-16 mt-12">
          {/* Model Cards */}
          <section data-section="models">
            <h2 className="text-3xl font-semibold mb-6" style={{ fontWeight: '600', lineHeight: '2.25rem' }}>
              🤖 Choose a Model
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockModels.map(model => (
                <ModelCard
                  key={model.id}
                  model={model}
                  isSelected={selectedCards.model?.id === model.id}
                  onSelect={() => handleCardSelect('model', model)}
                />
              ))}
            </div>
          </section>

          {/* Prompt Cards */}
          <section>
            <h2 className="text-3xl font-semibold mb-6" style={{ fontWeight: '600', lineHeight: '2.25rem' }}>
              💭 Pick a Prompt Pack
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockPrompts.map(prompt => (
                <PromptCard
                  key={prompt.id}
                  prompt={prompt}
                  isSelected={selectedCards.prompt?.id === prompt.id}
                  onSelect={() => handleCardSelect('prompt', prompt)}
                />
              ))}
            </div>
          </section>

          {/* Topic Cards */}
          <section>
            <h2 className="text-3xl font-semibold mb-6" style={{ fontWeight: '600', lineHeight: '2.25rem' }}>
              🎯 Select a Topic
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {mockTopics.map(topic => (
                <TopicCard
                  key={topic.id}
                  topic={topic}
                  isSelected={selectedCards.topic?.id === topic.id}
                  onSelect={() => handleCardSelect('topic', topic)}
                />
              ))}
            </div>
          </section>

          {/* Difficulty Cards */}
          <section>
            <h2 className="text-3xl font-semibold mb-6" style={{ fontWeight: '600', lineHeight: '2.25rem' }}>
              📊 Choose Complexity
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {mockDifficulties.map(difficulty => (
                <DifficultyCard
                  key={difficulty.id}
                  difficulty={difficulty}
                  isSelected={selectedCards.difficulty?.id === difficulty.id}
                  onSelect={() => handleCardSelect('difficulty', difficulty)}
                />
              ))}
            </div>
          </section>

          {/* Component Cards */}
          <section>
            <h2 className="text-3xl font-semibold mb-6" style={{ fontWeight: '600', lineHeight: '2.25rem' }}>
              🔧 Add UI Components
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockComponents.map(component => (
                <ComponentCard
                  key={component.id}
                  component={component}
                  isSelected={selectedCards.component?.id === component.id}
                  onSelect={() => handleCardSelect('component', component)}
                />
              ))}
            </div>
          </section>
        </div>

        {/* Generate Section */}
        <div className="mt-16 text-center">
          <GenerateButton 
            onGenerate={handleGenerate}
            canGenerate={canGenerate}
            isGenerating={isGenerating}
          />
          <p className="mt-4 text-sm" style={{ color: 'var(--ink-subtle)' }}>
            Generate a runnable Jupyter notebook that you can download and use immediately.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-16" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm" style={{ color: 'var(--ink-subtle)' }}>
              Making 2.1M+ Hugging Face models accessible through interactive notebooks
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setShowSharePage(true)}
                className="button secondary" 
                type="button"
              >
                <Share size={16} />
                Share Recipe
              </button>
              <button className="button secondary" type="button">
                <Download size={16} />
                Download
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Shuffle Animation Overlay */}
      <ShuffleAnimation 
        isShuffling={isShuffling}
        onComplete={performShuffle}
      />

      {/* Shuffle Toast Notification */}
      <ShuffleToast 
        show={showShuffleToast}
        onDismiss={() => setShowShuffleToast(false)}
        selectedCount={Object.values(selectedCards).filter(Boolean).length}
      />
    </div>
  );
}