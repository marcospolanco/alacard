import React from 'react';
import { Clock } from 'lucide-react';

interface DifficultyCardProps {
  difficulty: {
    id: string;
    level: string;
    emoji: string;
    description: string;
    features: string[];
    estimatedTime: string;
  };
  isSelected: boolean;
  onSelect: () => void;
  readOnly?: boolean;
}

export function DifficultyCard({ difficulty, isSelected, onSelect, readOnly = false }: DifficultyCardProps) {
  const getCardClass = () => {
    switch (difficulty.id) {
      case 'easy': return 'card--complexity-easy';
      case 'medium': return 'card--complexity-medium';
      case 'hard': return 'card--complexity-hard';
      default: return 'card--complexity-easy';
    }
  };

  const getBorderColor = () => {
    if (!isSelected) return 'var(--border)';
    switch (difficulty.id) {
      case 'easy': return 'var(--card-complexity-easy-accent)';
      case 'medium': return 'var(--card-complexity-medium-accent)';
      case 'hard': return 'var(--card-complexity-hard-accent)';
      default: return 'var(--card-complexity-easy-accent)';
    }
  };

  return (
    <div 
      className={`card ${getCardClass()} ${!readOnly ? 'cursor-pointer' : ''} ${isSelected ? 'is-selected' : ''} ${readOnly ? 'read-only' : ''}`}
      onClick={readOnly ? undefined : onSelect}
      style={{
        borderColor: getBorderColor()
      }}
    >
      <div className="card__header">
        <span>{difficulty.emoji}</span>
        <span>{difficulty.level}</span>
      </div>
      
      <div className="card__body">
        <p className="text-sm" style={{ color: 'var(--ink)', lineHeight: '1.5rem' }}>
          {difficulty.description}
        </p>
        
        <div className="space-y-1">
          {difficulty.features.map(feature => (
            <div key={feature} className="text-sm flex items-center gap-2" 
                 style={{ color: 'var(--ink-subtle)' }}>
              <div className="w-1 h-1 rounded-full" 
                   style={{ backgroundColor: 'var(--ink-subtle)' }}></div>
              {feature}
            </div>
          ))}
        </div>
        
        <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--ink-subtle)' }}>
          <Clock size={14} />
          <span>{difficulty.estimatedTime}</span>
        </div>
      </div>
    </div>
  );
}