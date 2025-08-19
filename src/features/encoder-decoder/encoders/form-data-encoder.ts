/**
 * Form Data Encoder
 * 
 * Handles application/x-www-form-urlencoded encoding and decoding.
 */

import { AbstractEncoder } from "./base-encoder";
import type { EncodingResult } from "../types";

export class FormDataEncoder extends AbstractEncoder {
  encode(input: string): EncodingResult {
    try {
      // Parse input as key-value pairs (JSON or plain text)
      let data: Record<string, string> = {};
      
      try {
        // Try to parse as JSON first
        data = JSON.parse(input);
      } catch {
        // If not JSON, treat each line as key=value
        const lines = input.split('\n');
        for (const line of lines) {
          const [key, ...valueParts] = line.split('=');
          if (key && valueParts.length > 0) {
            data[key.trim()] = valueParts.join('=').trim();
          }
        }
      }
      
      // Convert to form-encoded string
      const params = new URLSearchParams();
      for (const [key, value] of Object.entries(data)) {
        params.append(key, value);
      }
      
      return this.createResult(true, params.toString());
    } catch (error) {
      return this.handleError(error, "Form data encoding");
    }
  }

  decode(input: string): EncodingResult {
    try {
      const params = new URLSearchParams(input);
      const data: Record<string, string> = {};
      
      for (const [key, value] of params.entries()) {
        data[key] = value;
      }
      
      // Return as formatted JSON
      const result = JSON.stringify(data, null, 2);
      return this.createResult(true, result);
    } catch (error) {
      return this.handleError(error, "Form data decoding");
    }
  }

  detect(input: string): number {
    if (!input) return 0;
    
    // Look for form-encoded patterns
    const hasEquals = input.includes('=');
    const hasAmpersand = input.includes('&');
    
    if (!hasEquals) return 0;
    
    // Check for URL-encoded characters
    const percentMatches = input.match(/%[0-9A-Fa-f]{2}/g);
    const hasPercentEncoding = percentMatches && percentMatches.length > 0;
    
    // Check for plus signs (space encoding in forms)
    const hasPlus = input.includes('+');
    
    let confidence = 0.3;
    
    if (hasAmpersand) confidence += 0.3;
    if (hasPercentEncoding) confidence += 0.2;
    if (hasPlus) confidence += 0.2;
    
    // Check if it looks like valid form data format
    try {
      const params = new URLSearchParams(input);
      if (params.toString() === input) {
        confidence += 0.3;
      }
    } catch {
      // Invalid form data format
      confidence = Math.max(confidence - 0.2, 0);
    }
    
    return Math.min(confidence, 1);
  }
}