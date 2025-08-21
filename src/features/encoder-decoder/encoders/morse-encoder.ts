/**
 * Morse Code Encoder
 *
 * Handles Morse code encoding and decoding.
 */

import { AbstractEncoder } from "./base-encoder";
import type { EncodingResult } from "../types";

export class MorseEncoder extends AbstractEncoder {
  private readonly morseCode: Record<string, string> = {
    A: ".-",
    B: "-...",
    C: "-.-.",
    D: "-..",
    E: ".",
    F: "..-.",
    G: "--.",
    H: "....",
    I: "..",
    J: ".---",
    K: "-.-",
    L: ".-..",
    M: "--",
    N: "-.",
    O: "---",
    P: ".--.",
    Q: "--.-",
    R: ".-.",
    S: "...",
    T: "-",
    U: "..-",
    V: "...-",
    W: ".--",
    X: "-..-",
    Y: "-.--",
    Z: "--..",
    "0": "-----",
    "1": ".----",
    "2": "..---",
    "3": "...--",
    "4": "....-",
    "5": ".....",
    "6": "-....",
    "7": "--...",
    "8": "---..",
    "9": "----.",
    ".": ".-.-.-",
    ",": "--..--",
    "?": "..--..",
    "'": ".----.",
    "!": "-.-.--",
    "/": "-..-.",
    "(": "-.--.",
    ")": "-.--.-",
    "&": ".-...",
    ":": "---...",
    ";": "-.-.-.",
    "=": "-...-",
    "+": ".-.-.",
    "-": "-....-",
    _: "..--.-",
    '"': ".-..-.",
    $: "...-..-",
    "@": ".--.-.",
    " ": "/",
  };

  private readonly reverseMorse: Record<string, string>;

  constructor() {
    super();
    // Create reverse mapping
    this.reverseMorse = {};
    for (const [char, morse] of Object.entries(this.morseCode)) {
      this.reverseMorse[morse] = char;
    }
  }

  encode(input: string): EncodingResult {
    try {
      const upperInput = input.toUpperCase();
      const morseChars: string[] = [];

      for (const char of upperInput) {
        const morse = this.morseCode[char];
        if (morse) {
          morseChars.push(morse);
        } else if (char === " ") {
          morseChars.push("/");
        } else {
          // Skip unsupported characters or add them as-is
          morseChars.push("?");
        }
      }

      return this.createResult(true, morseChars.join(" "));
    } catch (error) {
      return this.handleError(error, "Morse code encoding");
    }
  }

  decode(input: string): EncodingResult {
    try {
      const morseChars = input.trim().split(/\s+/);
      let decoded = "";

      for (const morse of morseChars) {
        const char = this.reverseMorse[morse];
        if (char) {
          decoded += char;
        } else if (morse === "/") {
          decoded += " ";
        } else {
          // Invalid morse character
          return this.createResult(
            false,
            undefined,
            `Invalid Morse code: ${morse}`,
          );
        }
      }

      return this.createResult(true, decoded);
    } catch (error) {
      return this.handleError(error, "Morse code decoding");
    }
  }

  detect(input: string): number {
    if (!input) return 0;

    // Check if input contains only valid Morse code characters
    if (!/^[.\-\s/]+$/.test(input)) return 0;

    // Split by spaces and check each part
    const parts = input.trim().split(/\s+/);
    let validMorseCount = 0;

    for (const part of parts) {
      // Check if it's a valid Morse code sequence
      if (this.reverseMorse[part] || part === "/") {
        validMorseCount++;
      }
    }

    if (validMorseCount === 0) return 0;

    const ratio = validMorseCount / parts.length;

    // Higher confidence if most parts are valid Morse
    let confidence = ratio * 0.8;

    // Additional confidence if it has typical Morse patterns
    const hasDots = input.includes(".");
    const hasDashes = input.includes("-");
    const hasSpaces = /\s/.test(input);

    if (hasDots && hasDashes && hasSpaces) {
      confidence += 0.2;
    }

    return Math.min(confidence, 1);
  }
}
