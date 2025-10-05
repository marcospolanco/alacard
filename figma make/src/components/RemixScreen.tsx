import React, { useState, useEffect } from 'react';
import { Shuffle, Download, ExternalLink, Zap, Clock, FileText, Shield, CheckCircle, RotateCcw, HelpCircle, Copy, Flag, X } from 'lucide-react';
import { ModelCard } from './ModelCard';
import { PromptCard } from './PromptCard';
import { TopicCard } from './TopicCard';
import { DifficultyCard } from './DifficultyCard';
import { ComponentCard } from './ComponentCard';
import { mockModels, mockPrompts, mockTopics, mockDifficulties, mockComponents } from '../lib/mockData';

interface RemixScreenProps {
  shareId?: string;
  originalAuthor?: string;
  onBackToShare?: () => void;
}

interface SelectedCards {
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

export function RemixScreen({ 
  shareId = 'abc123def', 
  originalAuthor = 'jane_doe',
  onBackToShare 
}: RemixScreenProps) {
  // Original selections from the shared notebook
  const [originalCards] = useState<SelectedCards>({
    model: mockModels[0], // Llama-3.1-8B-Instruct
    prompt: mockPrompts[1], // Sentiment Analysis
    topic: mockTopics[2], // Text Analysis
    difficulty: mockDifficulties[1], // Medium
    component: mockComponents[0] // Gradio
  });

  // Current selections (starts as copy of original)
  const [selectedCards, setSelectedCards] = useState<SelectedCards>(originalCards);
  
  // Track which cards have been edited
  const [editedCards, setEditedCards] = useState<Set<string>>(new Set());
  
  // Generation states
  const [generationStatus, setGenerationStatus] = useState<GenerationStatus>({ step: 'queued', progress: 0 });
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSubmissionToast, setShowSubmissionToast] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  // Original generation info (mock data)
  const originalGeneration = {
    status: 'Ready',
    taskId: 'task_xyz789',
    downloadCount: 247,
    shareId: shareId
  };

  const handleCardSelect = (type: keyof SelectedCards, card: any) => {
    setSelectedCards(prev => ({
      ...prev,
      [type]: prev[type]?.id === card.id ? undefined : card
    }));
    
    // Mark as edited if different from original
    const isOriginal = originalCards[type]?.id === card.id;
    setEditedCards(prev => {
      const newSet = new Set(prev);
      if (isOriginal && prev.has(type)) {
        newSet.delete(type);
      } else if (!isOriginal) {
        newSet.add(type);
      }
      return newSet;
    });
  };

  const handleShuffle = () => {
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

    // Mark all as edited since they're different from original
    setEditedCards(new Set(['model', 'prompt', 'topic', 'difficulty', 'component']));
  };

