"use client";

import React, { useState, useCallback, useRef, useMemo } from "react";
import { useTranslations } from "next-intl";
import { GlassSurface } from "@/features/shared/ui/glass-surface";
import {
  getColorFormats,
  rgbToHex,
  hslToHex,
  hsvToHex,
  cmykToHex,
} from "@/features/color-picker/lib/color-conversions";
import { parseColorInput } from "@/features/color-picker/lib/color-parser";
import { fetchColorName } from "@/features/color-picker/lib/color-api";
import { ColorFormatsPanel } from "@/features/color-picker/components/color-formats-panel";
import { ColorDisplay } from "@/features/color-picker/components/color-display";
import { ColorPickerHeader } from "@/features/color-picker/components/color-picker-header";
import { DragDropOverlay } from "@/features/color-picker/components/drag-drop-overlay";
import { useDragDrop } from "@/features/color-picker/hooks/use-drag-drop";
import { ColorPickerCanvas } from "@/features/color-picker/components/color-picker-canvas";
import { ColorPickerPalette } from "@/features/color-picker/components/color-picker-palette";
import { ColorPickerControlPanel } from "@/features/color-picker/components/color-picker-control-panel";
import { RecentColorsPanel } from "@/features/color-picker/components/recent-colors-panel";
import { useRecentColors } from "@/features/color-picker/hooks/use-recent-colors";

export const ColorPicker: React.FC = () => {
  const t = useTranslations("ColorPicker");
  const [selectedColor, setSelectedColor] = useState("#3b82f6");
  const [colorFormat, setColorFormat] = useState<
    "RGB" | "HSL" | "HSV" | "CMYK" | "LAB"
  >("RGB");
  const [hasImage, setHasImage] = useState(false);
  const [colorName, setColorName] = useState<string | null>(null);
  const [loadingColorName, setLoadingColorName] = useState<boolean>(false);
  const colorNameTimeout = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const { addRecentColor } = useRecentColors();

  const colorFormats = useMemo(
    () => getColorFormats(selectedColor),
    [selectedColor],
  );

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

  const handleColorChange = useCallback(
    (color: string) => {
      setSelectedColor(color);
      addRecentColor(color);
      debouncedFetchColorName(color);
    },
    [addRecentColor, debouncedFetchColorName],
  );

  const handleInputChange = useCallback(
    (input: string) => {
      const parsedColor = parseColorInput(input);
      if (parsedColor) {
        handleColorChange(parsedColor);
      } else {
        // Still update the input for real-time feedback, even if invalid
        setSelectedColor(input);
      }
    },
    [handleColorChange],
  );

  const startScreenColorPicker = useCallback(async () => {
    if (!("EyeDropper" in window)) {
      alert(t("notifications.screenPickerNotSupported"));
      return;
    }

    try {
      // @ts-expect-error - EyeDropper is not in TypeScript types yet
      const eyeDropper = new EyeDropper();
      const result = await eyeDropper.open();
      handleColorChange(result.sRGBHex);
    } catch (err) {
      console.error("Screen color picker failed:", err);
    }
  }, [handleColorChange, t]);

  const handleImageFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setImageDataUrl(dataUrl);
      setHasImage(true);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleImageUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;
      handleImageFile(file);
    },
    [handleImageFile],
  );

  const { isDragOver, isVisible } = useDragDrop({
    onImageDrop: handleImageFile,
  });

  const handleImageRemove = useCallback(() => {
    setImageDataUrl(null);
    setHasImage(false);
    // Clear the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  const handleCanvasClick = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
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
    },
    [handleColorChange],
  );

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
  }, [debouncedFetchColorName, selectedColor]);

  // Cleanup timeouts on unmount
  React.useEffect(() => {
    return () => {
      if (colorNameTimeout.current) {
        clearTimeout(colorNameTimeout.current);
      }
    };
  }, []);

  const handleSliderChange = useCallback(
    (component: string, value: number[]) => {
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
    },
    [colorFormat, colorFormats, handleColorChange],
  );

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
      <ColorPickerHeader />

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />

      {/* Main Layout - Side by Side */}
      <div className="grid lg:grid-cols-[1fr,400px] gap-8">
        {/* Left Side - Color Display & Picker */}
        <div className="space-y-6">
          {/* Color Display with Name */}
          <ColorDisplay
            selectedColor={selectedColor}
            colorName={colorName}
            loadingColorName={loadingColorName}
            onScreenColorPicker={startScreenColorPicker}
            onImageUpload={() => fileInputRef.current?.click()}
            onImageRemove={handleImageRemove}
            hasImage={hasImage}
          />

          <GlassSurface className="p-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                {hasImage && imageDataUrl ? (
                  <ColorPickerCanvas
                    imageDataUrl={imageDataUrl}
                    canvasRef={canvasRef}
                    onCanvasClick={handleCanvasClick}
                  />
                ) : (
                  <ColorPickerPalette
                    selectedColor={selectedColor}
                    onColorChange={handleColorChange}
                  />
                )}
              </div>

              <ColorPickerControlPanel
                selectedColor={selectedColor}
                colorFormat={colorFormat}
                colorFormats={colorFormats}
                onColorFormatChange={setColorFormat}
                onInputChange={handleInputChange}
                onSliderChange={handleSliderChange}
              />
            </div>
          </GlassSurface>
        </div>

        <ColorFormatsPanel colorFormats={colorFormats} />
      </div>

      {/* Recent Colors Panel */}
      <RecentColorsPanel onColorSelect={handleColorChange} />

      {/* Drag and Drop Overlay */}
      <DragDropOverlay isVisible={isVisible} isDragOver={isDragOver} />
    </div>
  );
};
