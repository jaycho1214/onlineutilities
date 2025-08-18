/**
 * HTML Formatter Implementation
 *
 * This module provides HTML formatting, validation, and minification functionality
 * using the modular formatter system architecture.
 *
 * Note: This is a preparatory implementation for future expansion.
 */

import { Globe } from "lucide-react";
import type {
  FormatterDefinition,
  ContentDetectionResult,
  FormatOptions,
} from "../registry/formatter-registry";
import type { ValidationResult, FormatResult } from "../types";
import {
  checkEmptyInput,
  createEmptyInputFormatResult,
  createEmptyInputValidationResult,
} from "../lib/common-constants";

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

interface HtmlFormatOptions extends FormatOptions {
  preserveNewlines?: boolean;
  sortAttributes?: boolean;
  removeComments?: boolean;
  lowercaseTags?: boolean;
}

// ============================================================================
// CONTENT DETECTION
// ============================================================================

/**
 * Detect if content is HTML format
 */
function detectHtmlContent(content: string): ContentDetectionResult {
  const trimmedContent = content.trim();

  if (!trimmedContent) {
    return { confidence: 0 };
  }

  let confidence = 0;
  const metadata: Record<string, unknown> = {};

  // HTML-specific patterns
  const htmlPatterns = [
    /<!DOCTYPE\s+html/i, // HTML5 doctype
    /<!DOCTYPE\s+HTML\s+PUBLIC/i, // HTML4 doctype
    /<html[^>]*>/i, // HTML tag
    /<head[^>]*>/i, // Head tag
    /<body[^>]*>/i, // Body tag
    /<title[^>]*>/i, // Title tag
    /<meta[^>]*>/i, // Meta tags
    /<link[^>]*>/i, // Link tags
    /<script[^>]*>/i, // Script tags
    /<style[^>]*>/i, // Style tags
    /<div[^>]*>/i, // Div tags
    /<p[^>]*>/i, // Paragraph tags
    /<h[1-6][^>]*>/i, // Heading tags
    /<a[^>]*href=/i, // Anchor tags with href
    /<img[^>]*src=/i, // Image tags with src
  ];

  let patternMatches = 0;
  htmlPatterns.forEach((pattern) => {
    if (pattern.test(trimmedContent)) {
      patternMatches++;
    }
  });

  // Check for DOCTYPE
  if (/<!DOCTYPE/i.test(trimmedContent)) {
    confidence += 0.3;
    metadata.hasDoctype = true;
  }

  // Check for HTML structure
  if (/<html[^>]*>/i.test(trimmedContent)) {
    confidence += 0.3;
    metadata.hasHtmlTag = true;
  }

  // Check for head and body
  if (
    /<head[^>]*>/i.test(trimmedContent) &&
    /<body[^>]*>/i.test(trimmedContent)
  ) {
    confidence += 0.3;
    metadata.hasStructure = true;
  }

  // Calculate confidence based on pattern matches
  if (patternMatches >= 4) {
    confidence = Math.max(confidence, 0.9);
  } else if (patternMatches >= 2) {
    confidence = Math.max(confidence, 0.7);
  } else if (patternMatches >= 1) {
    confidence = Math.max(confidence, 0.5);
  }

  // Basic HTML validation
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(trimmedContent, "text/html");
    const parseError = doc.querySelector("parsererror");

    if (!parseError) {
      confidence = Math.max(confidence, 0.8);
    }
  } catch {
    confidence = Math.min(confidence, 0.6);
  }

  // Additional metadata
  const lines = trimmedContent.split("\n");
  metadata.lineCount = lines.length;
  metadata.avgLineLength = trimmedContent.length / lines.length;
  metadata.hasComments = /<!--[\s\S]*?-->/.test(trimmedContent);

  return {
    confidence,
    metadata,
  };
}

// ============================================================================
// FORMATTING FUNCTIONS
// ============================================================================

/**
 * Format HTML with proper indentation
 */
function formatHtml(
  content: string,
  options: HtmlFormatOptions = {},
): FormatResult {
  try {
    if (checkEmptyInput(content)) {
      return createEmptyInputFormatResult();
    }

    // Basic HTML formatting
    const indent = " ".repeat(options.indent ?? 2);
    let formatted = content;

    // Normalize whitespace
    formatted = formatted.replace(/>\s+</g, "><");

    // Add line breaks and indentation
    let indentLevel = 0;
    const lines: string[] = [];
    const tokens = formatted.split(/(<[^>]+>)/);

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i].trim();
      if (!token) continue;

      if (token.startsWith("</")) {
        // Closing tag
        indentLevel = Math.max(0, indentLevel - 1);
        lines.push(indent.repeat(indentLevel) + token);
      } else if (
        token.startsWith("<") &&
        !token.endsWith("/>") &&
        !isSelfClosingTag(token)
      ) {
        // Opening tag
        lines.push(indent.repeat(indentLevel) + token);
        if (!isInlineTag(token)) {
          indentLevel++;
        }
      } else if (token.startsWith("<")) {
        // Self-closing or inline tag
        lines.push(indent.repeat(indentLevel) + token);
      } else {
        // Text content
        if (token.length > 0) {
          lines.push(indent.repeat(indentLevel) + token);
        }
      }
    }

    return {
      success: true,
      output: lines.join("\n"),
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "errors.unknown";
    return {
      success: false,
      error: `HTML formatting error: ${errorMessage}`,
    };
  }
}

