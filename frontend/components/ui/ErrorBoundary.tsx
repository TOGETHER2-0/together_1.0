'use client';

import React from 'react';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div style={{
          minHeight: '100dvh',
          background: 'var(--bg-base)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '32px 24px',
          textAlign: 'center',
          gap: 16,
        }}>
          <div style={{ fontSize: 48 }}>⚠️</div>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 22, fontWeight: 800,
            letterSpacing: '-0.03em',
          }}>
            Something went wrong
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, maxWidth: 280, lineHeight: 1.6 }}>
            {this.state.error?.message || 'An unexpected error occurred.'}
          </p>
          <button
            className="btn btn-primary"
            onClick={() => {
              this.setState({ hasError: false });
              window.location.href = '/events';
            }}
          >
            Back to events
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
