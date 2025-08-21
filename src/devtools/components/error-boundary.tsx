import { Component, type ErrorInfo, type ReactNode } from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

interface ErrorBoundaryProps {
  children: ReactNode;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  private isDevelopment(): boolean {
    return import.meta.env.DEV;
  }

  render() {
    if (this.state.hasError) {
      if (this.isDevelopment()) {
        return (
          <div className="flex min-h-screen items-center justify-center bg-red-50 p-6 dark:bg-red-950">
            <div className="w-full max-w-4xl rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
              <div className="mb-4 flex items-center">
                <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
                  <svg
                    className="h-5 w-5 text-red-600 dark:text-red-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 18.5c-.77.833.192 2.5 1.732 2.5z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                    />
                  </svg>
                </div>
                <h1 className="text-xl font-semibold text-red-700 dark:text-red-300">
                  Application Error (Development Mode)
                </h1>
              </div>

              <div className="space-y-4">
                <div>
                  <h2 className="mb-2 text-lg font-medium text-gray-900 dark:text-gray-100">
                    Error Message:
                  </h2>
                  <div className="rounded bg-red-100 p-3 font-mono text-sm text-red-800 dark:bg-red-900 dark:text-red-200">
                    {this.state.error?.message || 'Unknown error occurred'}
                  </div>
                </div>

                {this.state.error?.stack && (
                  <div>
                    <h2 className="mb-2 text-lg font-medium text-gray-900 dark:text-gray-100">
                      Stack Trace:
                    </h2>
                    <div className="max-h-64 overflow-auto rounded bg-gray-100 p-3 font-mono text-xs text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                      <pre>{this.state.error.stack}</pre>
                    </div>
                  </div>
                )}

                {this.state.errorInfo?.componentStack && (
                  <div>
                    <h2 className="mb-2 text-lg font-medium text-gray-900 dark:text-gray-100">
                      Component Stack:
                    </h2>
                    <div className="max-h-64 overflow-auto rounded bg-gray-100 p-3 font-mono text-xs text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                      <pre>{this.state.errorInfo.componentStack}</pre>
                    </div>
                  </div>
                )}

                <button
                  className="mt-4 rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600"
                  onClick={() => window.location.reload()}
                >
                  Reload Application
                </button>
              </div>
            </div>
          </div>
        );
      }

      return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 p-6 dark:bg-gray-900">
          <div className="w-full max-w-md rounded-lg bg-white p-6 text-center shadow-lg dark:bg-gray-800">
            <div className="mb-4 flex justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
                <svg
                  className="h-6 w-6 text-red-600 dark:text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 18.5c-.77.833.192 2.5 1.732 2.5z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                  />
                </svg>
              </div>
            </div>

            <h1 className="mb-3 text-xl font-semibold text-gray-900 dark:text-gray-100">
              Something went wrong
            </h1>

            <p className="mb-6 text-gray-600 dark:text-gray-400">
              We're sorry, but something unexpected happened. Please try
              refreshing the page.
            </p>

            <button
              className="w-full rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
              onClick={() => window.location.reload()}
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
