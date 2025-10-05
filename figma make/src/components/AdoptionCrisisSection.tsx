import React from 'react';
import { Download, AlertTriangle, Clock, Eye, DollarSign, Zap, Building, Github, Globe } from 'lucide-react';

interface AdoptionCrisisSectionProps {
  onSeeExamples: () => void;
}

export function AdoptionCrisisSection({ onSeeExamples }: AdoptionCrisisSectionProps) {
  const whyReasons = [
    {
      icon: <AlertTriangle size={16} />,
      emoji: '📚',
      text: 'Bad/No Docs make models impossible to understand or use confidently'
    },
    {
      icon: <Zap size={16} />,
      emoji: '⚡',
      text: 'High Friction Setup blocks experimentation with complex dependencies'
    },
    {
      icon: <Eye size={16} />,
      emoji: '👀',
      text: 'Vibe Checking at Scale requires manual testing of every promising model'
    },
    {
      icon: <Clock size={16} />,
      emoji: '⏰',
      text: 'Time Expensive evaluation means most models never get proper testing'
    },
    {
      icon: <Building size={16} />,
      emoji: '🏢',
      text: 'Hyper-Consolidation pushes teams toward familiar big models only'
    }
  ];

  const costImpacts = [
    {
      icon: <DollarSign size={16} />,
      emoji: '👨‍💻',
      text: 'Developers waste hours on setup instead of building features'
    },
    {
      icon: <Building size={16} />,
      emoji: '🏢',
      text: 'Enterprises miss cost-effective specialized models for their use cases'
    },
    {
      icon: <Github size={16} />,
      emoji: '🔓',
      text: 'Open Source innovation gets buried under poor discoverability'
    },
    {
      icon: <Globe size={16} />,
      emoji: '🌍',
      text: 'Society loses diverse AI solutions concentrated in few large models'
    }
  ];

  return (
    <section className="crisis-section">
      <div className="crisis-container">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="crisis-title">
            The AI Model Adoption Crisis
          </h2>
          <p className="crisis-description">
            Despite 2.1M+ models on Hugging Face, most developers stick to the same few big names. 
            Here's why great models go unused and what it costs us.
          </p>
        </div>

        {/* Two Column Layout */}
        <div className="crisis-grid">
          {/* Why Column */}
          <div className="crisis-column">
            <div className="crisis-column-header">
              <h3 className="crisis-column-title">Why</h3>
              <div className="crisis-badge">
                <Download size={14} />
                <span className="metrics">2.1M models</span>
              </div>
            </div>
            
            <ul className="crisis-list">
              {whyReasons.map((reason, index) => (
                <li key={index} className="crisis-list-item">
                  <span className="crisis-icon">{reason.emoji}</span>
                  <span className="crisis-text">{reason.text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* The Cost Column */}
          <div className="crisis-column">
            <div className="crisis-column-header">
              <h3 className="crisis-column-title">The Cost</h3>
              <div className="crisis-badge">
                <AlertTriangle size={14} />
                <span>Wasted potential</span>
              </div>
            </div>
            
            <ul className="crisis-list">
              {costImpacts.map((impact, index) => (
                <li key={index} className="crisis-list-item">
                  <span className="crisis-icon">{impact.emoji}</span>
                  <span className="crisis-text">{impact.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* See Examples Link */}
        <div className="text-center mt-8">
          <button 
            onClick={onSeeExamples}
            className="crisis-link"
            type="button"
          >
            See examples
          </button>
        </div>
      </div>

      <style jsx>{`
        .crisis-section {
          max-width: 1120px;
          margin: 0 auto;
          padding: 64px 24px;
          background: var(--surface);
          color: var(--ink);
        }

        .crisis-container {
          width: 100%;
        }

        .crisis-title {
          font-size: 28px;
          line-height: 36px;
          font-weight: 600;
          font-family: var(--font-sans);
          color: var(--ink);
          margin: 0 0 12px 0;
        }

        .crisis-description {
          font-size: 16px;
          line-height: 24px;
          font-weight: 400;
          font-family: var(--font-sans);
          color: var(--ink-subtle);
          max-width: 600px;
          margin: 0 auto;
        }

        .crisis-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          margin: 0;
        }

        .crisis-column {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .crisis-column-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 8px;
        }

        .crisis-column-title {
          font-size: 20px;
          line-height: 28px;
          font-weight: 600;
          font-family: var(--font-sans);
          color: var(--ink);
          margin: 0;
        }

        .crisis-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          border-radius: var(--radius-pill);
          background: var(--surface-alt);
          color: var(--ink-subtle);
          font-size: 13px;
          font-weight: 500;
          font-family: var(--font-sans);
        }

        .crisis-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .crisis-list-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          font-size: 16px;
          line-height: 24px;
          font-weight: 400;
          font-family: var(--font-sans);
          color: var(--ink);
          padding: 0;
        }

        .crisis-icon {
          font-size: 16px;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .crisis-text {
          flex: 1;
        }

        .crisis-link {
          background: none;
          border: none;
          color: var(--cta-primary-bg);
          font-size: 14px;
          line-height: 20px;
          font-weight: 500;
          font-family: var(--font-sans);
          text-decoration: underline;
          text-underline-offset: 2px;
          cursor: pointer;
          padding: 4px 8px;
          border-radius: 4px;
          transition: color 160ms ease, background-color 160ms ease;
        }

        .crisis-link:hover {
          color: var(--cta-primary-hover);
          background-color: rgba(46, 107, 255, 0.08);
        }

        .crisis-link:focus-visible {
          outline: 2px solid var(--focus-ring);
          outline-offset: 2px;
        }

        @media (max-width: 768px) {
          .crisis-section {
            padding: 48px 16px;
          }

          .crisis-title {
            font-size: 24px;
            line-height: 32px;
          }

          .crisis-description {
            font-size: 15px;
            line-height: 22px;
          }

          .crisis-grid {
            grid-template-columns: 1fr;
            gap: 32px;
          }

          .crisis-column-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
          }

          .crisis-list-item {
            font-size: 15px;
            line-height: 22px;
          }
        }

        @media (max-width: 480px) {
          .crisis-list-item {
            gap: 10px;
          }

          .crisis-icon {
            font-size: 14px;
          }
        }
      `}</style>
    </section>
  );
}