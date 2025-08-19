/**
 * ASCII Encoder
 * 
 * Handles ASCII encoding and decoding (text to ASCII codes).
 */

import { AbstractEncoder } from "./base-encoder";
import type { EncodingResult } from "../types";

export class AsciiEncoder extends AbstractEncoder {
  encode(input: string): EncodingResult {
    try {
      const codes: string[] = [];
      for (let i = 0; i < input.length; i++) {
        codes.push(input.charCodeAt(i).toString());
      }
      return this.createResult(true, codes.join(" "));
    } catch (error) {
      return this.handleError(error, "ASCII encoding");
    }
  }

  decode(input: string): EncodingResult {
    try {
      const codes = input.trim().split(/\s+/);
      let decoded = "";
      
      for (const code of codes) {
        const num = parseInt(code, 10);
        
        if (isNaN(num)) {
          return this.createResult(false, undefined, `Invalid ASCII code: ${code}`);
        }
        
        if (num < 0 || num > 1114111) { // Unicode range
          return this.createResult(false, undefined, `ASCII code out of range: ${num}`);
        }
        
        decoded += String.fromCharCode(num);
      }
      
      return this.createResult(true, decoded);
    } catch (error) {
      return this.handleError(error, "ASCII decoding");
    }
  }

  detect(input: string): number {
    if (!input) return 0;
    
    // Check if input looks like space-separated numbers
    const trimmed = input.trim();
    const parts = trimmed.split(/\s+/);
    
    // Need at least some parts
    if (parts.length < 2) return 0;
    
    let validCount = 0;
    let totalCount = 0;
    
    for (const part of parts) {
      totalCount++;
      const num = parseInt(part, 10);
      
      // Check if it's a valid number in reasonable ASCII range
      if (!isNaN(num) && num >= 0 && num <= 1114111) {
        validCount++;
        
        // Higher confidence for typical ASCII range (32-126)
        if (num >= 32 && num <= 126) {
          validCount += 0.5;
        }
      }
    }
    
    if (validCount === 0) return 0;
    
    const ratio = validCount / totalCount;
    
    // Higher confidence if most/all parts are valid ASCII codes
    return Math.min(ratio * 0.9, 1);
  }
}