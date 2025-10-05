import React, { useState } from 'react';
import { Download, Copy, ExternalLink, AlertTriangle, CheckCircle, Flag, ArrowLeft } from 'lucide-react';
import { ModelCard } from './ModelCard';
import { PromptCard } from './PromptCard';
import { TopicCard } from './TopicCard';
import { DifficultyCard } from './DifficultyCard';
import { ComponentCard } from './ComponentCard';
import { mockModels, mockPrompts, mockTopics, mockDifficulties, mockComponents } from '../lib/mockData';

interface SharePageProps {
  shareId?: string;
  onBackToGenerator?: () => void;
  onRemix?: () => void;
}

interface NotebookData {
  title: string;
  shareId: string;
  taskId: string;
  downloadCount: number;
  remixCount: number;
  viewCount: number;
  createdAt: string;
  validationStatus: 'success' | 'warning' | 'error';
  validationMessage: string;
  selectedCards: {
    model: any;
    prompt: any;
    topic: any;
    difficulty: any;
    component: any;
  };
}

export function SharePage({ shareId = 'abc123def', onBackToGenerator, onRemix }: SharePageProps) {
  const [copySuccess, setCopySuccess] = useState(false);

  // Mock notebook data - in real app this would come from API
  const notebookData: NotebookData = {
    title: "Llama-3.1-8B Sentiment Analysis with Gradio UI",
    shareId: shareId,
    taskId: 'task_xyz789',
    downloadCount: 247,
    remixCount: 12,
    viewCount: 1203,
    createdAt: '2024-12-14T10:30:00Z',
    validationStatus: 'success',
    validationMessage: 'All cells executed successfully. Ready for use.',
    selectedCards: {
      model: mockModels[0], // Llama-3.1-8B-Instruct
      prompt: mockPrompts[1], // Sentiment Analysis
      topic: mockTopics[2], // Text Analysis
      difficulty: mockDifficulties[1], // Medium
      component: mockComponents[0] // Gradio
    }
  };

  const handleCopyShareLink = async () => {
    try {
      const shareUrl = `${window.location.origin}/share/${shareId}`;
      await navigator.clipboard.writeText(shareUrl);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const handleDownload = () => {
    // In real app: window.open(`/api/v1/notebook/download/${shareId}`)
    console.log(`Downloading notebook: ${shareId}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getValidationIcon = () => {
    switch (notebookData.validationStatus) {
      case 'success':
        return <CheckCircle size={16} />;
      case 'warning':
        return <AlertTriangle size={16} />;
      case 'error':
        return <AlertTriangle size={16} />;
      default:
        return <CheckCircle size={16} />;
    }
  };

  const getValidationColor = () => {
    switch (notebookData.validationStatus) {
      case 'success':
        return 'var(--card-complexity-easy-accent)';
      case 'warning':
        return 'var(--card-complexity-medium-accent)';
      case 'error':
        return 'var(--card-complexity-hard-accent)';
      default:
        return 'var(--card-complexity-easy-accent)';
    }
  };

  return (
    <div className="share-page">
      {/* Header */}
      <header className="share-header">
        <div className="share-container">
          <div className="header-content">
            <div className="header-left">
              <button 
                onClick={onBackToGenerator}
                className="button secondary back-button"
                type="button"
              >
                <ArrowLeft size={16} />
                Back to Generator
              </button>
              <div className="logo-section">
                <span className="logo-icon">🃏</span>
                <span className="logo-text">alacard</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Read-only Recipe Bar */}
      <div className="recipe-bar-section">
        <div className="share-container">
          <div className="recipe-bar-content">
            <div className="recipe-info">
              <h1 className="notebook-title">{notebookData.title}</h1>
              <div className="recipe-chips">
                <div className="recipe-chip chip--model">
                  <span>🤖</span>
                  <span>{notebookData.selectedCards.model.name}</span>
                </div>
                <div className="recipe-chip chip--model">
                  <span>💭</span>
                  <span>{notebookData.selectedCards.prompt.name}</span>
                </div>
                <div className="recipe-chip chip--model">
                  <span>🎯</span>
                  <span>{notebookData.selectedCards.topic.name}</span>
                </div>
                <div className="recipe-chip chip--difficulty">
                  <span>📊</span>
                  <span>{notebookData.selectedCards.difficulty.name}</span>
                </div>
                <div className="recipe-chip chip--component">
                  <span>🔧</span>
                  <span>{notebookData.selectedCards.component.name}</span>
                </div>
              </div>
              <div className="recipe-metadata">
                <span className="metadata-item">Share ID: <code>{notebookData.shareId}</code></span>
                <span className="metadata-item">Task ID: <code>{notebookData.taskId}</code></span>
                <div className="metric-badges">
                  <div className="metric-badge">
                    <span className="metric-value">{notebookData.viewCount}</span>
                    <span className="metric-label">views</span>
                  </div>
                  <div className="metric-badge">
                    <span className="metric-value">{notebookData.remixCount}</span>
                    <span className="metric-label">remixes</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="recipe-actions">
              <button 
                onClick={onBackToGenerator}
                className="button secondary"
                type="button"
              >
                <ExternalLink size={16} />
                Open in Generator
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="share-main">
        <div className="share-container">
          <div className="share-grid">
            {/* Left Column - Selected Cards & Validation */}
            <div className="share-left">
              {/* Selected Cards */}
              <section className="cards-section">
                <h2 className="section-title">Selected Recipe</h2>
                
                {/* Model */}
                <div className="card-group">
                  <h3 className="card-group-title">🤖 Model</h3>
                  <div className="card-wrapper">
                    <ModelCard
                      model={notebookData.selectedCards.model}
                      isSelected={true}
                      onSelect={() => {}} // No-op for read-only
                      readOnly={true}
                    />
                    <div className="selected-badge">
                      Selected
                    </div>
                  </div>
                </div>

                {/* Prompt Pack */}
                <div className="card-group">
                  <h3 className="card-group-title">💭 Prompt Pack</h3>
                  <div className="card-wrapper">
                    <PromptCard
                      prompt={notebookData.selectedCards.prompt}
                      isSelected={true}
                      onSelect={() => {}}
                      readOnly={true}
                    />
                    <div className="selected-badge">
                      Selected
                    </div>
                  </div>
                </div>

                {/* Topic */}
                <div className="card-group">
                  <h3 className="card-group-title">🎯 Topic</h3>
                  <div className="card-wrapper">
                    <TopicCard
                      topic={notebookData.selectedCards.topic}
                      isSelected={true}
                      onSelect={() => {}}
                      readOnly={true}
                    />
                    <div className="selected-badge">
                      Selected
                    </div>
                  </div>
                </div>

                {/* Difficulty */}
                <div className="card-group">
                  <h3 className="card-group-title">📊 Difficulty</h3>
                  <div className="card-wrapper">
                    <DifficultyCard
                      difficulty={notebookData.selectedCards.difficulty}
                      isSelected={true}
                      onSelect={() => {}}
                      readOnly={true}
                    />
                    <div className="selected-badge">
                      Selected
                    </div>
                  </div>
                </div>

                {/* UI Component */}
                <div className="card-group">
                  <h3 className="card-group-title">🔧 UI Component</h3>
                  <div className="card-wrapper">
                    <ComponentCard
                      component={notebookData.selectedCards.component}
                      isSelected={true}
                      onSelect={() => {}}
                      readOnly={true}
                    />
                    <div className="selected-badge">
                      Selected
                    </div>
                  </div>
                </div>
              </section>

              {/* Validation Section */}
              <section className="validation-section">
                <h2 className="section-title">Validation Status</h2>
                <div className="validation-card">
                  <div className="validation-header">
                    <div className="validation-icon" style={{ color: getValidationColor() }}>
                      {getValidationIcon()}
                    </div>
                    <div className="validation-content">
                      <h3 className="validation-title">
                        {notebookData.validationStatus === 'success' ? 'All checks passed' : 
                         notebookData.validationStatus === 'warning' ? 'Minor issues detected' : 
                         'Validation failed'}
                      </h3>
                      <p className="validation-message">
                        {notebookData.validationMessage}
                      </p>
                    </div>
                  </div>
                  <div className="validation-details">
                    <div className="validation-item">
                      <span className="validation-check">✓</span>
                      <span>Code syntax validation</span>
                    </div>
                    <div className="validation-item">
                      <span className="validation-check">✓</span>
                      <span>Dependency requirements</span>
                    </div>
                    <div className="validation-item">
                      <span className="validation-check">✓</span>
                      <span>Cell execution order</span>
                    </div>
                    <div className="validation-item">
                      <span className="validation-check">✓</span>
                      <span>Model availability</span>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            {/* Right Column - Metadata & Actions */}
            <div className="share-right">
              {/* Metadata */}
              <section className="metadata-section">
                <h3 className="metadata-title">Notebook Details</h3>
                <div className="metadata-list">
                  <div className="metadata-row">
                    <span className="metadata-label">Downloads</span>
                    <div className="metric-badge">
                      <span className="metric-value">{notebookData.downloadCount}</span>
                    </div>
                  </div>
                  <div className="metadata-row">
                    <span className="metadata-label">Remixes</span>
                    <div className="metric-badge">
                      <span className="metric-value">{notebookData.remixCount}</span>
                    </div>
                  </div>
                  <div className="metadata-row">
                    <span className="metadata-label">Created</span>
                    <span className="metadata-value">{formatDate(notebookData.createdAt)}</span>
                  </div>
                  <div className="metadata-row">
                    <span className="metadata-label">Status</span>
                    <div className="status-badge" style={{ 
                      background: notebookData.validationStatus === 'success' ? 'var(--card-complexity-easy-bg)' : 
                                 notebookData.validationStatus === 'warning' ? 'var(--card-complexity-medium-bg)' : 
                                 'var(--card-complexity-hard-bg)',
                      color: getValidationColor()
                    }}>
                      {notebookData.validationStatus}
                    </div>
                  </div>
                </div>
              </section>

              {/* API Documentation */}
              <section className="api-section">
                <h3 className="api-title">API Access</h3>
                <div className="api-block">
                  <div className="api-endpoint">
                    <h4 className="api-subtitle">Get Notebook Metadata</h4>
                    <pre className="api-code">
{`curl -X GET \\
  https://api.alacard.dev/v1/notebook/${shareId} \\
  -H "Accept: application/json"`}
                    </pre>
                  </div>
                  <div className="api-endpoint">
                    <h4 className="api-subtitle">Download Notebook</h4>
                    <pre className="api-code">
{`curl -X GET \\
  https://api.alacard.dev/v1/notebook/download/${shareId} \\
  -H "Accept: application/octet-stream" \\
  -o notebook.ipynb`}
                    </pre>
                  </div>
                </div>
              </section>

              {/* Actions */}
              <section className="actions-section">
                <div className="actions-list">
                  <button 
                    onClick={handleDownload}
                    className="button primary action-button"
                    type="button"
                  >
                    <Download size={16} />
                    Download .ipynb
                  </button>
                  <button 
                    onClick={onRemix}
                    className="button secondary action-button"
                    type="button"
                  >
                    🔄 Remix this
                  </button>
                  <button 
                    onClick={handleCopyShareLink}
                    className="button secondary action-button"
                    type="button"
                  >
                    <Copy size={16} />
                    {copySuccess ? 'Copied!' : 'Copy share link'}
                  </button>
                  <button 
                    className="link-button"
                    type="button"
                  >
                    <Flag size={14} />
                    Report issue
                  </button>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>

      <style jsx>{`
        .share-page {
          min-height: 100vh;
          background: var(--surface);
          color: var(--ink);
          font-family: var(--font-sans);
        }

        .share-container {
          max-width: 1120px;
          margin: 0 auto;
          padding: 0 24px;
        }

        /* Header */
        .share-header {
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

        .back-button {
          display: flex;
          align-items: center;
          gap: 8px;
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
          padding: 32px 0;
        }

        .recipe-bar-content {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 32px;
        }

        .recipe-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .notebook-title {
          font-size: 28px;
          line-height: 36px;
          font-weight: 600;
          margin: 0;
          color: var(--ink);
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

        .recipe-metadata {
          display: flex;
          align-items: center;
          gap: 24px;
          flex-wrap: wrap;
        }

        .metadata-item {
          font-size: 13px;
          color: var(--ink-subtle);
        }

        .metadata-item code {
          font-family: var(--font-mono);
          background: var(--surface-muted);
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 12px;
        }

        .metric-badges {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .metric-badge {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
        }

        .metric-value {
          font-size: 16px;
          font-weight: 600;
          font-variant-numeric: tabular-nums;
          color: var(--ink);
        }

        .metric-label {
          font-size: 12px;
          color: var(--ink-subtle);
        }

        .recipe-actions {
          display: flex;
          align-items: flex-start;
        }

        /* Main Grid */
        .share-main {
          padding: 32px 0;
        }

        .share-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 24px;
          align-items: start;
        }

        /* Left Column */
        .share-left {
          display: flex;
          flex-direction: column;
          gap: 32px;
        }

        .cards-section {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .section-title {
          font-size: 20px;
          line-height: 28px;
          font-weight: 600;
          margin: 0;
          color: var(--ink);
        }

        .card-group {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .card-group-title {
          font-size: 16px;
          line-height: 24px;
          font-weight: 500;
          margin: 0;
          color: var(--ink);
        }

        .card-wrapper {
          position: relative;
        }

        .selected-badge {
          position: absolute;
          top: 8px;
          right: 8px;
          padding: 4px 8px;
          border-radius: var(--radius-pill);
          background: var(--card-model-bg);
          color: var(--card-model-accent);
          font-size: 11px;
          font-weight: 600;
          z-index: 1;
        }

        /* Validation Section */
        .validation-section {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .validation-card {
          padding: 20px;
          border-radius: var(--radius-lg);
          border: 1px solid var(--border);
          background: var(--surface);
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .validation-header {
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }

        .validation-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 20px;
          height: 20px;
          margin-top: 2px;
        }

        .validation-content {
          flex: 1;
        }

        .validation-title {
          font-size: 16px;
          line-height: 24px;
          font-weight: 600;
          margin: 0 0 4px 0;
          color: var(--ink);
        }

        .validation-message {
          font-size: 14px;
          line-height: 20px;
          color: var(--ink-subtle);
          margin: 0;
        }

        .validation-details {
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding-top: 12px;
          border-top: 1px solid var(--border);
        }

        .validation-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          line-height: 20px;
          color: var(--ink-subtle);
        }

        .validation-check {
          color: var(--card-complexity-easy-accent);
          font-weight: 600;
        }

        /* Right Column */
        .share-right {
          display: flex;
          flex-direction: column;
          gap: 32px;
          position: sticky;
          top: 24px;
        }

        /* Metadata Section */
        .metadata-section {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .metadata-title {
          font-size: 18px;
          line-height: 26px;
          font-weight: 600;
          margin: 0;
          color: var(--ink);
        }

        .metadata-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .metadata-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 0;
        }

        .metadata-label {
          font-size: 14px;
          font-weight: 500;
          color: var(--ink);
        }

        .metadata-value {
          font-size: 14px;
          color: var(--ink-subtle);
        }

        .status-badge {
          padding: 4px 8px;
          border-radius: var(--radius-pill);
          font-size: 12px;
          font-weight: 500;
          text-transform: capitalize;
        }

        /* API Section */
        .api-section {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .api-title {
          font-size: 18px;
          line-height: 26px;
          font-weight: 600;
          margin: 0;
          color: var(--ink);
        }

        .api-block {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .api-endpoint {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .api-subtitle {
          font-size: 14px;
          line-height: 20px;
          font-weight: 500;
          margin: 0;
          color: var(--ink);
        }

        .api-code {
          font-family: var(--font-mono);
          font-size: 12px;
          line-height: 18px;
          background: var(--surface-muted);
          border: 1px solid var(--border);
          border-radius: 6px;
          padding: 12px;
          margin: 0;
          overflow-x: auto;
          color: var(--ink-subtle);
        }

        /* Actions Section */
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

        .button:focus-visible {
          outline: 2px solid var(--focus-ring);
          outline-offset: 2px;
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .share-container {
            max-width: 960px;
          }

          .share-grid {
            grid-template-columns: 1fr;
            gap: 32px;
          }

          .share-right {
            position: static;
          }

          .recipe-bar-content {
            flex-direction: column;
            align-items: stretch;
            gap: 24px;
          }
        }

        @media (max-width: 768px) {
          .share-container {
            padding: 0 16px;
          }

          .share-main {
            padding: 24px 0;
          }

          .recipe-bar-section {
            padding: 24px 0;
          }

          .notebook-title {
            font-size: 24px;
            line-height: 32px;
          }

          .header-left {
            gap: 16px;
          }

          .recipe-chips {
            gap: 8px;
          }

          .recipe-metadata {
            gap: 16px;
          }
        }
      `}</style>
    </div>
  );
}