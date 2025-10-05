import React from 'react';
import { SelectedCards } from '../App';

interface PlayingCardHandProps {
  selectedCards: SelectedCards;
  onShuffle?: () => void;
  showShuffleButton?: boolean;
}

interface PlayingCardProps {
  type: string;
  card: any;
  emoji: string;
  position: number;
  total: number;
  isEmpty?: boolean;
}

function PlayingCard({ type, card, emoji, position, total, isEmpty = false }: PlayingCardProps) {
  // Calculate rotation for fanned effect
  const maxRotation = 15; // degrees
  const centerIndex = (total - 1) / 2;
  const rotation = ((position - centerIndex) / centerIndex) * maxRotation;
  const verticalOffset = Math.abs(rotation) * 1.5; // Slight arc effect
  
  const getCardColor = () => {
    if (isEmpty) return 'var(--surface-muted)';
    
    switch (type.toLowerCase()) {
      case 'model':
        return 'var(--card-model-accent)';
      case 'prompt':
        return 'var(--card-model-accent)';
      case 'topic':
        return 'var(--card-model-accent)';
      case 'difficulty':
        if (!card) return 'var(--card-complexity-medium-accent)';
        switch (card.id) {
          case 'easy': return 'var(--card-complexity-easy-accent)';
          case 'medium': return 'var(--card-complexity-medium-accent)';
          case 'hard': return 'var(--card-complexity-hard-accent)';
          default: return 'var(--card-complexity-medium-accent)';
        }
      case 'component':
        return 'var(--card-components-accent)';
      default:
        return 'var(--card-model-accent)';
    }
  };

  const getCardBg = () => {
    if (isEmpty) return 'var(--surface-alt)';
    
    switch (type.toLowerCase()) {
      case 'model':
        return 'var(--card-model-bg)';
      case 'prompt':
        return 'var(--card-model-bg)';
      case 'topic':
        return 'var(--card-model-bg)';
      case 'difficulty':
        if (!card) return 'var(--card-complexity-medium-bg)';
        switch (card.id) {
          case 'easy': return 'var(--card-complexity-easy-bg)';
          case 'medium': return 'var(--card-complexity-medium-bg)';
          case 'hard': return 'var(--card-complexity-hard-bg)';
          default: return 'var(--card-complexity-medium-bg)';
        }
      case 'component':
        return 'var(--card-components-bg)';
      default:
        return 'var(--card-model-bg)';
    }
  };

  return (
    <div 
      className="playing-card"
      style={{
        transform: `rotate(${rotation}deg) translateY(${verticalOffset}px)`,
        zIndex: position + 1,
        '--card-color': getCardColor(),
        '--card-bg': getCardBg(),
        '--rotation': `${rotation}deg`
      } as React.CSSProperties}
    >
      <div className="card-inner">
        <div className="card-front">
          <div className="card-corner top-left">
            <div className="card-symbol">{emoji}</div>
            <div className="card-suit">{type[0].toUpperCase()}</div>
          </div>
          <div className="card-center">
            <div className="card-emoji">{emoji}</div>
            <div className="card-name">
              {isEmpty ? `Choose ${type}` : (card?.name || card?.level || 'Selected')}
            </div>
          </div>
          <div className="card-corner bottom-right">
            <div className="card-symbol rotated">{emoji}</div>
            <div className="card-suit rotated">{type[0].toUpperCase()}</div>
          </div>
        </div>
        <div className="card-back">
          <div className="card-pattern">
            <div className="pattern-grid">
              {Array.from({ length: 25 }).map((_, i) => (
                <div key={i} className="pattern-dot"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PlayingCardHand({ selectedCards, onShuffle, showShuffleButton = true }: PlayingCardHandProps) {
  const cards = [
    { type: 'Model', card: selectedCards.model, emoji: '🤖' },
    { type: 'Prompt', card: selectedCards.prompt, emoji: selectedCards.prompt?.theme || '💭' },
    { type: 'Topic', card: selectedCards.topic, emoji: selectedCards.topic?.emoji || '🎯' },
    { type: 'Difficulty', card: selectedCards.difficulty, emoji: selectedCards.difficulty?.emoji || '📊' },
    { type: 'Component', card: selectedCards.component, emoji: '🔧' }
  ];

  const selectedCount = cards.filter(c => c.card).length;

  return (
    <div className="playing-card-hand">
      <div className="hand-container">
        <div className="cards-fan">
          {cards.map((cardData, index) => (
            <PlayingCard
              key={cardData.type}
              type={cardData.type}
              card={cardData.card}
              emoji={cardData.emoji}
              position={index}
              total={cards.length}
              isEmpty={!cardData.card}
            />
          ))}
        </div>
        
        {showShuffleButton && (
          <div className="hand-actions">
            <div className="hand-info">
              <div className="selected-count">
                {selectedCount}/5 cards
              </div>
              <div className="hand-status">
                {selectedCount === 5 ? 'Full house!' : 
                 selectedCount >= 3 ? 'Good hand' : 
                 selectedCount > 0 ? 'Building...' : 'Deal me a hand'}
              </div>
            </div>
            <button 
              onClick={onShuffle}
              className="button shuffle hand-shuffle"
              type="button"
            >
              <span className="shuffle-icon">🎲</span>
              Deal cards
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        .playing-card-hand {
          padding: 32px 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 24px;
          background: linear-gradient(135deg, var(--surface) 0%, var(--surface-alt) 100%);
          border-radius: 16px;
          margin: 24px 0;
          position: relative;
          overflow: hidden;
        }

        .playing-card-hand::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: 
            radial-gradient(circle at 20% 30%, rgba(46, 107, 255, 0.03) 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, rgba(255, 122, 26, 0.03) 0%, transparent 50%);
          pointer-events: none;
        }

        .hand-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 32px;
          position: relative;
          z-index: 1;
        }

        .cards-fan {
          position: relative;
          height: 180px;
          width: 100%;
          max-width: 600px;
          display: flex;
          align-items: center;
          justify-content: center;
          perspective: 1000px;
        }

        .playing-card {
          position: relative;
          width: 110px;
          height: 160px;
          cursor: pointer;
          transition: all 300ms cubic-bezier(0.34, 1.56, 0.64, 1);
          transform-style: preserve-3d;
          flex-shrink: 0;
          margin-left: -20px; /* Overlap cards slightly */
        }

        .playing-card:first-child {
          margin-left: 0;
        }

        .playing-card:hover {
          transform: rotate(var(--rotation, 0deg)) translateY(-25px) scale(1.08);
          z-index: 20 !important;
        }

        .playing-card:not(:hover) .card-inner {
          animation: cardFloat 3s ease-in-out infinite;
        }

        .playing-card:nth-child(even):not(:hover) .card-inner {
          animation-delay: -1.5s;
        }

        .card-inner {
          position: relative;
          width: 100%;
          height: 100%;
          transition: transform 300ms ease;
          transform-style: preserve-3d;
        }

        .card-front,
        .card-back {
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 12px;
          border: 2px solid var(--border);
          backface-visibility: hidden;
          box-shadow: 
            0 8px 32px -8px rgba(15, 23, 42, 0.3),
            0 0 0 1px rgba(255, 255, 255, 0.1) inset;
        }

        .card-front {
          background: var(--card-bg, var(--surface));
          color: var(--card-color, var(--ink));
          display: flex;
          flex-direction: column;
          position: relative;
          overflow: hidden;
        }

        .card-back {
          background: var(--ink);
          transform: rotateY(180deg);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .card-corner {
          position: absolute;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
          font-size: 10px;
          font-weight: 600;
          line-height: 1;
        }

        .card-corner.top-left {
          top: 8px;
          left: 8px;
        }

        .card-corner.bottom-right {
          bottom: 8px;
          right: 8px;
        }

        .card-corner.rotated {
          transform: rotate(180deg);
        }

        .card-symbol {
          font-size: 14px;
          line-height: 1;
        }

        .card-suit {
          font-size: 8px;
          font-weight: 700;
          opacity: 0.8;
        }

        .card-center {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 16px 8px;
          text-align: center;
        }

        .card-emoji {
          font-size: 32px;
          line-height: 1;
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
        }

        .card-name {
          font-size: 11px;
          font-weight: 600;
          line-height: 1.2;
          max-width: 100%;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }

        .card-pattern {
          width: 100%;
          height: 100%;
          padding: 12px;
        }

        .pattern-grid {
          width: 100%;
          height: 100%;
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          grid-template-rows: repeat(5, 1fr);
          gap: 2px;
        }

        .pattern-dot {
          background: var(--ink-inverse);
          border-radius: 50%;
          opacity: 0.6;
        }

        .hand-actions {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }

        .hand-info {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          text-align: center;
        }

        .selected-count {
          font-size: 18px;
          font-weight: 600;
          color: var(--ink);
          font-variant-numeric: tabular-nums;
        }

        .hand-status {
          font-size: 14px;
          color: var(--ink-subtle);
          font-weight: 500;
        }

        .hand-shuffle {
          position: relative;
          overflow: hidden;
        }

        .hand-shuffle:hover {
          transform: scale(1.02) translateY(-1px);
        }

        .hand-shuffle:active {
          transform: scale(0.98);
        }

        .shuffle-icon {
          display: inline-block;
          animation: rollDice 2s infinite ease-in-out;
        }

        @keyframes rollDice {
          0%, 90%, 100% { transform: rotate(0deg); }
          20% { transform: rotate(90deg); }
          40% { transform: rotate(180deg); }
          60% { transform: rotate(270deg); }
          80% { transform: rotate(360deg); }
        }

        @keyframes cardFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-2px); }
        }

        /* Empty card styling */
        .playing-card:has(.card-front:empty) .card-front {
          opacity: 0.5;
          border-style: dashed;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .cards-fan {
            max-width: 450px;
            height: 150px;
          }

          .playing-card {
            width: 85px;
            height: 125px;
            margin-left: -15px;
          }

          .playing-card:first-child {
            margin-left: 0;
          }

          .card-emoji {
            font-size: 22px;
          }

          .card-name {
            font-size: 10px;
          }

          .hand-shuffle {
            padding: 12px 24px;
            font-size: 14px;
          }
        }

        @media (max-width: 480px) {
          .playing-card-hand {
            margin: 16px 0;
            padding: 24px 16px;
          }

          .cards-fan {
            max-width: 350px;
            height: 130px;
          }

          .playing-card {
            width: 65px;
            height: 95px;
            margin-left: -10px;
          }

          .playing-card:first-child {
            margin-left: 0;
          }

          .card-emoji {
            font-size: 18px;
          }

          .card-name {
            font-size: 9px;
          }

          .card-corner {
            top: 4px;
            left: 4px;
          }

          .card-corner.bottom-right {
            bottom: 4px;
            right: 4px;
          }

          .card-symbol {
            font-size: 10px;
          }

          .card-suit {
            font-size: 7px;
          }

          .selected-count {
            font-size: 16px;
          }

          .hand-status {
            font-size: 13px;
          }
        }
      `}</style>
    </div>
  );
}