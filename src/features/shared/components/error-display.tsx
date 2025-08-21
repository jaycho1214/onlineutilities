/**
 * Error Display Component
 *
 * Reusable component for displaying error messages with consistent styling
 * across the application.
 */

import React from "react";
import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ErrorDisplayProps {
  error: string | null;
  variant?: "inline" | "card" | "banner";
  size?: "sm" | "default" | "lg";
  showIcon?: boolean;
  className?: string;
}

const errorVariants = {
  inline: "text-sm text-red-600 dark:text-red-400",
  card: "p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-600 dark:text-red-400",
  banner:
    "p-4 bg-red-50 dark:bg-red-950/20 border-l-4 border-red-500 text-red-700 dark:text-red-300",
};

const sizeClasses = {
  sm: "text-xs",
  default: "text-sm",
  lg: "text-base",
};

/**
 * Displays error messages with consistent styling
 */
export const ErrorDisplay = React.memo<ErrorDisplayProps>(
  ({
    error,
    variant = "card",
    size = "default",
    showIcon = false,
    className = "",
  }) => {
    if (!error) return null;

    const baseClasses = errorVariants[variant];
    const sizeClass = sizeClasses[size];

    return (
      <div className={cn(baseClasses, sizeClass, className)}>
        {showIcon && variant !== "inline" && (
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {(!showIcon || variant === "inline") && error}
      </div>
    );
  },
);

ErrorDisplay.displayName = "ErrorDisplay";

/**
 * Inline error display for forms
 */
export const InlineError = React.memo<{ error?: string; className?: string }>(
  ({ error, className = "mt-1" }) => (
    <ErrorDisplay
      error={error || null}
      variant="inline"
      size="sm"
      className={className}
    />
  ),
);

InlineError.displayName = "InlineError";

/**
 * Validation error display with detailed information
 */
interface ValidationErrorProps {
  error: string;
  line?: number;
  column?: number;
  details?: string;
  className?: string;
}

export const ValidationError = React.memo<ValidationErrorProps>(
  ({ error, line, column, details, className = "mt-4" }) => (
    <div className={cn("space-y-2", className)}>
      <ErrorDisplay error={error} variant="card" showIcon />
      {(line || column || details) && (
        <div className="text-xs text-red-500 dark:text-red-400 ml-6 space-y-1">
          {line && column && (
            <div>
              At line {line}, column {column}
            </div>
          )}
          {line && !column && <div>At line {line}</div>}
          {details && (
            <div className="font-mono text-xs bg-red-50 dark:bg-red-950/20 p-2 rounded border">
              {details}
            </div>
          )}
        </div>
      )}
    </div>
  ),
);

ValidationError.displayName = "ValidationError";
