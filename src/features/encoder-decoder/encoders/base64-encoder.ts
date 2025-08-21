/**
 * Base64 Encoder
 *
 * Handles Base64 encoding and decoding.
 */

import { AbstractEncoder } from "./base-encoder";
import type { EncodingResult } from "../types";

export class Base64Encoder extends AbstractEncoder {
  encode(input: string): EncodingResult {
    try {
      // Use btoa for browser environments or Buffer for Node.js
      const encoded =
        typeof window !== "undefined"
          ? btoa(unescape(encodeURIComponent(input)))
          : Buffer.from(input, "utf8").toString("base64");

      return this.createResult(true, encoded);
    } catch (error) {
      return this.handleError(error, "Base64 encoding");
    }
  }

  decode(input: string): EncodingResult {
    try {
      // Clean up input - remove whitespace and validate characters
      const cleaned = input.replace(/\s/g, "");

      if (!/^[A-Za-z0-9+/]*={0,2}$/.test(cleaned)) {
        return this.createResult(false, undefined, "Invalid Base64 characters");
      }

      // Use atob for browser environments or Buffer for Node.js
      const decoded =
        typeof window !== "undefined"
          ? decodeURIComponent(escape(atob(cleaned)))
          : Buffer.from(cleaned, "base64").toString("utf8");

      return this.createResult(true, decoded);
    } catch (error) {
      return this.handleError(error, "Base64 decoding");
    }
  }

  detect(input: string): number {
    // Clean input
    const cleaned = input.replace(/\s/g, "");

    if (cleaned.length === 0) return 0;

    // Base64 should be multiple of 4 characters (with padding)
    if (cleaned.length % 4 !== 0) return 0;

    // Should only contain Base64 characters
    if (!/^[A-Za-z0-9+/]*={0,2}$/.test(cleaned)) return 0;

    // Higher confidence if it has typical Base64 characteristics
    let confidence = 0.6;

    // Check for padding
    if (cleaned.endsWith("=") || cleaned.endsWith("==")) {
      confidence += 0.2;
    }

    // Check character distribution (Base64 typically has good distribution)
    const chars = cleaned.replace(/=/g, "");
    const uniqueChars = new Set(chars).size;
    if (uniqueChars > chars.length * 0.3) {
      confidence += 0.2;
    }

    return Math.min(confidence, 1);
  }
}
