/**
 * Binary Encoder
 *
 * Handles binary encoding and decoding (text to binary representation).
 */

import { AbstractEncoder } from "./base-encoder";
import type { EncodingResult } from "../types";

export class BinaryEncoder extends AbstractEncoder {
  encode(input: string): EncodingResult {
    try {
      const binary: string[] = [];
      for (let i = 0; i < input.length; i++) {
        const binaryChar = input.charCodeAt(i).toString(2).padStart(8, "0");
        binary.push(binaryChar);
      }
      return this.createResult(true, binary.join(" "));
    } catch (error) {
      return this.handleError(error, "Binary encoding");
    }
  }

  decode(input: string): EncodingResult {
    try {
      // Clean input and split by whitespace
      const binaryGroups = input.trim().split(/\s+/);
      let decoded = "";

      for (const binaryGroup of binaryGroups) {
        // Validate binary string
        if (!/^[01]+$/.test(binaryGroup)) {
          return this.createResult(
            false,
            undefined,
            `Invalid binary: ${binaryGroup}`,
          );
        }

        // Convert binary to decimal
        const decimal = parseInt(binaryGroup, 2);

        if (decimal > 1114111) {
          // Unicode range
          return this.createResult(
            false,
            undefined,
            `Binary value out of range: ${binaryGroup}`,
          );
        }

        decoded += String.fromCharCode(decimal);
      }

      return this.createResult(true, decoded);
    } catch (error) {
      return this.handleError(error, "Binary decoding");
    }
  }

  detect(input: string): number {
    if (!input) return 0;

    // Remove whitespace and check if it's all binary
    const cleaned = input.replace(/\s/g, "");

    if (!/^[01]*$/.test(cleaned)) return 0;

    // Check if input is separated into 8-bit groups (common for text encoding)
    const groups = input.trim().split(/\s+/);

    let confidence = 0.5; // Base confidence for all binary

    // Higher confidence if groups are 8-bit
    const eightBitGroups = groups.filter(
      (group) => group.length === 8 && /^[01]{8}$/.test(group),
    );
    const eightBitRatio = eightBitGroups.length / groups.length;

    confidence += eightBitRatio * 0.4;

    // Even higher if there are multiple 8-bit groups (suggests text encoding)
    if (eightBitGroups.length >= 2) {
      confidence += 0.1;
    }

    return Math.min(confidence, 1);
  }
}
