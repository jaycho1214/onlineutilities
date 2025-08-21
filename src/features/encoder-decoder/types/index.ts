/**
 * Encoder/Decoder Types
 *
 * Type definitions for the encoder/decoder feature.
 */

// Core encoding types
export type EncodingType =
  // Basic encodings
  | "base64"
  | "url"
  | "html-entity"
  | "hex"
  | "base32"
  | "ascii"
  | "binary"
  | "unicode-escape"
  | "punycode"
  | "base58"
  | "rot13"
  | "morse-code"
  // Web-specific encodings
  | "uri-component"
  | "form-data"
  | "cookie";

export type Operation = "encode" | "decode";

export interface EncoderDecoderEntryModel {
  id: string;
  type: EncodingType;
  input: string;
  output: string;
  operation: Operation;
  createdAt: string;
  updatedAt?: string;
  isValid: boolean;
  error?: string;
}

// Backward compatibility type
export type EncoderDecoderEntry = EncoderDecoderEntryModel;

export interface EncodingConfig {
  id: EncodingType;
  name: string;
  description: string;
  category: string;
  supportsEncode: boolean;
  supportsDecode: boolean;
  examples?: {
    input: string;
    encoded?: string;
    decoded?: string;
  };
}

export interface DetectionResult {
  type: EncodingType;
  confidence: number;
  reason: string;
}

export interface EncoderDecoderState {
  type: EncodingType;
  operation: Operation;
  input: string;
  output: string;
  isValid: boolean;
  error: string | null;
  isProcessing: boolean;
  autoConvert: boolean;
  saveHistory: boolean;
  sizeLimitExceeded: boolean;
  dragDrop: {
    isDragOver: boolean;
  };
}

export interface EncodingResult {
  success: boolean;
  result?: string;
  error?: string;
}

// Configuration constants
export const MAX_INPUT_SIZE = 1024 * 1024; // 1MB limit for auto-conversion
export const DETECTION_SAMPLE_SIZE = 1000; // First 1000 chars for detection
