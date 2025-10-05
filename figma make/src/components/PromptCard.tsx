import React from 'react';

interface PromptCardProps {
  prompt: {
    id: string;
    name: string;
    theme: string;
    description: string;
    prompts: string[];
    tags: string[];
  };
  isSelected: boolean;
  onSelect: () => void;
  readOnly?: boolean;
}

export function PromptCard({ prompt, isSelected, onSelect, readOnly = false }: PromptCardProps) {
  return (
    <div 
      className={`card card--model ${!readOnly ? 'cursor-pointer' : ''} ${isSelected ? 'is-selected' : ''} ${readOnly ? 'read-only' : ''}`}
      onClick={readOnly ? undefined : onSelect}
      style={{
        borderColor: isSelected ? 'var(--card-model-accent)' : 'var(--border)'
      }}
    >
      <div className="card__header">
        <span>{prompt.theme}</span>
        <span>{prompt.name}</span>
      </div>
      
      <div className="card__body">
        <p className="text-sm" style={{ color: 'var(--ink)', lineHeight: '1.5rem' }}>
          {prompt.description}
        </p>
        
        <div className="space-y-2">
          {prompt.prompts.slice(0, 2).map((example, index) => (
            <div key={index} className="text-xs p-2 rounded" 
                 style={{ 
                   backgroundColor: 'var(--surface-alt)', 
                   color: 'var(--ink-subtle)',
                   lineHeight: '1.4rem'
                 }}>
              ""{example}""
            </div>
          ))}
          {prompt.prompts.length > 2 && (
            <div className="text-xs" style={{ color: 'var(--ink-subtle)' }}>
              +{prompt.prompts.length - 2} more prompts
            </div>
          )}
        </div>
      </div>
      
      <div className="card__footer">
        {prompt.tags.map(tag => (
          <span key={tag} className="badge text-xs">
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}