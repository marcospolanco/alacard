import React from 'react';
import { Shuffle, Search } from 'lucide-react';

interface LandingHeroProps {
  onShuffle: () => void;
  onBrowseModels: () => void;
}

export function LandingHero({ onShuffle, onBrowseModels }: LandingHeroProps) {
  const cardFamilies = [
    { emoji: '🤖', label: 'Model' },
    { emoji: '💭', label: 'Prompt' },
    { emoji: '🎯', label: 'Topic' },
    { emoji: '📊', label: 'Difficulty' },
    { emoji: '🔧', label: 'Component' }
  ];

  return (
    <div className="hero-container">
      <div className="hero-content">
        {/* Main Headlines */}
        <div className="text-center mb-12">
          <h1 className="hero-headline">
            AI Manuals for AI Models
          </h1>
          <p className="hero-subhead">
            IKEA assembly layer for AI. We solve the adoption crisis for 2.1M+ Hugging Face models 
            by making it trivially easy to try, learn, and deploy any model via interactive, runnable notebooks.
          </p>
        </div>

        {/* Three Blocks: Problem, Solution, Vision */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Problem Block */}
          <div className="summary-block">
            <h3 className="summary-block-title">Problem</h3>
            <p className="summary-block-description">
              Bad documentation, failed setup, and manual "vibe checks" waste hours and hide great open models.
            </p>
            <ul className="summary-block-list">
              <li>Bad docs make models hard to understand</li>
              <li>Failed setup blocks experimentation</li>
              <li>Manual vibe checks waste developer time</li>
            </ul>
          </div>

          {/* Solution Block */}
          <div className="summary-block">
            <h3 className="summary-block-title">Solution</h3>
            <p className="summary-block-description">
              Mix Model, Prompt Pack, Topic, Difficulty, and UI Component cards to generate 
              customized Jupyter notebooks that actually run.
            </p>
            <div className="flex flex-wrap gap-2 mt-4">
              {cardFamilies.map(({ emoji, label }) => (
                <div 
                  key={label}
                  className="card-family-chip"
                >
                  <span>{emoji}</span>
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Vision Block */}
          <div className="summary-block">
            <h3 className="summary-block-title">Vision</h3>
            <p className="summary-block-description">
              Every model gets a thriving ecosystem of community-created notebooks—"that was easy" 🎯 becomes the default.
            </p>
            <div className="mt-4 text-sm" style={{ color: 'var(--ink-subtle)' }}>
              <span>✨ Community-driven</span>
              <br />
              <span>🔄 Remixable recipes</span>
              <br />
              <span>🚀 Production-ready</span>
            </div>
          </div>
        </div>

        {/* CTAs */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <button 
              onClick={onShuffle}
              className="button primary cta-button"
              style={{
                fontSize: '1rem',
                padding: '12px 24px',
                fontWeight: '500'
              }}
            >
              <Shuffle size={18} />
              Try Shuffle
            </button>
            <button 
              onClick={onBrowseModels}
              className="button secondary cta-button"
              style={{
                fontSize: '1rem',
                padding: '12px 24px',
                fontWeight: '500'
              }}
            >
              <Search size={18} />
              Browse Models
            </button>
          </div>
          
          {/* Helper Text */}
          <p className="helper-text">
            Generates .ipynb via FastAPI + Celery, shareable via Supabase
          </p>
        </div>
      </div>
      
      <style jsx>{`
        .hero-container {
          max-width: 1120px;
          margin: 0 auto;
          padding: 0 24px;
          padding-top: 48px;
          padding-bottom: 48px;
          min-height: 80vh;
          display: flex;
          align-items: center;
          background: var(--surface);
          color: var(--ink);
        }

        .hero-content {
          width: 100%;
        }

        .hero-headline {
          font-size: 48px;
          line-height: 56px;
          font-weight: 600;
          font-family: var(--font-sans);
          margin: 0 0 16px 0;
          color: var(--ink);
        }

        .hero-subhead {
          font-size: 20px;
          line-height: 28px;
          font-weight: 400;
          font-family: var(--font-sans);
          color: var(--ink-subtle);
          max-width: 800px;
          margin: 0 auto;
        }

        .summary-block {
          text-align: left;
          padding: 24px;
          border-radius: var(--radius-lg);
          border: 1px solid var(--border);
          background: var(--surface);
          box-shadow: var(--shadow-card);
        }

        .summary-block-title {
          font-size: 18px;
          line-height: 26px;
          font-weight: 600;
          font-family: var(--font-sans);
          color: var(--ink);
          margin: 0 0 12px 0;
        }

        .summary-block-description {
          font-size: 16px;
          line-height: 24px;
          font-weight: 400;
          font-family: var(--font-sans);
          color: var(--ink);
          margin: 0 0 16px 0;
        }

        .summary-block-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .summary-block-list li {
          font-size: 14px;
          line-height: 20px;
          font-weight: 400;
          font-family: var(--font-sans);
          color: var(--ink-subtle);
          margin-bottom: 8px;
          position: relative;
          padding-left: 16px;
        }

        .summary-block-list li:before {
          content: '•';
          position: absolute;
          left: 0;
          color: var(--ink-subtle);
        }

        .card-family-chip {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: var(--radius-pill);
          background: var(--surface-alt);
          border: 1px solid var(--border);
          font-size: 14px;
          font-weight: 500;
          font-family: var(--font-sans);
          color: var(--ink);
          transition: all 160ms ease;
        }

        .card-family-chip:hover {
          border-color: var(--border-strong);
          transform: translateY(-1px);
        }

        .card-family-chip:focus-visible {
          outline: 2px solid var(--focus-ring);
          outline-offset: 2px;
        }

        .cta-button {
          transition: all 160ms ease;
        }

        .cta-button:focus-visible {
          outline: 2px solid var(--focus-ring);
          outline-offset: 2px;
        }

        .helper-text {
          font-size: 14px;
          line-height: 20px;
          font-weight: 400;
          font-family: var(--font-sans);
          color: var(--ink-subtle);
          margin: 0;
        }

        @media (max-width: 1024px) {
          .hero-container {
            padding-top: 32px;
            padding-bottom: 32px;
            min-height: 70vh;
          }
          
          .hero-headline {
            font-size: 40px;
            line-height: 48px;
          }

          .hero-subhead {
            font-size: 18px;
            line-height: 26px;
          }
        }

        @media (max-width: 768px) {
          .hero-container {
            padding: 0 16px;
            padding-top: 24px;
            padding-bottom: 24px;
            min-height: 60vh;
          }

          .hero-headline {
            font-size: 32px;
            line-height: 40px;
          }

          .hero-subhead {
            font-size: 16px;
            line-height: 24px;
          }

          .summary-block {
            padding: 20px;
          }

          .cta-button {
            width: 100%;
            margin-bottom: 8px;
          }

          .flex.items-center.justify-center.gap-3 {
            flex-direction: column;
            gap: 0;
          }
        }
      `}</style>
    </div>
  );
}