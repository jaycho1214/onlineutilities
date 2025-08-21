/**
 * Cookie Encoder
 *
 * Handles HTTP cookie value encoding and decoding.
 */

import { AbstractEncoder } from "./base-encoder";
import type { EncodingResult } from "../types";

export class CookieEncoder extends AbstractEncoder {
  // Characters that need to be encoded in cookie values
  private readonly cookieSpecialChars = /[()<>@,;:\\"/?={}\s\[\]]/g;

  encode(input: string): EncodingResult {
    try {
      // Encode special characters in cookie values
      const encoded = input.replace(this.cookieSpecialChars, (char) => {
        return (
          "%" + char.charCodeAt(0).toString(16).padStart(2, "0").toUpperCase()
        );
      });

      return this.createResult(true, encoded);
    } catch (error) {
      return this.handleError(error, "Cookie encoding");
    }
  }

  decode(input: string): EncodingResult {
    try {
      // Decode percent-encoded characters
      const decoded = input.replace(/%([0-9A-Fa-f]{2})/g, (match, hex) => {
        return String.fromCharCode(parseInt(hex, 16));
      });

      return this.createResult(true, decoded);
    } catch (error) {
      return this.handleError(error, "Cookie decoding");
    }
  }

  detect(input: string): number {
    if (!input) return 0;

    // Look for percent-encoded characters that are commonly encoded in cookies
    const cookieEncodedPattern =
      /%20|%21|%22|%23|%24|%25|%26|%27|%28|%29|%2A|%2B|%2C|%2F|%3A|%3B|%3C|%3D|%3E|%3F|%40|%5B|%5C|%5D|%5E|%60|%7B|%7C|%7D|%7E/gi;

    const hasEncodedChars = cookieEncodedPattern.test(input);

    if (!hasEncodedChars) {
      // Check if it contains characters that would typically be encoded in cookies
      const hasSpecialChars = this.cookieSpecialChars.test(input);
      return hasSpecialChars ? 0.2 : 0;
    }

    // Count encoded sequences
    const encodedMatches = input.match(/%[0-9A-Fa-f]{2}/g) || [];
    const encodedRatio = (encodedMatches.length * 3) / input.length;

    let confidence = Math.min(encodedRatio * 3, 0.8);

    // Higher confidence if it looks like a cookie format
    if (input.includes("=") && !input.includes("&")) {
      confidence += 0.1; // Cookies use = but not & (unlike form data)
    }

    return Math.min(confidence, 1);
  }
}
