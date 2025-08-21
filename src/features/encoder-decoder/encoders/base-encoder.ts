/**
 * Base Encoder Interface
 *
 * Defines the interface that all encoders must implement.
 */

import type { EncodingResult } from "../types";

export interface BaseEncoder {
  encode(input: string): EncodingResult;
  decode(input: string): EncodingResult;
  validate(input: string, operation: "encode" | "decode"): boolean;
  detect(input: string): number; // Returns confidence score 0-1
}

export abstract class AbstractEncoder implements BaseEncoder {
  abstract encode(input: string): EncodingResult;
  abstract decode(input: string): EncodingResult;

  validate(input: string, operation: "encode" | "decode"): boolean {
    if (!input) return false;

    // Most encoders can encode any text
    if (operation === "encode") return true;

    // For decode, try to decode and see if it works
    try {
      const result = this.decode(input);
      return result.success;
    } catch {
      return false;
    }
  }

  abstract detect(input: string): number;

  protected createResult(
    success: boolean,
    result?: string,
    error?: string,
  ): EncodingResult {
    return { success, result, error };
  }

  protected handleError(error: unknown, operation: string): EncodingResult {
    const message =
      error instanceof Error ? error.message : `${operation} failed`;
    return this.createResult(false, undefined, message);
  }
}
