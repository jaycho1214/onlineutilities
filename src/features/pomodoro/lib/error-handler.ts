/**
 * Error handling utilities for Pomodoro timer features
 */

export enum PomodoroErrorType {
  DATABASE_ERROR = "DATABASE_ERROR",
  TIMER_ERROR = "TIMER_ERROR",
  SESSION_ERROR = "SESSION_ERROR",
  TODO_ERROR = "TODO_ERROR",
  VALIDATION_ERROR = "VALIDATION_ERROR",
}

export class PomodoroError extends Error {
  constructor(
    public type: PomodoroErrorType,
    message: string,
    public originalError?: Error,
  ) {
    super(message);
    this.name = "PomodoroError";
  }

  static fromError(error: unknown, type: PomodoroErrorType): PomodoroError {
    if (error instanceof Error) {
      return new PomodoroError(type, error.message, error);
    }
    return new PomodoroError(type, String(error));
  }
}

export interface ErrorHandlerOptions {
  logToConsole?: boolean;
  showNotification?: boolean;
  fallbackMessage?: string;
}

export function handlePomodoroError(
  error: unknown,
  type: PomodoroErrorType,
  options: ErrorHandlerOptions = {},
): PomodoroError {
  const {
    logToConsole = true,
    showNotification = false,
    fallbackMessage = "An unexpected error occurred",
  } = options;

  const pomodoroError =
    error instanceof PomodoroError
      ? error
      : PomodoroError.fromError(error, type);

  if (logToConsole) {
    console.error(
      `[${type}]`,
      pomodoroError.message,
      pomodoroError.originalError,
    );
  }

  if (
    showNotification &&
    "Notification" in window &&
    Notification.permission === "granted"
  ) {
    new Notification("Pomodoro Timer Error", {
      body: pomodoroError.message || fallbackMessage,
      icon: "/favicon.ico",
    });
  }

  return pomodoroError;
}

export function createErrorHandler(
  type: PomodoroErrorType,
  options?: ErrorHandlerOptions,
) {
  return (error: unknown) => handlePomodoroError(error, type, options);
}
