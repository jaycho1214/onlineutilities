import React from "react";
import { HexColorPicker } from "react-colorful";

interface ColorPickerPaletteProps {
  selectedColor: string;
  onColorChange: (color: string) => void;
}

export const ColorPickerPalette: React.FC<ColorPickerPaletteProps> = ({
  selectedColor,
  onColorChange,
}) => {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Color Picker</h3>
      <HexColorPicker
        color={selectedColor}
        onChange={onColorChange}
        style={{ width: "100%", height: "250px" }}
      />
    </div>
  );
};
