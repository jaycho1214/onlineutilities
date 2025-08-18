/**
 * Enhanced Formatter Utilities Module
 *
 * This module provides enhanced utility functions for formatting, validating, and processing
 * various data formats using the new modular registry system.
 */

import { formatterRegistry } from "../registry";
import {
  validateFileSize,
  validateContentSize,
  handleFormatterError,
} from "./error-handling";
import type {
  FormatterType,
  ValidationResult,
  FormatResult,
  FileHandlingResult,
} from "../types";
import type { FormatOptions } from "../registry/formatter-registry";

// ============================================================================
// ENHANCED FILE HANDLING
// ============================================================================

/**
 * Enhanced file handling with smart format detection
 */
export async function handleFileLoadEnhanced(file: File): Promise<FileHandlingResult> {
  try {
    // Check if file type is supported first
    if (!formatterRegistry.isSupported(file.name, file.type)) {
      return {
        success: false,
        error: `Unsupported file type. Supported formats: ${formatterRegistry.getSupportedExtensions().join(', ')}`
      };
    }

    // Try to detect format for size validation
    const formatCandidates = formatterRegistry.detectFromExtension(file.name);
    const suggestedFormat = formatCandidates[0]?.id as FormatterType | undefined;

    // Validate file size based on detected format
    const sizeError = validateFileSize(file, suggestedFormat);
    if (sizeError) {
      return {
        success: false,
        error: sizeError.message
      };
    }

    // Read file content
    const content = await readFileAsText(file);
    
    if (!content.trim()) {
      return {
        success: false,
        error: 'File is empty'
      };
    }

    // Detect format using the registry
    const detection = formatterRegistry.detectFormat(content, file.name, file.type);
    
    // Validate content size if format was detected
    if (detection.formatter) {
      const contentSizeError = validateContentSize(content, detection.formatter.id as FormatterType);
      if (contentSizeError) {
        return {
          success: false,
          error: contentSizeError.message
        };
      }
    }
    
    const alternatives = detection.alternatives.map(alt => ({
      format: alt.formatter.id as FormatterType,
      confidence: Math.round(alt.confidence * 100),
    }));

    return {
      success: true,
      content,
      detectedFormat: detection.formatter?.id as FormatterType || undefined,
      detectionConfidence: Math.round(detection.confidence * 100),
      detectedAlternatives: alternatives,
      fileName: file.name,
      fileSize: Math.round(file.size / 1024) // Size in KB
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return {
      success: false,
      error: errorMessage
    };
  }
}

/**
 * Read file content as text
 */
function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const content = e.target?.result;
      if (typeof content === 'string') {
        resolve(content);
      } else {
        reject(new Error('Failed to read file as text'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsText(file);
  });
}

/**
 * Check if dragged items contain valid files
 */
export function hasValidFilesEnhanced(dataTransfer: DataTransfer): boolean {
  const files = Array.from(dataTransfer.files);
  
  if (files.length === 0) {
    return false;
  }

  // Check if at least one file is supported by the registry
  return files.some(file => formatterRegistry.isSupported(file.name, file.type));
}

/**
 * Get the first valid file from dropped files
 */
export function getFirstValidFileEnhanced(files: FileList): File | null {
  const fileArray = Array.from(files);
  
  return fileArray.find(file => 
    formatterRegistry.isSupported(file.name, file.type)
  ) || null;
}

// ============================================================================
// ENHANCED FORMATTING OPERATIONS
// ============================================================================

/**
 * Format content using the registry system
 */
export function formatEnhanced(
  content: string, 
  formatterType: FormatterType, 
  options: FormatOptions = {}
): FormatResult {
  const formatter = formatterRegistry.getFormatter(formatterType);
  
  if (!formatter) {
    return {
      success: false,
      error: `Unsupported format type: ${formatterType}`,
    };
  }

  // Validate content size before processing
  const contentSizeError = validateContentSize(content, formatterType);
  if (contentSizeError) {
    return {
      success: false,
      error: contentSizeError.message,
    };
  }

  // Use enhanced error handling
  return handleFormatterError(
    () => formatter.format(content, options),
    formatterType,
    content
  ) as FormatResult;
}

/**
 * Validate content using the registry system
 */
export function validateEnhanced(content: string, formatterType: FormatterType): ValidationResult {
  const formatter = formatterRegistry.getFormatter(formatterType);
  
  if (!formatter) {
    return {
      isValid: false,
      error: {
        message: `Unsupported format type: ${formatterType}`,
      },
    };
  }

  // Validate content size before processing
  const contentSizeError = validateContentSize(content, formatterType);
  if (contentSizeError) {
    return {
      isValid: false,
      error: {
        message: contentSizeError.message,
      },
    };
  }

  // Use enhanced error handling
  return handleFormatterError(
    () => formatter.validate(content),
    formatterType,
    content
  ) as ValidationResult;
}

/**
 * Minify content using the registry system
 */
export function minifyEnhanced(content: string, formatterType: FormatterType): FormatResult {
  const formatter = formatterRegistry.getFormatter(formatterType);
  
  if (!formatter) {
    return {
      success: false,
      error: `Unsupported format type: ${formatterType}`,
    };
  }

  if (!formatter.supportsMinify || !formatter.minify) {
    return {
      success: false,
      error: `Minification not supported for ${formatterType}`,
    };
  }

  // Validate content size before processing
  const contentSizeError = validateContentSize(content, formatterType);
  if (contentSizeError) {
    return {
      success: false,
      error: contentSizeError.message,
    };
  }

  // Use enhanced error handling
  return handleFormatterError(
    () => formatter.minify!(content),
    formatterType,
    content
  ) as FormatResult;
}

// ============================================================================
// FORMAT DETECTION AND ANALYSIS
// ============================================================================

/**
 * Detect format from content with detailed analysis
 */
export function detectFormatFromContent(content: string): {
  primary: FormatterType | null;
  confidence: number;
  alternatives: Array<{ format: FormatterType; confidence: number }>;
  metadata?: Record<string, unknown>;
} {
  const detection = formatterRegistry.detectFromContent(content);
  
  return {
    primary: detection.formatter?.id as FormatterType || null,
    confidence: Math.round(detection.confidence * 100),
    alternatives: detection.alternatives.map(alt => ({
      format: alt.formatter.id as FormatterType,
      confidence: Math.round(alt.confidence * 100),
    })),
    metadata: detection.detectedOptions,
  };
}

/**
 * Get all available formatter types
 */
export function getAvailableFormatters(): Array<{
  id: FormatterType;
  name: string;
  category: string;
  supportsMinify: boolean;
  supportsTableView: boolean;
  extensions: string[];
}> {
  return formatterRegistry.getAllFormatters().map(formatter => ({
    id: formatter.id as FormatterType,
    name: formatter.name,
    category: formatter.category,
    supportsMinify: formatter.supportsMinify,
    supportsTableView: formatter.supportsTableView,
    extensions: formatter.extensions,
  }));
}

/**
 * Check if a formatter supports a specific feature
 */
export function formatterSupports(
  formatterType: FormatterType, 
  feature: 'minify' | 'tableView'
): boolean {
  const formatter = formatterRegistry.getFormatter(formatterType);
  
  if (!formatter) return false;
  
  switch (feature) {
    case 'minify':
      return formatter.supportsMinify;
    case 'tableView':
      return formatter.supportsTableView;
    default:
      return false;
  }
}

/**
 * Get formatter configuration
 */
export function getFormatterConfig(formatterType: FormatterType) {
  const formatter = formatterRegistry.getFormatter(formatterType);
  return formatter?.config;
}

// ============================================================================
// LEGACY COMPATIBILITY
// ============================================================================

// Re-export legacy functions for backward compatibility
export {
  convertCsvDelimiter,
  parseCsvToTable,
} from './formatter-utils';