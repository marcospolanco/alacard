import React, { useState, useEffect } from 'react';
import { X, Shuffle } from 'lucide-react';

interface ShuffleToastProps {
  show: boolean;
  onDismiss: () => void;
  selectedCount: number;
}

export function ShuffleToast({ show, onDismiss, selectedCount }: ShuffleToastProps) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onDismiss();
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [show, onDismiss]);

  if (!show) return null;

  return (
    <div className="shuffle-toast">
      <div className="toast-content">
        <div className="toast-icon">
          <Shuffle size={16} />
        </div>
        <div className="toast-message">
          <strong>New hand dealt!</strong>
          <div className="toast-meta">
            {selectedCount} cards selected
          </div>
        </div>
        <button 
          onClick={onDismiss}
          className="toast-dismiss"
          type="button"
          aria-label="Dismiss notification"
        >
          <X size={16} />
        </button>
      </div>

      <style jsx>{`
        .shuffle-toast {
          position: fixed;
          top: 24px;
          right: 24px;
          z-index: 100;
          animation: toastSlideIn 300ms cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .toast-content {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          border-radius: var(--radius-lg);
          border: 1px solid var(--card-model-border);
          background: var(--card-model-bg);
          color: var(--card-model-accent);
          box-shadow: 0 12px 32px -12px rgba(46, 107, 255, 0.4);
          min-width: 280px;
        }

        .toast-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: var(--card-model-accent);
          color: var(--surface);
        }

        .toast-message {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .toast-message strong {
          font-size: 14px;
          font-weight: 600;
          line-height: 20px;
        }

        .toast-meta {
          font-size: 13px;
          opacity: 0.8;
          line-height: 18px;
        }

        .toast-dismiss {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          background: none;
          border: none;
          color: inherit;
          cursor: pointer;
          transition: opacity 160ms ease;
          border-radius: 4px;
          opacity: 0.7;
        }

        .toast-dismiss:hover {
          opacity: 1;
          background: rgba(46, 107, 255, 0.1);
        }

        @keyframes toastSlideIn {
          from {
            opacity: 0;
            transform: translateX(100%) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }

        @media (max-width: 768px) {
          .shuffle-toast {
            right: 16px;
            left: 16px;
            top: 16px;
          }

          .toast-content {
            min-width: auto;
          }
        }
      `}</style>
    </div>
  );
}