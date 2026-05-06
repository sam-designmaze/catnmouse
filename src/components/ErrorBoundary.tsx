"use client";

import React, { ReactNode } from "react";
import * as Sentry from "@sentry/nextjs";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    Sentry.captureException(error, {
      tags: { react_error_boundary: "true" },
      extra: { componentStack: errorInfo.componentStack },
    });
  }

  handleReset = () => {
    this.setState({ hasError: false });
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="max-w-md">
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6">
              <h2 className="text-white font-bold text-lg mb-2">Oops! Something went wrong</h2>
              <p className="text-gray-300 text-sm mb-4">
                We've logged this error and our team has been notified. Please try again or contact support if the problem persists.
              </p>
              {process.env.NODE_ENV === "development" && this.state.error && (
                <details className="mb-4 p-3 bg-red-500/5 rounded text-xs text-gray-400 max-h-40 overflow-auto">
                  <summary className="cursor-pointer font-mono">Error details</summary>
                  <pre className="mt-2 whitespace-pre-wrap break-words">
                    {this.state.error.message}
                  </pre>
                </details>
              )}
              <Button onClick={this.handleReset} className="w-full">
                Go Back Home
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
