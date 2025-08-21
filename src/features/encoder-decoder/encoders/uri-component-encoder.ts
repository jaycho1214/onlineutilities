/**
 * URI Component Encoder
 *
 * Handles URI component encoding and decoding.
 */

import { AbstractEncoder } from "./base-encoder";
import type { EncodingResult } from "../types";

export class UriComponentEncoder extends AbstractEncoder {
  encode(input: string): EncodingResult {
    try {
      const encoded = encodeURIComponent(input);
      return this.createResult(true, encoded);
    } catch (error) {
      return this.handleError(error, "URI component encoding");
    }
  }

  decode(input: string): EncodingResult {
    try {
      const decoded = decodeURIComponent(input);
      return this.createResult(true, decoded);
    } catch (error) {
      return this.handleError(error, "URI component decoding");
    }
  }

  detect(input: string): number {
    if (!input) return 0;

    // Look for percent-encoded sequences
    const percentMatches = input.match(/%[0-9A-Fa-f]{2}/g);
    const percentCount = percentMatches ? percentMatches.length : 0;

    if (percentCount === 0) return 0;

    // Calculate ratio of encoded characters
    const totalChars = input.length;
    const percentRatio = (percentCount * 3) / totalChars;

    // URI components often have specific encoded characters
    const commonUriEncoded =
      /%20|%21|%22|%23|%24|%25|%26|%27|%28|%29|%2A|%2B|%2C|%2F|%3A|%3B|%3C|%3D|%3E|%3F|%40|%5B|%5C|%5D|%5E|%60|%7B|%7C|%7D|%7E/gi;
    const hasCommonEncoded = commonUriEncoded.test(input);

    let confidence = Math.min(percentRatio * 2, 0.8);
    if (hasCommonEncoded) confidence += 0.2;

    return Math.min(confidence, 1);
  }
}
