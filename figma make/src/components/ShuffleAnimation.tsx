import React, { useState, useEffect } from 'react';

interface ShuffleAnimationProps {
  isShuffling: boolean;
  onComplete?: () => void;
}

export function ShuffleAnimation({ isShuffling, onComplete }: ShuffleAnimationProps) {
  const [stage, setStage] = useState<'idle' | 'shuffling' | 'dealing'>('idle');

  useEffect(() => {
    if (isShuffling) {
      setStage('shuffling');
      
      // Simulate shuffle stages
      const timer1 = setTimeout(() => {
        setStage('dealing');
      }, 600);
      
      const timer2 = setTimeout(() => {
        setStage('idle');
        onComplete?.();
      }, 1200);
      
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }
  }, [isShuffling, onComplete]);

  if (!isShuffling && stage === 'idle') return null;

  return (
    <div className="shuffle-overlay">
      <div className="shuffle-container">
        <div className={`deck-animation ${stage}`}>
          {/* Card stack simulation */}
          {Array.from({ length: 5 }).map((_, i) => (
            <div 
              key={i} 
              className={`shuffle-card card-${i}`}
              style={{
                animationDelay: `${i * 100}ms`
              }}
            >
              <div className="card-face">
                {stage === 'dealing' ? (
                  <div className="card-content">
                    {['🤖', '💭', '🎯', '📊', '🔧'][i]}
                  </div>
                ) : (
                  <div className="card-back-pattern">
                    <div className="pattern-dots">
                      {Array.from({ length: 9 }).map((_, j) => (
                        <div key={j} className="dot"></div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        
        <div className="shuffle-text">
          <div className={`message ${stage}`}>
            {stage === 'shuffling' && '🎲 Shuffling deck...'}
            {stage === 'dealing' && '🃏 Dealing hand...'}
          </div>
        </div>
      </div>

      <style jsx>{`
        .shuffle-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(15, 23, 42, 0.8);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 50;
          animation: fadeIn 200ms ease-out;
        }

        .shuffle-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 32px;
        }

        .deck-animation {
          position: relative;
          width: 200px;
          height: 140px;
          perspective: 1000px;
        }

        .shuffle-card {
          position: absolute;
          width: 80px;
          height: 110px;
          border-radius: 8px;
          background: var(--surface);
          border: 2px solid var(--border);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          transform-style: preserve-3d;
          left: 50%;
          top: 50%;
          margin-left: -40px;
          margin-top: -55px;
        }

        .deck-animation.shuffling .shuffle-card {
          animation: shuffleMotion 600ms ease-in-out;
        }

        .deck-animation.dealing .shuffle-card {
          animation: dealCards 600ms ease-out forwards;
        }

        .card-face {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 6px;
          transition: transform 300ms ease;
        }

        .card-content {
          font-size: 24px;
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
        }

        .card-back-pattern {
          width: 100%;
          height: 100%;
          padding: 8px;
        }

        .pattern-dots {
          width: 100%;
          height: 100%;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          grid-template-rows: repeat(3, 1fr);
          gap: 2px;
        }

        .dot {
          background: var(--ink);
          border-radius: 50%;
          opacity: 0.6;
        }

        .shuffle-text {
          color: var(--ink-inverse);
          text-align: center;
        }

        .message {
          font-size: 18px;
          font-weight: 600;
          opacity: 0;
          transform: translateY(10px);
          transition: all 300ms ease;
        }

        .message.shuffling,
        .message.dealing {
          opacity: 1;
          transform: translateY(0);
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes shuffleMotion {
          0% {
            transform: translateX(0) translateY(0) rotateY(0deg);
          }
          25% {
            transform: translateX(-30px) translateY(-20px) rotateY(180deg);
          }
          50% {
            transform: translateX(30px) translateY(20px) rotateY(360deg);
          }
          75% {
            transform: translateX(-15px) translateY(-10px) rotateY(540deg);
          }
          100% {
            transform: translateX(0) translateY(0) rotateY(720deg);
          }
        }

        @keyframes dealCards {
          0% {
            transform: translateX(0) translateY(0) rotateY(0deg);
            opacity: 1;
          }
          100% {
            transform: translateX(calc(var(--deal-x, 0) * 60px)) 
                       translateY(calc(var(--deal-y, 0) * 40px)) 
                       rotateY(180deg);
            opacity: 0.8;
          }
        }

        .card-0 {
          --deal-x: -2;
          --deal-y: -1;
        }

        .card-1 {
          --deal-x: -1;
          --deal-y: 0;
        }

        .card-2 {
          --deal-x: 0;
          --deal-y: 1;
        }

        .card-3 {
          --deal-x: 1;
          --deal-y: 0;
        }

        .card-4 {
          --deal-x: 2;
          --deal-y: -1;
        }
      `}</style>
    </div>
  );
}