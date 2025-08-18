/**
 * CSV Formatter Implementation
 *
 * This module provides CSV formatting, validation, and processing functionality
 * extending the BaseFormatter class.
 */

import { Table } from "lucide-react";
import { BaseFormatter } from "./base-formatter";
import type {
  ContentDetectionResult,
  FormatOptions,
  FormatterCategory,
  FormatterConfig,
} from "../registry/formatter-registry";
import type { ValidationResult, FormatResult, CsvDelimiter } from "../types";

const CSV_DELIMITERS = {
  comma: ",",
  semicolon: ";",
  tab: "\t",
  pipe: "|",
} as const;

interface CsvFormatOptions extends FormatOptions {
  delimiter?: CsvDelimiter;
  hasHeaders?: boolean;
  quoteAll?: boolean;
  escapeQuotes?: boolean;
}

/**
 * Detect the most likely CSV delimiter from content
 */
function detectCsvDelimiter(content: string): { delimiter: CsvDelimiter; confidence: number } {
  const delimiters: Array<{ type: CsvDelimiter; char: string }> = [
    { type: "comma", char: "," },
    { type: "semicolon", char: ";" },
    { type: "tab", char: "\t" },
    { type: "pipe", char: "|" },
  ];

  const results = delimiters.map(({ type, char }) => {
    const count = (content.match(new RegExp(`\\${char}`, "g")) || []).length;
    const lines = content.split('\n').slice(0, 10); // Check first 10 lines
    
    // Calculate consistency score
    const lineCounts = lines.map(line => 
      (line.match(new RegExp(`\\${char}`, "g")) || []).length
    ).filter(count => count > 0);
    
    const avgCount = lineCounts.length > 0 ? 
      lineCounts.reduce((sum, c) => sum + c, 0) / lineCounts.length : 0;
    
    const variance = lineCounts.length > 0 ?
      lineCounts.reduce((sum, c) => sum + Math.pow(c - avgCount, 2), 0) / lineCounts.length : Infinity;
    
    // Lower variance means more consistent delimiter usage
    const consistencyScore = variance === 0 ? 1 : 1 / (1 + variance);
    
    return {
      type,
      count,
      avgCount,
      variance,
      consistencyScore,
      score: count * consistencyScore,
    };
  });

  results.sort((a, b) => b.score - a.score);
  const best = results[0];
  
  // Calculate confidence based on how much better the best is compared to others
  const confidence = best.score > 0 ? 
    Math.min(1, best.score / (results[1]?.score || best.score + 1)) : 0;

  return {
    delimiter: best.type,
    confidence: Math.min(confidence, 0.9), // Cap at 0.9 to leave room for other formats
  };
}

/**
 * Parse CSV string into rows and columns
 */
function parseCsv(content: string, delimiter: CsvDelimiter): string[][] {
  const delimiterChar = CSV_DELIMITERS[delimiter];
  const lines = content.split('\n').filter(line => line.trim());
  const rows: string[][] = [];

  for (const line of lines) {
    // Enhanced CSV parsing that handles quoted fields
    const cells = parseCsvLine(line, delimiterChar);
    rows.push(cells);
  }

  return rows;
}

/**
 * Parse a single CSV line with proper quote handling
 */
function parseCsvLine(line: string, delimiter: string): string[] {
  const cells: string[] = [];
  let current = '';
  let inQuotes = false;
  let i = 0;

  while (i < line.length) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        current += '"';
        i += 2;
      } else {
        // Start or end of quoted field
        inQuotes = !inQuotes;
        i++;
      }
    } else if (char === delimiter && !inQuotes) {
      // Field separator
      cells.push(current.trim());
      current = '';
      i++;
    } else {
      current += char;
      i++;
    }
  }

  // Add the last cell
  cells.push(current.trim());
  return cells;
}

/**
 * Convert CSV rows back to string
 */
