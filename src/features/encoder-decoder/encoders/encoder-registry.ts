/**
 * Encoder Registry
 * 
 * Central registry for all encoders and their configurations.
 */

import type { EncodingType, EncodingConfig, DetectionResult } from "../types";
import type { BaseEncoder } from "./base-encoder";

// Import all encoders
import { Base64Encoder } from "./base64-encoder";
import { UrlEncoder } from "./url-encoder";
import { HtmlEntityEncoder } from "./html-entity-encoder";
import { HexEncoder } from "./hex-encoder";
import { Base32Encoder } from "./base32-encoder";
import { AsciiEncoder } from "./ascii-encoder";
import { BinaryEncoder } from "./binary-encoder";
import { UnicodeEscapeEncoder } from "./unicode-escape-encoder";
import { PunycodeEncoder } from "./punycode-encoder";
import { Base58Encoder } from "./base58-encoder";
import { Rot13Encoder } from "./rot13-encoder";
import { MorseEncoder } from "./morse-encoder";
import { UriComponentEncoder } from "./uri-component-encoder";
import { FormDataEncoder } from "./form-data-encoder";
import { CookieEncoder } from "./cookie-encoder";

// Encoder configurations
export const encodingConfigs: Record<EncodingType, EncodingConfig> = {
  "base64": {
    id: "base64",
    name: "Base64",
    description: "Binary-to-text encoding scheme",
    category: "Basic",
    supportsEncode: true,
    supportsDecode: true,
    examples: {
      input: "Hello World",
      encoded: "SGVsbG8gV29ybGQ=",
      decoded: "Hello World"
    }
  },
  "url": {
    id: "url",
    name: "URL Encoding",
    description: "Percent-encoding for URLs",
    category: "Web",
    supportsEncode: true,
    supportsDecode: true,
    examples: {
      input: "Hello World!",
      encoded: "Hello%20World%21",
      decoded: "Hello World!"
    }
  },
  "html-entity": {
    id: "html-entity",
    name: "HTML Entity",
    description: "HTML character entity encoding",
    category: "Web",
    supportsEncode: true,
    supportsDecode: true,
    examples: {
      input: "<script>alert('hello')</script>",
      encoded: "&lt;script&gt;alert(&#39;hello&#39;)&lt;/script&gt;",
      decoded: "<script>alert('hello')</script>"
    }
  },
  "hex": {
    id: "hex",
    name: "Hexadecimal",
    description: "Binary data to hexadecimal",
    category: "Basic",
    supportsEncode: true,
    supportsDecode: true,
    examples: {
      input: "Hello",
      encoded: "48656c6c6f",
      decoded: "Hello"
    }
  },
  "base32": {
    id: "base32",
    name: "Base32",
    description: "32-character encoding scheme",
    category: "Basic",
    supportsEncode: true,
    supportsDecode: true,
    examples: {
      input: "Hello",
      encoded: "JBSWY3DP",
      decoded: "Hello"
    }
  },
  "ascii": {
    id: "ascii",
    name: "ASCII Codes",
    description: "Text to ASCII character codes",
    category: "Basic",
    supportsEncode: true,
    supportsDecode: true,
    examples: {
      input: "Hi",
      encoded: "72 105",
      decoded: "Hi"
    }
  },
  "binary": {
    id: "binary",
    name: "Binary",
    description: "Text to binary representation",
    category: "Basic",
    supportsEncode: true,
    supportsDecode: true,
    examples: {
      input: "Hi",
      encoded: "01001000 01101001",
      decoded: "Hi"
    }
  },
  "unicode-escape": {
    id: "unicode-escape",
    name: "Unicode Escape",
    description: "Unicode \\u sequences",
    category: "Basic",
    supportsEncode: true,
    supportsDecode: true,
    examples: {
      input: "Hello 世界",
      encoded: "Hello \\u4e16\\u754c",
      decoded: "Hello 世界"
    }
  },
  "punycode": {
    id: "punycode",
    name: "Punycode",
    description: "International domain name encoding",
    category: "Web",
    supportsEncode: true,
    supportsDecode: true,
    examples: {
      input: "münchen.de",
      encoded: "xn--mnchen-3ya.de",
      decoded: "münchen.de"
    }
  },
  "base58": {
    id: "base58",
    name: "Base58",
    description: "Cryptocurrency address encoding",
    category: "Crypto",
    supportsEncode: true,
    supportsDecode: true,
    examples: {
      input: "Hello World",
      encoded: "JxF12TrwUP45BMd",
      decoded: "Hello World"
    }
  },
  "rot13": {
    id: "rot13",
    name: "ROT13",
    description: "Caesar cipher with 13-character rotation",
    category: "Cipher",
    supportsEncode: true,
    supportsDecode: true,
    examples: {
      input: "Hello World",
      encoded: "Uryyb Jbeyq",
      decoded: "Hello World"
    }
  },
  "morse-code": {
    id: "morse-code",
    name: "Morse Code",
    description: "Dots and dashes encoding",
    category: "Cipher",
    supportsEncode: true,
    supportsDecode: true,
    examples: {
      input: "HELLO",
      encoded: ".... . .-.. .-.. ---",
      decoded: "HELLO"
    }
  },
  "uri-component": {
    id: "uri-component",
    name: "URI Component",
    description: "Encode URI components",
    category: "Web",
    supportsEncode: true,
    supportsDecode: true,
    examples: {
      input: "hello world!",
      encoded: "hello%20world!",
      decoded: "hello world!"
    }
  },
  "form-data": {
    id: "form-data",
    name: "Form Data",
    description: "application/x-www-form-urlencoded",
    category: "Web",
    supportsEncode: true,
    supportsDecode: true,
    examples: {
      input: '{"name": "John Doe", "email": "john@example.com"}',
      encoded: "name=John+Doe&email=john%40example.com",
      decoded: '{\n  "name": "John Doe",\n  "email": "john@example.com"\n}'
    }
  },
  "cookie": {
    id: "cookie",
    name: "Cookie Encoding",
    description: "HTTP cookie value encoding",
    category: "Web",
    supportsEncode: true,
    supportsDecode: true,
    examples: {
      input: "user=John Doe; path=/",
      encoded: "user=John%20Doe%3B%20path%3D%2F",
      decoded: "user=John Doe; path=/"
    }
  }
};

