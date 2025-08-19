"use client";

import React, { Component, ReactNode } from "react";
import { GlassSurface } from "@/features/shared/ui/glass-surface";
import { Button } from "@/features/shared/ui/button";
import { AlertTriangle } from "lucide-react";
import posthog from "posthog-js";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error boundary caught:", error, errorInfo);
    
    // Report to PostHog in production
    const isProduction = process.env.NODE_ENV === "production";
    if (isProduction && typeof window !== "undefined") {
      try {
        posthog.captureException(error, {
          errorInfo,
          errorBoundary: true,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href,
        });
      } catch (posthogError) {
        console.error("Failed to report error to PostHog:", posthogError);
      }
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return <>{this.props.fallback}</>;
      }

      const isProduction = process.env.NODE_ENV === "production";
      const showErrorDetails = !isProduction && this.state.error?.message;

      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <GlassSurface className="max-w-md w-full p-6 text-center">
            <div className="flex flex-col items-center gap-4">
              <AlertTriangle className="w-12 h-12 text-destructive" />
              <h2 className="text-xl font-semibold">Something went wrong</h2>
              <p className="text-sm text-muted-foreground">
                {showErrorDetails 
                  ? this.state.error?.message
                  : "An unexpected error occurred. We've been notified and are working to fix it."
                }
              </p>
              <Button
                onClick={this.handleReset}
                variant="default"
                className="py-2 px-4"
              >
                Reload Page
              </Button>
            </div>
          </GlassSurface>
        </div>
      );
    }

    return this.props.children;
  }
}
