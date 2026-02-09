import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = { hasError: false };

  constructor(props: Props) {
    super(props);
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    // TODO: Send to monitoring service (e.g., Sentry) in production
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md shadow-xl border border-slate-100 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-rounded text-4xl text-red-600">error</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Coś poszło nie tak</h2>
            <p className="text-slate-600 mb-6">
              Przepraszamy, wystąpił nieoczekiwany błąd. Spróbuj odświeżyć stronę.
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-slate-900 text-white px-6 py-3 rounded-xl font-semibold hover:bg-slate-800 transition-colors"
            >
              Odśwież stronę
            </button>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-4 text-left">
                <summary className="cursor-pointer text-sm text-slate-500 hover:text-slate-700">
                  Szczegóły błędu (dev only)
                </summary>
                <pre className="mt-2 text-xs bg-slate-100 p-3 rounded overflow-auto max-h-40">
                  {this.state.error.toString()}
                  {this.state.error.stack && `\n\n${this.state.error.stack}`}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
