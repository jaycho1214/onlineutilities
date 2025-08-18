/**
 * Formatter Registry Module
 *
 * This module provides a centralized registry system for managing different formatter types.
 * It enables easy extension of the formatter system with new formats.
 */

import type { LucideIcon } from "lucide-react";
import type { ValidationResult, FormatResult } from "../types";

// ============================================================================
// CORE INTERFACES
// ============================================================================

/**
 * Formatter Definition Interface
 * Defines the structure for all formatter implementations
 */
export interface FormatterDefinition {
  /** Unique identifier for the formatter */
  id: string;
  /** Display name for the formatter */
  name: string;
  /** Supported file extensions */
  extensions: string[];
  /** MIME types associated with this formatter */
  mimeTypes: string[];
  /** Function to detect if content matches this format */
  detectContent: (content: string) => ContentDetectionResult;
  /** Function to format content */
  format: (content: string, options?: FormatOptions) => FormatResult;
  /** Function to validate content */
  validate: (content: string) => ValidationResult;
  /** Optional function to minify content */
  minify?: (content: string) => FormatResult;
  /** Icon component for UI display */
  icon: LucideIcon;
  /** Category for grouping formatters */
  category: FormatterCategory;
  /** Whether this formatter supports minification */
  supportsMinify: boolean;
  /** Whether this formatter supports table view (for CSV-like data) */
  supportsTableView: boolean;
  /** Additional configuration options specific to this formatter */
  config?: FormatterConfig;
}

/**
 * Content Detection Result
 */
export interface ContentDetectionResult {
  /** Confidence level (0-1) that content matches this format */
  confidence: number;
  /** Detected sub-format (e.g., CSV delimiter type) */
  detectedOptions?: Record<string, unknown>;
  /** Additional metadata about the detection */
  metadata?: {
    lineCount?: number;
    avgLineLength?: number;
    hasHeaders?: boolean;
    encoding?: string;
  };
}

/**
 * Format Options
 */
export interface FormatOptions {
  /** Indentation size */
  indent?: number;
  /** Line ending style */
  lineEndings?: "LF" | "CRLF";
  /** Format-specific options */
  [key: string]: unknown;
}

/**
 * Formatter Categories
 */
export type FormatterCategory =
  | "data"
  | "markup"
  | "programming"
  | "config"
  | "stylesheet";

/**
 * Formatter Configuration
 */
export interface FormatterConfig {
  /** Maximum input size in bytes */
  maxInputSize?: number;
  /** Default formatting options */
  defaultOptions?: FormatOptions;
  /** Custom validation rules */
  customValidation?: (content: string) => ValidationResult;
  /** Performance optimization flags */
  performance?: {
    enableChunking?: boolean;
    chunkSize?: number;
    enableWorker?: boolean;
  };
}

/**
 * Format Detection Result
 */
export interface FormatDetectionResult {
  /** Detected formatter definition */
  formatter: FormatterDefinition | null;
  /** Confidence in the detection */
  confidence: number;
  /** Alternative formatters that could match */
  alternatives: Array<{
    formatter: FormatterDefinition;
    confidence: number;
  }>;
  /** Any detected options for the format */
  detectedOptions?: Record<string, unknown>;
}

// ============================================================================
// REGISTRY CLASS
// ============================================================================

/**
 * Central registry for managing formatter definitions
 */
export class FormatterRegistry {
  private formatters: Map<string, FormatterDefinition> = new Map();
  private extensionMap: Map<string, FormatterDefinition[]> = new Map();
  private mimeTypeMap: Map<string, FormatterDefinition[]> = new Map();

  /**
   * Register a new formatter definition
   */
  register(formatter: FormatterDefinition): void {
    this.formatters.set(formatter.id, formatter);

    // Update extension mapping
    formatter.extensions.forEach((ext) => {
      const existing = this.extensionMap.get(ext) || [];
      existing.push(formatter);
      this.extensionMap.set(ext, existing);
    });

    // Update MIME type mapping
    formatter.mimeTypes.forEach((mimeType) => {
      const existing = this.mimeTypeMap.get(mimeType) || [];
      existing.push(formatter);
      this.mimeTypeMap.set(mimeType, existing);
    });
  }

  /**
   * Get formatter by ID
   */
  getFormatter(id: string): FormatterDefinition | undefined {
    return this.formatters.get(id);
  }

  /**
   * Get all registered formatters
   */
  getAllFormatters(): FormatterDefinition[] {
    return Array.from(this.formatters.values());
  }

  /**
   * Get formatters by category
   */
  getFormattersByCategory(category: FormatterCategory): FormatterDefinition[] {
    return Array.from(this.formatters.values()).filter(
      (formatter) => formatter.category === category,
    );
  }

