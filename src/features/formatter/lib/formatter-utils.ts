/**
 * Formatter Utilities Module
 *
 * This module provides utility functions for formatting, validating, and processing
 * JSON, CSV, and XML data. All operations are performed client-side for privacy.
 */

import {
  FormatterType,
  CsvDelimiter,
  ValidationResult,
  FormatResult,
  FormatOptions,
  CsvTableData,
  FormatterError,
  FormatterErrorType,
  FileHandlingResult,
} from "../types";
import { FORMATTER_CONSTANTS } from "../types";

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Common validation functions
 */
const validators = {
  /**
   * Check if input size is within limits
   */
  validateInputSize(input: string): void {
    if (input.length > FORMATTER_CONSTANTS.MAX_INPUT_SIZE) {
      throw new FormatterError(FormatterErrorType.TOO_LARGE, "errors.tooLarge");
    }
  },

  /**
   * Check if input is empty
   */
  validateInputNotEmpty(input: string): void {
    if (!input.trim()) {
      throw new FormatterError(
        FormatterErrorType.EMPTY_INPUT,
        "errors.emptyInput",
      );
    }
  },

  /**
   * Validate input with common checks
   */
  validateInput(input: string): void {
    this.validateInputNotEmpty(input);
    this.validateInputSize(input);
  },
};

/**
 * Get CSV delimiter character from delimiter type
 */
function getCsvDelimiterChar(delimiter: CsvDelimiter): string {
  return FORMATTER_CONSTANTS.CSV_DELIMITERS[delimiter];
}

/**
 * Detect CSV delimiter from content
 */
function detectCsvDelimiter(content: string): CsvDelimiter {
  const delimiters: Array<{ type: CsvDelimiter; char: string }> = [
    { type: "comma", char: "," },
    { type: "semicolon", char: ";" },
    { type: "tab", char: "\t" },
    { type: "pipe", char: "|" },
  ];

  let maxCount = 0;
  let detectedDelimiter: CsvDelimiter = "comma";

  for (const { type, char } of delimiters) {
    const count = (content.match(new RegExp(`\\${char}`, "g")) || []).length;
    if (count > maxCount) {
      maxCount = count;
      detectedDelimiter = type;
    }
  }

  return detectedDelimiter;
}

// ============================================================================
// FILE HANDLING UTILITIES
// ============================================================================

/**
 * Get file extension from filename
 */
function getFileExtension(filename: string): string {
  const lastDotIndex = filename.lastIndexOf(".");
  if (lastDotIndex === -1 || lastDotIndex === filename.length - 1) {
    return "";
  }
  return filename.substring(lastDotIndex).toLowerCase();
}

/**
 * Detect formatter type from file extension
 */
function detectFormatFromExtension(filename: string): FormatterType | null {
  const extension = getFileExtension(filename);
  const extensionWithoutDot = extension.slice(
    1,
  ) as keyof typeof FORMATTER_CONSTANTS.FILE_TYPE_MAPPING;

  if (extensionWithoutDot in FORMATTER_CONSTANTS.FILE_TYPE_MAPPING) {
    return FORMATTER_CONSTANTS.FILE_TYPE_MAPPING[extensionWithoutDot];
  }

  return null;
}

/**
 * Detect formatter type from content analysis
 */
