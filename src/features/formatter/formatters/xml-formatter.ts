/**
 * XML Formatter Implementation
 *
 * This module provides XML formatting, validation, and minification functionality
 * using the modular formatter system architecture.
 */

import { FileText } from "lucide-react";
import type {
  FormatterDefinition,
  ContentDetectionResult,
  FormatOptions,
} from "../registry/formatter-registry";
import type { ValidationResult, FormatResult } from "../types";
import { 
  checkEmptyInput, 
  createEmptyInputFormatResult, 
  createEmptyInputValidationResult 
} from "../lib/common-constants";

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

interface XmlFormatOptions extends FormatOptions {
  preserveWhitespace?: boolean;
  sortAttributes?: boolean;
  selfClosingTags?: boolean;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Check if a string looks like XML content
 */
function hasXmlStructure(content: string): boolean {
  const xmlPatterns = [
    /^\s*<\?xml/i, // XML declaration
    /^\s*<!DOCTYPE/i, // DOCTYPE declaration
    /<[a-zA-Z][^>]*>/g, // Opening tags
    /<\/[a-zA-Z][^>]*>/g, // Closing tags
    /<[a-zA-Z][^>]*\/>/g, // Self-closing tags
  ];

  let patternMatches = 0;
  xmlPatterns.forEach(pattern => {
    if (pattern.test(content)) {
      patternMatches++;
    }
  });

  return patternMatches >= 2;
}

/**
 * Count XML tag pairs and validate basic structure
 */
function analyzeXmlStructure(content: string): {
  isValid: boolean;
  tagCount: number;
  depth: number;
  hasDeclaration: boolean;
  hasDoctype: boolean;
} {
  const hasDeclaration = /^\s*<\?xml/i.test(content);
  const hasDoctype = /<!DOCTYPE/i.test(content);
  
  // Count tags (rough estimate)
  const openingTags = (content.match(/<[a-zA-Z][^>]*[^\/]>/g) || []).length;
  const closingTags = (content.match(/<\/[a-zA-Z][^>]*>/g) || []).length;
  const selfClosingTags = (content.match(/<[a-zA-Z][^>]*\/>/g) || []).length;
  
  const tagCount = openingTags + closingTags + selfClosingTags;
  
  // Rough validation: opening tags should match closing tags
  const isBalanced = openingTags === closingTags;
  
  // Estimate maximum depth
  let depth = 0;
  let currentDepth = 0;
  const tagMatches = content.match(/<\/?[a-zA-Z][^>]*\/?>/g) || [];
  
  for (const tag of tagMatches) {
    if (tag.startsWith('</')) {
      currentDepth--;
    } else if (!tag.endsWith('/>')) {
      currentDepth++;
      depth = Math.max(depth, currentDepth);
    }
  }

  return {
    isValid: isBalanced && tagCount > 0,
    tagCount,
    depth,
    hasDeclaration,
    hasDoctype,
  };
}

/**
 * Get attributes string for XML element
 */
function getAttributesString(element: Element, options: XmlFormatOptions = {}): string {
  const attributes = Array.from(element.attributes);
  if (attributes.length === 0) {
    return '';
  }

  let attrs = attributes;
  if (options.sortAttributes) {
    attrs = attrs.sort((a, b) => a.name.localeCompare(b.name));
  }

  return ' ' + attrs
    .map(attr => `${attr.name}="${attr.value}"`)
    .join(' ');
}

/**
 * Format XML node with indentation
 */
function formatXmlNode(node: Node, indent: number, level: number = 0, options: XmlFormatOptions = {}): string {
  const indentStr = ' '.repeat(indent);
  const currentIndent = indentStr.repeat(level);
  const nextIndent = indentStr.repeat(level + 1);

  if (node.nodeType === Node.DOCUMENT_NODE) {
    return Array.from(node.childNodes)
      .map(child => formatXmlNode(child, indent, level, options))
      .join('');
  }

  if (node.nodeType === Node.ELEMENT_NODE) {
    const element = node as Element;
    const hasChildElements = Array.from(element.childNodes).some(
      child => child.nodeType === Node.ELEMENT_NODE
    );

    const hasTextContent = Array.from(element.childNodes).some(
      child => child.nodeType === Node.TEXT_NODE && child.textContent?.trim()
    );

    const attributesStr = getAttributesString(element, options);

    // Handle self-closing tags
    if (!hasChildElements && !hasTextContent) {
      if (options.selfClosingTags) {
        return `${currentIndent}<${element.tagName}${attributesStr}/>`;
      } else {
        return `${currentIndent}<${element.tagName}${attributesStr}></${element.tagName}>`;
      }
    }

    if (hasChildElements) {
      const children = Array.from(element.childNodes)
        .map(child => {
          if (child.nodeType === Node.ELEMENT_NODE) {
            return '\n' + formatXmlNode(child, indent, level + 1, options);
          } else if (child.nodeType === Node.TEXT_NODE) {
            const text = child.textContent?.trim();
            return text ? `\n${nextIndent}${text}` : '';
          }
          return '';
        })
        .filter(content => content.length > 0)
        .join('');

      return `${currentIndent}<${element.tagName}${attributesStr}>${children}\n${currentIndent}</${element.tagName}>`;
    } else {
      const textContent = element.textContent?.trim() || '';
      return `${currentIndent}<${element.tagName}${attributesStr}>${textContent}</${element.tagName}>`;
    }
  }

  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent?.trim();
    return text ? `${currentIndent}${text}` : '';
  }

