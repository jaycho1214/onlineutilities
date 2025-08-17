import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import {
  getColorFormats,
  rgbToHex,
  hslToHex,
  hsvToHex,
  cmykToHex,
  type ColorFormats,
} from "../lib/color-conversions";
import { parseColorInput } from "../lib/color-parser";
import { fetchColorName } from "../lib/color-api";
import { storage } from "../lib/storage";

export type ColorFormat = "RGB" | "HSL" | "HSV" | "CMYK" | "LAB";
export type PickerMode = "palette" | "image";

export interface UseColorPickerReturn {
  // State
  selectedColor: string;
  colorFormat: ColorFormat;
  pickerMode: PickerMode;
  recentColors: string[];
  colorName: string | null;
  loadingColorName: boolean;
  imageDataUrl: string | null;

  // Derived state
  colorFormats: ColorFormats;

  // Actions
  setSelectedColor: (color: string) => void;
  setColorFormat: (format: ColorFormat) => void;
  setPickerMode: (mode: PickerMode) => void;
  handleColorChange: (color: string) => void;
  handleInputChange: (input: string) => void;
  handleSliderChange: (component: string, value: number[]) => void;
  handleImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  startScreenColorPicker: () => Promise<void>;

  // Refs
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
}

export const useColorPicker = (): UseColorPickerReturn => {
  const [selectedColor, setSelectedColor] = useState("#3b82f6");
  const [colorFormat, setColorFormat] = useState<ColorFormat>("RGB");
  const [pickerMode, setPickerMode] = useState<PickerMode>("palette");
  const [recentColors, setRecentColors] = useState<string[]>([]);
  const [colorName, setColorName] = useState<string | null>(null);
  const [loadingColorName, setLoadingColorName] = useState<boolean>(false);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  // Refs
  const colorNameTimeout = useRef<NodeJS.Timeout | null>(null);
  const recentColorsTimeout = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Memoize expensive color format calculations
  const colorFormats = useMemo(
    () => getColorFormats(selectedColor),
    [selectedColor]
  );

  // Debounced color name fetching
  const debouncedFetchColorName = useCallback((color: string) => {
    if (colorNameTimeout.current) {
      clearTimeout(colorNameTimeout.current);
    }

    setLoadingColorName(true);

    colorNameTimeout.current = setTimeout(async () => {
      try {
        const name = await fetchColorName(color);
        setColorName(name);
      } catch (error) {
        console.error("Failed to fetch color name:", error);
        setColorName(null);
      } finally {
        setLoadingColorName(false);
      }
    }, 800);
  }, []);

  // Debounced recent colors addition
  const addToRecentColors = useCallback((color: string) => {
    if (recentColorsTimeout.current) {
      clearTimeout(recentColorsTimeout.current);
    }

    recentColorsTimeout.current = setTimeout(() => {
      setRecentColors((prev) => {
        if (prev.includes(color)) return prev;
        const newColors = [color, ...prev].slice(0, 12);
        if (typeof window !== "undefined") {
          storage.setRecentColors(newColors);
        }
        return newColors;
      });
    }, 500);
  }, []);

  // Main color change handler
  const handleColorChange = useCallback(
    (color: string) => {
      setSelectedColor(color);
      addToRecentColors(color);
      debouncedFetchColorName(color);
    },
    [addToRecentColors, debouncedFetchColorName]
  );

  // Input change handler with validation
  const handleInputChange = useCallback(
    (input: string) => {
      const parsedColor = parseColorInput(input);
      if (parsedColor) {
        handleColorChange(parsedColor);
      } else {
        setSelectedColor(input); // For real-time feedback
      }
    },
    [handleColorChange]
  );

  // Slider change handler
  const handleSliderChange = useCallback(
    (component: string, value: number[]) => {
      const currentValue = value[0];
      let newHex: string;

      switch (colorFormat) {
        case "RGB": {
          const rgb = { ...colorFormats.rgb };
          rgb[component as "r" | "g" | "b"] = currentValue;
          newHex = rgbToHex(rgb.r, rgb.g, rgb.b);
          break;
        }
        case "HSL": {
          const hsl = { ...colorFormats.hsl };
          hsl[component as "h" | "s" | "l"] = currentValue;
          newHex = hslToHex(hsl.h, hsl.s, hsl.l);
          break;
        }
        case "HSV": {
          const hsv = { ...colorFormats.hsv };
          hsv[component as "h" | "s" | "v"] = currentValue;
          newHex = hsvToHex(hsv.h, hsv.s, hsv.v);
          break;
        }
        case "CMYK": {
          const cmyk = { ...colorFormats.cmyk };
          cmyk[component as "c" | "m" | "y" | "k"] = currentValue;
          newHex = cmykToHex(cmyk.c, cmyk.m, cmyk.y, cmyk.k);
          break;
        }
        default:
          return;
      }

      handleColorChange(newHex);
    },
    [colorFormat, colorFormats, handleColorChange]
  );

  // Screen color picker
  const startScreenColorPicker = useCallback(async () => {
    if (!("EyeDropper" in window)) {
      throw new Error("Screen color picker is not supported in this browser");
    }

    try {
      // @ts-ignore - EyeDropper is not in TypeScript types yet
      const eyeDropper = new EyeDropper();
      const result = await eyeDropper.open();
      handleColorChange(result.sRGBHex);
    } catch (err) {
      console.error("Screen color picker failed:", err);
      throw err;
    }
  }, [handleColorChange]);

  // Image upload handler
  const handleImageUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        setImageDataUrl(dataUrl);
        setPickerMode("image");
      };
      reader.onerror = () => {
        console.error("Failed to read image file");
      };
      reader.readAsDataURL(file);
    },
    []
  );

  // Initialize client-side only data
  useEffect(() => {
    setIsClient(true);

    // Load saved data from localStorage
    const savedFormat = storage.getLastColorFormat();
    if (
      savedFormat &&
      ["RGB", "HSL", "HSV", "CMYK", "LAB"].includes(savedFormat)
    ) {
      setColorFormat(savedFormat as ColorFormat);
    }

    const savedColors = storage.getRecentColors();
    setRecentColors(savedColors);

    // Initialize color name for default color
    debouncedFetchColorName(selectedColor);
  }, [debouncedFetchColorName, selectedColor]);

  // Save color format preference (only on client)
  useEffect(() => {
    if (isClient) {
      storage.setLastColorFormat(colorFormat);
    }
  }, [colorFormat, isClient]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (recentColorsTimeout.current) {
        clearTimeout(recentColorsTimeout.current);
      }
      if (colorNameTimeout.current) {
        clearTimeout(colorNameTimeout.current);
      }
    };
  }, []);

  return {
    // State
    selectedColor,
    colorFormat,
    pickerMode,
    recentColors,
    colorName,
    loadingColorName,
    imageDataUrl,

    // Derived state
    colorFormats,

    // Actions
    setSelectedColor,
    setColorFormat,
    setPickerMode,
    handleColorChange,
    handleInputChange,
    handleSliderChange,
    handleImageUpload,
    startScreenColorPicker,

    // Refs
    fileInputRef,
    canvasRef,
  };
};
