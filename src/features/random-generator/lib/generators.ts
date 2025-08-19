import { customAlphabet } from "nanoid";
import type {
  PasswordConfig,
  NumberConfig,
  UuidConfig,
  NanoidConfig,
  CuidConfig,
  StringConfig,
  BooleanConfig,
  ColorConfig,
  DateConfig,
} from "../types";
import { CHARACTER_SETS as CHARS, NANOID_ALPHABETS } from "../types";

/**
 * Generate a secure random integer between min and max (inclusive)
 */
function getRandomInt(min: number, max: number): number {
  const range = max - min + 1;
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return min + (array[0] % range);
}

/**
 * Generate a secure random float between min and max
 */
function getRandomFloat(min: number, max: number, decimals: number): number {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  const randomFloat = min + (array[0] / (0xffffffff + 1)) * (max - min);
  return parseFloat(randomFloat.toFixed(decimals));
}

/**
 * Password Generator
 */
export async function generatePasswords(
  config: PasswordConfig,
): Promise<string[]> {
  const {
    count,
    length,
    includeUppercase,
    includeLowercase,
    includeNumbers,
    includeSymbols,
    excludeSimilar,
    excludeAmbiguous,
    customCharacters,
  } = config;

  if (length < 1 || length > 1000) {
    throw new Error("Password length must be between 1 and 1000");
  }

  if (count < 1 || count > 100) {
    throw new Error("Count must be between 1 and 100");
  }

  // Build character set
  let charset = "";

  if (customCharacters) {
    charset = customCharacters;
  } else {
    if (includeLowercase) charset += CHARS.lowercase;
    if (includeUppercase) charset += CHARS.uppercase;
    if (includeNumbers) charset += CHARS.numbers;
    if (includeSymbols) charset += CHARS.symbols;
  }

  if (!charset) {
    throw new Error("At least one character type must be selected");
  }

  // Remove similar characters if requested
  if (excludeSimilar) {
    charset = charset.replace(new RegExp(`[${CHARS.similar}]`, "g"), "");
  }

  // Remove ambiguous characters if requested
  if (excludeAmbiguous) {
    charset = charset.replace(
      new RegExp(
        `[${CHARS.ambiguous.replace(/[\\^$.*+?()[\]{}|]/g, "\\$&")}]`,
        "g",
      ),
      "",
    );
  }

  if (!charset) {
    throw new Error("No characters available after applying filters");
  }

  const passwords = [];
  for (let i = 0; i < count; i++) {
    let password = "";
    for (let j = 0; j < length; j++) {
      const randomIndex = getRandomInt(0, charset.length - 1);
      password += charset[randomIndex];
    }
    passwords.push(password);
  }

  return passwords;
}

/**
 * Number Generator
 */
export async function generateNumbers(config: NumberConfig): Promise<string[]> {
  const { count, type, min, max, decimalPlaces, unique, sorted } = config;

  if (count < 1 || count > 100) {
    throw new Error("Count must be between 1 and 100");
  }

  if (min >= max) {
    throw new Error("Minimum must be less than maximum");
  }

  const numbers: number[] = [];
  const usedNumbers = new Set<number>();

  for (let i = 0; i < count; i++) {
    let number: number;

    if (type === "integer") {
      do {
        number = getRandomInt(min, max);
      } while (
        unique &&
        usedNumbers.has(number) &&
        usedNumbers.size < max - min + 1
      );
    } else {
      do {
        number = getRandomFloat(min, max, decimalPlaces);
      } while (unique && usedNumbers.has(number));
    }

    if (unique) {
      if (usedNumbers.has(number)) {
        // If we can't find a unique number, break to avoid infinite loop
        break;
      }
      usedNumbers.add(number);
    }

    numbers.push(number);
  }

  if (sorted) {
    numbers.sort((a, b) => a - b);
  }

  return numbers.map((num) =>
    type === "integer" ? num.toString() : num.toFixed(decimalPlaces),
  );
}

