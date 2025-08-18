/**
 * Formatter Types Module
 *
 * This module defines all TypeScript interfaces and types for the formatter feature.
 */

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Supported formatter types
 */
export type FormatterType =
  | "json"
  | "csv"
  | "xml"
  | "javascript"
  | "html"
  | "yaml"
  | "css"
  | "sql";

/**
 * CSV delimiter options
 */
export type CsvDelimiter = "comma" | "semicolon" | "tab" | "pipe";

/**
 * CSV view modes
 */
export type CsvViewMode = "raw" | "table";

/**
 * Validation result interface
 */
export interface ValidationResult {
  isValid: boolean;
  error?: {
    message: string;
    line?: number;
    column?: number;
  };
}

/**
 * Format operation result
 */
export interface FormatResult {
  success: boolean;
  output?: string;
  error?: string;
}

/**
 * Formatter history entry interface
 */
export interface FormatterEntry {
  id: string;
  type: FormatterType;
  input: string;
  output: string;
  operation: "format" | "validate" | "minify";
  timestamp: string;
  isValid: boolean;
  delimiter?: CsvDelimiter; // For CSV entries
}

/**
 * CSV table data structure
 */
export interface CsvTableData {
  headers: string[];
  rows: string[][];
}

/**
 * File loading state interface
 */
export interface FileLoadingState {
  isLoading: boolean;
  isDetecting?: boolean;
  fileName?: string;
  fileSize?: number;
  detectedFormat?: FormatterType;
  detectionConfidence?: number;
  detectedAlternatives?: Array<{
    format: string;
    confidence: number;
  }>;
}

/**
 * Drag and drop state interface
 */
export interface DragDropState {
  isDragOver: boolean;
  dragCount: number;
}

/**
 * Formatter state interface
 */
export interface FormatterState {
  type: FormatterType;
  input: string;
  output: string;
  isValid: boolean;
  validationError?: ValidationResult["error"];
  csvDelimiter: CsvDelimiter;
  csvViewMode: CsvViewMode;
  csvTableData?: CsvTableData;
  fileLoading: FileLoadingState;
  dragDrop: DragDropState;
  tabSize: number;
  useTabs: boolean;
}

/**
 * Formatter operations interface
 */
export interface FormatterOperations {
  format: (
    input: string,
    type: FormatterType,
    options?: FormatOptions,
  ) => FormatResult;
  validate: (input: string, type: FormatterType) => ValidationResult;
  minify: (input: string, type: FormatterType) => FormatResult;
  convertCsvDelimiter: (
    input: string,
    fromDelimiter: CsvDelimiter,
    toDelimiter: CsvDelimiter,
  ) => FormatResult;
  parseCsvToTable: (
    input: string,
    delimiter: CsvDelimiter,
  ) => CsvTableData | null;
}

/**
 * Format options interface
 */
export interface FormatOptions {
  indent?: number;
  csvDelimiter?: CsvDelimiter;
  tabSize?: number;
  useTabs?: boolean;
}

/**
 * File handling result interface
 */
export interface FileHandlingResult {
  success: boolean;
  content?: string;
  detectedFormat?: FormatterType;
  detectedAlternatives?: Array<{
    format: FormatterType;
    confidence: number;
  }>;
  detectionConfidence?: number;
  fileName?: string;
  fileSize?: number;
  error?: string;
}

/**
 * Formatter context value interface
 */
export interface FormatterContextValue {
  state: FormatterState;
  history: FormatterEntry[];
  isLoading: boolean;
  // State actions
  setType: (type: FormatterType) => void;
  setInput: (input: string) => void;
  setOutput: (output: string) => void;
  setCsvDelimiter: (delimiter: CsvDelimiter) => void;
  setCsvViewMode: (mode: CsvViewMode) => void;
  setTabSize: (tabSize: number) => void;
  setUseTabs: (useTabs: boolean) => void;
  // Formatter operations
  formatInput: () => Promise<void>;
  validateInput: () => Promise<void>;
  minifyInput: () => Promise<void>;
  clearInput: () => void;
  clearOutput: () => void;
  clearAll: () => void;
  // History operations
  addToHistory: (entry: FormatterEntry) => void;
  clearHistory: () => Promise<void>;
  loadHistoryItem: (entry: FormatterEntry) => void;
  // Utility operations
  copyInput: () => Promise<void>;
  copyOutput: () => Promise<void>;
  pasteToInput: () => Promise<void>;
  autoCopyOutput: () => Promise<void>;
  // Drag and drop operations
  handleDragEnter: () => void;
  handleDragLeave: () => void;
  handleDragOver: React.DragEventHandler<HTMLDivElement>;
  handleDrop: React.DragEventHandler<HTMLDivElement>;
  handleFileLoad: (file: File) => Promise<void>;
}

/**
 * Error types for formatter operations
 */
export enum FormatterErrorType {
  INVALID_JSON = "INVALID_JSON",
  INVALID_CSV = "INVALID_CSV",
  INVALID_XML = "INVALID_XML",
  EMPTY_INPUT = "EMPTY_INPUT",
  TOO_LARGE = "TOO_LARGE",
  PARSE_ERROR = "PARSE_ERROR",
  UNKNOWN_ERROR = "UNKNOWN_ERROR",
}

/**
 * Formatter error class
 */
export class FormatterError extends Error {
  public type: FormatterErrorType;
  public line?: number;
  public column?: number;

  constructor(
    type: FormatterErrorType,
    message: string,
    line?: number,
    column?: number,
  ) {
    super(message);
    this.name = "FormatterError";
    this.type = type;
    this.line = line;
    this.column = column;
  }
}

/**
 * Constants for formatter configuration
 */
export const FORMATTER_CONSTANTS = {
  MAX_INPUT_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  DEFAULT_INDENT: 2,
  CSV_DELIMITERS: {
    comma: ",",
    semicolon: ";",
    tab: "\t",
    pipe: "|",
  } as const,
  SUPPORTED_FILE_EXTENSIONS: [
    ".json",
    ".csv",
    ".xml",
    ".js",
    ".jsx",
    ".html",
    ".htm",
    ".yaml",
    ".yml",
    ".css",
    ".sql",
    ".txt",
  ] as const,
  FILE_TYPE_MAPPING: {
    json: "json",
    csv: "csv",
    xml: "xml",
    js: "javascript",
    jsx: "javascript",
    html: "html",
    htm: "html",
    yaml: "yaml",
    yml: "yaml",
    css: "css",
    sql: "sql",
    txt: null, // Will try to detect from content
  } as const,
} as const;
