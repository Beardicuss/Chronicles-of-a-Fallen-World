/**
 * Error Boundary Component
 * React component to catch and handle errors
 */

import React, { ReactNode, ReactElement, ErrorInfo as ReactErrorInfo } from 'react';
import { GameErrorOverlay } from './GameErrorOverlay.js';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ReactErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ReactErrorInfo | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: ReactErrorInfo): void {
    this.setState({
      error,
      errorInfo
    });

    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    console.error('[ErrorBoundary] Error caught:', error, errorInfo);
  }

  resetError = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render(): ReactElement {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return <>{this.props.fallback}</>;
      }

      return (
        <GameErrorOverlay
          error={this.state.error}
          stack={this.state.errorInfo?.componentStack ?? undefined}
          onDismiss={this.resetError}
        />
      );
    }

    return <>{this.props.children}</>;
  }
}
