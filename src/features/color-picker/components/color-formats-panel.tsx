import React from "react";
import { GlassSurface } from "@/features/shared/ui/glass-surface";
import { CopyButton } from "./copy-button";
import type { ColorFormats } from "../lib/color-conversions";

interface ColorFormatsPanelProps {
  colorFormats: ColorFormats;
}

const formatConfigs = [
  {
    key: "hex" as const,
    label: "HEX",
    getValue: (formats: ColorFormats) => formats.hex.toUpperCase(),
    getCopyValue: (formats: ColorFormats) => formats.hex,
  },
  {
    key: "rgb" as const,
    label: "RGB",
    getValue: (formats: ColorFormats) =>
      `${formats.rgb.r}, ${formats.rgb.g}, ${formats.rgb.b}`,
    getCopyValue: (formats: ColorFormats) =>
      `rgb(${formats.rgb.r}, ${formats.rgb.g}, ${formats.rgb.b})`,
  },
  {
    key: "hsl" as const,
    label: "HSL",
    getValue: (formats: ColorFormats) =>
      `${formats.hsl.h}°, ${formats.hsl.s}%, ${formats.hsl.l}%`,
    getCopyValue: (formats: ColorFormats) =>
      `hsl(${formats.hsl.h}, ${formats.hsl.s}%, ${formats.hsl.l}%)`,
  },
  {
    key: "hsv" as const,
    label: "HSV",
    getValue: (formats: ColorFormats) =>
      `${formats.hsv.h}°, ${formats.hsv.s}%, ${formats.hsv.v}%`,
    getCopyValue: (formats: ColorFormats) =>
      `hsv(${formats.hsv.h}, ${formats.hsv.s}%, ${formats.hsv.v}%)`,
  },
  {
    key: "cmyk" as const,
    label: "CMYK",
    getValue: (formats: ColorFormats) =>
      `${formats.cmyk.c}%, ${formats.cmyk.m}%, ${formats.cmyk.y}%, ${formats.cmyk.k}%`,
    getCopyValue: (formats: ColorFormats) =>
      `cmyk(${formats.cmyk.c}%, ${formats.cmyk.m}%, ${formats.cmyk.y}%, ${formats.cmyk.k}%)`,
  },
  {
    key: "lab" as const,
    label: "LAB",
    getValue: (formats: ColorFormats) =>
      `${formats.lab.l}, ${formats.lab.a}, ${formats.lab.b}`,
    getCopyValue: (formats: ColorFormats) =>
      `lab(${formats.lab.l} ${formats.lab.a} ${formats.lab.b})`,
  },
] as const;

const ColorFormatsPanelComponent: React.FC<ColorFormatsPanelProps> = React.memo(
  ({ colorFormats }) => {
    return (
      <GlassSurface className="p-6">
        <h3 className="font-semibold mb-4">Color Formats</h3>
        <div className="space-y-3">
          {formatConfigs.map((config) => (
            <div
              key={config.key}
              className="flex items-center justify-between p-2 rounded bg-black/5 dark:bg-white/5"
            >
              <span className="text-sm font-medium">{config.label}</span>
              <div className="flex items-center gap-2">
                <code className="text-sm font-mono text-right">
                  {config.getValue(colorFormats)}
                </code>
                <CopyButton
                  value={config.getCopyValue(colorFormats)}
                  format={config.label}
                />
              </div>
            </div>
          ))}
        </div>
      </GlassSurface>
    );
  }
);

ColorFormatsPanelComponent.displayName = 'ColorFormatsPanel';
export const ColorFormatsPanel = ColorFormatsPanelComponent;
