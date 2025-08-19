/**
 * Type definitions for the Random Generator feature
 */

// ============================================================================
// CORE TYPES
// ============================================================================

/**
 * Random generator types supported by the application
 */
export type GeneratorType =
  | "password"
  | "number"
  | "uuid"
  | "nanoid"
  | "cuid"
  | "string"
  | "boolean"
  | "color"
  | "date";

/**
 * Password strength levels
 */
export type PasswordStrength =
  | "weak"
  | "fair"
  | "good"
  | "strong"
  | "veryStrong";

/**
 * Number types for number generator
 */
export type NumberType = "integer" | "float";

/**
 * Character set types for string generator
 */
export type CharsetType =
  | "alphanumeric"
  | "alphabetic"
  | "numeric"
  | "lowercase"
  | "uppercase"
  | "symbols"
  | "custom";

/**
 * Boolean output formats
 */
export type BooleanFormat = "boolean" | "binary" | "yesno";

/**
 * Color formats
 */
export type ColorFormat = "hex" | "rgb" | "hsl" | "hsv";

/**
 * Date formats
 */
export type DateFormat = "iso" | "us" | "european" | "timestamp" | "custom";

/**
 * Nanoid alphabet presets
 */
export type NanoidPreset =
  | "default"
  | "alphanumeric"
  | "numbers"
  | "lowercase"
  | "uppercase";

// ============================================================================
// CONFIGURATION INTERFACES
// ============================================================================

/**
 * Base configuration interface for all generators
 */
export interface BaseGeneratorConfig {
  count: number;
}

/**
 * Password generator configuration
 */
export interface PasswordConfig extends BaseGeneratorConfig {
  length: number;
  includeUppercase: boolean;
  includeLowercase: boolean;
  includeNumbers: boolean;
  includeSymbols: boolean;
  excludeSimilar: boolean;
  excludeAmbiguous: boolean;
  customCharacters: string;
}

/**
 * Number generator configuration
 */
export interface NumberConfig extends BaseGeneratorConfig {
  type: NumberType;
  min: number;
  max: number;
  decimalPlaces: number;
  unique: boolean;
  sorted: boolean;
}

/**
 * UUID generator configuration
 */
export interface UuidConfig extends BaseGeneratorConfig {
  version: number;
  uppercase: boolean;
  hyphenated: boolean;
}

/**
 * Nanoid generator configuration
 */
export interface NanoidConfig extends BaseGeneratorConfig {
  length: number;
  alphabet: string;
  preset: NanoidPreset;
}

/**
 * CUID generator configuration
 */
export interface CuidConfig extends BaseGeneratorConfig {
  version: "cuid" | "cuid2";
  fingerprint?: string;
}

/**
 * String generator configuration
 */
export interface StringConfig extends BaseGeneratorConfig {
  length: number;
  charset: CharsetType;
  customCharset: string;
  pattern: string;
  usePattern: boolean;
}

/**
 * Boolean generator configuration
 */
export interface BooleanConfig extends BaseGeneratorConfig {
  probability: number;
  format: BooleanFormat;
}

/**
 * Color generator configuration
 */
export interface ColorConfig extends BaseGeneratorConfig {
  format: ColorFormat;
  hueRange: [number, number];
  saturationRange: [number, number];
  lightnessRange: [number, number];
}

/**
 * Date generator configuration
 */
export interface DateConfig extends BaseGeneratorConfig {
  startDate: string;
  endDate: string;
  format: DateFormat;
  customFormat: string;
}

/**
 * Union type for all generator configurations
 */
export type GeneratorConfig =
  | PasswordConfig
  | NumberConfig
  | UuidConfig
  | NanoidConfig
  | CuidConfig
  | StringConfig
  | BooleanConfig
  | ColorConfig
  | DateConfig;

// ============================================================================
// RESULT INTERFACES
// ============================================================================

/**
 * Password generation result with strength analysis
 */
export interface PasswordResult {
  password: string;
  strength: PasswordStrength;
  score: number;
  entropy: number;
}

/**
 * Generic generation result
 */
export interface GenerationResult {
  values: string[];
  type: GeneratorType;
  config: GeneratorConfig;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

// ============================================================================
// UI STATE INTERFACES
// ============================================================================

/**
 * Generator UI state
 */
export interface GeneratorState {
  activeType: GeneratorType;
  isGenerating: boolean;
  lastResults: string[];
  error: string | null;
}

/**
 * Generator form validation errors
 */
export interface ValidationErrors {
  [key: string]: string | undefined;
}

// ============================================================================
// PRESET AND HISTORY INTERFACES
// ============================================================================

/**
 * Generator preset (re-exported from database types)
 */
export interface GeneratorPreset {
  id: string;
  name: string;
  type: GeneratorType;
  config: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

/**
 * Generation history entry (re-exported from database types)
 */
export interface GenerationEntry {
  id: string;
  type: GeneratorType;
  config: Record<string, unknown>;
  results: string[];
  createdAt: string;
}

/**
 * Generator settings (re-exported from database types)
 */
export interface GeneratorSettings {
  id: string;
  autoCopy: boolean;
  showStrength: boolean;
  saveHistory: boolean;
  updatedAt: string;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Type guard function type
 */
export type TypeGuard<T> = (value: unknown) => value is T;

/**
 * Generator function type
 */
export type GeneratorFunction<T extends GeneratorConfig> = (
  config: T,
) => Promise<string[]>;

/**
 * Validator function type
 */
export type ValidatorFunction<T> = (value: T) => ValidationErrors;

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Default configurations for each generator type
 */
export const DEFAULT_CONFIGS: Record<GeneratorType, GeneratorConfig> = {
  password: {
    count: 1,
    length: 16,
    includeUppercase: true,
    includeLowercase: true,
    includeNumbers: true,
    includeSymbols: true,
    excludeSimilar: false,
    excludeAmbiguous: false,
    customCharacters: "",
  },
  number: {
    count: 1,
    type: "integer",
    min: 1,
    max: 100,
    decimalPlaces: 2,
    unique: false,
    sorted: false,
  },
  uuid: {
    count: 1,
    version: 4,
    uppercase: false,
    hyphenated: true,
  },
  nanoid: {
    count: 1,
    length: 21,
    alphabet: "",
    preset: "default",
  },
  cuid: {
    count: 1,
    version: "cuid2",
    fingerprint: "",
  },
  string: {
    count: 1,
    length: 10,
    charset: "alphanumeric",
    customCharset: "",
    pattern: "",
    usePattern: false,
  },
  boolean: {
    count: 1,
    probability: 50,
    format: "boolean",
  },
  color: {
    count: 1,
    format: "hex",
    hueRange: [0, 360],
    saturationRange: [0, 100],
    lightnessRange: [0, 100],
  },
  date: {
    count: 1,
    startDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0], // 1 year ago
    endDate: new Date().toISOString().split("T")[0], // today
    format: "iso",
    customFormat: "YYYY-MM-DD",
  },
};

/**
 * Character sets for password and string generation
 */
export const CHARACTER_SETS = {
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  numbers: "0123456789",
  symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?",
  similar: "0Ol1I",
  ambiguous: "{}[]()\/\\~,;.<>",
} as const;

/**
 * Nanoid alphabet presets
 */
export const NANOID_ALPHABETS: Record<NanoidPreset, string> = {
  default: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-",
  alphanumeric:
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
  numbers: "0123456789",
  lowercase: "abcdefghijklmnopqrstuvwxyz0123456789",
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
} as const;
