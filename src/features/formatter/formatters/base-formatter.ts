/**
 * Base Formatter Abstract Class
 *
 * This abstract class provides a common foundation for all formatter implementations,
 * reducing code duplication and ensuring consistent behavior across formatters.
 */

import type { LucideIcon } from "lucide-react";
import type {
  FormatterDefinition,
  ContentDetectionResult,
  FormatOptions,
  FormatterCategory,
  FormatterConfig,
} from "../registry/formatter-registry";
import type { ValidationResult, FormatResult } from "../types";
import {
  checkEmptyInput,
  createEmptyInputFormatResult,
  createEmptyInputValidationResult,
} from "../lib/common-constants";

/**
 * Abstract base class for all formatters
 */
export abstract class BaseFormatter implements FormatterDefinition {
  abstract readonly id: string;
  abstract readonly name: string;
  abstract readonly extensions: string[];
  abstract readonly mimeTypes: string[];
  abstract readonly icon: LucideIcon;
  abstract readonly category: FormatterCategory;
  abstract readonly supportsMinify: boolean;
  abstract readonly supportsTableView: boolean;

  readonly config?: FormatterConfig;

  /**
   * Detect if content matches this format
   */
  abstract detectContent(content: string): ContentDetectionResult;

  /**
   * Format content with proper structure
   */
  format(content: string, options: FormatOptions = {}): FormatResult {
    try {
      if (checkEmptyInput(content)) {
        return createEmptyInputFormatResult();
      }

      return this.doFormat(content, options);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      return {
        success: false,
        error: `${this.name} formatting error: ${errorMessage}`,
      };
    }
  }

  /**
   * Validate content syntax
   */
  validate(content: string): ValidationResult {
    try {
      if (checkEmptyInput(content)) {
        return createEmptyInputValidationResult();
      }

      return this.doValidate(content);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : `Invalid ${this.name}`;
      return {
        isValid: false,
        error: {
          message: errorMessage,
        },
      };
    }
  }

  /**
   * Minify content (optional)
   */
  minify?(content: string): FormatResult {
    try {
      if (checkEmptyInput(content)) {
        return createEmptyInputFormatResult();
      }

      if (this.doMinify) {
        return this.doMinify(content);
      }

      // Default to format if minify is not implemented
      return this.format(content);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      return {
        success: false,
        error: `${this.name} minification error: ${errorMessage}`,
      };
    }
  }

  /**
   * Abstract method for format implementation
   */
  protected abstract doFormat(
    content: string,
    options: FormatOptions,
  ): FormatResult;

  /**
   * Abstract method for validation implementation
   */
  protected abstract doValidate(content: string): ValidationResult;

  /**
   * Optional method for minification implementation
   */
  protected doMinify?(content: string): FormatResult;

  /**
   * Helper method to extract line and column from position
   */
  protected getLineAndColumn(
    content: string,
    position: number,
  ): { line: number; column: number } {
    const lines = content.substring(0, position).split("\n");
    const line = lines.length;
    const column = lines[lines.length - 1].length + 1;
    return { line, column };
  }

  /**
   * Helper method to count pattern matches
   */
  protected countPatternMatches(content: string, patterns: RegExp[]): number {
    let count = 0;
    patterns.forEach((pattern) => {
      if (pattern.test(content)) {
        count++;
      }
    });
    return count;
  }

  /**
   * Helper method to analyze content structure
   */
  protected analyzeContentStructure(content: string): {
    lineCount: number;
    avgLineLength: number;
    trimmedLength: number;
  } {
    const lines = content.split("\n");
    const lineCount = lines.length;
    const avgLineLength = content.length / lineCount;
    const trimmedLength = content.trim().length;

    return {
      lineCount,
      avgLineLength,
      trimmedLength,
    };
  }
}
