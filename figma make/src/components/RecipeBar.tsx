import React from 'react';
import { SelectedCards } from '../App';

interface RecipeBarProps {
  selectedCards: SelectedCards;
  onGenerate: () => void;
  canGenerate: boolean;
  isGenerating: boolean;
}

export function RecipeBar({ selectedCards, onGenerate, canGenerate, isGenerating }: RecipeBarProps) {
  const getCardChip = (type: string, card: any, emoji: string) => {
    if (!card) {
      return (
        <div className="recipe-chip opacity-50">
          <span>{emoji}</span>
          <span>Choose {type}</span>
        </div>
      );
    }

    return (
      <div className="recipe-chip">
        <span>{emoji}</span>
        <span>{card.name || card.level}</span>
      </div>
    );
  };

  return (
    <div className="sticky top-6 z-10">
      <div className="recipe-bar">
        <div className="flex flex-wrap gap-3">
          {getCardChip('Model', selectedCards.model, '🤖')}
          {getCardChip('Prompt', selectedCards.prompt, selectedCards.prompt?.theme || '💭')}
          {getCardChip('Topic', selectedCards.topic, selectedCards.topic?.emoji || '🎯')}
          {getCardChip('Difficulty', selectedCards.difficulty, selectedCards.difficulty?.emoji || '📊')}
          {getCardChip('Component', selectedCards.component, '🔧')}
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={onGenerate}
            disabled={!canGenerate || isGenerating}
            className="button primary"
            style={{
              opacity: !canGenerate ? 0.5 : 1,
              cursor: !canGenerate ? 'not-allowed' : 'pointer'
            }}
          >
            {isGenerating ? 'Generating...' : 'Generate Notebook'}
          </button>
        </div>
      </div>
    </div>
  );
}