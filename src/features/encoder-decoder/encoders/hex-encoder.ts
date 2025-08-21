/**
 * Hex Encoder
 *
 * Handles hexadecimal encoding and decoding.
 */

import { AbstractEncoder } from "./base-encoder";
import type { EncodingResult } from "../types";

export class HexEncoder extends AbstractEncoder {
  encode(input: string): EncodingResult {
    try {
      let encoded = "";
      for (let i = 0; i < input.length; i++) {
        const hex = input.charCodeAt(i).toString(16).padStart(2, "0");
        encoded += hex;
      }
      return this.createResult(true, encoded);
    } catch (error) {
      return this.handleError(error, "Hex encoding");
    }
  }

  decode(input: string): EncodingResult {
    try {
      // Remove any whitespace and make lowercase
      const cleaned = input.replace(/\s/g, "").toLowerCase();

      // Validate hex characters
      if (!/^[0-9a-f]*$/.test(cleaned)) {
        return this.createResult(
          false,
          undefined,
          "Invalid hexadecimal characters",
        );
      }

      // Must be even length
      if (cleaned.length % 2 !== 0) {
        return this.createResult(
          false,
          undefined,
          "Hex string must have even length",
        );
      }

      let decoded = "";
      for (let i = 0; i < cleaned.length; i += 2) {
        const hex = cleaned.substring(i, i + 2);
        const charCode = parseInt(hex, 16);
        decoded += String.fromCharCode(charCode);
      }

      return this.createResult(true, decoded);
    } catch (error) {
      return this.handleError(error, "Hex decoding");
    }
  }

  detect(input: string): number {
    if (!input) return 0;

    // Remove whitespace for analysis
    const cleaned = input.replace(/\s/g, "");

    // Must be even length for hex
    if (cleaned.length % 2 !== 0) return 0;

    // Check if all characters are hex
    if (!/^[0-9A-Fa-f]*$/.test(cleaned)) return 0;

    // Higher confidence for longer strings that are all hex
    let confidence = 0.7;

    // Look for patterns that suggest hex encoding
    // Good distribution of digits and letters
    const hasDigits = /[0-9]/.test(cleaned);
    const hasLetters = /[A-Fa-f]/.test(cleaned);

    if (hasDigits && hasLetters) {
      confidence += 0.2;
    }

    // Very long hex strings are more likely to be encoded text
    if (cleaned.length > 20) {
      confidence += 0.1;
    }

    return Math.min(confidence, 1);
  }
}