function detectFormatFromContent(content: string): FormatterType | null {
  const trimmedContent = content.trim();

  if (!trimmedContent) {
    return null;
  }

  // Try JSON first - look for object/array syntax
  if (
    (trimmedContent.startsWith("{") && trimmedContent.endsWith("}")) ||
    (trimmedContent.startsWith("[") && trimmedContent.endsWith("]"))
  ) {
    try {
      JSON.parse(trimmedContent);
      return "json";
    } catch {
      // Not valid JSON, continue checking
    }
  }

  // Try XML - look for XML declaration or tag structure
  if (
    trimmedContent.startsWith("<?xml") ||
    (trimmedContent.startsWith("<") && trimmedContent.endsWith(">"))
  ) {
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(trimmedContent, "text/xml");
      const parseError = xmlDoc.getElementsByTagName("parsererror");
      if (parseError.length === 0) {
        return "xml";
      }
    } catch {
      // Not valid XML, continue checking
    }
  }

  // Check for CSV patterns - look for delimiters and consistent row structure
  const lines = trimmedContent.split("\n").filter((line) => line.trim());
  if (lines.length >= 2) {
    const detectedDelimiter = detectCsvDelimiter(trimmedContent);
    const delimiterChar = getCsvDelimiterChar(detectedDelimiter);

    // Check if we have consistent column counts (basic CSV heuristic)
    const columnCounts = lines
      .slice(0, 5)
      .map((line) => line.split(delimiterChar).length);

    const firstCount = columnCounts[0];
    const hasConsistentColumns = columnCounts.every(
      (count) => count === firstCount,
    );

    if (hasConsistentColumns && firstCount > 1) {
      return "csv";
    }
  }

  // Default to null if we can't determine the format
  return null;
}

/**
 * Validate file before processing
 */
function validateFile(file: File): { valid: boolean; error?: string } {
  // Check file size
  if (file.size > FORMATTER_CONSTANTS.MAX_FILE_SIZE) {
    const maxSizeMB = FORMATTER_CONSTANTS.MAX_FILE_SIZE / (1024 * 1024);
    return {
      valid: false,
      error: `File is too large. Maximum size allowed is ${maxSizeMB}MB`,
    };
  }

  // Check if file is text-based (basic check)
  if (
    file.type &&
    !file.type.includes("text") &&
    !file.type.includes("json") &&
    !file.type.includes("xml") &&
    !file.type.includes("csv")
  ) {
    const extension = getFileExtension(file.name);
    if (
      !(
        FORMATTER_CONSTANTS.SUPPORTED_FILE_EXTENSIONS as readonly string[]
      ).includes(extension)
    ) {
      return {
        valid: false,
        error:
          "Unsupported file type. Please upload .json, .csv, .xml, or .txt files",
      };
    }
  }

  return { valid: true };
}

/**
 * Read file content as text
 */
function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const content = e.target?.result;
      if (typeof content === "string") {
        resolve(content);
      } else {
        reject(new Error("errors.fileReadError"));
      }
    };

    reader.onerror = () => {
      reject(new Error("errors.fileReadError"));
    };

    reader.readAsText(file);
  });
}

/**
 * Handle file loading with format detection
 */
