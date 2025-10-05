import React from 'react';
import { ArrowRight } from 'lucide-react';

interface PersonaCardsProps {
  onSeeGeneratorFlow: () => void;
}

export function PersonaCards({ onSeeGeneratorFlow }: PersonaCardsProps) {
  const personas = [
    {
      id: 'pragmatic-engineer',
      title: '👨‍💻 Pragmatic Engineer',
      isPrimary: true,
      profile: 'Senior developer building production features with tight deadlines',
      pain: 'Wastes hours on model setup instead of implementing business logic',
      goal: 'Quick proof-of-concept with a working model in under 30 minutes',
      success: 'Has a runnable notebook that demonstrates value to stakeholders'
    },
    {
      id: 'ai-explorer',
      title: '🔍 AI Explorer',
      isPrimary: false,
      profile: 'Tech-savvy professional discovering AI capabilities for projects',
      pain: 'Overwhelmed by 2.1M models with poor documentation and examples',
      goal: 'Understand which models solve specific problems through hands-on testing',
      success: 'Confidently evaluates and compares models for real use cases'
    },
    {
      id: 'learning-developer',
      title: '🌱 Learning Developer',
      isPrimary: false,
      profile: 'Junior to mid-level developer expanding into AI/ML development',
      pain: 'Complex setup processes block learning and experimentation',
      goal: 'Learn AI concepts through working examples and guided tutorials',
      success: 'Builds foundational AI skills with immediate, tangible results'
    }
  ];

  return (
    <section className="personas-section">
      <div className="personas-container">
        {/* Anti-personas Helper */}
        <div className="text-center mb-8">
          <p className="anti-personas-text">
            Anti-personas: Researchers, Non-technical PMs, Enterprise ML Ops
          </p>
        </div>

        {/* Persona Cards Grid */}
        <div className="personas-grid">
          {personas.map((persona) => (
            <div key={persona.id} className="persona-card">
              {/* Card Header */}
              <div className="persona-header">
                <h3 className="persona-title">{persona.title}</h3>
                {persona.isPrimary && (
                  <div className="persona-badge">
                    Primary
                  </div>
                )}
              </div>

              {/* Card Body */}
              <div className="persona-body">
                <div className="persona-field">
                  <div className="persona-field-label">Profile</div>
                  <div className="persona-field-separator"></div>
                  <p className="persona-field-text">{persona.profile}</p>
                </div>

                <div className="persona-field">
                  <div className="persona-field-label">Pain</div>
                  <div className="persona-field-separator"></div>
                  <p className="persona-field-text">{persona.pain}</p>
                </div>

                <div className="persona-field">
                  <div className="persona-field-label">Goal</div>
                  <div className="persona-field-separator"></div>
                  <p className="persona-field-text">{persona.goal}</p>
                </div>

                <div className="persona-field">
                  <div className="persona-field-label">Success</div>
                  <div className="persona-field-separator"></div>
                  <p className="persona-field-text">{persona.success}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* See Generator Flow Button */}
        <div className="text-right mt-8">
          <button 
            onClick={onSeeGeneratorFlow}
            className="button secondary"
            type="button"
          >
            See generator flow
            <ArrowRight size={16} />
          </button>
        </div>
      </div>

      <style jsx>{`
        .personas-section {
          max-width: 1120px;
          margin: 0 auto;
          padding: 64px 24px;
          background: var(--surface);
          color: var(--ink);
        }

        .personas-container {
          width: 100%;
        }

        .anti-personas-text {
          font-size: 14px;
          line-height: 20px;
          font-weight: 400;
          font-family: var(--font-sans);
          color: var(--ink-subtle);
          margin: 0;
        }

        .personas-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          align-items: start;
        }

        .persona-card {
          display: flex;
          flex-direction: column;
          border-radius: var(--radius-card);
          border: 1px solid var(--border);
          background: var(--surface);
          box-shadow: var(--shadow-card);
          padding: 24px;
          height: 100%;
          transition: transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease;
        }

        .persona-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px -12px rgba(15, 23, 42, 0.25);
          border-color: var(--border-strong);
        }

        .persona-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
        }

        .persona-title {
          font-size: 18px;
          line-height: 26px;
          font-weight: 600;
          font-family: var(--font-sans);
          color: var(--ink);
          margin: 0;
        }

        .persona-badge {
          padding: 4px 10px;
          border-radius: var(--radius-pill);
          background: var(--surface-alt);
          color: var(--ink-subtle);
          font-size: 13px;
          font-weight: 500;
          font-family: var(--font-sans);
        }

        .persona-body {
          display: flex;
          flex-direction: column;
          gap: 18px;
          flex: 1;
        }

        .persona-field {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .persona-field-label {
          font-size: 14px;
          line-height: 20px;
          font-weight: 600;
          font-family: var(--font-sans);
          color: var(--ink);
        }

        .persona-field-separator {
          height: 1px;
          background: var(--border);
          margin: 2px 0;
        }

        .persona-field-text {
          font-size: 16px;
          line-height: 24px;
          font-weight: 400;
          font-family: var(--font-sans);
          color: var(--ink);
          margin: 0;
        }

        .button:focus-visible {
          outline: 2px solid var(--focus-ring);
          outline-offset: 2px;
        }

        @media (max-width: 1024px) {
          .personas-section {
            padding: 48px 16px;
          }

          .personas-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
          }
        }

        @media (max-width: 768px) {
          .personas-grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }

          .persona-card {
            padding: 20px;
          }

          .persona-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
            margin-bottom: 16px;
          }

          .text-right {
            text-align: center;
          }
        }

        @media (max-width: 480px) {
          .persona-field-text {
            font-size: 15px;
            line-height: 22px;
          }

          .anti-personas-text {
            font-size: 13px;
            line-height: 18px;
          }
        }
      `}</style>
    </section>
  );
}