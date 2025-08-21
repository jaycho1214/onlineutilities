/**
 * Base32 Encoder
 *
 * Handles Base32 encoding and decoding.
 */

import { AbstractEncoder } from "./base-encoder";
import type { EncodingResult } from "../types";

export class Base32Encoder extends AbstractEncoder {
  private readonly alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

  encode(input: string): EncodingResult {
    try {
      const bytes = new TextEncoder().encode(input);
      let result = "";
      let buffer = 0;
      let bitsLeft = 0;

      for (const byte of bytes) {
        buffer = (buffer << 8) | byte;
        bitsLeft += 8;

        while (bitsLeft >= 5) {
          const index = (buffer >> (bitsLeft - 5)) & 0x1f;
          result += this.alphabet[index];
          bitsLeft -= 5;
        }
      }

      if (bitsLeft > 0) {
        const index = (buffer << (5 - bitsLeft)) & 0x1f;
        result += this.alphabet[index];
      }

      // Add padding
      while (result.length % 8 !== 0) {
        result += "=";
      }

      return this.createResult(true, result);
    } catch (error) {
      return this.handleError(error, "Base32 encoding");
    }
  }

  decode(input: string): EncodingResult {
    try {
      // Clean and validate input
      const cleaned = input.replace(/\s/g, "").toUpperCase();

      if (!/^[A-Z2-7=]*$/.test(cleaned)) {
        return this.createResult(false, undefined, "Invalid Base32 characters");
      }

      // Remove padding
      const noPadding = cleaned.replace(/=+$/, "");

      let buffer = 0;
      let bitsLeft = 0;
      const bytes: number[] = [];

      for (const char of noPadding) {
        const index = this.alphabet.indexOf(char);
        if (index === -1) {
          return this.createResult(
            false,
            undefined,
            `Invalid Base32 character: ${char}`,
          );
        }

        buffer = (buffer << 5) | index;
        bitsLeft += 5;

        if (bitsLeft >= 8) {
          bytes.push((buffer >> (bitsLeft - 8)) & 0xff);
          bitsLeft -= 8;
        }
      }

      const result = new TextDecoder().decode(new Uint8Array(bytes));
      return this.createResult(true, result);
    } catch (error) {
      return this.handleError(error, "Base32 decoding");
    }
  }

  detect(input: string): number {
    if (!input) return 0;

    const cleaned = input.replace(/\s/g, "").toUpperCase();

    // Check Base32 alphabet
    if (!/^[A-Z2-7=]*$/.test(cleaned)) return 0;

    // Should be multiple of 8 with proper padding
    if (cleaned.length % 8 !== 0) return 0;

    // Check padding (should only be at the end)
    const paddingMatch = cleaned.match(/=*$/);
    const paddingLength = paddingMatch ? paddingMatch[0].length : 0;

    if (paddingLength > 6) return 0; // Max 6 padding chars in Base32

    let confidence = 0.6;

    // Higher confidence with proper padding
    if (paddingLength > 0 && paddingLength <= 6) {
      confidence += 0.2;
    }

    // Check character distribution
    const noPadding = cleaned.replace(/=+$/, "");
    const uniqueChars = new Set(noPadding).size;
    if (uniqueChars > noPadding.length * 0.2) {
      confidence += 0.2;
    }

    return Math.min(confidence, 1);
  }
}
