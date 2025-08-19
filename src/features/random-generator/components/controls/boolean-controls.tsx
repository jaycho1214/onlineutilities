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
import { Slider } from "@/features/shared/ui/slider";
import type { BooleanConfig, BooleanFormat } from "../../types";

interface BooleanControlsProps {
  config: BooleanConfig;
  onChange: (config: BooleanConfig) => void;
}

export function BooleanControls({ config, onChange }: BooleanControlsProps) {
  const t = useTranslations("RandomGenerator.boolean");

  const handleChange = <K extends keyof BooleanConfig>(
    field: K,
    value: BooleanConfig[K],
  ) => {
    onChange({ ...config, [field]: value });
  };

  // Calculate conflict probability for boolean values
  const calculateConflictProbability = () => {
    // Boolean has only 2 possible values (true/false)
    const totalPossibleValues = 2;

    const scenarios = [
      { users: 3, label: "3 values" },
      { users: 10, label: "10 values" },
      { users: 50, label: "50 values" },
      { users: 100, label: "100 values" },
    ];

    return scenarios.map((scenario) => {
      if (scenario.users >= totalPossibleValues)
        return { ...scenario, probability: 100 };

      // Birthday paradox: probability of at least one collision
      const probability =
        1 - Math.exp(-Math.pow(scenario.users, 2) / (2 * totalPossibleValues));
      return { ...scenario, probability: probability * 100 };
    });
  };

  const conflictProbability = calculateConflictProbability();
  const formatProbability = (prob: number) => {
    if (prob < 0.001) return "< 0.001%";
    if (prob < 1) return prob.toFixed(3) + "%";
    if (prob < 10) return prob.toFixed(2) + "%";
    if (prob < 100) return prob.toFixed(1) + "%";
    return "~100%";
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

      {/* Probability */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t("probability")}: {config.probability}%
        </label>
        <Slider
          value={[config.probability]}
          onValueChange={([value]) => handleChange("probability", value)}
          min={0}
          max={100}
          step={1}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>0% (always false)</span>
          <span>100% (always true)</span>
        </div>
      </div>

      {/* Output Format */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t("format")}
        </label>
        <Select
          value={config.format}
          onValueChange={(value: BooleanFormat) =>
            handleChange("format", value)
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="boolean">{t("formats.boolean")}</SelectItem>
            <SelectItem value="binary">{t("formats.binary")}</SelectItem>
            <SelectItem value="yesno">{t("formats.yesno")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Conflict Probability */}
      <div>
        <div className="p-3 bg-blue-500/10 dark:bg-blue-400/5 rounded-lg border border-blue-500/20 dark:border-blue-400/20 backdrop-blur-sm">
          <div className="mb-2">
            <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
              Collision Risk:
            </span>
          </div>
          <div className="space-y-1">
            {conflictProbability.map((scenario, index) => (
              <div
                key={index}
                className="flex items-center justify-between text-xs"
              >
                <span className="text-blue-800 dark:text-blue-200">
                  {scenario.label}:
                </span>
                <span
                  className={`font-mono ${
                    scenario.probability < 0.1
                      ? "text-green-600 dark:text-green-400"
                      : scenario.probability < 1
                        ? "text-yellow-600 dark:text-yellow-400"
                        : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {formatProbability(scenario.probability)}
                </span>
              </div>
            ))}
          </div>
          <p className="text-xs text-blue-700 dark:text-blue-300 mt-2">
            Boolean values have only 2 possible states (very high collision
            rate)
          </p>
        </div>
      </div>

      {/* Preview */}
      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
          Preview values:
        </p>
        <div className="flex gap-4 text-sm font-mono text-gray-900 dark:text-gray-100">
          <span>
            True:{" "}
            {config.format === "boolean"
              ? "true"
              : config.format === "binary"
                ? "1"
                : "Yes"}
          </span>
          <span>
            False:{" "}
            {config.format === "boolean"
              ? "false"
              : config.format === "binary"
                ? "0"
                : "No"}
          </span>
        </div>
      </div>
    </div>
  );
}