/**
 * Validate HTML syntax and structure
 */
function validateHtml(content: string): ValidationResult {
  try {
    if (checkEmptyInput(content)) {
      return createEmptyInputValidationResult();
    }

    // Use DOMParser to validate HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, "text/html");
    const parseError = doc.querySelector("parsererror");

    if (parseError) {
      return {
        isValid: false,
        error: {
          message: parseError.textContent || "HTML parsing error",
        },
      };
    }

    // Additional validation checks
    const openTags = (content.match(/<[^\/!][^>]*[^\/]>/g) || []).length;
    const closeTags = (content.match(/<\/[^>]+>/g) || []).length;
    const selfClosingTags = (content.match(/<[^>]+\/>/g) || []).length;

    // Basic balance check (simplified)
    if (openTags > closeTags + selfClosingTags + 10) {
      // Allow some leeway for void elements
      return {
        isValid: false,
        error: {
          message: "errors.htmlUnbalancedTags",
        },
      };
    }

    return { isValid: true };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Invalid HTML";
    return {
      isValid: false,
      error: {
        message: errorMessage,
      },
    };
  }
}

/**
 * Minify HTML by removing unnecessary whitespace and comments
 */
function minifyHtml(content: string): FormatResult {
  try {
    if (checkEmptyInput(content)) {
      return createEmptyInputFormatResult();
    }

    let minified = content;

    // Remove comments
    minified = minified.replace(/<!--[\s\S]*?-->/g, "");

    // Remove extra whitespace between tags
    minified = minified.replace(/>\s+</g, "><");

    // Remove leading/trailing whitespace
    minified = minified.replace(/^\s+|\s+$/g, "");

    // Normalize line breaks
    minified = minified.replace(/\n\s*/g, "");

    return {
      success: true,
      output: minified,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "errors.unknown";
    return {
      success: false,
      error: `HTML minification error: ${errorMessage}`,
    };
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Check if a tag is self-closing
 */
function isSelfClosingTag(tag: string): boolean {
  const selfClosingTags = [
    "area",
    "base",
    "br",
    "col",
    "embed",
    "hr",
    "img",
    "input",
    "link",
    "meta",
    "param",
    "source",
    "track",
    "wbr",
  ];

  const tagName = tag.match(/<(\w+)/)?.[1]?.toLowerCase();
  return tagName ? selfClosingTags.includes(tagName) : false;
}

/**
 * Check if a tag is typically inline
 */
function isInlineTag(tag: string): boolean {
  const inlineTags = [
    "a",
    "abbr",
    "acronym",
    "b",
    "bdi",
    "bdo",
    "big",
    "br",
    "button",
    "cite",
    "code",
    "dfn",
    "em",
    "i",
    "img",
    "input",
    "kbd",
    "label",
    "map",
    "mark",
    "meter",
    "noscript",
    "object",
    "output",
    "progress",
    "q",
    "ruby",
    "s",
    "samp",
    "script",
    "select",
    "small",
    "span",
    "strong",
    "sub",
    "sup",
    "textarea",
    "time",
    "tt",
    "u",
    "var",
    "wbr",
  ];

  const tagName = tag.match(/<(\w+)/)?.[1]?.toLowerCase();
  return tagName ? inlineTags.includes(tagName) : false;
}

// ============================================================================
// FORMATTER DEFINITION
// ============================================================================

/**
 * HTML Formatter Definition
 */
export const htmlFormatter: FormatterDefinition = {
  id: "html",
  name: "HTML",
  extensions: [".html", ".htm", ".xhtml"],
  mimeTypes: ["text/html", "application/xhtml+xml"],
  detectContent: detectHtmlContent,
  format: formatHtml,
  validate: validateHtml,
  minify: minifyHtml,
  icon: Globe,
  category: "markup",
  supportsMinify: true,
  supportsTableView: false,
  config: {
    maxInputSize: 10 * 1024 * 1024, // 10MB
    defaultOptions: {
      indent: 2,
      preserveNewlines: false,
      sortAttributes: false,
      removeComments: false,
      lowercaseTags: false,
    },
    performance: {
      enableChunking: false,
      enableWorker: true,
    },
  },
};
