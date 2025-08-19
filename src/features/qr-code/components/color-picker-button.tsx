"use client";

import React, { useState, useEffect, memo, useCallback } from "react";
import { HexColorPicker } from "react-colorful";
import { Input } from "@/features/shared/ui/input";
import { Button } from "@/features/shared/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface ColorPickerButtonProps {
  color: string;
  label: string;
  onChange: (color: string) => void;
}

export const ColorPickerButton = memo(
  ({ color, label, onChange }: ColorPickerButtonProps) => {
    const [inputValue, setInputValue] = useState(color);

    useEffect(() => {
      setInputValue(color);
    }, [color]);

    const handleInputChange = useCallback(
      (value: string) => {
        setInputValue(value);
        if (/^#[0-9A-F]{6}$/i.test(value)) {
          onChange(value);
        }
      },
      [onChange],
    );

    const handleColorChange = useCallback(
      (newColor: string) => {
        onChange(newColor);
      },
      [onChange],
    );

    return (
      <div className="space-y-1">
        <label className="text-xs text-muted-foreground">{label}</label>
        <div className="flex gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="none"
                className="h-10 w-10 rounded-lg p-0"
                aria-label={`Pick color for ${label}`}
              >
                <div
                  className="w-6 h-6 rounded border border-border/50"
                  style={{ backgroundColor: color }}
                />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto p-3 border border-border bg-background/95 backdrop-blur-xl"
              align="start"
              sideOffset={5}
            >
              <HexColorPicker color={color} onChange={handleColorChange} />
            </PopoverContent>
          </Popover>
          <Input
            value={inputValue}
            onChange={(e) => handleInputChange(e.target.value.toUpperCase())}
            className="h-10 flex-1 font-mono text-xs"
            placeholder="#000000"
            maxLength={7}
            aria-label={`Hex color input for ${label}`}
          />
        </div>
      </div>
    );
  },
);

ColorPickerButton.displayName = "ColorPickerButton";