  const handleResetToOriginal = () => {
    setSelectedCards(originalCards);
    setEditedCards(new Set());
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setShowSubmissionToast(true);
    
    // Simulate API call
    setTimeout(() => {
      setShowSubmissionToast(false);
    }, 5000);

    const steps = ['queued', 'generating', 'validating', 'ready'] as const;
    
    for (let i = 0; i < steps.length; i++) {
      setGenerationStatus({ 
        step: steps[i], 
        progress: (i + 1) * 25,
        taskId: 'task_remix_456'
      });
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    setIsGenerating(false);
  };

  const handleCancelRemix = () => {
    if (onBackToShare) {
      onBackToShare();
    }
  };

  const canGenerate = selectedCards.model && selectedCards.prompt && selectedCards.topic && selectedCards.difficulty;

  const statusSteps = [
    { key: 'queued', label: 'Queued', icon: Clock, active: generationStatus.step === 'queued' },
    { key: 'generating', label: 'Generating Remix', icon: FileText, active: generationStatus.step === 'generating' },
    { key: 'validating', label: 'Validating', icon: Shield, active: generationStatus.step === 'validating' },
    { key: 'ready', label: 'Ready', icon: CheckCircle, active: generationStatus.step === 'ready' }
  ];

  return (
    <div className="remix-screen">
      {/* Header */}
      <header className="remix-header">
        <div className="remix-container">
          <div className="header-content">
            <div className="header-left">
              <div className="logo-section">
                <span className="logo-icon">🃏</span>
                <span className="logo-text">alacard</span>
              </div>
            </div>
            <div className="header-right">
              <button 
                onClick={onBackToShare}
                className="button secondary"
                type="button"
              >
                <ExternalLink size={16} />
                Back to Share
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Remix Banner */}
      <div className="remix-banner">
        <div className="remix-container">
          <div className="banner-content">
            <div className="banner-info">
              <h1 className="banner-title">Remixing {shareId}</h1>
              <p className="banner-subtitle">Fork of {originalAuthor}</p>
            </div>
            <button 
              onClick={onBackToShare}
              className="button secondary banner-action"
              type="button"
            >
              View source share
            </button>
          </div>
        </div>
      </div>

      {/* Recipe Bar */}
      <div className="recipe-bar-section">
        <div className="remix-container">
          <div className="recipe-bar-content">
            <div className="recipe-chips">
              <div className={`recipe-chip ${selectedCards.model ? 'chip--model' : 'chip--empty'}`}>
                <span>🤖</span>
                <span>{selectedCards.model?.name || 'Choose Model'}</span>
                {!editedCards.has('model') && (
                  <div className="original-badge">Original</div>
                )}
              </div>
              <div className={`recipe-chip ${selectedCards.prompt ? 'chip--model' : 'chip--empty'}`}>
                <span>💭</span>
                <span>{selectedCards.prompt?.name || 'Pick Prompt Pack'}</span>
                {!editedCards.has('prompt') && (
                  <div className="original-badge">Original</div>
                )}
              </div>
              <div className={`recipe-chip ${selectedCards.topic ? 'chip--model' : 'chip--empty'}`}>
                <span>🎯</span>
                <span>{selectedCards.topic?.name || 'Select Topic'}</span>
                {!editedCards.has('topic') && (
                  <div className="original-badge">Original</div>
                )}
              </div>
              <div className={`recipe-chip ${selectedCards.difficulty ? 'chip--difficulty' : 'chip--empty'}`}>
                <span>📊</span>
                <span>{selectedCards.difficulty?.name || 'Choose Difficulty'}</span>
                {!editedCards.has('difficulty') && (
                  <div className="original-badge">Original</div>
                )}
              </div>
              <div className={`recipe-chip ${selectedCards.component ? 'chip--component' : 'chip--empty'}`}>
                <span>🔧</span>
                <span>{selectedCards.component?.name || 'Add UI Component'}</span>
                {!editedCards.has('component') && (
                  <div className="original-badge">Original</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="remix-main">
        <div className="remix-container">
          <div className="remix-grid">
            {/* Left Column - Card Selection */}
            <div className="remix-left">
              {/* Control Row */}
              <div className="controls-section">
                <button 
                  onClick={handleShuffle}
                  className="button shuffle"
                  type="button"
                >
                  <Shuffle size={16} />
                  Deal me a hand
                </button>
                <button 
                  onClick={handleResetToOriginal}
                  className="reset-button"
                  type="button"
                >
                  <RotateCcw size={14} />
                  Reset to original
                </button>
                <div className="tooltip-wrapper">
                  <button 
                    onMouseEnter={() => setShowTooltip(true)}
                    onMouseLeave={() => setShowTooltip(false)}
                    onFocus={() => setShowTooltip(true)}
                    onBlur={() => setShowTooltip(false)}
                    className="tooltip-trigger"
                    type="button"
                    aria-describedby="remix-rules-tooltip"
                  >
                    <HelpCircle size={16} />
                  </button>
                  {showTooltip && (
                    <div id="remix-rules-tooltip" className="tooltip" role="tooltip">
                      Remix rules: You can modify any card to create a new notebook. 
                      Original selections are marked. All changes are tracked.
                    </div>
                  )}
                </div>
              </div>

              {/* Model Section */}
              <section className="card-section">
                <div className="section-header">
                  <h2 className="section-title">🤖 Model</h2>
                  <p className="section-subtitle">Imported from share</p>
                </div>
                <div className="cards-grid model-grid">
                  {mockModels.slice(0, 6).map(model => (
                    <div key={model.id} className="card-wrapper">
                      <div className={`${editedCards.has('model') && selectedCards.model?.id === model.id ? 'card-edited' : ''}`}>
                        <ModelCard
                          model={model}
                          isSelected={selectedCards.model?.id === model.id}
                          onSelect={() => handleCardSelect('model', model)}
                        />
                      </div>
                      {editedCards.has('model') && selectedCards.model?.id === model.id && (
                        <div className="edited-badge">
                          Edited
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>

              {/* Prompt Pack Section */}
              <section className="card-section">
                <div className="section-header">
                  <h2 className="section-title">💭 Prompt Pack</h2>
                  <p className="section-subtitle">Imported from share</p>
                </div>
                <div className="cards-grid prompt-grid">
                  {mockPrompts.slice(0, 6).map(prompt => (
                    <div key={prompt.id} className="card-wrapper">
                      <div className={`${editedCards.has('prompt') && selectedCards.prompt?.id === prompt.id ? 'card-edited' : ''}`}>
                        <PromptCard
                          prompt={prompt}
                          isSelected={selectedCards.prompt?.id === prompt.id}
                          onSelect={() => handleCardSelect('prompt', prompt)}
                        />
                      </div>
                      {editedCards.has('prompt') && selectedCards.prompt?.id === prompt.id && (
                        <div className="edited-badge">
                          Edited
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>

              {/* Topic Section */}
              <section className="card-section">
                <div className="section-header">
                  <h2 className="section-title">🎯 Topic</h2>
                  <p className="section-subtitle">Imported from share</p>
                </div>
                <div className="cards-grid topic-grid">
                  {mockTopics.map(topic => (
                    <div key={topic.id} className="card-wrapper">
                      <div className={`${editedCards.has('topic') && selectedCards.topic?.id === topic.id ? 'card-edited' : ''}`}>
                        <TopicCard
                          topic={topic}
                          isSelected={selectedCards.topic?.id === topic.id}
                          onSelect={() => handleCardSelect('topic', topic)}
                        />
                      </div>
                      {editedCards.has('topic') && selectedCards.topic?.id === topic.id && (
                        <div className="edited-badge">
                          Edited
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>

              {/* Difficulty Section */}
              <section className="card-section">
                <div className="section-header">
                  <h2 className="section-title">📊 Difficulty</h2>
                  <p className="section-subtitle">Imported from share</p>
                </div>
                <div className="cards-grid difficulty-grid">
                  {mockDifficulties.map(difficulty => (
                    <div key={difficulty.id} className="card-wrapper">
                      <div className={`${editedCards.has('difficulty') && selectedCards.difficulty?.id === difficulty.id ? 'card-edited' : ''}`}>
                        <DifficultyCard
                          difficulty={difficulty}
                          isSelected={selectedCards.difficulty?.id === difficulty.id}
                          onSelect={() => handleCardSelect('difficulty', difficulty)}
                        />
                      </div>
                      {editedCards.has('difficulty') && selectedCards.difficulty?.id === difficulty.id && (
                        <div className="edited-badge">
                          Edited
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>

              {/* UI Component Section */}
              <section className="card-section">
                <div className="section-header">
                  <h2 className="section-title">🔧 UI Component</h2>
                  <p className="section-subtitle">Imported from share</p>
                </div>
                <div className="cards-grid component-grid">
                  {mockComponents.slice(0, 6).map(component => (
                    <div key={component.id} className="card-wrapper">
                      <div className={`${editedCards.has('component') && selectedCards.component?.id === component.id ? 'card-edited' : ''}`}>
                        <ComponentCard
                          component={component}
                          isSelected={selectedCards.component?.id === component.id}
                          onSelect={() => handleCardSelect('component', component)}
                        />
                      </div>
                      {editedCards.has('component') && selectedCards.component?.id === component.id && (
                        <div className="edited-badge">
                          Edited
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Right Column - Status & Info */}
            <div className="remix-right">
              {/* Previous Generation Info */}
              <section className="original-info-section">
                <h3 className="info-title">Original Generation</h3>
                <div className="info-list">
                  <div className="info-row">
                    <span className="info-label">Status</span>
                    <div className="status-badge ready">
                      Ready
                    </div>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Task ID</span>
                    <code className="info-value">{originalGeneration.taskId}</code>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Downloads</span>
                    <span className="info-value">{originalGeneration.downloadCount}</span>
                  </div>
                  <div className="info-row">
                    <button 
                      onClick={() => console.log(`Download original: ${shareId}`)}
                      className="download-link"
                      type="button"
                    >
                      <Download size={14} />
                      Download original
                    </button>
                  </div>
                </div>
              </section>

              {/* Remix Generation Status */}
              <section className="remix-status-section">
                <h3 className="status-title">Remix Generation</h3>
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
              </section>

              {/* Actions */}
              <section className="actions-section">
                <div className="actions-list">
                  <button 
                    onClick={handleGenerate}
                    disabled={!canGenerate || isGenerating}
                    className={`button primary action-button ${!canGenerate ? 'disabled' : ''}`}
                    type="button"
                  >
                    <Zap size={16} />
                    {isGenerating ? 'Generating Remix...' : 'Generate Remix'}
                  </button>
                  <button 
                    onClick={handleCancelRemix}
                    className="button secondary action-button"
                    type="button"
                  >
                    Cancel Remix
                  </button>
                  <button 
                    className="link-button"
                    type="button"
                  >
                    View validation
                  </button>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>

      {/* Submission Toast */}
      {showSubmissionToast && (
        <div className="toast-notification" role="alert" aria-live="assertive">
          <div className="toast-content">
            <div className="toast-message">
              <strong>Remix task submitted</strong> — watching WebSocket /ws/progress/{generationStatus.taskId}
            </div>
            <button 
              onClick={() => setShowSubmissionToast(false)}
              className="toast-dismiss"
              type="button"
              aria-label="Dismiss notification"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        .remix-screen {
          min-height: 100vh;
          background: var(--surface);
          color: var(--ink);
          font-family: var(--font-sans);
        }

        .remix-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 24px;
        }

        /* Header */
        .remix-header {
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

        .header-left {
          display: flex;
          align-items: center;
          gap: 24px;
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

        /* Remix Banner */
        .remix-banner {
          border-bottom: 1px solid var(--border);
          background: var(--card-components-bg);
          padding: 20px 0;
        }

        .banner-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
        }

        .banner-title {
          font-size: 24px;
          line-height: 32px;
          font-weight: 600;
          margin: 0;
          color: var(--card-components-accent);
        }

        .banner-subtitle {
          font-size: 14px;
          line-height: 20px;
          margin: 4px 0 0 0;
          color: var(--ink-subtle);
        }

        /* Recipe Bar */
        .recipe-bar-section {
          border-bottom: 1px solid var(--border);
          background: var(--surface-alt);
          padding: 16px 0;
        }

        .recipe-bar-content {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .recipe-chips {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
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
          position: relative;
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

        .original-badge {
          position: absolute;
          top: -8px;
          right: -8px;
          padding: 2px 6px;
          border-radius: var(--radius-pill);
          background: var(--card-complexity-easy-bg);
          color: var(--card-complexity-easy-accent);
          font-size: 10px;
          font-weight: 600;
          border: 1px solid var(--card-complexity-easy-border);
        }

        /* Main Grid */
        .remix-main {
          padding: 32px 0;
        }

        .remix-grid {
          display: grid;
          grid-template-columns: 7fr 5fr;
          gap: 24px;
          align-items: start;
        }

        /* Left Column */
        .remix-left {
          display: flex;
          flex-direction: column;
          gap: 32px;
        }

        .controls-section {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 16px;
          padding-bottom: 16px;
          border-bottom: 1px solid var(--border);
        }

        .reset-button {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 12px;
          background: none;
          border: none;
          color: var(--ink-subtle);
          font-size: 14px;
          cursor: pointer;
          transition: color 160ms ease;
          border-radius: 6px;
        }

        .reset-button:hover {
          color: var(--ink);
          background: var(--surface-muted);
        }

        .tooltip-wrapper {
          position: relative;
        }

        .tooltip-trigger {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          background: none;
          border: 1px solid var(--border);
          border-radius: 6px;
          color: var(--ink-subtle);
          cursor: pointer;
          transition: all 160ms ease;
        }

        .tooltip-trigger:hover,
        .tooltip-trigger:focus {
          color: var(--ink);
          border-color: var(--border-strong);
        }

        .tooltip {
          position: absolute;
          top: 40px;
          right: 0;
          width: 280px;
          padding: 12px;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 8px;
          box-shadow: var(--shadow-card);
          font-size: 13px;
          line-height: 18px;
          color: var(--ink);
          z-index: 10;
        }

        .card-section {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .section-header {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .section-title {
          font-size: 20px;
          line-height: 28px;
          font-weight: 600;
          margin: 0;
          color: var(--ink);
        }

        .section-subtitle {
          font-size: 14px;
          line-height: 20px;
          margin: 0;
          color: var(--ink-subtle);
        }

        .cards-grid {
          display: grid;
          gap: 16px;
        }

        .model-grid,
        .prompt-grid,
        .component-grid {
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
        }

        .topic-grid {
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
        }

        .difficulty-grid {
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        }

        .card-wrapper {
          position: relative;
        }

        .card-edited .card {
          border-color: var(--border-strong);
          border-width: 2px;
        }

        .edited-badge {
          position: absolute;
          top: 8px;
          right: 8px;
          padding: 4px 8px;
          border-radius: var(--radius-pill);
          background: var(--card-components-bg);
          color: var(--card-components-accent);
          font-size: 11px;
          font-weight: 600;
          border: 1px solid var(--card-components-border);
          z-index: 1;
        }

        /* Right Column */
        .remix-right {
          display: flex;
          flex-direction: column;
          gap: 32px;
          position: sticky;
          top: 24px;
        }

        .original-info-section,
        .remix-status-section {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .info-title,
        .status-title {
          font-size: 18px;
          line-height: 26px;
          font-weight: 600;
          margin: 0;
          color: var(--ink);
        }

        .info-list,
        .status-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .info-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 0;
        }

        .info-label {
          font-size: 14px;
          font-weight: 500;
          color: var(--ink);
        }

        .info-value {
          font-size: 14px;
          color: var(--ink-subtle);
        }

        .info-value code {
          font-family: var(--font-mono);
          background: var(--surface-muted);
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 12px;
        }

        .status-badge {
          padding: 4px 8px;
          border-radius: var(--radius-pill);
          font-size: 12px;
          font-weight: 500;
        }

        .status-badge.ready {
          background: var(--card-complexity-easy-bg);
          color: var(--card-complexity-easy-accent);
        }

        .download-link {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 4px 8px;
          background: none;
          border: none;
          color: var(--card-model-accent);
          font-size: 13px;
          cursor: pointer;
          transition: color 160ms ease;
          border-radius: 4px;
        }

        .download-link:hover {
          background: var(--card-model-bg);
        }

        .status-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 12px 0;
          opacity: 0.5;
          transition: opacity 160ms ease;
        }

        .status-item.active,
        .status-item.completed {
          opacity: 1;
        }

        .status-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 20px;
          height: 20px;
          margin-top: 2px;
        }

        .status-content {
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
          margin-top: 4px;
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

        /* Actions */
        .actions-section {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .actions-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .action-button {
          width: 100%;
          justify-content: center;
        }

        .link-button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 8px;
          background: none;
          border: none;
          color: var(--ink-subtle);
          font-size: 13px;
          cursor: pointer;
          transition: color 160ms ease;
        }

        .link-button:hover {
          color: var(--ink);
        }

        /* Toast Notification */
        .toast-notification {
          position: fixed;
          top: 24px;
          right: 24px;
          width: 400px;
          z-index: 20;
          animation: toastSlideIn 200ms ease-out;
        }

        .toast-content {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 16px;
          border-radius: var(--radius-lg);
          border: 1px solid var(--border);
          background: var(--surface);
          box-shadow: 0 12px 32px -12px rgba(15, 23, 42, 0.4);
        }

        .toast-message {
          flex: 1;
          font-size: 14px;
          line-height: 20px;
          color: var(--ink);
        }

        .toast-dismiss {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          background: none;
          border: none;
          color: var(--ink-subtle);
          cursor: pointer;
          transition: color 160ms ease;
          border-radius: 4px;
        }

        .toast-dismiss:hover {
          color: var(--ink);
          background: var(--surface-muted);
        }

        @keyframes toastSlideIn {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .button:focus-visible {
          outline: 2px solid var(--focus-ring);
          outline-offset: 2px;
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .remix-container {
            max-width: 960px;
          }

          .remix-grid {
            grid-template-columns: 1fr;
            gap: 32px;
          }

          .remix-right {
            position: static;
          }

          .banner-content {
            flex-direction: column;
            align-items: stretch;
            gap: 16px;
          }
        }

        @media (max-width: 768px) {
          .remix-container {
            padding: 0 16px;
          }

          .remix-main {
            padding: 24px 0;
          }

          .remix-banner {
            padding: 16px 0;
          }

          .banner-title {
            font-size: 20px;
            line-height: 28px;
          }

          .controls-section {
            flex-direction: column;
            align-items: stretch;
            gap: 12px;
          }

          .recipe-chips {
            gap: 8px;
          }

          .toast-notification {
            width: calc(100vw - 32px);
            right: 16px;
          }

          .tooltip {
            right: -120px;
            width: 240px;
          }
        }
      `}</style>
    </div>
  );
}