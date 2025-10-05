import React from 'react';
import { Sparkles, Download } from 'lucide-react';

interface GenerateButtonProps {
  onGenerate: () => void;
  canGenerate: boolean;
  isGenerating: boolean;
}

export function GenerateButton({ onGenerate, canGenerate, isGenerating }: GenerateButtonProps) {
  if (!canGenerate) {
    return (
      <div className="text-center">
        <div className="text-lg mb-4" style={{ color: 'var(--ink-subtle)' }}>
          Select at least Model, Prompt Pack, Topic, and Difficulty to generate a notebook
        </div>
        <button 
          className="button primary opacity-50 cursor-not-allowed"
          disabled
        >
          <Sparkles size={16} />
          Generate Notebook
        </button>
      </div>
    );
  }

  return (
    <div className="text-center">
      <div className="text-lg mb-4" style={{ color: 'var(--ink)' }}>
        {isGenerating ? 'Crafting your custom notebook...' : 'Ready to generate your notebook!'}
      </div>
      <button 
        onClick={onGenerate}
        disabled={isGenerating}
        className="button primary text-lg px-8 py-3"
        style={{
          fontSize: '1.125rem',
          padding: '12px 32px'
        }}
      >
        {isGenerating ? (
          <>
            <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full"></div>
            Generating...
          </>
        ) : (
          <>
            <Sparkles size={20} />
            Generate Notebook
          </>
        )}
      </button>
      
      {isGenerating && (
        <div className="mt-4 max-w-md mx-auto">
          <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--surface-alt)' }}>
            <div 
              className="h-full rounded-full transition-all duration-1000 ease-out"
              style={{ 
                backgroundColor: 'var(--cta-primary-bg)',
                width: '65%'
              }}
            ></div>
          </div>
          <div className="text-sm mt-2" style={{ color: 'var(--ink-subtle)' }}>
            Analyzing model documentation and generating cells...
          </div>
        </div>
      )}
    </div>
  );
}