  /**
   * Detect format from file extension
   */
  detectFromExtension(filename: string): FormatterDefinition[] {
    const ext = this.getFileExtension(filename);
    return this.extensionMap.get(ext) || [];
  }

  /**
   * Detect format from MIME type
   */
  detectFromMimeType(mimeType: string): FormatterDefinition[] {
    return this.mimeTypeMap.get(mimeType) || [];
  }

  /**
   * Detect format from content analysis
   */
  detectFromContent(content: string): FormatDetectionResult {
    const results: Array<{
      formatter: FormatterDefinition;
      confidence: number;
      detectedOptions?: Record<string, unknown>;
    }> = [];

    // Test all formatters against the content
    for (const formatter of this.formatters.values()) {
      try {
        const detection = formatter.detectContent(content);
        if (detection.confidence > 0) {
          results.push({
            formatter,
            confidence: detection.confidence,
            detectedOptions: detection.detectedOptions,
          });
        }
      } catch {}
    }

    // Sort by confidence (highest first)
    results.sort((a, b) => b.confidence - a.confidence);

    const bestMatch = results[0];
    const alternatives = results.slice(1, 4); // Top 3 alternatives

    return {
      formatter: bestMatch?.formatter || null,
      confidence: bestMatch?.confidence || 0,
      alternatives,
      detectedOptions: bestMatch?.detectedOptions,
    };
  }

  /**
   * Comprehensive format detection combining multiple strategies
   */
  detectFormat(
    content: string,
    filename?: string,
    mimeType?: string,
  ): FormatDetectionResult {
    const candidates: Array<{
      formatter: FormatterDefinition;
      confidence: number;
      source: "extension" | "mimeType" | "content";
      detectedOptions?: Record<string, unknown>;
    }> = [];

    // 1. Try extension-based detection
    if (filename) {
      const extensionMatches = this.detectFromExtension(filename);
      extensionMatches.forEach((formatter) => {
        candidates.push({
          formatter,
          confidence: 0.7, // Medium confidence for extension matches
          source: "extension",
        });
      });
    }

    // 2. Try MIME type detection
    if (mimeType) {
      const mimeMatches = this.detectFromMimeType(mimeType);
      mimeMatches.forEach((formatter) => {
        candidates.push({
          formatter,
          confidence: 0.8, // Higher confidence for MIME type matches
          source: "mimeType",
        });
      });
    }

    // 3. Content-based detection (highest priority)
    const contentDetection = this.detectFromContent(content);
    if (contentDetection.formatter) {
      candidates.push({
        formatter: contentDetection.formatter,
        confidence: contentDetection.confidence,
        source: "content",
        detectedOptions: contentDetection.detectedOptions,
      });
    }

    // Merge and prioritize results
    const formatterConfidence = new Map<
      string,
      {
        formatter: FormatterDefinition;
        maxConfidence: number;
        detectedOptions?: Record<string, unknown>;
      }
    >();

    candidates.forEach((candidate) => {
      const existing = formatterConfidence.get(candidate.formatter.id);
      if (!existing || candidate.confidence > existing.maxConfidence) {
        formatterConfidence.set(candidate.formatter.id, {
          formatter: candidate.formatter,
          maxConfidence: candidate.confidence,
          detectedOptions: candidate.detectedOptions,
        });
      }
    });

    const sortedResults = Array.from(formatterConfidence.values()).sort(
      (a, b) => b.maxConfidence - a.maxConfidence,
    );

    const bestMatch = sortedResults[0];
    const alternatives = sortedResults.slice(1, 4).map((result) => ({
      formatter: result.formatter,
      confidence: result.maxConfidence,
    }));

    return {
      formatter: bestMatch?.formatter || null,
      confidence: bestMatch?.maxConfidence || 0,
      alternatives,
      detectedOptions: bestMatch?.detectedOptions,
    };
  }

  /**
   * Check if a file type is supported
   */
  isSupported(filename: string, mimeType?: string): boolean {
    const ext = this.getFileExtension(filename);
    const extensionSupported = this.extensionMap.has(ext);
    const mimeSupported = mimeType ? this.mimeTypeMap.has(mimeType) : false;

    return extensionSupported || mimeSupported;
  }

  /**
   * Get supported file extensions
   */
  getSupportedExtensions(): string[] {
    return Array.from(this.extensionMap.keys());
  }

  /**
   * Get supported MIME types
   */
  getSupportedMimeTypes(): string[] {
    return Array.from(this.mimeTypeMap.keys());
  }

  /**
   * Helper method to extract file extension
   */
  private getFileExtension(filename: string): string {
    const lastDotIndex = filename.lastIndexOf(".");
    if (lastDotIndex === -1 || lastDotIndex === filename.length - 1) {
      return "";
    }
    return filename.substring(lastDotIndex).toLowerCase();
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

/**
 * Global formatter registry instance
 */
export const formatterRegistry = new FormatterRegistry();