function stringifyCsv(rows: string[][], delimiter: CsvDelimiter, options: CsvFormatOptions = {}): string {
  const delimiterChar = CSV_DELIMITERS[delimiter];
  
  return rows.map(row => {
    return row.map(cell => {
      // Quote cells that contain the delimiter, quotes, or newlines
      const needsQuoting = cell.includes(delimiterChar) || 
                          cell.includes('"') || 
                          cell.includes('\n') ||
                          cell.includes('\r') ||
                          options.quoteAll;

      if (needsQuoting) {
        // Escape existing quotes by doubling them
        const escaped = cell.replace(/"/g, '""');
        return `"${escaped}"`;
      }
      
      return cell;
    }).join(delimiterChar);
  }).join('\n');
}

/**
 * CSV Formatter Class
 */
export class CsvFormatter extends BaseFormatter {
  readonly id = "csv";
  readonly name = "CSV";
  readonly extensions = [".csv", ".tsv", ".dsv"];
  readonly mimeTypes = [
    "text/csv",
    "text/tab-separated-values",
    "application/csv",
  ];
  readonly icon = Table;
  readonly category: FormatterCategory = "data";
  readonly supportsMinify = false;
  readonly supportsTableView = true;
  readonly config: FormatterConfig = {
    maxInputSize: 50 * 1024 * 1024, // 50MB for large datasets
    defaultOptions: {
      delimiter: "comma",
      hasHeaders: true,
      quoteAll: false,
      escapeQuotes: true,
    },
    performance: {
      enableChunking: true,
      chunkSize: 1000, // Process 1000 rows at a time
      enableWorker: true,
    },
  };

  /**
   * Detect if content is CSV format
   */
  detectContent(content: string): ContentDetectionResult {
  const trimmedContent = content.trim();
  
  if (!trimmedContent) {
    return { confidence: 0 };
  }

  const lines = trimmedContent.split('\n').filter(line => line.trim());
  
  if (lines.length < 2) {
    return { confidence: 0 };
  }

  // Detect the most likely delimiter
  const delimiterDetection = detectCsvDelimiter(trimmedContent);
  
  if (delimiterDetection.confidence === 0) {
    return { confidence: 0 };
  }

  const delimiter = delimiterDetection.delimiter;
  const delimiterChar = CSV_DELIMITERS[delimiter];

  // Check for consistent column counts
  const columnCounts = lines.slice(0, 10).map(line => 
    parseCsvLine(line, delimiterChar).length
  );

  const firstCount = columnCounts[0];
  const hasConsistentColumns = columnCounts.every(count => count === firstCount);
  const hasMultipleColumns = firstCount > 1;

  let confidence = 0;

  if (hasMultipleColumns && hasConsistentColumns) {
    confidence = 0.8 * delimiterDetection.confidence;
  } else if (hasMultipleColumns) {
    confidence = 0.6 * delimiterDetection.confidence;
  } else {
    confidence = 0.2 * delimiterDetection.confidence;
  }

  // Check for CSV-like patterns
  const hasHeaders = lines.length > 1 && 
    parseCsvLine(lines[0], delimiterChar).every(cell => 
      /^[a-zA-Z_][a-zA-Z0-9_\s]*$/.test(cell.trim())
    );

  if (hasHeaders) {
    confidence += 0.1;
  }

  return {
    confidence: Math.min(confidence, 0.95),
    detectedOptions: {
      delimiter,
      hasHeaders,
    },
    metadata: {
      lineCount: lines.length,
      avgLineLength: lines.reduce((sum, line) => sum + line.length, 0) / lines.length,
      hasHeaders,
    },
  };
}

  /**
   * Format CSV with proper alignment and structure
   */
  protected doFormat(content: string, options: CsvFormatOptions = {}): FormatResult {

    // Auto-detect delimiter if not provided
    let delimiter = options.delimiter;
    if (!delimiter) {
      const detection = detectCsvDelimiter(content);
      delimiter = detection.delimiter;
    }

    const rows = parseCsv(content, delimiter);

    if (rows.length === 0) {
      return {
        success: false,
        error: "No valid CSV data found",
      };
    }

    // Format by ensuring consistent column count
    const maxColumns = Math.max(...rows.map(row => row.length));
    const formattedRows = rows.map(row => {
      const paddedRow = [...row];
      while (paddedRow.length < maxColumns) {
        paddedRow.push('');
      }
      return paddedRow;
    });

    const formatted = stringifyCsv(formattedRows, delimiter, options);

    return {
      success: true,
      output: formatted,
    };
  }

  /**
   * Validate CSV structure
   */
  protected doValidate(content: string): ValidationResult {

    const detection = detectCsvDelimiter(content);
    const rows = parseCsv(content, detection.delimiter);

    if (rows.length === 0) {
      return {
        isValid: false,
        error: {
          message: "No valid CSV data found",
        },
      };
    }

    // Check for consistent column count (basic validation)
    const columnCounts = rows.map(row => row.length);
    const firstColumnCount = columnCounts[0];
    const inconsistentRows = columnCounts
      .map((count, index) => ({ count, index }))
      .filter(({ count }) => count !== firstColumnCount);

    if (inconsistentRows.length > 0) {
      const firstInconsistent = inconsistentRows[0];
      return {
        isValid: false,
        error: {
          message: `Inconsistent number of columns. Expected ${firstColumnCount}, found ${firstInconsistent.count} at row ${firstInconsistent.index + 1}`,
          line: firstInconsistent.index + 1,
        },
      };
    }

    return { isValid: true };
  }
}

/**
 * Export singleton instance for compatibility
 */
export const csvFormatter = new CsvFormatter();