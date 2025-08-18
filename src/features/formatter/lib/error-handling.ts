/**
 * Enhanced Error Handling Module
 *
 * This module provides comprehensive error handling, validation, and user feedback
 * for the formatter system with detailed error messages and recovery suggestions.
 */

import type { FormatterType, ValidationResult, FormatResult } from "../types";

// ============================================================================
// ERROR TYPES
// ============================================================================

export enum FormatterErrorCode {
  // File Errors
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',
  FILE_EMPTY = 'FILE_EMPTY',
  FILE_READ_ERROR = 'FILE_READ_ERROR',
  UNSUPPORTED_FILE_TYPE = 'UNSUPPORTED_FILE_TYPE',
  INVALID_FILE = 'INVALID_FILE',
  
  // Content Errors
  CONTENT_EMPTY = 'CONTENT_EMPTY',
  CONTENT_TOO_LARGE = 'CONTENT_TOO_LARGE',
  MALFORMED_CONTENT = 'MALFORMED_CONTENT',
  ENCODING_ERROR = 'ENCODING_ERROR',
  
  // Format-specific Errors
  JSON_SYNTAX_ERROR = 'JSON_SYNTAX_ERROR',
  JSON_INVALID_STRUCTURE = 'JSON_INVALID_STRUCTURE',
  CSV_INCONSISTENT_COLUMNS = 'CSV_INCONSISTENT_COLUMNS',
  CSV_INVALID_DELIMITER = 'CSV_INVALID_DELIMITER',
  CSV_MALFORMED_QUOTES = 'CSV_MALFORMED_QUOTES',
  XML_SYNTAX_ERROR = 'XML_SYNTAX_ERROR',
  XML_INVALID_STRUCTURE = 'XML_INVALID_STRUCTURE',
  HTML_MALFORMED = 'HTML_MALFORMED',
  
  // Operation Errors
  FORMAT_OPERATION_FAILED = 'FORMAT_OPERATION_FAILED',
  VALIDATION_FAILED = 'VALIDATION_FAILED',
  MINIFY_OPERATION_FAILED = 'MINIFY_OPERATION_FAILED',
  DETECTION_FAILED = 'DETECTION_FAILED',
  
  // System Errors
  BROWSER_NOT_SUPPORTED = 'BROWSER_NOT_SUPPORTED',
  MEMORY_LIMIT_EXCEEDED = 'MEMORY_LIMIT_EXCEEDED',
  NETWORK_ERROR = 'NETWORK_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export interface FormatterError {
  code: FormatterErrorCode;
  message: string;
  details?: string;
  line?: number;
  column?: number;
  position?: number;
  suggestions?: string[];
  recovery?: {
    action: string;
    description: string;
  };
  metadata?: Record<string, unknown>;
}

// ============================================================================
// FILE SIZE VALIDATION
// ============================================================================

export const FILE_SIZE_LIMITS = {
  JSON: 10 * 1024 * 1024,    // 10MB
  CSV: 50 * 1024 * 1024,     // 50MB  
  XML: 20 * 1024 * 1024,     // 20MB
  HTML: 10 * 1024 * 1024,    // 10MB
  JAVASCRIPT: 5 * 1024 * 1024, // 5MB
  DEFAULT: 10 * 1024 * 1024,  // 10MB
} as const;

export const CONTENT_SIZE_LIMITS = {
  JSON: 20 * 1024 * 1024,    // 20MB in memory
  CSV: 100 * 1024 * 1024,    // 100MB in memory
  XML: 40 * 1024 * 1024,     // 40MB in memory
  HTML: 20 * 1024 * 1024,    // 20MB in memory
  JAVASCRIPT: 10 * 1024 * 1024, // 10MB in memory
  DEFAULT: 20 * 1024 * 1024,  // 20MB in memory
} as const;

/**
 * Validate file size based on format type
 */
export function validateFileSize(file: File, formatterType?: FormatterType): FormatterError | null {
  const formatKey = formatterType?.toUpperCase() as keyof typeof FILE_SIZE_LIMITS;
  const limit = FILE_SIZE_LIMITS[formatKey] || FILE_SIZE_LIMITS.DEFAULT;
  
  if (file.size > limit) {
    const limitMB = Math.round(limit / (1024 * 1024));
    const fileSizeMB = Math.round(file.size / (1024 * 1024));
    
    return {
      code: FormatterErrorCode.FILE_TOO_LARGE,
      message: `File size (${fileSizeMB}MB) exceeds the limit for ${formatterType || 'this'} files (${limitMB}MB)`,
      details: `Large files can cause performance issues and may crash your browser.`,
      suggestions: [
        'Try splitting the file into smaller chunks',
        'Use a more efficient format (e.g., JSON instead of XML)',
        'Compress the file before uploading',
        'Process the file in smaller sections'
      ],
      recovery: {
        action: 'split_file',
        description: 'Consider breaking the file into smaller parts'
      },
      metadata: {
        fileSize: file.size,
        limit,
        fileSizeMB,
        limitMB
      }
    };
  }
  
  return null;
}