/**
 * UUID Generator
 */
export async function generateUuids(config: UuidConfig): Promise<string[]> {
  const { count, uppercase, hyphenated } = config;

  if (count < 1 || count > 100) {
    throw new Error("Count must be between 1 and 100");
  }

  const uuids = [];
  for (let i = 0; i < count; i++) {
    // Generate UUID v4
    const uuid = crypto.randomUUID();
    let result = hyphenated ? uuid : uuid.replace(/-/g, "");
    if (uppercase) {
      result = result.toUpperCase();
    }
    uuids.push(result);
  }

  return uuids;
}

/**
 * Nanoid Generator
 */
export async function generateNanoids(config: NanoidConfig): Promise<string[]> {
  const { count, length, alphabet, preset } = config;

  if (count < 1 || count > 100) {
    throw new Error("Count must be between 1 and 100");
  }

  if (length < 1 || length > 1000) {
    throw new Error("Length must be between 1 and 1000");
  }

  const finalAlphabet = alphabet || NANOID_ALPHABETS[preset];
  const generator = customAlphabet(finalAlphabet, length);

  const nanoids = [];
  for (let i = 0; i < count; i++) {
    nanoids.push(generator());
  }

  return nanoids;
}

/**
 * CUID Generator
 */
export async function generateCuids(config: CuidConfig): Promise<string[]> {
  const { count, version, fingerprint } = config;

  if (count < 1 || count > 100) {
    throw new Error("Count must be between 1 and 100");
  }

  const cuids = [];
  for (let i = 0; i < count; i++) {
    if (version === "cuid2") {
      cuids.push(generateCuid2(fingerprint));
    } else {
      cuids.push(generateCuidLegacy(fingerprint));
    }
  }

  return cuids;
}

/**
 * Generate CUID2 (modern version)
 */
function generateCuid2(fingerprint?: string): string {
  // CUID2 format: [prefix][timestamp][counter][fingerprint][random]
  const prefix = "c"; // Fixed prefix for CUID2
  const timestamp = Date.now().toString(36).slice(-4); // Last 4 chars of timestamp in base36
  const counter = getRandomInt(0, 35).toString(36); // Single char counter
  const fp = fingerprint
    ? fingerprint.slice(0, 2)
    : generateFingerprint().slice(0, 2);
  const random = generateRandomString(
    16,
    "abcdefghijklmnopqrstuvwxyz0123456789",
  );

  return prefix + timestamp + counter + fp + random;
}

/**
 * Generate CUID Legacy (original version)
 */
function generateCuidLegacy(fingerprint?: string): string {
  // CUID format: c[timestamp][counter][fingerprint][random]
  const prefix = "c";
  const timestamp = Date.now().toString(36);
  const counter = getRandomInt(0, 1295).toString(36).padStart(2, "0"); // 2 chars
  const fp = fingerprint ? fingerprint.slice(0, 4) : generateFingerprint();
  const random = generateRandomString(
    8,
    "abcdefghijklmnopqrstuvwxyz0123456789",
  );

  return prefix + timestamp + counter + fp + random;
}

/**
 * Generate machine fingerprint
 */
function generateFingerprint(): string {
  // Use browser/environment info to create a consistent fingerprint
  const userAgent =
    typeof navigator !== "undefined" ? navigator.userAgent : "nodejs";
  const platform =
    typeof navigator !== "undefined" ? navigator.platform : "server";
  const language = typeof navigator !== "undefined" ? navigator.language : "en";

  // Create a simple hash of these values
  let hash = 0;
  const combined = userAgent + platform + language;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  return Math.abs(hash).toString(36).slice(0, 4);
}

/**
 * Generate random string using secure crypto
 */
function generateRandomString(length: number, charset: string): string {
  let result = "";
  for (let i = 0; i < length; i++) {
    result += charset[getRandomInt(0, charset.length - 1)];
  }
  return result;
}

/**
 * String Generator
 */