export async function handleFileLoad(file: File): Promise<FileHandlingResult> {
  try {
    // Validate file
    const validation = validateFile(file);
    if (!validation.valid) {
      return {
        success: false,
        error: validation.error,
      };
    }

    // Read file content
    const content = await readFileAsText(file);

    if (!content.trim()) {
      return {
        success: false,
        error: "errors.emptyInput",
      };
    }

    // Detect format - try extension first, then content analysis
    let detectedFormat = detectFormatFromExtension(file.name);

    if (!detectedFormat) {
      detectedFormat = detectFormatFromContent(content);
    }

    return {
      success: true,
      content,
      detectedFormat: detectedFormat || undefined,
      fileName: file.name,
      fileSize: Math.round(file.size / 1024), // Size in KB
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "errors.unknown";
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Check if dragged items contain valid files
 */
export function hasValidFiles(dataTransfer: DataTransfer): boolean {
  const files = Array.from(dataTransfer.files);

  if (files.length === 0) {
    return false;
  }

  // Check if at least one file is potentially valid
  return files.some((file) => {
    const extension = getFileExtension(file.name);
    return (
      (
        FORMATTER_CONSTANTS.SUPPORTED_FILE_EXTENSIONS as readonly string[]
      ).includes(extension) ||
      file.type.includes("text") ||
      file.type.includes("json") ||
      file.type.includes("xml") ||
      file.type.includes("csv")
    );
  });
}

/**
 * Get the first valid file from dropped files
 */
export function getFirstValidFile(files: FileList): File | null {
  const fileArray = Array.from(files);

  return (
    fileArray.find((file) => {
      const extension = getFileExtension(file.name);
      return (
        (
          FORMATTER_CONSTANTS.SUPPORTED_FILE_EXTENSIONS as readonly string[]
        ).includes(extension) ||
        file.type.includes("text") ||
        file.type.includes("json") ||
        file.type.includes("xml") ||
        file.type.includes("csv")
      );
    }) || null
  );
}

// ============================================================================
// JSON OPERATIONS
// ============================================================================

/**
 * Format JSON with proper indentation
 */
export function formatJson(
  input: string,
  options: FormatOptions = {},
): FormatResult {
  try {
    validators.validateInput(input);

    const parsed = JSON.parse(input);
    const indent = options.indent ?? FORMATTER_CONSTANTS.DEFAULT_INDENT;
    const formatted = JSON.stringify(parsed, null, indent);

    return {
      success: true,
      output: formatted,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "errors.unknown";
    return {
      success: false,
      error: `Invalid JSON: ${errorMessage}`,
    };
  }
}

/**
 * Validate JSON syntax
 */
export function validateJson(input: string): ValidationResult {
  try {
    validators.validateInputNotEmpty(input);
    JSON.parse(input);
    return { isValid: true };
  } catch (error) {
    if (error instanceof FormatterError) {
      return {
        isValid: false,
        error: {
          message: error.message,
        },
      };
    }

    const errorMessage =
      error instanceof Error ? error.message : "Invalid JSON";

    // Try to extract line/column information from JSON parse error
    const match = errorMessage.match(/at position (\d+)/);
    let line: number | undefined;
    let column: number | undefined;

    if (match && input) {
      const position = parseInt(match[1], 10);
      const lines = input.substring(0, position).split("\n");
      line = lines.length;
      column = lines[lines.length - 1].length + 1;
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
export function minifyJson(input: string): FormatResult {
  try {
    validators.validateInput(input);

    const parsed = JSON.parse(input);
    const minified = JSON.stringify(parsed);

    return {
      success: true,
      output: minified,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "errors.unknown";
    return {
      success: false,
      error: `Invalid JSON: ${errorMessage}`,
    };
  }
}

// ============================================================================
// CSV OPERATIONS
// ============================================================================

/**
 * Parse CSV string into rows and columns
 */
function parseCsv(content: string, delimiter: CsvDelimiter): string[][] {
  const delimiterChar = getCsvDelimiterChar(delimiter);
  const lines = content.split("\n").filter((line) => line.trim());
  const rows: string[][] = [];

  for (const line of lines) {
    // Simple CSV parsing - handles basic cases
    // For production, consider using a robust CSV parsing library
    const cells = line.split(delimiterChar).map((cell) => cell.trim());
    rows.push(cells);
  }

  return rows;
}

/**
 * Convert CSV rows back to string
 */
function stringifyCsv(rows: string[][], delimiter: CsvDelimiter): string {
  const delimiterChar = getCsvDelimiterChar(delimiter);
  return rows.map((row) => row.join(delimiterChar)).join("\n");
}

/**
 * Format CSV with proper alignment and structure
 */
export function formatCsv(
  input: string,
  options: FormatOptions = {},
): FormatResult {
  try {
    validators.validateInput(input);

    const delimiter = options.csvDelimiter ?? detectCsvDelimiter(input);
    const rows = parseCsv(input, delimiter);

    if (rows.length === 0) {
      return {
        success: false,
        error: "No valid CSV data found",
      };
    }

    // Format by ensuring consistent column count
    const maxColumns = Math.max(...rows.map((row) => row.length));
    const formattedRows = rows.map((row) => {
      const paddedRow = [...row];
      while (paddedRow.length < maxColumns) {
        paddedRow.push("");
      }
      return paddedRow;
    });

    const formatted = stringifyCsv(formattedRows, delimiter);

    return {
      success: true,
      output: formatted,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "errors.unknown";
    return {
      success: false,
      error: `CSV formatting error: ${errorMessage}`,
    };
  }
}

/**
 * Validate CSV structure
 */
export function validateCsv(input: string): ValidationResult {
  try {
    validators.validateInputNotEmpty(input);

    const delimiter = detectCsvDelimiter(input);
    const rows = parseCsv(input, delimiter);

    if (rows.length === 0) {
      return {
        isValid: false,
        error: {
          message: "No valid CSV data found",
        },
      };
    }

    // Check for consistent column count (basic validation)
    const columnCounts = rows.map((row) => row.length);
    const firstColumnCount = columnCounts[0];
    const hasInconsistentColumns = columnCounts.some(
      (count) => count !== firstColumnCount,
    );

    if (hasInconsistentColumns) {
      return {
        isValid: false,
        error: {
          message: "errors.csvInconsistentColumns",
        },
      };
    }

    return { isValid: true };
  } catch (error) {
    if (error instanceof FormatterError) {
      return {
        isValid: false,
        error: {
          message: error.message,
        },
      };
    }

    const errorMessage = error instanceof Error ? error.message : "Invalid CSV";
    return {
      isValid: false,
      error: {
        message: errorMessage,
      },
    };
  }
}

/**
 * Convert CSV delimiter
 */
export function convertCsvDelimiter(
  input: string,
  fromDelimiter: CsvDelimiter,
  toDelimiter: CsvDelimiter,
): FormatResult {
  try {
    validators.validateInput(input);

    const rows = parseCsv(input, fromDelimiter);
    const converted = stringifyCsv(rows, toDelimiter);

    return {
      success: true,
      output: converted,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "errors.unknown";
    return {
      success: false,
      error: `CSV conversion error: ${errorMessage}`,
    };
  }
}

/**
 * Parse CSV to table data structure
 */
export function parseCsvToTable(
  input: string,
  delimiter: CsvDelimiter,
): CsvTableData | null {
  try {
    const rows = parseCsv(input, delimiter);

    if (rows.length === 0) {
      return null;
    }

    const headers = rows[0];
    const dataRows = rows.slice(1);

    return {
      headers,
      rows: dataRows,
    };
  } catch {
    return null;
  }
}

// ============================================================================
// XML OPERATIONS
// ============================================================================

/**
 * Format XML with proper indentation
 */
export function formatXml(
  input: string,
  options: FormatOptions = {},
): FormatResult {
  try {
    validators.validateInput(input);

    // Basic XML formatting - parse and re-stringify with indentation
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(input, "text/xml");

    // Check for parsing errors
    const parseError = xmlDoc.getElementsByTagName("parsererror");
    if (parseError.length > 0) {
      const errorText =
        parseError[0].textContent || "Unknown XML parsing error";
      return {
        success: false,
        error: `Invalid XML: ${errorText}`,
      };
    }

    // Format XML with indentation
    const formatted = formatXmlNode(
      xmlDoc,
      options.indent ?? FORMATTER_CONSTANTS.DEFAULT_INDENT,
    );

    return {
      success: true,
      output: formatted,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "errors.unknown";
    return {
      success: false,
      error: `XML formatting error: ${errorMessage}`,
    };
  }
}

/**
 * Validate XML syntax
 */
export function validateXml(input: string): ValidationResult {
  try {
    validators.validateInputNotEmpty(input);

    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(input, "text/xml");

    // Check for parsing errors
    const parseError = xmlDoc.getElementsByTagName("parsererror");
    if (parseError.length > 0) {
      const errorText =
        parseError[0].textContent || "Unknown XML parsing error";

      // Try to extract line information from error
      const lineMatch = errorText.match(/line (\d+)/i);
      const line = lineMatch ? parseInt(lineMatch[1], 10) : undefined;

      return {
        isValid: false,
        error: {
          message: errorText,
          line,
        },
      };
    }

    return { isValid: true };
  } catch (error) {
    if (error instanceof FormatterError) {
      return {
        isValid: false,
        error: {
          message: error.message,
        },
      };
    }

    const errorMessage = error instanceof Error ? error.message : "Invalid XML";
    return {
      isValid: false,
      error: {
        message: errorMessage,
      },
    };
  }
}

/**
 * Minify XML by removing whitespace
 */
export function minifyXml(input: string): FormatResult {
  try {
    validators.validateInput(input);

    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(input, "text/xml");

    // Check for parsing errors
    const parseError = xmlDoc.getElementsByTagName("parsererror");
    if (parseError.length > 0) {
      const errorText =
        parseError[0].textContent || "Unknown XML parsing error";
      return {
        success: false,
        error: `Invalid XML: ${errorText}`,
      };
    }

    // Minify by removing unnecessary whitespace
    const serializer = new XMLSerializer();
    const minified = serializer
      .serializeToString(xmlDoc)
      .replace(/>\s+</g, "><");

    return {
      success: true,
      output: minified,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "errors.unknown";
    return {
      success: false,
      error: `XML minification error: ${errorMessage}`,
    };
  }
}

/**
 * Helper function to format XML node with indentation
 */
function formatXmlNode(node: Node, indent: number, level: number = 0): string {
  const indentStr = " ".repeat(indent);
  const currentIndent = indentStr.repeat(level);
  // const nextIndent = indentStr.repeat(level + 1);

  if (node.nodeType === Node.DOCUMENT_NODE) {
    return Array.from(node.childNodes)
      .map((child) => formatXmlNode(child, indent, level))
      .join("");
  }

  if (node.nodeType === Node.ELEMENT_NODE) {
    const element = node as Element;
    const hasChildElements = Array.from(element.childNodes).some(
      (child) => child.nodeType === Node.ELEMENT_NODE,
    );

    if (hasChildElements) {
      const children = Array.from(element.childNodes)
        .filter(
          (child) =>
            child.nodeType === Node.ELEMENT_NODE ||
            (child.nodeType === Node.TEXT_NODE && child.textContent?.trim()),
        )
        .map((child) => {
          if (child.nodeType === Node.ELEMENT_NODE) {
            return "\n" + formatXmlNode(child, indent, level + 1);
          } else {
            return child.textContent?.trim() || "";
          }
        })
        .filter((content) => content.length > 0)
        .join("");

      return `${currentIndent}<${element.tagName}${getAttributesString(
        element,
      )}>${children}\n${currentIndent}</${element.tagName}>`;
    } else {
      const textContent = element.textContent?.trim() || "";
      return `${currentIndent}<${element.tagName}${getAttributesString(
        element,
      )}>${textContent}</${element.tagName}>`;
    }
  }

  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent?.trim();
    return text ? `${currentIndent}${text}` : "";
  }

  return "";
}

/**
 * Helper function to get attributes string for XML element
 */
function getAttributesString(element: Element): string {
  const attributes = Array.from(element.attributes);
  if (attributes.length === 0) {
    return "";
  }

  return (
    " " + attributes.map((attr) => `${attr.name}="${attr.value}"`).join(" ")
  );
}

// ============================================================================
// UNIFIED OPERATIONS
// ============================================================================

/**
 * Format input based on type
 */
export function format(
  input: string,
  type: FormatterType,
  options: FormatOptions = {},
): FormatResult {
  switch (type) {
    case "json":
      return formatJson(input, options);
    case "csv":
      return formatCsv(input, options);
    case "xml":
      return formatXml(input, options);
    default:
      return {
        success: false,
        error: `Unsupported format type: ${type}`,
      };
  }
}

/**
 * Validate input based on type
 */
export function validate(input: string, type: FormatterType): ValidationResult {
  switch (type) {
    case "json":
      return validateJson(input);
    case "csv":
      return validateCsv(input);
    case "xml":
      return validateXml(input);
    default:
      return {
        isValid: false,
        error: {
          message: `Unsupported format type: ${type}`,
        },
      };
  }
}

/**
 * Minify input based on type
 */
export function minify(input: string, type: FormatterType): FormatResult {
  switch (type) {
    case "json":
      return minifyJson(input);
    case "csv":
      // CSV doesn't really have a minify concept, return as-is
      return formatCsv(input);
    case "xml":
      return minifyXml(input);
    default:
      return {
        success: false,
        error: `Unsupported format type: ${type}`,
      };
  }
}
