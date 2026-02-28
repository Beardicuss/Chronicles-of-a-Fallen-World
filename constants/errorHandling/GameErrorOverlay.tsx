/**
 * Game Error Overlay Component
 * Displays error information to the user
 */

import React, { ReactElement } from 'react';

interface Props {
  error: Error | null;
  stack?: string;
  onDismiss: () => void;
}

export const GameErrorOverlay: React.FC<Props> = ({
  error,
  stack,
  onDismiss
}): ReactElement => {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        fontFamily: 'monospace',
        color: '#fff'
      }}
    >
      <div
        style={{
          maxWidth: '600px',
          padding: '24px',
          backgroundColor: '#1a1a1a',
          borderRadius: '8px',
          border: '2px solid #ff0000',
          boxShadow: '0 0 20px rgba(255, 0, 0, 0.3)'
        }}
      >
        <h2 style={{ color: '#ff0000', marginTop: 0 }}>⚠️ An Error Occurred</h2>

        <div
          style={{
            backgroundColor: '#0a0a0a',
            padding: '12px',
            borderRadius: '4px',
            marginBottom: '16px',
            fontSize: '14px',
            lineHeight: '1.5'
          }}
        >
          <p style={{ margin: '0 0 8px 0', color: '#ff6b6b' }}>
            <strong>Error:</strong> {error?.message || 'Unknown error'}
          </p>

          {stack && (
            <details>
              <summary style={{ cursor: 'pointer', color: '#999', marginTop: '8px' }}>
                Stack Trace
              </summary>
              <pre
                style={{
                  margin: '8px 0 0 0',
                  fontSize: '12px',
                  color: '#666',
                  overflow: 'auto',
                  maxHeight: '200px'
                }}
              >
                {stack}
              </pre>
            </details>
          )}
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={onDismiss}
            style={{
              flex: 1,
              padding: '8px 16px',
              backgroundColor: '#0066cc',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            Dismiss
          </button>
          <button
            onClick={() => window.location.reload()}
            style={{
              flex: 1,
              padding: '8px 16px',
              backgroundColor: '#ff0000',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            Reload
          </button>
        </div>

        <p
          style={{
            fontSize: '12px',
            color: '#999',
            marginTop: '16px',
            marginBottom: 0
          }}
        >
          If this error persists, please contact support with the error details.
        </p>
      </div>
    </div>
  );
};
