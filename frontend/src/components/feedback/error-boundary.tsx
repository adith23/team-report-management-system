// ──────────────────────────────────────────────────────────────────────────────
// Error Boundary — React error boundary with recovery UI
// ──────────────────────────────────────────────────────────────────────────────

"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorBoundaryProps {
  children: ReactNode;
  /** Optional fallback component */
  fallback?: ReactNode;
  /** Called when an error is caught */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * React error boundary that catches render errors and displays
 * a recovery UI with a retry button.
 *
 * @example
 * <ErrorBoundary>
 *   <SomeComponent />
 * </ErrorBoundary>
 *
 * <ErrorBoundary fallback={<CustomError />}>
 *   <SomeComponent />
 * </ErrorBoundary>
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error for debugging
    console.error("[ErrorBoundary]", error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Custom fallback
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center animate-fade-in">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[hsl(var(--destructive)/0.1)]">
            <AlertCircle className="h-8 w-8 text-[hsl(var(--destructive))]" />
          </div>

          <h3 className="mt-4 text-lg font-semibold text-[hsl(var(--foreground))]">
            Something went wrong
          </h3>
          <p className="mt-1 max-w-sm text-sm text-[hsl(var(--muted-foreground))]">
            An unexpected error occurred. Please try again.
          </p>

          {/* Error details in development */}
          {process.env.NODE_ENV === "development" && this.state.error && (
            <pre className="mt-4 max-w-lg overflow-auto rounded-lg bg-[hsl(var(--muted))] p-4 text-left text-xs text-[hsl(var(--muted-foreground))]">
              {this.state.error.message}
            </pre>
          )}

          <Button
            variant="secondary"
            onClick={this.handleReset}
            className="mt-6"
          >
            <RotateCcw className="h-4 w-4" />
            Try Again
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
