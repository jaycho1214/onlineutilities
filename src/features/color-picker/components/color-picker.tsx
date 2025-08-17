"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { HexColorPicker } from "react-colorful";
import { GlassSurface } from "@/features/shared/ui/glass-surface";
import { Button } from "@/features/shared/ui/button";
import { Input } from "@/features/shared/ui/input";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/features/shared/ui/tooltip";
import {
  Copy,
  Pipette,
  Upload,
  Palette,
  Monitor,
  Image as ImageIcon,
  Search,
  Droplets,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/features/shared/ui/skeleton";
import { 
  type ColorFormats, 
  getColorFormats, 
  rgbToHex, 
  hslToHex, 
  hsvToHex, 
  cmykToHex 
} from "../lib/color-conversions";
import { parseColorInput } from "../lib/color-parser";
import { fetchColorName } from "../lib/color-api";
import { getSliderConfig } from "../lib/color-slider-config";

export const ColorPicker: React.FC = () => {
  const [selectedColor, setSelectedColor] = useState("#3b82f6");
  const [colorFormat, setColorFormat] = useState<
    "RGB" | "HSL" | "HSV" | "CMYK" | "LAB"
  >("RGB");
  const [pickerMode, setPickerMode] = useState<"palette" | "image">("palette");
  const [recentColors, setRecentColors] = useState<string[]>([]);
  const [colorName, setColorName] = useState<string | null>(null);
  const [loadingColorName, setLoadingColorName] = useState<boolean>(false);
  const colorNameTimeout = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const recentColorsTimeout = useRef<NodeJS.Timeout | null>(null);

  const colorFormats = getColorFormats(selectedColor);

  const MainCopyButton: React.FC<{ value: string }> = ({ value }) => {
    const [localCopiedState, setLocalCopiedState] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    
    const handleCopy = async () => {
      try {
        await navigator.clipboard.writeText(value);
        setLocalCopiedState(true);
        setIsOpen(true);
        setTimeout(() => {
          setLocalCopiedState(false);
          setIsOpen(false);
        }, 2000);
      } catch (err) {
        console.error("Failed to copy: ", err);
      }
    };

    return (
      <Tooltip open={isOpen} onOpenChange={setIsOpen}>
        <TooltipTrigger asChild>
          <Button
            size="icon"
            variant="ghost"
            onClick={handleCopy}
            className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white border border-white/20"
          >
            <Copy className="w-4 h-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {localCopiedState ? "Copied!" : "Copy Color"}
        </TooltipContent>
      </Tooltip>
    );
  };

  const CopyButton: React.FC<{ value: string; format: string }> = ({
    value,
    format,
  }) => {
    const [localCopiedState, setLocalCopiedState] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    
    const handleCopy = async () => {
      try {
        await navigator.clipboard.writeText(value);
        setLocalCopiedState(true);
        setIsOpen(true);
        setTimeout(() => {
          setLocalCopiedState(false);
          setIsOpen(false);
        }, 2000);
      } catch (err) {
        console.error("Failed to copy: ", err);
      }
    };

    return (
      <Tooltip open={isOpen} onOpenChange={setIsOpen}>
        <TooltipTrigger asChild>
          <Button
            size="icon"
            variant="ghost"
            onClick={handleCopy}
            className="h-8 w-8"
          >
            <Copy className="w-3 h-3" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {localCopiedState ? "Copied!" : `Copy ${format}`}
        </TooltipContent>
      </Tooltip>
    );
  };

  const addToRecentColors = useCallback((color: string) => {
    // Clear existing timeout
    if (recentColorsTimeout.current) {
      clearTimeout(recentColorsTimeout.current);
    }

    // Debounce the addition of colors to recent list
    recentColorsTimeout.current = setTimeout(() => {
      setRecentColors((prev) => {
        const filtered = prev.filter((c) => c !== color);
        return [color, ...filtered].slice(0, 12);
      });
    }, 500); // 500ms debounce
  }, []);

  const debouncedFetchColorName = useCallback((color: string) => {
    // Clear existing timeout
    if (colorNameTimeout.current) {
      clearTimeout(colorNameTimeout.current);
    }

    // Set loading state immediately
    setLoadingColorName(true);

    // Debounce the API call
    colorNameTimeout.current = setTimeout(async () => {
      const name = await fetchColorName(color);
      setColorName(name);
      setLoadingColorName(false);
    }, 800); // 800ms debounce
  }, []);

  const handleColorChange = (color: string) => {
    setSelectedColor(color);
    addToRecentColors(color);
    debouncedFetchColorName(color);
  };

  const handleInputChange = (input: string) => {
    const parsedColor = parseColorInput(input);
    if (parsedColor) {
      handleColorChange(parsedColor);
    } else {
      // Still update the input for real-time feedback, even if invalid
      setSelectedColor(input);
    }
  };

  const startScreenColorPicker = async () => {
    if (!("EyeDropper" in window)) {
      alert("Screen color picker is not supported in this browser");
      return;
    }

    try {
      // @ts-ignore - EyeDropper is not in TypeScript types yet
      const eyeDropper = new EyeDropper();
      const result = await eyeDropper.open();
      handleColorChange(result.sRGBHex);
    } catch (err) {
      console.error("Screen color picker failed:", err);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setImageDataUrl(dataUrl);
      setPickerMode("image");
    };
    reader.readAsDataURL(file);
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const imageData = ctx.getImageData(x, y, 1, 1);
    const [r, g, b] = imageData.data;
    const hex = `#${[r, g, b]
      .map((x) => x.toString(16).padStart(2, "0"))
      .join("")}`;
    handleColorChange(hex);
  };

  React.useEffect(() => {
    if (imageDataUrl && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const img = new Image();
      img.onload = () => {
        const maxWidth = 400;
        const maxHeight = 300;
        const scale = Math.min(maxWidth / img.width, maxHeight / img.height);

        canvas.width = img.width * scale;
        canvas.height = img.height * scale;

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      };
      img.src = imageDataUrl;
    }
  }, [imageDataUrl]);

  // Initialize color name for default color
  React.useEffect(() => {
    debouncedFetchColorName(selectedColor);
  }, [debouncedFetchColorName]);

  // Cleanup timeouts on unmount
  React.useEffect(() => {
    return () => {
      if (recentColorsTimeout.current) {
        clearTimeout(recentColorsTimeout.current);
      }
      if (colorNameTimeout.current) {
        clearTimeout(colorNameTimeout.current);
      }
    };
  }, []);

  const handleSliderChange = (component: string, value: number[]) => {
    const currentValue = value[0];

    if (colorFormat === "RGB") {
      const rgb = { ...colorFormats.rgb };
      rgb[component as "r" | "g" | "b"] = currentValue;
      const newHex = rgbToHex(rgb.r, rgb.g, rgb.b);
      handleColorChange(newHex);
    } else if (colorFormat === "HSL") {
      const hsl = { ...colorFormats.hsl };
      hsl[component as "h" | "s" | "l"] = currentValue;
      const newHex = hslToHex(hsl.h, hsl.s, hsl.l);
      handleColorChange(newHex);
    } else if (colorFormat === "HSV") {
      const hsv = { ...colorFormats.hsv };
      hsv[component as "h" | "s" | "v"] = currentValue;
      const newHex = hsvToHex(hsv.h, hsv.s, hsv.v);
      handleColorChange(newHex);
    } else if (colorFormat === "CMYK") {
      const cmyk = { ...colorFormats.cmyk };
      cmyk[component as "c" | "m" | "y" | "k"] = currentValue;
      const newHex = cmykToHex(cmyk.c, cmyk.m, cmyk.y, cmyk.k);
      handleColorChange(newHex);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
      {/* Header */}
      <div className="text-left space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
          Color Picker
        </h1>
        <p className="text-muted-foreground">
          Pick colors from screen, images, or create custom palettes
        </p>
      </div>

      {/* Mode Selector */}
      <div className="flex gap-2">
        <Button
          variant={pickerMode === "palette" ? "default" : "ghost"}
          size="sm"
          onClick={() => setPickerMode("palette")}
          className={cn(
            "flex items-center gap-2 px-3 py-2 h-9 transition-all duration-200",
            pickerMode === "palette"
              ? "bg-primary/20 text-primary border-primary/30"
              : "hover:bg-white/10"
          )}
        >
          <Palette className="w-4 h-4" />
          <span className="text-sm font-medium">Palette</span>
        </Button>
        <Button
          variant={pickerMode === "image" ? "default" : "ghost"}
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "flex items-center gap-2 px-3 py-2 h-9 transition-all duration-200",
            pickerMode === "image"
              ? "bg-primary/20 text-primary border-primary/30"
              : "hover:bg-white/10"
          )}
        >
          <ImageIcon className="w-4 h-4" />
          <span className="text-sm font-medium">Image</span>
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
      </div>

      {/* Main Layout - Side by Side */}
      <div className="grid lg:grid-cols-[1fr,400px] gap-8">
        {/* Left Side - Color Display & Picker */}
        <div className="space-y-6">
          {/* Color Display with Name */}
          <GlassSurface className="relative overflow-hidden">
            <div
              className="w-full h-64 md:h-80 relative"
              style={{ backgroundColor: selectedColor }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />

              {/* Color Info Overlay */}
              <div className="absolute top-6 left-6 text-white drop-shadow-lg">
                <div className="text-xs opacity-75 mb-1">
                  {selectedColor.toUpperCase()}
                </div>
                <div className="text-2xl font-bold">
                  {loadingColorName ? (
                    <Skeleton className="h-8 w-32 bg-white/20" />
                  ) : (
                    colorName || selectedColor.toUpperCase()
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="absolute top-6 right-6 flex gap-2">
                <MainCopyButton value={selectedColor} />

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={startScreenColorPicker}
                      className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white border border-white/20"
                    >
                      <Pipette className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Pick from Screen</TooltipContent>
                </Tooltip>
              </div>
            </div>
          </GlassSurface>

          {/* Combined Image Picker and Color Controls in One Row */}
          <GlassSurface className="p-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Left: Image Picker or Color Picker */}
              <div className="space-y-4">
                {pickerMode === "image" && imageDataUrl ? (
                  <>
                    <h3 className="font-semibold">
                      Click on image to pick color
                    </h3>
                    <div className="relative">
                      <canvas
                        ref={canvasRef}
                        onClick={handleCanvasClick}
                        className="max-w-full border rounded-lg cursor-crosshair"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <h3 className="font-semibold">Color Picker</h3>
                    <HexColorPicker
                      color={selectedColor}
                      onChange={handleColorChange}
                      style={{ width: "100%", height: "250px" }}
                    />
                  </>
                )}
              </div>

              {/* Right: Color Controls Sliders */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Select
                    value={colorFormat}
                    onValueChange={(value) => setColorFormat(value as any)}
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
                    onChange={(e) => handleInputChange(e.target.value)}
                    placeholder="#FFFFFF"
                    className="font-mono"
                  />
                </div>

                {/* Sliders with Input Fields */}
                <div className="space-y-4">
                  {getSliderConfig(colorFormat, colorFormats).map((slider) => (
                    <div key={slider.key} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">
                          {slider.label}
                        </label>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            value={slider.value}
                            onChange={(e) =>
                              handleSliderChange(slider.key, [
                                parseInt(e.target.value) || 0,
                              ])
                            }
                            min={0}
                            max={slider.max}
                            className="w-20 h-8 text-xs text-center min-w-0"
                          />
                        </div>
                      </div>
                      <Slider
                        value={[slider.value]}
                        onValueChange={(value) =>
                          handleSliderChange(slider.key, value)
                        }
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
          </GlassSurface>
        </div>

        {/* Right Side - Info Only */}
        <div className="space-y-6">
          {/* Color Formats */}
          <GlassSurface className="p-6">
            <h3 className="font-semibold mb-4">Color Formats</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-2 rounded bg-white/5">
                <span className="text-sm">HEX</span>
                <div className="flex items-center gap-2">
                  <code className="text-sm font-mono">
                    {colorFormats.hex.toUpperCase()}
                  </code>
                  <CopyButton value={colorFormats.hex} format="HEX" />
                </div>
              </div>

              <div className="flex items-center justify-between p-2 rounded bg-white/5">
                <span className="text-sm">RGB</span>
                <div className="flex items-center gap-2">
                  <code className="text-sm font-mono">
                    {colorFormats.rgb.r}, {colorFormats.rgb.g},{" "}
                    {colorFormats.rgb.b}
                  </code>
                  <CopyButton
                    value={`rgb(${colorFormats.rgb.r}, ${colorFormats.rgb.g}, ${colorFormats.rgb.b})`}
                    format="RGB"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-2 rounded bg-white/5">
                <span className="text-sm">HSL</span>
                <div className="flex items-center gap-2">
                  <code className="text-sm font-mono">
                    {colorFormats.hsl.h}°, {colorFormats.hsl.s}%,{" "}
                    {colorFormats.hsl.l}%
                  </code>
                  <CopyButton
                    value={`hsl(${colorFormats.hsl.h}, ${colorFormats.hsl.s}%, ${colorFormats.hsl.l}%)`}
                    format="HSL"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-2 rounded bg-white/5">
                <span className="text-sm">HSV</span>
                <div className="flex items-center gap-2">
                  <code className="text-sm font-mono">
                    {colorFormats.hsv.h}°, {colorFormats.hsv.s}%,{" "}
                    {colorFormats.hsv.v}%
                  </code>
                  <CopyButton
                    value={`hsv(${colorFormats.hsv.h}, ${colorFormats.hsv.s}%, ${colorFormats.hsv.v}%)`}
                    format="HSV"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-2 rounded bg-white/5">
                <span className="text-sm">CMYK</span>
                <div className="flex items-center gap-2">
                  <code className="text-sm font-mono">
                    {colorFormats.cmyk.c}%, {colorFormats.cmyk.m}%,{" "}
                    {colorFormats.cmyk.y}%, {colorFormats.cmyk.k}%
                  </code>
                  <CopyButton
                    value={`cmyk(${colorFormats.cmyk.c}%, ${colorFormats.cmyk.m}%, ${colorFormats.cmyk.y}%, ${colorFormats.cmyk.k}%)`}
                    format="CMYK"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-2 rounded bg-white/5">
                <span className="text-sm">LAB</span>
                <div className="flex items-center gap-2">
                  <code className="text-sm font-mono">
                    {colorFormats.lab.l}, {colorFormats.lab.a},{" "}
                    {colorFormats.lab.b}
                  </code>
                  <CopyButton
                    value={`lab(${colorFormats.lab.l} ${colorFormats.lab.a} ${colorFormats.lab.b})`}
                    format="LAB"
                  />
                </div>
              </div>
            </div>
          </GlassSurface>

          {/* Recent Colors */}
          {recentColors.length > 0 && (
            <GlassSurface className="p-6">
              <h3 className="font-semibold mb-4">Recent Colors</h3>
              <div className="grid grid-cols-6 gap-2">
                {recentColors.map((color, index) => (
                  <button
                    key={index}
                    className="aspect-square rounded-lg border border-white/20 hover:scale-105 transition-transform"
                    style={{ backgroundColor: color }}
                    onClick={() => setSelectedColor(color)}
                  />
                ))}
              </div>
            </GlassSurface>
          )}
        </div>
      </div>
    </div>
  );
};