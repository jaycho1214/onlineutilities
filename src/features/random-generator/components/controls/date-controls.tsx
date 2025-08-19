"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/features/shared/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/features/shared/ui/select";
import type { DateConfig, DateFormat } from "../../types";

interface DateControlsProps {
  config: DateConfig;
  onChange: (config: DateConfig) => void;
}

export function DateControls({ config, onChange }: DateControlsProps) {
  const t = useTranslations("RandomGenerator.date");

  const handleChange = <K extends keyof DateConfig>(
    field: K,
    value: DateConfig[K],
  ) => {
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

      {/* Date Range */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t("startDate")}
          </label>
          <Input
            type="date"
            value={config.startDate}
            onChange={(e) => handleChange("startDate", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t("endDate")}
          </label>
          <Input
            type="date"
            value={config.endDate}
            onChange={(e) => handleChange("endDate", e.target.value)}
          />
        </div>
      </div>

      {/* Date Format */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t("format")}
        </label>
        <Select
          value={config.format}
          onValueChange={(value: DateFormat) => handleChange("format", value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="iso">{t("formats.iso")}</SelectItem>
            <SelectItem value="us">{t("formats.us")}</SelectItem>
            <SelectItem value="european">{t("formats.european")}</SelectItem>
            <SelectItem value="timestamp">{t("formats.timestamp")}</SelectItem>
            <SelectItem value="custom">{t("formats.custom")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Custom Format */}
      {config.format === "custom" && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t("customFormat")}
          </label>
          <Input
            type="text"
            value={config.customFormat}
            onChange={(e) => handleChange("customFormat", e.target.value)}
            placeholder={t("customFormatPlaceholder")}
            className="font-mono"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            YYYY = year, MM = month, DD = day, HH = hour, mm = minute, ss =
            second
          </p>
        </div>
      )}

      {/* Preview */}
      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
          Preview format:
        </p>
        <code className="text-sm font-mono text-gray-900 dark:text-gray-100">
          {config.format === "iso" && "2023-12-25"}
          {config.format === "us" && "12/25/2023"}
          {config.format === "european" && "25/12/2023"}
          {config.format === "timestamp" && "1703462400"}
          {config.format === "custom" && (config.customFormat || "YYYY-MM-DD")}
        </code>
      </div>
    </div>
  );
}