export async function generateStrings(config: StringConfig): Promise<string[]> {
  const { count, length, charset, customCharset, pattern, usePattern } = config;

  if (count < 1 || count > 100) {
    throw new Error("Count must be between 1 and 100");
  }

  if (length < 1 || length > 1000) {
    throw new Error("Length must be between 1 and 1000");
  }

  const strings = [];

  for (let i = 0; i < count; i++) {
    let result = "";

    if (usePattern && pattern) {
      // Generate using pattern
      for (const char of pattern) {
        if (char === "X") {
          // Random character
          const chars = customCharset || getCharsetString(charset);
          result += chars[getRandomInt(0, chars.length - 1)];
        } else if (char === "9") {
          // Random digit
          result += getRandomInt(0, 9).toString();
        } else if (char === "A") {
          // Random letter
          const letters = CHARS.uppercase + CHARS.lowercase;
          result += letters[getRandomInt(0, letters.length - 1)];
        } else {
          // Literal character
          result += char;
        }
      }
    } else {
      // Generate using character set
      const chars = customCharset || getCharsetString(charset);
      if (!chars) {
        throw new Error("No characters available for generation");
      }

      for (let j = 0; j < length; j++) {
        result += chars[getRandomInt(0, chars.length - 1)];
      }
    }

    strings.push(result);
  }

  return strings;
}

/**
 * Get character set string based on charset type
 */
function getCharsetString(charset: string): string {
  switch (charset) {
    case "alphanumeric":
      return CHARS.uppercase + CHARS.lowercase + CHARS.numbers;
    case "alphabetic":
      return CHARS.uppercase + CHARS.lowercase;
    case "numeric":
      return CHARS.numbers;
    case "lowercase":
      return CHARS.lowercase;
    case "uppercase":
      return CHARS.uppercase;
    case "symbols":
      return CHARS.symbols;
    default:
      return "";
  }
}

/**
 * Boolean Generator
 */
export async function generateBooleans(
  config: BooleanConfig,
): Promise<string[]> {
  const { count, probability, format } = config;

  if (count < 1 || count > 100) {
    throw new Error("Count must be between 1 and 100");
  }

  if (probability < 0 || probability > 100) {
    throw new Error("Probability must be between 0 and 100");
  }

  const results = [];
  for (let i = 0; i < count; i++) {
    const isTrue = getRandomInt(1, 100) <= probability;

    let result: string;
    switch (format) {
      case "boolean":
        result = isTrue.toString();
        break;
      case "binary":
        result = isTrue ? "1" : "0";
        break;
      case "yesno":
        result = isTrue ? "Yes" : "No";
        break;
      default:
        result = isTrue.toString();
    }

    results.push(result);
  }

  return results;
}

/**
 * Color Generator
 */
export async function generateColors(config: ColorConfig): Promise<string[]> {
  const { count, format, hueRange, saturationRange, lightnessRange } = config;

  if (count < 1 || count > 100) {
    throw new Error("Count must be between 1 and 100");
  }

  const colors = [];
  for (let i = 0; i < count; i++) {
    const hue = getRandomInt(hueRange[0], hueRange[1]);
    const saturation = getRandomInt(saturationRange[0], saturationRange[1]);
    const lightness = getRandomInt(lightnessRange[0], lightnessRange[1]);

    let color: string;
    switch (format) {
      case "hex":
        // Convert HSL to RGB then to HEX
        const rgb = hslToRgb(hue / 360, saturation / 100, lightness / 100);
        color = `#${rgb.map((c) => Math.round(c).toString(16).padStart(2, "0")).join("")}`;
        break;
      case "rgb":
        const rgbValues = hslToRgb(
          hue / 360,
          saturation / 100,
          lightness / 100,
        );
        color = `rgb(${rgbValues.map((c) => Math.round(c)).join(", ")})`;
        break;
      case "hsl":
        color = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
        break;
      case "hsv":
        const hsv = hslToHsv(hue, saturation, lightness);
        color = `hsv(${hsv.h}, ${hsv.s}%, ${hsv.v}%)`;
        break;
      default:
        color = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    }

    colors.push(color);
  }

  return colors;
}

