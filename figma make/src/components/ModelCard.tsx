import React from 'react';
import { Download } from 'lucide-react';

interface ModelCardProps {
  model: {
    id: string;
    name: string;
    vendor: string;
    modelId: string;
    description: string;
    downloads: string;
    category: string;
    capabilities: string[];
  };
  isSelected: boolean;
  onSelect: () => void;
  readOnly?: boolean;
}

export function ModelCard({ model, isSelected, onSelect, readOnly = false }: ModelCardProps) {
  return (
    <div 
      className={`card card--model ${!readOnly ? 'cursor-pointer' : ''} ${isSelected ? 'is-selected' : ''} ${readOnly ? 'read-only' : ''}`}
      onClick={readOnly ? undefined : onSelect}
      style={{
        borderColor: isSelected ? 'var(--card-model-accent)' : 'var(--border)'
      }}
    >
      <div className="card__header">
        <span>🤖</span>
        <span>{model.name}</span>
      </div>
      
      <div className="card__body">
        <div>
          <code 
            className="text-sm" 
            style={{ 
              fontFamily: 'var(--font-mono)', 
              fontSize: '0.8125rem',
              color: 'var(--ink-subtle)'
            }}
          >
            {model.modelId}
          </code>
        </div>
        
        <p className="text-sm" style={{ color: 'var(--ink)', lineHeight: '1.5rem' }}>
          {model.description}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--ink-subtle)' }}>
            <Download size={14} />
            <span className="metrics">{model.downloads}</span>
          </div>
          <span className="badge">{model.category}</span>
        </div>
      </div>
      
      <div className="card__footer">
        {model.capabilities.map(capability => (
          <span key={capability} className="badge text-xs">
            {capability}
          </span>
        ))}
      </div>
    </div>
  );
}