/**
 * YAML Formatter Implementation
 *
 * This module provides YAML formatting, validation, and processing functionality
 * using a basic built-in parser without external dependencies.
 */

import { FileText, type LucideIcon } from "lucide-react";
import * as yaml from "js-yaml";
import type { ValidationResult, FormatResult } from "../types";
import type { FormatterCategory } from "../registry/formatter-registry";
import {
  checkEmptyInput,
  createEmptyInputFormatResult,
  createEmptyInputValidationResult,
} from "../lib/common-constants";

// Import the correct types from registry
interface ContentDetectionResult {
  confidence: number;
  metadata?: Record<string, unknown>;
}

interface FormatOptions {
  indent?: number;
  lineEndings?: "LF" | "CRLF";
  [key: string]: unknown;
}

interface FormatterDefinition {
  id: string;
  name: string;
  extensions: string[];
  mimeTypes: string[];
  detectContent: (content: string) => ContentDetectionResult;
  format: (content: string, options?: FormatOptions) => FormatResult;
  validate: (content: string) => ValidationResult;
  minify?: (content: string) => FormatResult;
  icon: LucideIcon;
  category: FormatterCategory;
  supportsMinify: boolean;
  supportsTableView: boolean;
  config?: Record<string, unknown>;
}

// ============================================================================
// YAML UTILITIES
// ============================================================================

// ============================================================================
// CONTENT DETECTION
// ============================================================================

/**
 * Detect if content is YAML format
 */
function detectYamlContent(content: string): ContentDetectionResult {
  const trimmedContent = content.trim();

  if (!trimmedContent) {
    return { confidence: 0 };
  }

  let confidence = 0;
  const metadata: Record<string, unknown> = {};
  const lines = trimmedContent.split("\n");

  // Strong indicators
  if (trimmedContent.startsWith("---")) {
    confidence += 0.4;
  }
  if (trimmedContent.includes("...")) {
    confidence += 0.2;
  }

  // Check if it's likely JSON or XML first (to avoid false positives)
  if (trimmedContent.startsWith("{") && trimmedContent.endsWith("}")) {
    return { confidence: 0 }; // Likely JSON
  }
  if (trimmedContent.startsWith("[") && trimmedContent.endsWith("]")) {
    return { confidence: 0 }; // Likely JSON array
  }
  if (trimmedContent.startsWith("<") && trimmedContent.includes(">")) {
    return { confidence: 0 }; // Likely XML/HTML
  }

  let yamlPatterns = 0;
  let totalMeaningfulLines = 0;
  let hasIndentation = false;
  let hasColons = false;
  let hasLists = false;

  for (const line of lines) {
    const trimmed = line.trim();

    // Skip empty lines and comments
    if (!trimmed || trimmed.startsWith("#")) continue;

    totalMeaningfulLines++;

    // Check indentation patterns (YAML uses spaces, not tabs typically)
    if (line.match(/^  +[^\s]/)) {
      hasIndentation = true;
    }

    // YAML key-value patterns
    if (/^[a-zA-Z_][a-zA-Z0-9_\-\s]*\s*:/.test(trimmed)) {
      yamlPatterns++;
      hasColons = true;
    }

    // YAML list patterns
    else if (/^-\s+/.test(trimmed)) {
      yamlPatterns++;
      hasLists = true;
    }

    // Nested key-value with proper indentation
    else if (/^\s{2,}[a-zA-Z_][a-zA-Z0-9_\-\s]*\s*:/.test(line)) {
      yamlPatterns++;
    }

    // Array items with colons (objects in arrays)
    else if (/^-\s+[a-zA-Z_][a-zA-Z0-9_\-\s]*\s*:/.test(trimmed)) {
      yamlPatterns += 2; // Strong indicator
    }
  }

  // Calculate pattern ratio
  if (totalMeaningfulLines > 0) {
    const patternRatio = yamlPatterns / totalMeaningfulLines;
    confidence += patternRatio * 0.5;
  }

  // Bonus for YAML-specific features
  if (hasIndentation) confidence += 0.2;
  if (hasColons && hasLists) confidence += 0.15;
  if (hasIndentation && hasColons) confidence += 0.1;

  // Try parsing to validate
  try {
    const parsed = yaml.load(trimmedContent);

    if (parsed !== null && typeof parsed === "object") {
      // Successfully parsed as complex structure
      confidence = Math.max(confidence, 0.7);

      metadata.type = Array.isArray(parsed) ? "array" : "object";
      if (Array.isArray(parsed)) {
        metadata.length = parsed.length;
      } else if (typeof parsed === "object") {
        metadata.keys = Object.keys(parsed).length;
      }
    } else if (parsed !== null) {
      // Simple value, less likely to be intentional YAML
      confidence = Math.max(confidence, 0.3);
    }
  } catch {
    // Parsing failed, reduce confidence significantly
    confidence = Math.max(0, confidence - 0.4);
  }

  // Additional checks for common YAML patterns
  if (
    trimmedContent.includes("version:") ||
    trimmedContent.includes("apiVersion:") ||
    trimmedContent.includes("kind:") ||
    trimmedContent.includes("metadata:")
  ) {
    confidence += 0.3; // Common in k8s/config files
  }

  return {
    confidence: Math.min(confidence, 0.95),
    metadata,
  };
}

