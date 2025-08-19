/**
 * Unicode Escape Encoder
 * 
 * Handles Unicode escape encoding and decoding (\u sequences).
 */

import { AbstractEncoder } from "./base-encoder";
import type { EncodingResult } from "../types";

export class UnicodeEscapeEncoder extends AbstractEncoder {
  encode(input: string): EncodingResult {
    try {
      let encoded = "";
      for (let i = 0; i < input.length; i++) {
        const char = input[i];
        const code = char.charCodeAt(0);
        
        // Only escape non-ASCII characters
        if (code > 127) {
          encoded += "\\u" + code.toString(16).padStart(4, "0");
        } else {
          encoded += char;
        }
      }
      return this.createResult(true, encoded);
    } catch (error) {
      return this.handleError(error, "Unicode escape encoding");
    }
  }

  decode(input: string): EncodingResult {
    try {
      // Replace \\uXXXX sequences
      const decoded = input.replace(/\\u([0-9A-Fa-f]{4})/g, (match, hex) => {
        const code = parseInt(hex, 16);
        return String.fromCharCode(code);
      });
      
      return this.createResult(true, decoded);
    } catch (error) {
      return this.handleError(error, "Unicode escape decoding");
    }
  }

  detect(input: string): number {
    if (!input) return 0;
    
    // Look for \\uXXXX patterns
    const unicodeEscapes = input.match(/\\u[0-9A-Fa-f]{4}/g) || [];
    
    if (unicodeEscapes.length === 0) return 0;
    
    // Calculate confidence based on number of escapes
    const totalLength = input.length;
    const escapeRatio = (unicodeEscapes.length * 6) / totalLength; // Each \\uXXXX is 6 chars
    
    let confidence = Math.min(escapeRatio * 3, 0.9);
    
    // Higher confidence if mixed with regular ASCII
    const hasRegularText = /[a-zA-Z0-9\s]/.test(input.replace(/\\u[0-9A-Fa-f]{4}/g, ""));
    if (hasRegularText && unicodeEscapes.length > 0) {
      confidence += 0.1;
    }
    
    return Math.min(confidence, 1);
  }
}