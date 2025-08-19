import React from "react";
import { Input } from "@/features/shared/ui/input";
import { Slider } from "@/features/shared/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/features/shared/ui/select";
import { getSliderConfig } from "@/features/color-picker/lib/color-slider-config";
import type { ColorFormats } from "@/features/color-picker/lib/color-conversions";

type ColorFormat = "RGB" | "HSL" | "HSV" | "CMYK" | "LAB";

interface ColorPickerControlPanelProps {
  selectedColor: string;
  colorFormat: ColorFormat;
  colorFormats: ColorFormats;
  onColorFormatChange: (format: ColorFormat) => void;
  onInputChange: (input: string) => void;
  onSliderChange: (component: string, value: number[]) => void;
}

export const ColorPickerControlPanel: React.FC<
  ColorPickerControlPanelProps
> = ({
  selectedColor,
  colorFormat,
  colorFormats,
  onColorFormatChange,
  onInputChange,
  onSliderChange,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Select
          value={colorFormat}
          onValueChange={(value) => onColorFormatChange(value as ColorFormat)}
        >
          <SelectTrigger className="w-24">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="RGB">RGB</SelectItem>
            <SelectItem value="HSL">HSL</SelectItem>
            <SelectItem value="HSV">HSV</SelectItem>
            <SelectItem value="CMYK">CMYK</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* HEX Input Field */}
      <div className="space-y-2">
        <label className="text-sm font-medium">HEX</label>
        <Input
          type="text"
          value={selectedColor}
          onChange={(e) => onInputChange(e.target.value)}
          placeholder="#FFFFFF"
          className="font-mono"
        />
      </div>

      {/* Sliders with Input Fields */}
      <div className="space-y-4">
        {getSliderConfig(colorFormat, colorFormats).map((slider) => (
          <div key={slider.key} className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">{slider.label}</label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={slider.value}
                  onChange={(e) =>
                    onSliderChange(slider.key, [parseInt(e.target.value) || 0])
                  }
                  min={0}
                  max={slider.max}
                  className="w-20 h-8 text-xs text-center min-w-0"
                />
              </div>
            </div>
            <Slider
              value={[slider.value]}
              onValueChange={(value) => onSliderChange(slider.key, value)}
              max={slider.max}
              min={0}
              step={1}
              className="w-full"
            />
          </div>
        ))}
      </div>
    </div>
  );
};
