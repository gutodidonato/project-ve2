'use client';

import { Component, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  /** Rendered instead of `children` once something below has thrown. */
  fallback: ReactNode;
  onError?: (error: unknown) => void;
  children: ReactNode;
}

interface ErrorBoundaryState {
  failed: boolean;
}

/**
 * Minimal error boundary. Works in the DOM tree (canvas creation failures) and
 * inside the R3F tree (a failed GLB falls back to the primitive car).
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { failed: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    this.props.onError?.(error);
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