/**
 * Date Generator
 */
export async function generateDates(config: DateConfig): Promise<string[]> {
  const { count, startDate, endDate, format, customFormat } = config;

  if (count < 1 || count > 100) {
    throw new Error("Count must be between 1 and 100");
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (start >= end) {
    throw new Error("End date must be after start date");
  }

  const dates = [];
  const timeDiff = end.getTime() - start.getTime();

  for (let i = 0; i < count; i++) {
    // Use secure random for date generation
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    const randomFactor = array[0] / (0xffffffff + 1); // Convert to 0-1 range
    const randomTime = start.getTime() + randomFactor * timeDiff;
    const randomDate = new Date(randomTime);

    let formattedDate: string;
    switch (format) {
      case "iso":
        formattedDate = randomDate.toISOString().split("T")[0];
        break;
      case "us":
        formattedDate = randomDate.toLocaleDateString("en-US");
        break;
      case "european":
        formattedDate = randomDate.toLocaleDateString("en-GB");
        break;
      case "timestamp":
        formattedDate = Math.floor(randomDate.getTime() / 1000).toString();
        break;
      case "custom":
        formattedDate = formatDateCustom(randomDate, customFormat);
        break;
      default:
        formattedDate = randomDate.toISOString().split("T")[0];
    }

    dates.push(formattedDate);
  }

  return dates;
}

/**
 * Convert HSL to RGB
 */
function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h * 6) % 2) - 1));
  const m = l - c / 2;

  let r = 0,
    g = 0,
    b = 0;

  if (0 <= h && h < 1 / 6) {
    r = c;
    g = x;
    b = 0;
  } else if (1 / 6 <= h && h < 2 / 6) {
    r = x;
    g = c;
    b = 0;
  } else if (2 / 6 <= h && h < 3 / 6) {
    r = 0;
    g = c;
    b = x;
  } else if (3 / 6 <= h && h < 4 / 6) {
    r = 0;
    g = x;
    b = c;
  } else if (4 / 6 <= h && h < 5 / 6) {
    r = x;
    g = 0;
    b = c;
  } else if (5 / 6 <= h && h < 1) {
    r = c;
    g = 0;
    b = x;
  }

  return [(r + m) * 255, (g + m) * 255, (b + m) * 255];
}

/**
 * Convert HSL to HSV
 */
function hslToHsv(
  h: number,
  s: number,
  l: number,
): { h: number; s: number; v: number } {
  const sNorm = s / 100;
  const lNorm = l / 100;

  const v = lNorm + sNorm * Math.min(lNorm, 1 - lNorm);
  const sNew = v === 0 ? 0 : 2 * (1 - lNorm / v);

  return {
    h: h,
    s: Math.round(sNew * 100),
    v: Math.round(v * 100),
  };
}

/**
 * Format date with custom format string
 */
function formatDateCustom(date: Date, format: string): string {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();

  return format
    .replace(/YYYY/g, year.toString())
    .replace(/YY/g, year.toString().slice(-2))
    .replace(/MM/g, month.toString().padStart(2, "0"))
    .replace(/M/g, month.toString())
    .replace(/DD/g, day.toString().padStart(2, "0"))
    .replace(/D/g, day.toString())
    .replace(/HH/g, hours.toString().padStart(2, "0"))
    .replace(/H/g, hours.toString())
    .replace(/mm/g, minutes.toString().padStart(2, "0"))
    .replace(/m/g, minutes.toString())
    .replace(/ss/g, seconds.toString().padStart(2, "0"))
    .replace(/s/g, seconds.toString());
}

export const generators = {
  password: generatePasswords,
  number: generateNumbers,
  uuid: generateUuids,
  nanoid: generateNanoids,
  cuid: generateCuids,
  string: generateStrings,
  boolean: generateBooleans,
  color: generateColors,
  date: generateDates,
} as const;
