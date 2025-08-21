/**
 * Base58 Encoder
 *
 * Handles Base58 encoding and decoding (used in cryptocurrency addresses).
 */

import { AbstractEncoder } from "./base-encoder";
import type { EncodingResult } from "../types";

export class Base58Encoder extends AbstractEncoder {
  private readonly alphabet =
    "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

  encode(input: string): EncodingResult {
    try {
      if (!input) return this.createResult(true, "");

      // Convert string to bytes
      const bytes = new TextEncoder().encode(input);

      // Count leading zeros
      let leadingZeros = 0;
      for (let i = 0; i < bytes.length && bytes[i] === 0; i++) {
        leadingZeros++;
      }

      // Convert to base 58
      const digits: number[] = [];
      for (const byte of bytes) {
        let carry = byte;
        for (let i = 0; i < digits.length; i++) {
          carry += digits[i] * 256;
          digits[i] = carry % 58;
          carry = Math.floor(carry / 58);
        }
        while (carry > 0) {
          digits.push(carry % 58);
          carry = Math.floor(carry / 58);
        }
      }

      // Convert to string
      let result = "";

      // Add leading ones for leading zeros
      for (let i = 0; i < leadingZeros; i++) {
        result += "1";
      }

      // Add digits in reverse order
      for (let i = digits.length - 1; i >= 0; i--) {
        result += this.alphabet[digits[i]];
      }

      return this.createResult(true, result);
    } catch (error) {
      return this.handleError(error, "Base58 encoding");
    }
  }

  decode(input: string): EncodingResult {
    try {
      if (!input) return this.createResult(true, "");

      // Validate input
      for (const char of input) {
        if (this.alphabet.indexOf(char) === -1) {
          return this.createResult(
            false,
            undefined,
            `Invalid Base58 character: ${char}`,
          );
        }
      }

      // Count leading ones
      let leadingOnes = 0;
      for (let i = 0; i < input.length && input[i] === "1"; i++) {
        leadingOnes++;
      }

      // Convert from base 58
      const bytes: number[] = [];
      for (const char of input) {
        const value = this.alphabet.indexOf(char);
        let carry = value;

        for (let i = 0; i < bytes.length; i++) {
          carry += bytes[i] * 58;
          bytes[i] = carry % 256;
          carry = Math.floor(carry / 256);
        }

        while (carry > 0) {
          bytes.push(carry % 256);
          carry = Math.floor(carry / 256);
        }
      }

      // Add leading zeros
      const result: number[] = [];
      for (let i = 0; i < leadingOnes; i++) {
        result.push(0);
      }

      // Add bytes in reverse order
      for (let i = bytes.length - 1; i >= 0; i--) {
        result.push(bytes[i]);
      }

      // Convert to string
      const decoded = new TextDecoder().decode(new Uint8Array(result));
      return this.createResult(true, decoded);
    } catch (error) {
      return this.handleError(error, "Base58 decoding");
    }
  }

  detect(input: string): number {
    if (!input) return 0;

    // Check if all characters are in Base58 alphabet
    for (const char of input) {
      if (this.alphabet.indexOf(char) === -1) {
        return 0;
      }
    }

    // Base58 typically starts with '1' for Bitcoin addresses
    let confidence = 0.6;

    if (
      input.startsWith("1") ||
      input.startsWith("3") ||
      input.startsWith("bc1")
    ) {
      confidence = 0.9; // Very likely Bitcoin address
    }

    // Length check - Bitcoin addresses are typically 25-34 characters
    if (input.length >= 25 && input.length <= 34) {
      confidence += 0.1;
    }

    return Math.min(confidence, 1);
  }
}