/**
 * Validate content size in memory
 */
export function validateContentSize(content: string, formatterType: FormatterType): FormatterError | null {
  const formatKey = formatterType.toUpperCase() as keyof typeof CONTENT_SIZE_LIMITS;
  const limit = CONTENT_SIZE_LIMITS[formatKey] || CONTENT_SIZE_LIMITS.DEFAULT;
  const contentSize = new Blob([content]).size;
  
  if (contentSize > limit) {
    const limitMB = Math.round(limit / (1024 * 1024));
    const contentSizeMB = Math.round(contentSize / (1024 * 1024));
    
    return {
      code: FormatterErrorCode.CONTENT_TOO_LARGE,
      message: `Content size (${contentSizeMB}MB) exceeds the processing limit for ${formatterType} (${limitMB}MB)`,
      details: `Large content can cause browser performance issues or crashes.`,
      suggestions: [
        'Try processing a smaller portion of the content',
        'Use streaming processing for large datasets',
        'Consider using a desktop application for very large files'
      ],
      recovery: {
        action: 'reduce_content',
        description: 'Process a smaller portion of the content'
      },
      metadata: {
        contentSize,
        limit,
        contentSizeMB,
        limitMB
      }
    };
  }
  
  return null;
}

// ============================================================================
// ERROR PARSING AND ENHANCEMENT
// ============================================================================

/**
 * Parse and enhance JSON errors
 */
export function parseJsonError(error: Error, content: string): FormatterError {
  const message = error.message;
  
  // Try to extract position information
  const positionMatch = message.match(/at position (\d+)/);
  // const unexpectedMatch = message.match(/Unexpected token (.+) in JSON at position (\d+)/);
  const syntaxMatch = message.match(/JSON\.parse: (.+) at line (\d+) column (\d+)/);
  
  let line: number | undefined;
  let column: number | undefined;
  let position: number | undefined;
  let suggestions: string[] = [];
  
  if (positionMatch) {
    position = parseInt(positionMatch[1], 10);
    const lines = content.substring(0, position).split('\n');
    line = lines.length;
    column = lines[lines.length - 1].length + 1;
  } else if (syntaxMatch) {
    line = parseInt(syntaxMatch[2], 10);
    column = parseInt(syntaxMatch[3], 10);
  }
  
  // Generate specific suggestions based on error type
  if (message.includes('Unexpected token')) {
    suggestions = [
      'Check for missing or extra commas',
      'Ensure all strings are properly quoted',
      'Verify that all brackets and braces are properly closed',
      'Remove any trailing commas before closing brackets'
    ];
  } else if (message.includes('Unexpected end')) {
    suggestions = [
      'Check for unclosed brackets or braces',
      'Ensure the JSON structure is complete',
      'Verify all opening brackets have corresponding closing brackets'
    ];
  } else {
    suggestions = [
      'Validate JSON structure with proper brackets and braces',
      'Ensure all property names are quoted with double quotes',
      'Check for proper comma separation between properties',
      'Remove any comments (JSON does not support comments)'
    ];
  }
  
  return {
    code: FormatterErrorCode.JSON_SYNTAX_ERROR,
    message: `JSON parsing error: ${message}`,
    details: position ? `Error occurred at character position ${position}` : undefined,
    line,
    column,
    position,
    suggestions,
    recovery: {
      action: 'fix_syntax',
      description: 'Fix the JSON syntax errors highlighted above'
    }
  };
}

/**
 * Parse and enhance XML errors
 */
export function parseXmlError(error: Error): FormatterError {
  const message = error.message;
  
  // Extract line information from XML parser errors
  const lineMatch = message.match(/line (\d+)/i);
  const line = lineMatch ? parseInt(lineMatch[1], 10) : undefined;
  
  let suggestions: string[] = [];
  
  if (message.includes('unclosed') || message.includes('mismatched')) {
    suggestions = [
      'Check that all opening tags have corresponding closing tags',
      'Ensure tag names match exactly (XML is case-sensitive)',
      'Verify proper nesting of elements',
      'Check for self-closing tags that should end with "/>"'
    ];
  } else if (message.includes('invalid character') || message.includes('illegal character')) {
    suggestions = [
      'Check for invalid characters in tag names or content',
      'Ensure special characters are properly escaped',
      'Use CDATA sections for content with special characters',
      'Validate the character encoding of the file'
    ];
  } else {
    suggestions = [
      'Ensure the document has a single root element',
      'Check XML declaration syntax (<?xml version="1.0"?>)',
      'Verify proper attribute quoting',
      'Validate the overall XML structure'
    ];
  }
  
  return {
    code: FormatterErrorCode.XML_SYNTAX_ERROR,
    message: `XML parsing error: ${message}`,
    line,
    suggestions,
    recovery: {
      action: 'fix_xml_syntax',
      description: 'Fix the XML syntax errors'
    }
  };
}

