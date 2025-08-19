/**
 * ROT13 Encoder
 * 
 * Handles ROT13 encoding and decoding (Caesar cipher with 13 rotation).
 */

import { AbstractEncoder } from "./base-encoder";
import type { EncodingResult } from "../types";

export class Rot13Encoder extends AbstractEncoder {
  private rot13Transform(input: string): string {
    return input.replace(/[A-Za-z]/g, (char) => {
      const start = char <= "Z" ? 65 : 97; // 'A' or 'a'
      return String.fromCharCode(((char.charCodeAt(0) - start + 13) % 26) + start);
    });
  }

  encode(input: string): EncodingResult {
    try {
      const encoded = this.rot13Transform(input);
      return this.createResult(true, encoded);
    } catch (error) {
      return this.handleError(error, "ROT13 encoding");
    }
  }

  decode(input: string): EncodingResult {
    try {
      // ROT13 is its own inverse
      const decoded = this.rot13Transform(input);
      return this.createResult(true, decoded);
    } catch (error) {
      return this.handleError(error, "ROT13 decoding");
    }
  }

  detect(input: string): number {
    if (!input) return 0;
    
    // ROT13 detection is tricky since it produces valid text
    // We'll look for patterns that might suggest ROT13
    
    const letters = input.match(/[A-Za-z]/g) || [];
    if (letters.length === 0) return 0;
    
    // Check letter frequency distribution
    // ROT13 tends to have unusual letter patterns
    const letterCounts: Record<string, number> = {};
    letters.forEach(letter => {
      const lower = letter.toLowerCase();
      letterCounts[lower] = (letterCounts[lower] || 0) + 1;
    });
    
    // Common letters in English: e, t, a, o, i, n, s, h, r
    const uncommonLetters = ['x', 'z', 'q', 'j', 'k'];
    
    let uncommonCount = 0;
    
    for (const [letter, count] of Object.entries(letterCounts)) {
      if (uncommonLetters.includes(letter)) {
        uncommonCount += count;
      }
    }
    
    const totalLetters = letters.length;
    const uncommonRatio = uncommonCount / totalLetters;
    
    // ROT13 might have more uncommon letters than normal text
    if (uncommonRatio > 0.1) {
      return Math.min(uncommonRatio * 2, 0.6);
    }
    
    return 0.1; // Low confidence since ROT13 is hard to detect
  }
}