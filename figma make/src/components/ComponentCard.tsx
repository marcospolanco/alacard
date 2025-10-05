import React from 'react';
import { Code } from 'lucide-react';

interface ComponentCardProps {
  component: {
    id: string;
    name: string;
    tech: string;
    description: string;
    preview: string;
    features: string[];
    useCase: string;
  };
  isSelected: boolean;
  onSelect: () => void;
  readOnly?: boolean;
}

export function ComponentCard({ component, isSelected, onSelect, readOnly = false }: ComponentCardProps) {
  return (
    <div 
      className={`card card--components ${!readOnly ? 'cursor-pointer' : ''} ${isSelected ? 'is-selected' : ''} ${readOnly ? 'read-only' : ''}`}
      onClick={readOnly ? undefined : onSelect}
      style={{
        borderColor: isSelected ? 'var(--card-components-accent)' : 'var(--border)'
      }}
    >
      <div className="card__header">
        <span>🔧</span>
        <span>{component.name}</span>
      </div>
      
      <div className="card__body">
        <div className="flex items-center gap-2 mb-3">
          <span className="badge">{component.tech}</span>
        </div>
        
        <p className="text-sm mb-3" style={{ color: 'var(--ink)', lineHeight: '1.5rem' }}>
          {component.description}
        </p>
        
        <div className="mb-3 p-2 rounded" 
             style={{ 
               backgroundColor: 'var(--surface-alt)',
               border: '1px solid var(--border)'
             }}>
          <div className="flex items-center gap-2 mb-1">
            <Code size={12} />
            <span className="text-xs" style={{ color: 'var(--ink-subtle)' }}>Preview</span>
          </div>
          <code 
            className="text-xs block" 
            style={{ 
              fontFamily: 'var(--font-mono)', 
              color: 'var(--ink)'
            }}
          >
            {component.preview}
          </code>
        </div>
        
        <div className="text-xs italic mb-3" style={{ color: 'var(--ink-subtle)' }}>
          {component.useCase}
        </div>
      </div>
      
      <div className="card__footer">
        {component.features.map(feature => (
          <span key={feature} className="badge text-xs">
            {feature}
          </span>
        ))}
      </div>
    </div>
  );
}