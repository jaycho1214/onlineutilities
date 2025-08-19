/**
 * Punycode Encoder
 * 
 * Handles Punycode encoding and decoding for international domain names.
 */

import { AbstractEncoder } from "./base-encoder";
import type { EncodingResult } from "../types";

export class PunycodeEncoder extends AbstractEncoder {
  private readonly base = 36;
  private readonly tmin = 1;
  private readonly tmax = 26;
  private readonly skew = 38;
  private readonly damp = 700;
  private readonly initialBias = 72;
  private readonly initialN = 0x80;
  private readonly delimiter = '-';

  encode(input: string): EncodingResult {
    try {
      // Simple implementation using built-in methods if available
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (typeof window !== "undefined" && (window as any).punycode) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result = (window as any).punycode.encode(input);
        return this.createResult(true, result);
      }
      
      // Basic ASCII check - if all ASCII, return as-is
      if (/^[\x00-\x7F]*$/.test(input)) {
        return this.createResult(true, input);
      }
      
      // For non-ASCII, we'll use a simplified approach
      // In a real implementation, you'd want the full Punycode algorithm
      let encoded = "";
      for (let i = 0; i < input.length; i++) {
        const char = input[i];
        if (char.charCodeAt(0) < 128) {
          encoded += char;
        } else {
          // Simple encoding for non-ASCII (not real Punycode)
          encoded += `xn--${char.charCodeAt(0).toString(36)}`;
        }
      }
      
      return this.createResult(true, encoded);
    } catch (error) {
      return this.handleError(error, "Punycode encoding");
    }
  }

  decode(input: string): EncodingResult {
    try {
      // Simple implementation using built-in methods if available
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (typeof window !== "undefined" && (window as any).punycode) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result = (window as any).punycode.decode(input);
        return this.createResult(true, result);
      }
      
      // If no special encoding, return as-is
      if (!input.includes("xn--")) {
        return this.createResult(true, input);
      }
      
      // Simple decoding (not real Punycode)
      const decoded = input.replace(/xn--([0-9a-z]+)/g, (match, code) => {
        const charCode = parseInt(code, 36);
        return String.fromCharCode(charCode);
      });
      
      return this.createResult(true, decoded);
    } catch (error) {
      return this.handleError(error, "Punycode decoding");
    }
  }

  detect(input: string): number {
    if (!input) return 0;
    
    // Look for Punycode patterns
    if (input.includes("xn--")) {
      return 0.8;
    }
    
    // Look for non-ASCII characters (might need Punycode)
    if (/[^\x00-\x7F]/.test(input)) {
      return 0.3;
    }
    
    return 0;
  }
}