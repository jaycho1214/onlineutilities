/**
 * JSON Formatter Implementation
 *
 * This module provides JSON formatting, validation, and minification functionality
 * extending the BaseFormatter class.
 */

import { Code2 } from "lucide-react";
import { BaseFormatter } from "./base-formatter";
import type {
  ContentDetectionResult,
  FormatOptions,
  FormatterCategory,
  FormatterConfig,
} from "../registry/formatter-registry";
import type { ValidationResult, FormatResult } from "../types";

/**
 * JSON Formatter Class
 */
export class JsonFormatter extends BaseFormatter {
  readonly id = "json";
  readonly name = "JSON";
  readonly extensions = [".json", ".jsonl", ".ndjson"];
  readonly mimeTypes = ["application/json", "application/ld+json", "text/json"];
  readonly icon = Code2;
  readonly category: FormatterCategory = "data";
  readonly supportsMinify = true;
  readonly supportsTableView = false;
  readonly config: FormatterConfig = {
    maxInputSize: 10 * 1024 * 1024, // 10MB
    defaultOptions: {
      indent: 2,
      lineEndings: "LF",
    },
    performance: {
      enableChunking: false, // JSON needs to be parsed as a whole
      enableWorker: true, // Can use worker for large JSON files
    },
  };

  /**
   * Detect if content is JSON format
   */
  detectContent(content: string): ContentDetectionResult {
    const trimmedContent = content.trim();

    if (!trimmedContent) {
      return { confidence: 0 };
    }

    let confidence = 0;
    const metadata: Record<string, unknown> = {};

    // Check for JSON structural markers
    const startsWithObject =
      trimmedContent.startsWith("{") && trimmedContent.endsWith("}");
    const startsWithArray =
      trimmedContent.startsWith("[") && trimmedContent.endsWith("]");

    if (startsWithObject || startsWithArray) {
      confidence += 0.4;
    }

    // Try to parse as JSON for definitive detection
    try {
      // First try with trailing comma removal for more forgiving detection
      const cleanedContent = this.removeTrailingCommas(trimmedContent);
      const parsed = JSON.parse(cleanedContent);
      confidence = 0.95; // Very high confidence for valid JSON

      // Add metadata about the JSON structure
      if (Array.isArray(parsed)) {
        metadata.type = "array";
        metadata.length = parsed.length;
      } else if (typeof parsed === "object" && parsed !== null) {
        metadata.type = "object";
        metadata.keys = Object.keys(parsed).length;
      } else {
        metadata.type = typeof parsed;
      }

      // Note if we had to clean trailing commas
      if (cleanedContent !== trimmedContent) {
        metadata.hasTrailingCommas = true;
      }
    } catch {
      // Check for common JSON patterns even if parsing fails
      const jsonPatterns = [
        /"[^"]*"\s*:\s*/, // Key-value pairs
        /"\w+"\s*:\s*"[^"]*"/, // String key-value pairs
        /"\w+"\s*:\s*\d+/, // String key with number value
        /"\w+"\s*:\s*true|false/, // String key with boolean
        /"\w+"\s*:\s*null/, // String key with null
      ];

      const patternMatches = this.countPatternMatches(
        trimmedContent,
        jsonPatterns,
      );

      if (patternMatches >= 2) {
        confidence = Math.min(0.7, patternMatches * 0.15);
      }
    }

    // Additional heuristics
    if (confidence > 0) {
      const structure = this.analyzeContentStructure(trimmedContent);
      metadata.lineCount = structure.lineCount;
      metadata.avgLineLength = structure.avgLineLength;
    }

    return {
      confidence,
      metadata,
    };
  }

  /**
   * Format JSON with proper indentation
   */
  protected doFormat(
    content: string,
    options: FormatOptions = {},
  ): FormatResult {
    // Remove trailing commas before parsing
    const cleanedContent = this.removeTrailingCommas(content);
    const parsed = JSON.parse(cleanedContent);
    const indent = options.indent ?? 2;
    const formatted = JSON.stringify(parsed, null, indent);

    return {
      success: true,
      output: formatted,
    };
  }

  /**
   * Validate JSON syntax and structure
   */
  protected doValidate(content: string): ValidationResult {
    try {
      // Try with trailing comma removal first
      const cleanedContent = this.removeTrailingCommas(content);
      JSON.parse(cleanedContent);
      return { isValid: true };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Invalid JSON";

      // Try to extract line/column information from JSON parse error
      const match = errorMessage.match(/at position (\d+)/);
      let line: number | undefined;
      let column: number | undefined;

      if (match && content) {
        const position = parseInt(match[1], 10);
        const location = this.getLineAndColumn(content, position);
        line = location.line;
        column = location.column;
      }

      return {
        isValid: false,
        error: {
          message: errorMessage,
          line,
          column,
        },
      };
    }
  }

  /**
   * Minify JSON by removing whitespace
   */
  protected doMinify(content: string): FormatResult {
    // Remove trailing commas before parsing
    const cleanedContent = this.removeTrailingCommas(content);
    const parsed = JSON.parse(cleanedContent);
    const minified = JSON.stringify(parsed);

    return {
      success: true,
      output: minified,
    };
  }

  /**
   * Remove trailing commas and comments from JSON string
   * This makes the parser more forgiving of common JSON5/JSONC errors
   */
  private removeTrailingCommas(json: string): string {
    let cleaned = json;

    // Remove comments while preserving strings
    // This is a simplified approach - for production, consider a proper JSON5 parser

    // Remove single-line comments (but not // inside strings)
    // Match // that are not inside quotes
    cleaned = cleaned.replace(/("(?:[^"\\]|\\.)*")|\/\/.*$/gm, "$1");

    // Remove multi-line comments (but not /* */ inside strings)
    cleaned = cleaned.replace(/("(?:[^"\\]|\\.)*")|\/\*[\s\S]*?\*\//g, "$1");

    // Remove trailing commas before } or ]
    // This regex matches commas followed by optional whitespace and then } or ]
    cleaned = cleaned.replace(/,(\s*[}\]])/g, "$1");

    return cleaned;
  }
}

/**
 * Export singleton instance for compatibility
 */
export const jsonFormatter = new JsonFormatter();