// ============================================================================
// FORMATTING FUNCTIONS
// ============================================================================

/**
 * Format YAML with proper indentation
 */
function formatYaml(
  content: string,
  options: FormatOptions = {},
): FormatResult {
  try {
    if (checkEmptyInput(content)) {
      return createEmptyInputFormatResult();
    }

    const parsed = yaml.load(content);
    const indent = options.indent || 2;
    const formatted = yaml.dump(parsed, {
      indent,
      lineWidth: -1, // Don't wrap lines
      noRefs: true, // Don't use references
      sortKeys: false, // Preserve key order
    });

    return {
      success: true,
      output: formatted,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Invalid YAML";
    return {
      success: false,
      error: `YAML formatting failed: ${errorMessage}`,
    };
  }
}

/**
 * Validate YAML syntax and structure
 */
function validateYaml(content: string): ValidationResult {
  try {
    if (checkEmptyInput(content)) {
      return createEmptyInputValidationResult();
    }

    yaml.load(content);
    return { isValid: true };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Invalid YAML";

    // Try to extract line information from YAML error
    let line: number | undefined;
    if (error instanceof yaml.YAMLException && error.mark) {
      line = error.mark.line + 1; // Convert to 1-based line number
    }

    return {
      isValid: false,
      error: {
        message: `YAML validation failed: ${errorMessage}`,
        line,
      },
    };
  }
}

/**
 * Minify YAML by removing unnecessary whitespace
 */
function minifyYaml(content: string): FormatResult {
  try {
    if (checkEmptyInput(content)) {
      return createEmptyInputFormatResult();
    }

    const parsed = yaml.load(content);
    const minified = yaml.dump(parsed, {
      indent: 1, // Minimal indentation
      lineWidth: -1, // Don't wrap lines
      noRefs: true, // Don't use references
      sortKeys: false, // Preserve key order
      flowLevel: -1, // Use block style but allow flow for simple structures
    });

    return {
      success: true,
      output: minified,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return {
      success: false,
      error: `YAML minification failed: ${errorMessage}`,
    };
  }
}

// ============================================================================
// FORMATTER DEFINITION
// ============================================================================

export const yamlFormatter: FormatterDefinition = {
  id: "yaml",
  name: "YAML",
  extensions: [".yaml", ".yml"],
  mimeTypes: ["application/x-yaml", "text/yaml", "application/yaml"],
  detectContent: detectYamlContent,
  format: formatYaml,
  validate: validateYaml,
  minify: minifyYaml,
  icon: FileText,
  category: "data",
  supportsMinify: true,
  supportsTableView: false,
  config: {
    maxInputSize: 15 * 1024 * 1024, // 15MB
    defaultOptions: {
      indent: 2,
      lineEndings: "LF",
    },
    performance: {
      enableChunking: false, // YAML needs to be parsed as a whole
      enableWorker: false, // Keep simple for now
      enableCaching: true,
    },
    features: {
      autoDetection: true,
      syntaxHighlighting: true,
      errorReporting: true,
    },
  },
};
