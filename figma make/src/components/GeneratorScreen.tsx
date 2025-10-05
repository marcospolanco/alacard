import React, { useState } from 'react';
import { Shuffle, Share, Zap, CheckCircle, Clock, FileText, Shield, Download } from 'lucide-react';
import { ModelCard } from './ModelCard';
import { PromptCard } from './PromptCard';
import { TopicCard } from './TopicCard';
import { DifficultyCard } from './DifficultyCard';
import { ComponentCard } from './ComponentCard';
import { mockModels, mockPrompts, mockTopics, mockDifficulties, mockComponents } from '../lib/mockData';

export interface SelectedCards {
  model?: any;
  prompt?: any;
  topic?: any;
  difficulty?: any;
  component?: any;
}

interface GenerationStatus {
  step: 'queued' | 'fetching' | 'generating' | 'validating' | 'ready';
  progress: number;
  taskId?: string;
}

export function GeneratorScreen() {
  const [selectedCards, setSelectedCards] = useState<SelectedCards>({});
  const [previousCards, setPreviousCards] = useState<SelectedCards>({});
  const [generationStatus, setGenerationStatus] = useState<GenerationStatus>({ step: 'queued', progress: 0 });
  const [isGenerating, setIsGenerating] = useState(false);
  const [showShuffleFeedback, setShowShuffleFeedback] = useState(false);
  const [animatingCards, setAnimatingCards] = useState<string[]>([]);

  const handleCardSelect = (type: keyof SelectedCards, card: any) => {
    setSelectedCards(prev => ({
      ...prev,
      [type]: prev[type]?.id === card.id ? undefined : card
    }));
  };

  const handleShuffle = () => {
    // Store previous cards for comparison
    setPreviousCards(selectedCards);
    
    const randomModel = mockModels[Math.floor(Math.random() * mockModels.length)];
    const randomPrompt = mockPrompts[Math.floor(Math.random() * mockPrompts.length)];
    const randomTopic = mockTopics[Math.floor(Math.random() * mockTopics.length)];
    const randomDifficulty = mockDifficulties[Math.floor(Math.random() * mockDifficulties.length)];
    const randomComponent = mockComponents[Math.floor(Math.random() * mockComponents.length)];

    const newCards = {
      model: randomModel,
      prompt: randomPrompt,
      topic: randomTopic,
      difficulty: randomDifficulty,
      component: randomComponent
    };

    setSelectedCards(newCards);
    setShowShuffleFeedback(true);
    setGenerationStatus({ step: 'queued', progress: 0 });
    
    // Trigger card animations with stagger
    const cardTypes = ['model', 'prompt', 'topic', 'difficulty', 'component'];
    cardTypes.forEach((type, index) => {
      setTimeout(() => {
        setAnimatingCards(prev => [...prev, type]);
      }, index * 40);
    });

    // Reset animations after they complete
    setTimeout(() => {
      setAnimatingCards([]);
    }, 1000);

    // Auto-dismiss feedback after 5 seconds
    setTimeout(() => {
      setShowShuffleFeedback(false);
    }, 5000);
  };

  const handleGenerate = async () => {
    if (!canGenerate) return;
    
    setShowShuffleFeedback(false);
    setIsGenerating(true);
    const steps = ['queued', 'fetching', 'generating', 'validating', 'ready'] as const;
    
    for (let i = 0; i < steps.length; i++) {
      setGenerationStatus({ 
        step: steps[i], 
        progress: (i + 1) * 20,
        taskId: 'task_abc123'
      });
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    setIsGenerating(false);
  };

  const handleDismissToast = () => {
    setShowShuffleFeedback(false);
  };

  // Handle ESC key to dismiss toast
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showShuffleFeedback) {
        handleDismissToast();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showShuffleFeedback]);

  // Determine which cards are new/changed
  const getCardChanges = () => {
    const changes = {
      model: selectedCards.model?.id !== previousCards.model?.id,
      prompt: selectedCards.prompt?.id !== previousCards.prompt?.id,
      topic: selectedCards.topic?.id !== previousCards.topic?.id,
      difficulty: selectedCards.difficulty?.id !== previousCards.difficulty?.id,
      component: selectedCards.component?.id !== previousCards.component?.id,
    };
    return changes;
  };

  const canGenerate = selectedCards.model && selectedCards.prompt && selectedCards.topic && selectedCards.difficulty;

  const statusSteps = [
    { key: 'queued', label: 'Queued', icon: Clock, active: generationStatus.step === 'queued' },
    { key: 'fetching', label: 'Fetching README', icon: Download, active: generationStatus.step === 'fetching' },
    { key: 'generating', label: 'Generating Cells', icon: FileText, active: generationStatus.step === 'generating' },
    { key: 'validating', label: 'Validating', icon: Shield, active: generationStatus.step === 'validating' },
    { key: 'ready', label: 'Ready', icon: CheckCircle, active: generationStatus.step === 'ready' }
  ];

  return (
    <div className="generator-screen">
      {/* Header */}
      <header className="generator-header">
        <div className="generator-container">
          <div className="header-content">
            <div className="header-left">
              <div className="logo-section">
                <span className="logo-icon">🃏</span>
                <span className="logo-text">alacard</span>
              </div>
            </div>
            <div className="header-right">
              <button className="button secondary" type="button">
                <Share size={16} />
                Open Share Page
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Recipe Bar */}
      <div className="recipe-bar-section">
        <div className="generator-container">
          <div className="recipe-bar-content">
            <div className="recipe-chips">
              <div className={`recipe-chip ${selectedCards.model ? 'chip--model' : 'chip--empty'}`}>
                <span>🤖</span>
                <span>{selectedCards.model?.name || 'Choose Model'}</span>
              </div>
              <div className={`recipe-chip ${selectedCards.prompt ? 'chip--model' : 'chip--empty'}`}>
                <span>💭</span>
                <span>{selectedCards.prompt?.name || 'Pick Prompt Pack'}</span>
              </div>
              <div className={`recipe-chip ${selectedCards.topic ? 'chip--model' : 'chip--empty'}`}>
                <span>🎯</span>
                <span>{selectedCards.topic?.name || 'Select Topic'}</span>
              </div>
              <div className={`recipe-chip ${selectedCards.difficulty ? 'chip--difficulty' : 'chip--empty'}`}>
                <span>📊</span>
                <span>{selectedCards.difficulty?.name || 'Choose Difficulty'}</span>
              </div>
              <div className={`recipe-chip ${selectedCards.component ? 'chip--component' : 'chip--empty'}`}>
                <span>🔧</span>
                <span>{selectedCards.component?.name || 'Add UI Component'}</span>
              </div>
              {showShuffleFeedback && (
                <div className="status-pill">
                  Queued
                </div>
              )}
            </div>
            <div className="share-id-section">
              <div className="share-id-placeholder">
                Share ID: {generationStatus.taskId || 'abc123def'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="generator-main">
        <div className="generator-container">
          <div className="generator-grid">
            {/* Left Column - Card Selection */}
            <div className="generator-left">
              <div className="shuffle-section">
                <button 
                  onClick={handleShuffle}
                  className={`button shuffle ${showShuffleFeedback ? 'pressed' : ''}`}
                  type="button"
                >
                  <Shuffle size={16} />
                  Deal me a hand
                </button>
                {showShuffleFeedback && (
                  <p className="shuffle-helper">Cards reshuffled</p>
                )}
              </div>

              {/* Model Section */}
              <section className={`card-section ${animatingCards.includes('model') ? 'animating' : ''}`}>
                <div className="section-header">
                  <h2 className="section-title">🤖 Model</h2>
                  {showShuffleFeedback && getCardChanges().model && (
                    <div className="new-combo-badge">
                      New combo
                    </div>
                  )}
                </div>
                <div className="cards-grid model-grid">
                  {mockModels.slice(0, 6).map(model => (
                    <ModelCard
                      key={model.id}
                      model={model}
                      isSelected={selectedCards.model?.id === model.id}
                      onSelect={() => handleCardSelect('model', model)}
                    />
                  ))}
                </div>
              </section>

              {/* Prompt Pack Section */}
              <section className={`card-section ${animatingCards.includes('prompt') ? 'animating' : ''}`}>
                <div className="section-header">
                  <h2 className="section-title">💭 Prompt Pack</h2>
                  {showShuffleFeedback && getCardChanges().prompt && (
                    <div className="new-combo-badge">
                      New combo
                    </div>
                  )}
                </div>
                <div className="cards-grid prompt-grid">
                  {mockPrompts.slice(0, 6).map(prompt => (
                    <PromptCard
                      key={prompt.id}
                      prompt={prompt}
                      isSelected={selectedCards.prompt?.id === prompt.id}
                      onSelect={() => handleCardSelect('prompt', prompt)}
                    />
                  ))}
                </div>
              </section>

              {/* Topic Section */}
              <section className={`card-section ${animatingCards.includes('topic') ? 'animating' : ''}`}>
                <div className="section-header">
                  <h2 className="section-title">🎯 Topic</h2>
                  {showShuffleFeedback && getCardChanges().topic && (
                    <div className="new-combo-badge">
                      New combo
                    </div>
                  )}
                </div>
                <div className="cards-grid topic-grid">
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

              {/* Difficulty Section */}
              <section className={`card-section ${animatingCards.includes('difficulty') ? 'animating' : ''}`}>
                <div className="section-header">
                  <h2 className="section-title">📊 Difficulty</h2>
                  {showShuffleFeedback && getCardChanges().difficulty && (
                    <div className="new-combo-badge">
                      New combo
                    </div>
                  )}
                </div>
                <div className="cards-grid difficulty-grid">
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

              {/* UI Component Section */}
              <section className={`card-section ${animatingCards.includes('component') ? 'animating' : ''}`}>
                <div className="section-header">
                  <h2 className="section-title">🔧 UI Component</h2>
                  {showShuffleFeedback && getCardChanges().component && (
                    <div className="new-combo-badge">
                      New combo
                    </div>
                  )}
                </div>
                <div className="cards-grid component-grid">
                  {mockComponents.slice(0, 6).map(component => (
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

            {/* Right Column - Status & Preview */}
            <div className="generator-right">
              {/* Generation Status */}
              <div className="status-section">
                <h3 className="status-title">Generation status</h3>
                {showShuffleFeedback ? (
                  <div className="status-simple">
                    <div className="status-item active">
                      <div className="status-icon">
                        <Clock size={16} />
                      </div>
                      <div className="status-content">
                        <span className="status-label">Queued (0%)</span>
                        <div className="status-note">
                          Waiting on POST /api/v1/notebook/generate
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="status-list">
                    {statusSteps.map((step, index) => {
                      const Icon = step.icon;
                      const isActive = step.active;
                      const isCompleted = statusSteps.findIndex(s => s.key === generationStatus.step) > index;
                      
                      return (
                        <div key={step.key} className={`status-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}>
                          <div className="status-icon">
                            <Icon size={16} />
                          </div>
                          <div className="status-content">
                            <span className="status-label">{step.label}</span>
                            {isActive && generationStatus.taskId && (
                              <div className="status-meta">
                                <span className="task-id">{generationStatus.taskId}</span>
                                <div className="progress-badge">
                                  {generationStatus.progress}%
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Notebook Preview */}
              <div className="preview-section">
                <h3 className="preview-title">Notebook Preview</h3>
                <div className="preview-card">
                  <div className="preview-summary">
                    <div className="summary-item">
                      <span className="summary-label">Model:</span>
                      <span className="summary-value">{selectedCards.model?.name || 'Not selected'}</span>
                    </div>
                    <div className="summary-item">
                      <span className="summary-label">Prompt Pack:</span>
                      <span className="summary-value">{selectedCards.prompt?.name || 'Not selected'}</span>
                    </div>
                    <div className="summary-item">
                      <span className="summary-label">Topic:</span>
                      <span className="summary-value">{selectedCards.topic?.name || 'Not selected'}</span>
                    </div>
                    <div className="summary-item">
                      <span className="summary-label">Difficulty:</span>
                      <span className="summary-value">{selectedCards.difficulty?.name || 'Not selected'}</span>
                    </div>
                    <div className="summary-item">
                      <span className="summary-label">UI Component:</span>
                      <span className="summary-value">{selectedCards.component?.name || 'Not selected'}</span>
                    </div>
                  </div>
                  
                  <div className="share-link-section">
                    <div className="share-link-placeholder">
                      <span className="share-link-label">Share Link:</span>
                      <span className="share-link-value">
                        https://supabase.co/share/{generationStatus.taskId || 'pending'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Generate Button */}
              <div className="generate-section">
                <button 
                  onClick={handleGenerate}
                  disabled={!canGenerate || isGenerating}
                  className={`button primary generate-button ${!canGenerate ? 'disabled' : ''}`}
                  type="button"
                >
                  <Zap size={16} />
                  {isGenerating ? 'Generating...' : 'Generate Notebook'}
                </button>
                <p className="generate-helper">
                  POST /api/v1/notebook/generate (async)
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Overlay for shuffle feedback */}
      {showShuffleFeedback && (
        <div className="shuffle-overlay" />
      )}

      {/* Toast Notification */}
      {showShuffleFeedback && (
        <div className="toast-notification">
          <div className="toast-content">
            <span className="toast-message">New recipe ready — tweak or generate</span>
            <button 
              onClick={handleGenerate}
              className="button primary toast-button"
              type="button"
            >
              Generate now
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        .generator-screen {
          min-height: 100vh;
          background: var(--surface);
          color: var(--ink);
          font-family: var(--font-sans);
        }

        .generator-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 24px;
        }

        /* Header */
        .generator-header {
          height: 64px;
          border-bottom: 1px solid var(--border);
          background: var(--surface);
        }

        .header-content {
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .logo-section {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .logo-icon {
          font-size: 24px;
        }

        .logo-text {
          font-size: 20px;
          font-weight: 600;
          color: var(--ink);
        }

        /* Recipe Bar */
        .recipe-bar-section {
          border-bottom: 1px solid var(--border);
          background: var(--surface-alt);
        }

        .recipe-bar-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 0;
          gap: 24px;
        }

        .recipe-chips {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
        }

        .recipe-chip {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: var(--radius-pill);
          background: var(--surface);
          border: 1px solid var(--border);
          font-size: 13px;
          font-weight: 500;
          min-width: 140px;
        }

        .recipe-chip.chip--model {
          border-color: var(--card-model-border);
          color: var(--card-model-accent);
        }

        .recipe-chip.chip--difficulty {
          border-color: var(--card-complexity-medium-border);
          color: var(--card-complexity-medium-accent);
        }

        .recipe-chip.chip--component {
          border-color: var(--card-components-border);
          color: var(--card-components-accent);
        }

        .recipe-chip.chip--empty {
          color: var(--ink-subtle);
        }

        .share-id-section {
          font-size: 13px;
          color: var(--ink-subtle);
          white-space: nowrap;
        }

        .status-pill {
          padding: 4px 10px;
          border-radius: var(--radius-pill);
          background: var(--card-model-bg);
          color: var(--card-model-accent);
          font-size: 12px;
          font-weight: 500;
          border: 1px solid var(--card-model-border);
        }

        /* Main Grid */
        .generator-main {
          padding: 32px 0;
        }

        .generator-grid {
          display: grid;
          grid-template-columns: 7fr 5fr;
          gap: 32px;
          align-items: start;
        }

        /* Left Column */
        .generator-left {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .shuffle-section {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 8px;
        }

        .shuffle-helper {
          font-size: 12px;
          color: var(--ink-subtle);
          margin: 0;
          font-style: italic;
        }

        .button.shuffle.pressed {
          background: var(--cta-primary-hover);
          border-color: var(--focus-ring);
          box-shadow: 0 0 0 2px var(--focus-ring);
        }

        .card-section {
          display: flex;
          flex-direction: column;
          gap: 16px;
          transition: transform 160ms ease-out;
        }

        .card-section.animating {
          transform: translateY(-8px);
        }

        .section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .section-title {
          font-size: 20px;
          line-height: 28px;
          font-weight: 600;
          margin: 0;
          color: var(--ink);
        }

        .new-combo-badge {
          padding: 4px 10px;
          border-radius: var(--radius-pill);
          background: var(--shuffle-bg);
          color: var(--shuffle-fg);
          font-size: 12px;
          font-weight: 500;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }

        .cards-grid {
          display: grid;
          gap: 12px;
        }

        .model-grid,
        .prompt-grid,
        .component-grid {
          grid-template-columns: repeat(2, 1fr);
        }

        .topic-grid {
          grid-template-columns: repeat(4, 1fr);
        }

        .difficulty-grid {
          grid-template-columns: repeat(3, 1fr);
        }

        /* Right Column */
        .generator-right {
          display: flex;
          flex-direction: column;
          gap: 24px;
          position: sticky;
          top: 24px;
        }

        /* Status Section */
        .status-section {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .status-title {
          font-size: 18px;
          line-height: 26px;
          font-weight: 600;
          margin: 0;
          color: var(--ink);
        }

        .status-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .status-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 12px;
          border-radius: 8px;
          transition: background-color 160ms ease;
        }

        .status-item.active {
          background: var(--surface-alt);
        }

        .status-item.completed .status-icon {
          color: var(--card-complexity-easy-accent);
        }

        .status-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          color: var(--ink-subtle);
          transition: color 160ms ease;
        }

        .status-content {
          display: flex;
          flex-direction: column;
          gap: 4px;
          flex: 1;
        }

        .status-label {
          font-size: 14px;
          line-height: 20px;
          font-weight: 500;
          color: var(--ink);
        }

        .status-meta {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .task-id {
          font-size: 12px;
          font-family: var(--font-mono);
          color: var(--ink-subtle);
        }

        .progress-badge {
          padding: 2px 6px;
          border-radius: var(--radius-pill);
          background: var(--card-model-bg);
          color: var(--card-model-accent);
          font-size: 11px;
          font-weight: 600;
        }

        .status-simple {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .status-note {
          font-size: 12px;
          color: var(--ink-subtle);
          font-family: var(--font-mono);
        }

        /* Preview Section */
        .preview-section {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .preview-title {
          font-size: 18px;
          line-height: 26px;
          font-weight: 600;
          margin: 0;
          color: var(--ink);
        }

        .preview-card {
          padding: 16px;
          border-radius: var(--radius-card);
          border: 1px solid var(--border);
          background: var(--surface-alt);
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .preview-summary {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .summary-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          line-height: 20px;
        }

        .summary-label {
          font-weight: 500;
          color: var(--ink);
          min-width: 80px;
        }

        .summary-value {
          color: var(--ink-subtle);
          flex: 1;
          font-size: 13px;
        }

        .share-link-section {
          padding-top: 12px;
          border-top: 1px solid var(--border);
        }

        .share-link-placeholder {
          font-size: 12px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .share-link-label {
          color: var(--ink);
          font-weight: 500;
        }

        .share-link-value {
          color: var(--ink-subtle);
          font-family: var(--font-mono);
          word-break: break-all;
        }

        /* Generate Section */
        .generate-section {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 8px;
        }

        .generate-button {
          min-width: 180px;
        }

        .generate-button.disabled {
          opacity: 0.5;
          cursor: not-allowed;
          pointer-events: none;
        }

        .generate-helper {
          font-size: 12px;
          color: var(--ink-subtle);
          font-family: var(--font-mono);
          margin: 0;
          text-align: right;
        }

        .button:focus-visible {
          outline: 2px solid var(--focus-ring);
          outline-offset: 2px;
        }

        /* Responsive */
        @media (max-width: 1280px) {
          .generator-container {
            max-width: 1024px;
          }

          .generator-grid {
            grid-template-columns: 2fr 1fr;
            gap: 24px;
          }

          .model-grid,
          .prompt-grid,
          .component-grid {
            grid-template-columns: 1fr;
          }

          .topic-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        @media (max-width: 1024px) {
          .generator-grid {
            grid-template-columns: 1fr;
            gap: 32px;
          }

          .generator-right {
            position: static;
          }

          .recipe-bar-content {
            flex-direction: column;
            align-items: stretch;
            gap: 16px;
          }

          .recipe-chips {
            flex-wrap: wrap;
            justify-content: center;
          }
        }

        @media (max-width: 768px) {
          .generator-container {
            padding: 0 16px;
          }

          .generator-main {
            padding: 24px 0;
          }

          .header-content {
            flex-direction: column;
            height: auto;
            padding: 12px 0;
            gap: 12px;
          }

          .generator-header {
            height: auto;
          }

          .topic-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .difficulty-grid {
            grid-template-columns: 1fr;
          }
        }

        /* Shuffle Feedback Overlay */
        .shuffle-overlay {
          position: fixed;
          top: 64px; /* Below header */
          left: 0;
          right: 0;
          bottom: 0;
          background: var(--surface-muted);
          opacity: 0.7;
          z-index: 10;
          pointer-events: none;
        }

        /* Toast Notification */
        .toast-notification {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 360px;
          z-index: 20;
          animation: toastSlideIn 200ms ease-out;
        }

        .toast-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          padding: 24px;
          border-radius: var(--radius-lg);
          border: 1px solid var(--border);
          background: var(--surface);
          box-shadow: 0 12px 32px -12px rgba(15, 23, 42, 0.4);
          text-align: center;
        }

        .toast-message {
          font-size: 16px;
          line-height: 24px;
          font-weight: 500;
          color: var(--ink);
        }

        .toast-button {
          min-width: 140px;
        }

        @keyframes toastSlideIn {
          from {
            opacity: 0;
            transform: translate(-50%, -60%);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%);
          }
        }

        @media (max-width: 768px) {
          .toast-notification {
            width: 320px;
          }

          .toast-content {
            padding: 20px;
          }

          .shuffle-overlay {
            top: auto; /* Adjust for mobile header */
          }
        }
      `}</style>
    </div>
  );
}