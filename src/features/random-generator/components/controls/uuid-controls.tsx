"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/features/shared/ui/input";
import { Checkbox } from "@/features/shared/ui/checkbox";
import type { UuidConfig } from "../../types";

interface UuidControlsProps {
  config: UuidConfig;
  onChange: (config: UuidConfig) => void;
}

export function UuidControls({ config, onChange }: UuidControlsProps) {
  const t = useTranslations("RandomGenerator.uuid");

  const handleChange = <K extends keyof UuidConfig>(
    field: K,
    value: UuidConfig[K],
  ) => {
    onChange({ ...config, [field]: value });
  };

  // UUID v4 has 2^122 possible values (extremely low collision probability)
  const calculateConflictProbability = () => {
    // UUID v4 has 122 random bits = 2^122 ≈ 5.3 × 10^36 possible values
    const totalPossibleUuids = Math.pow(2, 122);

    const scenarios = [
      { users: 1000000, label: "1 Million UUIDs" },
      { users: 1000000000, label: "1 Billion UUIDs" },
      { users: 1000000000000, label: "1 Trillion UUIDs" },
      { users: 1000000000000000, label: "1 Quadrillion UUIDs" },
    ];

    return scenarios.map((scenario) => {
      // Birthday paradox: probability of at least one collision
      const probability =
        1 - Math.exp(-Math.pow(scenario.users, 2) / (2 * totalPossibleUuids));
      return { ...scenario, probability: probability * 100 };
    });
  };

  const conflictProbability = calculateConflictProbability();
  const formatProbability = (prob: number) => {
    if (prob < 0.000000001) return "< 0.000000001%";
    if (prob < 0.001) return prob.toExponential(2) + "%";
    if (prob < 1) return prob.toFixed(6) + "%";
    return prob.toFixed(2) + "%";
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

      {/* Options */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="uppercase"
            checked={config.uppercase}
            onCheckedChange={(checked) => handleChange("uppercase", !!checked)}
          />
          <label
            htmlFor="uppercase"
            className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer"
          >
            {t("uppercase")}
          </label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="hyphenated"
            checked={config.hyphenated}
            onCheckedChange={(checked) => handleChange("hyphenated", !!checked)}
          />
          <label
            htmlFor="hyphenated"
            className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer"
          >
            {t("hyphenated")}
          </label>
        </div>
      </div>

      {/* Conflict Probability */}
      <div>
        <div className="p-3 bg-blue-500/10 dark:bg-blue-400/5 rounded-lg border border-blue-500/20 dark:border-blue-400/20 backdrop-blur-sm">
          <div className="mb-2">
            <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
              Collision Risk (UUID v4):
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
                <span className="font-mono text-green-600 dark:text-green-400">
                  {formatProbability(scenario.probability)}
                </span>
              </div>
            ))}
          </div>
          <p className="text-xs text-blue-700 dark:text-blue-300 mt-2">
            UUID v4 is cryptographically secure with virtually zero collision
            risk
          </p>
          <div className="mt-2 pt-2 border-t border-blue-200 dark:border-blue-700">
            <p className="text-xs text-blue-600 dark:text-blue-400">
              💡 For production: Consider using the{" "}
              <code className="font-mono bg-blue-100 dark:bg-blue-900 px-1 rounded">
                uuid
              </code>{" "}
              npm package
            </p>
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
          Preview format:
        </p>
        <code className="text-sm font-mono text-gray-900 dark:text-gray-100">
          {config.hyphenated
            ? config.uppercase
              ? "550E8400-E29B-41D4-A716-446655440000"
              : "550e8400-e29b-41d4-a716-446655440000"
            : config.uppercase
              ? "550E8400E29B41D4A716446655440000"
              : "550e8400e29b41d4a716446655440000"}
        </code>
      </div>
    </div>
  );
}
