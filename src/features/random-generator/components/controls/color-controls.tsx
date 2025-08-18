"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/features/shared/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import type { ColorConfig, ColorFormat } from "../../types";

interface ColorControlsProps {
  config: ColorConfig;
  onChange: (config: ColorConfig) => void;
}

export function ColorControls({ config, onChange }: ColorControlsProps) {
  const t = useTranslations("RandomGenerator.color");

  const handleChange = <K extends keyof ColorConfig>(field: K, value: ColorConfig[K]) => {
    onChange({ ...config, [field]: value });
  };

  return (
    <div className="space-y-6">
      {/* Count */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t("count")}
        </label>
        <Input
          type="number"
          min={1}
          max={100}
          value={config.count}
          onChange={(e) => handleChange("count", parseInt(e.target.value) || 1)}
          className="w-24"
        />
      </div>

      {/* Color Format */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t("format")}
        </label>
        <Select 
          value={config.format} 
          onValueChange={(value: ColorFormat) => handleChange("format", value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="hex">{t("formats.hex")}</SelectItem>
            <SelectItem value="rgb">{t("formats.rgb")}</SelectItem>
            <SelectItem value="hsl">{t("formats.hsl")}</SelectItem>
            <SelectItem value="hsv">{t("formats.hsv")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Hue Range */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t("hueRange")}: {config.hueRange[0]}° - {config.hueRange[1]}°
        </label>
        <div className="px-3">
          <Slider
            value={config.hueRange}
            onValueChange={(value) => handleChange("hueRange", value as [number, number])}
            min={0}
            max={360}
            step={1}
            className="w-full"
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>0° (red)</span>
          <span>360° (red)</span>
        </div>
      </div>

      {/* Saturation Range */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t("saturationRange")}: {config.saturationRange[0]}% - {config.saturationRange[1]}%
        </label>
        <div className="px-3">
          <Slider
            value={config.saturationRange}
            onValueChange={(value) => handleChange("saturationRange", value as [number, number])}
            min={0}
            max={100}
            step={1}
            className="w-full"
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>0% (gray)</span>
          <span>100% (vivid)</span>
        </div>
      </div>

      {/* Lightness Range */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t("lightnessRange")}: {config.lightnessRange[0]}% - {config.lightnessRange[1]}%
        </label>
        <div className="px-3">
          <Slider
            value={config.lightnessRange}
            onValueChange={(value) => handleChange("lightnessRange", value as [number, number])}
            min={0}
            max={100}
            step={1}
            className="w-full"
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>0% (black)</span>
          <span>100% (white)</span>
        </div>
      </div>

      {/* Preview */}
      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Preview format:</p>
        <code className="text-sm font-mono text-gray-900 dark:text-gray-100">
          {config.format === "hex" && "#FF5733"}
          {config.format === "rgb" && "rgb(255, 87, 51)"}
          {config.format === "hsl" && "hsl(14, 100%, 60%)"}
          {config.format === "hsv" && "hsv(14, 80%, 100%)"}
        </code>
      </div>
    </div>
  );
}