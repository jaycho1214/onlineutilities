import React from "react";
import { HexColorPicker } from "react-colorful";
import { Input } from "@/features/shared/ui/input";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getSliderConfig } from "../lib/color-slider-config";
import type { ColorFormats } from "../lib/color-conversions";
import type { ColorFormat } from "../hooks/use-color-picker";

interface ColorControlsProps {
  selectedColor: string;
  colorFormat: ColorFormat;
  colorFormats: ColorFormats;
  onColorChange: (color: string) => void;
  onColorFormatChange: (format: ColorFormat) => void;
  onInputChange: (input: string) => void;
  onSliderChange: (component: string, value: number[]) => void;
}

const ColorControlsComponent: React.FC<ColorControlsProps> = React.memo(({
  selectedColor,
  colorFormat,
  colorFormats,
  onColorChange,
  onColorFormatChange,
  onInputChange,
  onSliderChange,
}) => {
  const sliderConfig = getSliderConfig(colorFormat, colorFormats);
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Color Controls</h3>
        <Select
          value={colorFormat}
          onValueChange={onColorFormatChange}
        >
          <SelectTrigger className="w-20">
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

      <div className="grid md:grid-cols-2 gap-6">
        {/* Color Picker */}
        <div className="space-y-4">
          <HexColorPicker
            color={selectedColor}
            onChange={onColorChange}
            style={{ width: "100%", height: "200px" }}
          />
        </div>

        {/* Controls */}
        <div className="space-y-4">
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
          <div className="space-y-3">
            {sliderConfig.map((slider) => (
              <div key={slider.key} className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">
                    {slider.label}
                  </label>
                  <Input
                    type="number"
                    value={slider.value}
                    onChange={(e) =>
                      onSliderChange(slider.key, [
                        parseInt(e.target.value) || 0,
                      ])
                    }
                    min={0}
                    max={slider.max}
                    className="w-20 h-8 text-xs text-center min-w-0"
                  />
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
      </div>
    </div>
  );
});

ColorControlsComponent.displayName = 'ColorControls';
export const ColorControls = ColorControlsComponent;