  if (node.nodeType === Node.COMMENT_NODE) {
    const comment = node.textContent || '';
    return `${currentIndent}<!--${comment}-->`;
  }

  if (node.nodeType === Node.PROCESSING_INSTRUCTION_NODE) {
    const pi = node as ProcessingInstruction;
    return `${currentIndent}<?${pi.target} ${pi.data}?>`;
  }

  return '';
}

// ============================================================================
// CONTENT DETECTION
// ============================================================================

/**
 * Detect if content is XML format
 */
function detectXmlContent(content: string): ContentDetectionResult {
  const trimmedContent = content.trim();
  
  if (!trimmedContent) {
    return { confidence: 0 };
  }

  let confidence = 0;
  const metadata: Record<string, unknown> = {};

  // Check for XML declaration
  if (/^\s*<\?xml/i.test(trimmedContent)) {
    confidence += 0.3;
    metadata.hasDeclaration = true;
  }

  // Check for DOCTYPE
  if (/<!DOCTYPE/i.test(trimmedContent)) {
    confidence += 0.2;
    metadata.hasDoctype = true;
  }

  // Check for basic XML structure
  if (hasXmlStructure(trimmedContent)) {
    confidence += 0.4;
  }

  // Try to parse as XML for definitive detection
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(trimmedContent, "text/xml");
    const parseError = xmlDoc.getElementsByTagName("parsererror");
    
    if (parseError.length === 0) {
      confidence = Math.max(confidence, 0.9);
      
      // Analyze structure
      const structure = analyzeXmlStructure(trimmedContent);
      metadata.tagCount = structure.tagCount;
      metadata.depth = structure.depth;
      metadata.hasDeclaration = structure.hasDeclaration;
      metadata.hasDoctype = structure.hasDoctype;
    } else {
      // Parsing failed, but still might be XML-like
      confidence = Math.min(confidence, 0.6);
    }
  } catch {
    confidence = Math.min(confidence, 0.5);
  }

  // Additional structure analysis
  if (confidence > 0) {
    metadata.lineCount = trimmedContent.split('\n').length;
    metadata.avgLineLength = trimmedContent.length / metadata.lineCount;
  }

  return {
    confidence,
    metadata,
  };
}

// ============================================================================
// FORMATTING FUNCTIONS
// ============================================================================

/**
 * Format XML with proper indentation
 */
function formatXml(content: string, options: XmlFormatOptions = {}): FormatResult {
  try {
    if (checkEmptyInput(content)) {
      return createEmptyInputFormatResult();
    }

    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(content, "text/xml");

    // Check for parsing errors
    const parseError = xmlDoc.getElementsByTagName("parsererror");
    if (parseError.length > 0) {
      const errorText = parseError[0].textContent || "Unknown XML parsing error";
      return {
        success: false,
        error: `Invalid XML: ${errorText}`,
      };
    }

    // Format XML with indentation
    const indent = options.indent ?? 2;
    const formatted = formatXmlNode(xmlDoc, indent, 0, options);

    return {
      success: true,
      output: formatted,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return {
      success: false,
      error: `XML formatting error: ${errorMessage}`,
    };
  }
}

/**
 * Validate XML syntax and structure
 */
function validateXml(content: string): ValidationResult {
  try {
    if (checkEmptyInput(content)) {
      return createEmptyInputValidationResult();
    }

    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(content, "text/xml");

    // Check for parsing errors
    const parseError = xmlDoc.getElementsByTagName("parsererror");
    if (parseError.length > 0) {
      const errorText = parseError[0].textContent || "Unknown XML parsing error";
      
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
 * Minify XML by removing unnecessary whitespace
 */
function minifyXml(content: string): FormatResult {
  try {
    if (checkEmptyInput(content)) {
      return createEmptyInputFormatResult();
    }

    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(content, "text/xml");

    // Check for parsing errors
    const parseError = xmlDoc.getElementsByTagName("parsererror");
    if (parseError.length > 0) {
      const errorText = parseError[0].textContent || "Unknown XML parsing error";
      return {
        success: false,
        error: `Invalid XML: ${errorText}`,
      };
    }

    // Minify by removing unnecessary whitespace
    const serializer = new XMLSerializer();
    let minified = serializer.serializeToString(xmlDoc);
    
    // Remove whitespace between tags while preserving content
    minified = minified
      .replace(/>\s+</g, '><')
      .replace(/^\s+|\s+$/g, '');

    return {
      success: true,
      output: minified,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return {
      success: false,
      error: `XML minification error: ${errorMessage}`,
    };
  }
}

// ============================================================================
// FORMATTER DEFINITION
// ============================================================================

/**
 * XML Formatter Definition
 */
export const xmlFormatter: FormatterDefinition = {
  id: "xml",
  name: "XML",
  extensions: [".xml", ".xsd", ".xsl", ".xslt", ".rss", ".atom", ".svg"],
  mimeTypes: [
    "application/xml",
    "text/xml",
    "application/rss+xml",
    "application/atom+xml",
    "image/svg+xml",
  ],
  detectContent: detectXmlContent,
  format: formatXml,
  validate: validateXml,
  minify: minifyXml,
  icon: FileText,
  category: "markup",
  supportsMinify: true,
  supportsTableView: false,
  config: {
    maxInputSize: 20 * 1024 * 1024, // 20MB
    defaultOptions: {
      indent: 2,
      preserveWhitespace: false,
      sortAttributes: false,
      selfClosingTags: true,
    },
    performance: {
      enableChunking: false, // XML needs to be parsed as a whole
      enableWorker: true,
    },
  },
};