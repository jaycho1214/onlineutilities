import { rgbToHex, hslToHex, hsvToHex, cmykToHex } from './color-conversions';

// Parse color input based on format
export const parseColorInput = (input: string): string | null => {
  input = input.trim();

  // HEX format
  if (/^#?([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/.test(input)) {
    return input.startsWith("#") ? input : `#${input}`;
  }

  // RGB format
  const rgbMatch = input.match(/rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/);
  if (rgbMatch) {
    const [, r, g, b] = rgbMatch;
    return rgbToHex(parseInt(r), parseInt(g), parseInt(b));
  }

  // HSL format
  const hslMatch = input.match(
    /hsl\s*\(\s*(\d+)\s*,\s*(\d+)%?\s*,\s*(\d+)%?\s*\)/
  );
  if (hslMatch) {
    const [, h, s, l] = hslMatch;
    return hslToHex(parseInt(h), parseInt(s), parseInt(l));
  }

  // HSV format
  const hsvMatch = input.match(
    /hsv\s*\(\s*(\d+)\s*,\s*(\d+)%?\s*,\s*(\d+)%?\s*\)/
  );
  if (hsvMatch) {
    const [, h, s, v] = hsvMatch;
    return hsvToHex(parseInt(h), parseInt(s), parseInt(v));
  }

  // CMYK format
  const cmykMatch = input.match(
    /cmyk\s*\(\s*(\d+)%?\s*,\s*(\d+)%?\s*,\s*(\d+)%?\s*,\s*(\d+)%?\s*\)/
  );
  if (cmykMatch) {
    const [, c, m, y, k] = cmykMatch;
    return cmykToHex(parseInt(c), parseInt(m), parseInt(y), parseInt(k));
  }

  return null;
};