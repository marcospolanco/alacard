import React from 'react';
import { Shuffle, Zap } from 'lucide-react';

interface RecipeBuildingExplainerProps {
  onGenerateNotebook: () => void;
  onDealHand: () => void;
}

export function RecipeBuildingExplainer({ onGenerateNotebook, onDealHand }: RecipeBuildingExplainerProps) {
  const exampleCards = [
    {
      type: 'model',
      emoji: '🤖',
      title: 'Model',
      description: 'The AI brain that powers your notebook',
      bullets: [
        'Meta Llama, GPT, BERT, or 2.1M+ options',
        'Automatically configured with best practices',
        'Optimized for your chosen complexity level'
      ]
    },
    {
      type: 'prompt',
      emoji: '💭',
      title: 'Prompt Pack',
      description: 'Curated examples that showcase capabilities',
      bullets: [
        'Real-world use cases and demonstrations',
        'Expert-crafted prompts for immediate results',
        'Multiple variations to explore possibilities'
      ]
    },
    {
      type: 'topic',
      emoji: '🎯',
      title: 'Topic',
      description: 'The domain focus for your exploration',
      bullets: [
        'Healthcare, Finance, Education, and more',
        'Contextual examples relevant to your field',
        'Industry-specific prompt variations'
      ]
    },
    {
      type: 'difficulty',
      emoji: '📊',
      title: 'Difficulty',
      description: 'Complexity level tailored to your experience',
      bullets: [
        'Easy: Quick start with minimal setup',
        'Medium: Balanced features and evaluation',
        'Hard: Advanced techniques and optimization'
      ]
    },
    {
      type: 'component',
      emoji: '🔧',
      title: 'UI Component',
      description: 'Interactive elements for your notebook',
      bullets: [
        'Gradio, Streamlit, or custom widgets',
        'Ready-to-use interface components',
        'Enhanced user interaction and visualization'
      ]
    }
  ];

  const recipeChips = [
    { emoji: '🤖', label: 'Llama 3.1', type: 'model' },
    { emoji: '💭', label: 'Creative Writing', type: 'prompt' },
    { emoji: '🎯', label: 'Education', type: 'topic' },
    { emoji: '📊', label: 'Medium', type: 'difficulty' },
    { emoji: '🔧', label: 'Gradio Chat', type: 'component' }
  ];

  return (
    <section className="explainer-section">
      <div className="explainer-container">
        {/* Title and Metaphor */}
        <div className="text-center mb-12">
          <h2 className="explainer-title">
            Card-Based Recipe Building
          </h2>
          <p className="explainer-metaphor">
            Think cooking: proteins, seasonings, theme, skill, presentation
          </p>
        </div>

        {/* Five Card Types */}
        <div className="cards-grid">
          {exampleCards.map((card) => (
            <div key={card.type} className={`explainer-card card--${card.type}`}>
              <div className="card__header">
                <span className="card-emoji">{card.emoji}</span>
                <span className="card-title">{card.title}</span>
              </div>
              
              <div className="card__body">
                <p className="card-description">{card.description}</p>
                
                <ul className="card-bullets">
                  {card.bullets.map((bullet, index) => (
                    <li key={index} className="bullet-item">
                      {bullet}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Recipe Bar Example */}
        <div className="recipe-example">
          <div className="recipe-bar-demo">
            <div className="recipe-chips">
              {recipeChips.map((chip, index) => (
                <div key={index} className={`recipe-chip chip--${chip.type}`}>
                  <span>{chip.emoji}</span>
                  <span>{chip.label}</span>
                </div>
              ))}
            </div>
            <div className="generate-pill">
              <Zap size={14} />
              <span>Generate</span>
            </div>
          </div>
        </div>

        {/* Flow Annotation */}
        <div className="text-center mb-8">
          <p className="flow-annotation">
            → FastAPI fetches README → adapts content → saves .ipynb to Supabase
          </p>
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          <button 
            onClick={onGenerateNotebook}
            className="button primary"
            type="button"
          >
            Generate Notebook
          </button>
          <button 
            onClick={onDealHand}
            className="button secondary"
            type="button"
          >
            <Shuffle size={16} />
            Deal me a hand
          </button>
        </div>
      </div>

      <style jsx>{`
        .explainer-section {
          max-width: 1120px;
          margin: 0 auto;
          padding: 64px 24px;
          background: var(--surface);
          color: var(--ink);
        }

        .explainer-container {
          width: 100%;
        }

        .explainer-title {
          font-size: 28px;
          line-height: 36px;
          font-weight: 600;
          font-family: var(--font-sans);
          color: var(--ink);
          margin: 0 0 8px 0;
        }

        .explainer-metaphor {
          font-size: 16px;
          line-height: 24px;
          font-weight: 400;
          font-family: var(--font-sans);
          color: var(--ink-subtle);
          margin: 0;
        }

        .cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 24px;
          margin: 0 0 32px 0;
        }

        .explainer-card {
          display: flex;
          flex-direction: column;
          border-radius: var(--radius-card);
          border: 1px solid var(--border);
          background: var(--surface);
          box-shadow: var(--shadow-card);
          padding: 16px;
          transition: transform 160ms ease, box-shadow 160ms ease;
        }

        .explainer-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px -12px rgba(15, 23, 42, 0.25);
        }

        .explainer-card .card__header {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          border-radius: 6px;
          font-weight: 600;
          font-size: 15px;
          margin-bottom: 12px;
        }

        .card-emoji {
          font-size: 16px;
        }

        .card-title {
          flex: 1;
        }

        .explainer-card.card--model .card__header {
          background: var(--card-model-bg);
          color: var(--card-model-accent);
        }

        .explainer-card.card--prompt .card__header {
          background: var(--card-model-bg);
          color: var(--card-model-accent);
        }

        .explainer-card.card--topic .card__header {
          background: var(--card-model-bg);
          color: var(--card-model-accent);
        }

        .explainer-card.card--difficulty .card__header {
          background: var(--card-complexity-medium-bg);
          color: var(--card-complexity-medium-accent);
        }

        .explainer-card.card--component .card__header {
          background: var(--card-components-bg);
          color: var(--card-components-accent);
        }

        .card__body {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .card-description {
          font-size: 16px;
          line-height: 24px;
          font-weight: 400;
          font-family: var(--font-sans);
          color: var(--ink);
          margin: 0;
        }

        .card-bullets {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .bullet-item {
          font-size: 14px;
          line-height: 20px;
          font-weight: 400;
          font-family: var(--font-sans);
          color: var(--ink-subtle);
          position: relative;
          padding-left: 12px;
        }

        .bullet-item::before {
          content: '•';
          position: absolute;
          left: 0;
          color: var(--ink-subtle);
        }

        .recipe-example {
          margin: 32px 0;
        }

        .recipe-bar-demo {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 12px 16px;
          border-radius: var(--radius-lg);
          border: 1px solid var(--border);
          background: var(--surface-alt);
          flex-wrap: wrap;
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
          font-family: var(--font-sans);
        }

        .recipe-chip.chip--model {
          border-color: var(--card-model-border);
          color: var(--card-model-accent);
        }

        .recipe-chip.chip--prompt {
          border-color: var(--card-model-border);
          color: var(--card-model-accent);
        }

        .recipe-chip.chip--topic {
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

        .generate-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          border-radius: var(--radius-pill);
          background: var(--cta-primary-bg);
          color: var(--cta-primary-fg);
          font-size: 13px;
          font-weight: 500;
          font-family: var(--font-sans);
        }

        .flow-annotation {
          font-size: 14px;
          line-height: 20px;
          font-weight: 400;
          font-family: var(--font-sans);
          color: var(--ink-subtle);
          margin: 0;
        }

        .action-buttons {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          flex-wrap: wrap;
        }

        .button:focus-visible {
          outline: 2px solid var(--focus-ring);
          outline-offset: 2px;
        }

        @media (max-width: 1024px) {
          .explainer-section {
            padding: 48px 16px;
          }

          .cards-grid {
            grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
            gap: 20px;
          }
        }

        @media (max-width: 768px) {
          .explainer-title {
            font-size: 24px;
            line-height: 32px;
          }

          .cards-grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }

          .recipe-bar-demo {
            flex-direction: column;
            align-items: stretch;
            gap: 12px;
          }

          .recipe-chips {
            justify-content: center;
          }

          .action-buttons {
            flex-direction: column;
            width: 100%;
          }

          .action-buttons .button {
            width: 100%;
            max-width: 300px;
          }
        }

        @media (max-width: 480px) {
          .recipe-chips {
            gap: 8px;
          }

          .recipe-chip {
            font-size: 12px;
            padding: 5px 10px;
          }

          .card-bullets {
            gap: 4px;
          }

          .bullet-item {
            font-size: 13px;
            line-height: 18px;
          }
        }
      `}</style>
    </section>
  );
}