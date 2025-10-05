import React from 'react';

interface TopicCardProps {
  topic: {
    id: string;
    name: string;
    emoji: string;
  };
  isSelected: boolean;
  onSelect: () => void;
  readOnly?: boolean;
}

export function TopicCard({ topic, isSelected, onSelect, readOnly = false }: TopicCardProps) {
  return (
    <div 
      className={`card ${!readOnly ? 'cursor-pointer' : ''} ${isSelected ? 'is-selected' : ''} ${readOnly ? 'read-only' : ''}`}
      onClick={readOnly ? undefined : onSelect}
      style={{
        borderColor: isSelected ? 'var(--card-model-accent)' : 'var(--border)',
        minHeight: '120px',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center'
      }}
    >
      <div className="flex flex-col items-center gap-3">
        <div className="text-3xl">{topic.emoji}</div>
        <div className="text-sm font-medium" style={{ fontWeight: '500' }}>
          {topic.name}
        </div>
      </div>
    </div>
  );
}