/**
 * Parse and enhance CSV errors
 */
export function parseCsvError(error: Error): FormatterError {
  const message = error.message;
  
  let suggestions: string[] = [];
  
  if (message.includes('inconsistent') || message.includes('column')) {
    suggestions = [
      'Ensure all rows have the same number of columns',
      'Check for missing commas or delimiters',
      'Verify that quoted fields are properly closed',
      'Consider if the file uses a different delimiter (semicolon, tab, etc.)'
    ];
  } else if (message.includes('quote') || message.includes('delimiter')) {
    suggestions = [
      'Check for unescaped quotes within quoted fields',
      'Ensure quoted fields that contain the delimiter are properly quoted',
      'Try a different delimiter if the auto-detection failed',
      'Verify the file encoding is correct'
    ];
  } else {
    suggestions = [
      'Check the file format and delimiter',
      'Ensure the file is actually CSV format',
      'Verify there are no binary characters in the file',
      'Try opening the file in a text editor to inspect its structure'
    ];
  }
  
  return {
    code: FormatterErrorCode.CSV_INCONSISTENT_COLUMNS,
    message: `CSV parsing error: ${message}`,
    suggestions,
    recovery: {
      action: 'fix_csv_structure',
      description: 'Fix the CSV structure and formatting'
    }
  };
}

// ============================================================================
// COMPREHENSIVE ERROR HANDLING
// ============================================================================

/**
 * Wrap formatter operations with enhanced error handling
 */
export function handleFormatterError(
  operation: () => FormatResult | ValidationResult,
  formatterType: FormatterType,
  content?: string
): FormatResult | ValidationResult {
  try {
    return operation();
  } catch (error) {
    
    
    let formatterError: FormatterError;
    
    if (error instanceof Error) {
      switch (formatterType) {
        case 'json':
          formatterError = parseJsonError(error, content || '');
          break;
        case 'xml':
          formatterError = parseXmlError(error, content || '');
          break;
        case 'csv':
          formatterError = parseCsvError(error, content || '');
          break;
        default:
          formatterError = {
            code: FormatterErrorCode.FORMAT_OPERATION_FAILED,
            message: `${formatterType} operation failed: ${error.message}`,
            suggestions: ['Check the input format and try again'],
            recovery: {
              action: 'retry',
              description: 'Verify the input and retry the operation'
            }
          };
      }
    } else {
      formatterError = {
        code: FormatterErrorCode.UNKNOWN_ERROR,
        message: 'An unknown error occurred',
        suggestions: ['Try refreshing the page and trying again'],
        recovery: {
          action: 'refresh',
          description: 'Refresh the page and try again'
        }
      };
    }
    
    // Return appropriate error result
    if ('success' in operation()) {
      return {
        success: false,
        error: formatterError.message
      } as FormatResult;
    } else {
      return {
        isValid: false,
        error: {
          message: formatterError.message,
          line: formatterError.line,
          column: formatterError.column
        }
      } as ValidationResult;
    }
  }
}

/**
 * Create user-friendly error messages with recovery suggestions
 */
export function createUserErrorMessage(error: FormatterError): {
  title: string;
  message: string;
  suggestions: string[];
  recoveryAction?: string;
} {
  let title = 'Formatting Error';
  const message = error.message;
  
  switch (error.code) {
    case FormatterErrorCode.FILE_TOO_LARGE:
      title = 'File Too Large';
      break;
    case FormatterErrorCode.JSON_SYNTAX_ERROR:
      title = 'JSON Syntax Error';
      break;
    case FormatterErrorCode.XML_SYNTAX_ERROR:
      title = 'XML Syntax Error';
      break;
    case FormatterErrorCode.CSV_INCONSISTENT_COLUMNS:
      title = 'CSV Format Error';
      break;
    case FormatterErrorCode.CONTENT_TOO_LARGE:
      title = 'Content Too Large';
      break;
    default:
      title = 'Processing Error';
  }
  
  return {
    title,
    message,
    suggestions: error.suggestions || [],
    recoveryAction: error.recovery?.description
  };
}