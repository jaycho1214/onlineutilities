/**
 * HTML Entity Encoder
 * 
 * Handles HTML entity encoding and decoding.
 */

import { AbstractEncoder } from "./base-encoder";
import type { EncodingResult } from "../types";

export class HtmlEntityEncoder extends AbstractEncoder {
  private readonly htmlEntities: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
    "/": "&#x2F;",
    "`": "&#x60;",
    "=": "&#x3D;",
  };

  private readonly namedEntities: Record<string, string> = {
    "&amp;": "&",
    "&lt;": "<",
    "&gt;": ">",
    "&quot;": '"',
    "&apos;": "'",
    "&#39;": "'",
    "&#x2F;": "/",
    "&#x60;": "`",
    "&#x3D;": "=",
    "&nbsp;": " ",
    "&copy;": "©",
    "&reg;": "®",
    "&trade;": "™",
    "&ldquo;": "\u201C",
    "&rdquo;": "\u201D",
    "&lsquo;": "\u2018",
    "&rsquo;": "\u2019",
    "&mdash;": "—",
    "&ndash;": "–",
    "&hellip;": "…",
  };

  encode(input: string): EncodingResult {
    try {
      let encoded = input;
      
      // Replace each character with its HTML entity
      for (const [char, entity] of Object.entries(this.htmlEntities)) {
        encoded = encoded.replace(new RegExp(this.escapeRegex(char), "g"), entity);
      }
      
      // Encode other special characters as numeric entities
      encoded = encoded.replace(/[^\x00-\x7F]/g, (char) => {
        return `&#${char.charCodeAt(0)};`;
      });
      
      return this.createResult(true, encoded);
    } catch (error) {
      return this.handleError(error, "HTML entity encoding");
    }
  }

  decode(input: string): EncodingResult {
    try {
      let decoded = input;
      
      // Decode named entities
      for (const [entity, char] of Object.entries(this.namedEntities)) {
        decoded = decoded.replace(new RegExp(this.escapeRegex(entity), "g"), char);
      }
      
      // Decode numeric entities (&#123; and &#xFF;)
      decoded = decoded.replace(/&#(\d+);/g, (_, num) => {
        return String.fromCharCode(parseInt(num, 10));
      });
      
      decoded = decoded.replace(/&#x([0-9A-Fa-f]+);/g, (_, hex) => {
        return String.fromCharCode(parseInt(hex, 16));
      });
      
      return this.createResult(true, decoded);
    } catch (error) {
      return this.handleError(error, "HTML entity decoding");
    }
  }

  detect(input: string): number {
    if (!input) return 0;
    
    // Look for HTML entities
    const namedEntityPattern = /&[a-zA-Z][a-zA-Z0-9]+;/g;
    const numericEntityPattern = /&#\d+;/g;
    const hexEntityPattern = /&#x[0-9A-Fa-f]+;/g;
    
    const namedMatches = input.match(namedEntityPattern) || [];
    const numericMatches = input.match(numericEntityPattern) || [];
    const hexMatches = input.match(hexEntityPattern) || [];
    
    const totalEntities = namedMatches.length + numericMatches.length + hexMatches.length;
    
    if (totalEntities === 0) return 0;
    
    // Check for common HTML entities
    const commonEntities = /&(amp|lt|gt|quot|apos|nbsp);/g;
    const hasCommonEntities = commonEntities.test(input);
    
    let confidence = Math.min(totalEntities * 0.1, 0.8);
    if (hasCommonEntities) confidence += 0.2;
    
    return Math.min(confidence, 1);
  }

  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }
}