// Encoder instances
const encoderInstances: Record<EncodingType, BaseEncoder> = {
  "base64": new Base64Encoder(),
  "url": new UrlEncoder(),
  "html-entity": new HtmlEntityEncoder(),
  "hex": new HexEncoder(),
  "base32": new Base32Encoder(),
  "ascii": new AsciiEncoder(),
  "binary": new BinaryEncoder(),
  "unicode-escape": new UnicodeEscapeEncoder(),
  "punycode": new PunycodeEncoder(),
  "base58": new Base58Encoder(),
  "rot13": new Rot13Encoder(),
  "morse-code": new MorseEncoder(),
  "uri-component": new UriComponentEncoder(),
  "form-data": new FormDataEncoder(),
  "cookie": new CookieEncoder(),
};

/**
 * Get encoder instance by type
 */
export function getEncoder(type: EncodingType): BaseEncoder {
  return encoderInstances[type];
}

/**
 * Get all available encoding configurations
 */
export function getAvailableEncodings(): EncodingConfig[] {
  return Object.values(encodingConfigs);
}

/**
 * Get encodings by category
 */
export function getEncodingsByCategory(category: string): EncodingConfig[] {
  return Object.values(encodingConfigs).filter(config => config.category === category);
}

/**
 * Auto-detect encoding type from input
 */
export function detectEncoding(input: string): DetectionResult[] {
  if (!input.trim()) return [];

  const results: DetectionResult[] = [];

  // Test each encoder's detection
  for (const [type, encoder] of Object.entries(encoderInstances)) {
    const confidence = encoder.detect(input);
    if (confidence > 0.1) {
      results.push({
        type: type as EncodingType,
        confidence,
        reason: `${confidence > 0.7 ? "High" : confidence > 0.4 ? "Medium" : "Low"} confidence based on pattern analysis`
      });
    }
  }

  // Sort by confidence (highest first)
  results.sort((a, b) => b.confidence - a.confidence);

  return results.slice(0, 5); // Return top 5 matches
}

/**
 * Get categories
 */
export function getCategories(): string[] {
  const categories = new Set<string>();
  Object.values(encodingConfigs).forEach(config => categories.add(config.category));
  return Array.from(categories).sort();
}