/**
 * Common constants and error messages for formatters
 */

// Default error messages - these can be overridden by translations
export const COMMON_ERROR_MESSAGES = {
  EMPTY_INPUT: "Input cannot be empty",
  INVALID_FORMAT: "Invalid format",
  TOO_LARGE: "Input is too large to process"
} as const;

/**
 * Helper function to check if input is empty
 */
export function checkEmptyInput(input: string) {
  return !input.trim();
}

/**
 * Create standardized empty input format result
 */
export function createEmptyInputFormatResult() {
  return {
    success: false,
    error: COMMON_ERROR_MESSAGES.EMPTY_INPUT,
  };
}

/**
 * Create standardized empty input validation result
 */
export function createEmptyInputValidationResult() {
  return {
    isValid: false,
    error: {
      message: COMMON_ERROR_MESSAGES.EMPTY_INPUT,
    },
  };
}