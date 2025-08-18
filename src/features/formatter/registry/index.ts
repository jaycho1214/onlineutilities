/**
 * Formatter Registry Initialization
 *
 * This module initializes the formatter registry with all available formatters.
 * It provides a centralized place to configure which formatters are enabled.
 */

import { formatterRegistry } from "./formatter-registry";

// Import all formatter implementations
import { jsonFormatter } from "../formatters/json-formatter";
import { csvFormatter } from "../formatters/csv-formatter";
import { xmlFormatter } from "../formatters/xml-formatter";

// Future formatters (ready for implementation)
import { javascriptFormatter } from "../formatters/javascript-formatter";
import { htmlFormatter } from "../formatters/html-formatter";
import { yamlFormatter } from "../formatters/yaml-formatter";

// ============================================================================
// FORMATTER CONFIGURATION
// ============================================================================

/**
 * Configuration for which formatters are currently enabled
 *
 * Enable future formatters by setting their enabled flag to true
 */
const FORMATTER_CONFIG = {
  // Currently active formatters
  json: { enabled: true },
  csv: { enabled: true },
  xml: { enabled: true },

  // Additional formatters
  javascript: { enabled: true },
  html: { enabled: true },
  yaml: { enabled: true },
} as const;

// ============================================================================
// REGISTRY INITIALIZATION
// ============================================================================

/**
 * Initialize the formatter registry with all enabled formatters
 */
export function initializeFormatterRegistry(): void {
  // Register currently active formatters
  if (FORMATTER_CONFIG.json.enabled) {
    formatterRegistry.register(jsonFormatter);
  }

  if (FORMATTER_CONFIG.csv.enabled) {
    formatterRegistry.register(csvFormatter);
  }

  if (FORMATTER_CONFIG.xml.enabled) {
    formatterRegistry.register(xmlFormatter);
  }

  // Register future formatters when enabled
  if (FORMATTER_CONFIG.javascript.enabled) {
    formatterRegistry.register(javascriptFormatter);
  }

  if (FORMATTER_CONFIG.html.enabled) {
    formatterRegistry.register(htmlFormatter);
  }

  if (FORMATTER_CONFIG.yaml.enabled) {
    formatterRegistry.register(yamlFormatter);
  }
}

/**
 * Get the list of enabled formatter IDs
 */
export function getEnabledFormatterIds(): string[] {
  return formatterRegistry.getAllFormatters().map((formatter) => formatter.id);
}

/**
 * Check if a specific formatter is enabled
 */
export function isFormatterEnabled(formatterId: string): boolean {
  return formatterRegistry.getFormatter(formatterId) !== undefined;
}

/**
 * Get formatter configuration
 */
export function getFormatterConfig() {
  return FORMATTER_CONFIG;
}

// ============================================================================
// EXPORTED REGISTRY
// ============================================================================

// Initialize the registry when this module is imported
initializeFormatterRegistry();

// Export the configured registry instance
export { formatterRegistry };

// Export types
export type {
  FormatterDefinition,
  ContentDetectionResult,
  FormatDetectionResult,
  FormatOptions,
  FormatterCategory,
  FormatterConfig,
} from "./formatter-registry";
