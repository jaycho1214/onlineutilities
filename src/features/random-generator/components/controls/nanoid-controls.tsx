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
import type { NanoidConfig, NanoidPreset } from "../../types";

interface NanoidControlsProps {
  config: NanoidConfig;
  onChange: (config: NanoidConfig) => void;
}

export function NanoidControls({ config, onChange }: NanoidControlsProps) {
  const t = useTranslations("RandomGenerator.nanoid");

  const handleChange = <K extends keyof NanoidConfig>(
    field: K,
    value: NanoidConfig[K],
  ) => {
    onChange({ ...config, [field]: value });
  };

  // Calculate conflict probability
  const getAlphabetSize = (preset: NanoidPreset, customAlphabet: string) => {
    if (customAlphabet) return customAlphabet.length;

    switch (preset) {
      case "default":
        return 64; // _-0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ
      case "alphanumeric":
        return 62; // 0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ
      case "numbers":
        return 10; // 0123456789
      case "lowercase":
        return 26; // abcdefghijklmnopqrstuvwxyz
      case "uppercase":
        return 26; // ABCDEFGHIJKLMNOPQRSTUVWXYZ
      default:
        return 64;
    }
  };

  const calculateConflictProbability = () => {
    const alphabetSize = getAlphabetSize(config.preset, config.alphabet);
    const totalPossibleIds = Math.pow(alphabetSize, config.length);

    // Real-world usage scenarios for collision probability
    const scenarios = [
      { users: 1000, label: "Small system (1K)" },
      { users: 10000, label: "Medium system (10K)" },
      { users: 100000, label: "Large system (100K)" },
      { users: 1000000, label: "Enterprise (1M)" },
    ];

    return scenarios.map((scenario) => {
      if (scenario.users >= totalPossibleIds)
        return { ...scenario, probability: 100 };

      // Birthday paradox: probability of at least one collision
      const probability =
        1 - Math.exp(-Math.pow(scenario.users, 2) / (2 * totalPossibleIds));
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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Count */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {t("count")}
        </label>
        <Input
          type="number"
          min={1}
          max={100}
          value={config.count}
          onChange={(e) => handleChange("count", parseInt(e.target.value) || 1)}
          className="w-20"
        />
      </div>

      {/* Length */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {t("length")}
        </label>
        <Input
          type="number"
          min={1}
          max={1000}
          value={config.length}
          onChange={(e) =>
            handleChange("length", parseInt(e.target.value) || 21)
          }
          className="w-20"
        />
      </div>

      {/* Alphabet Preset */}
      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Alphabet Preset
        </label>
        <Select
          value={config.preset}
          onValueChange={(value: NanoidPreset) => handleChange("preset", value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="default">{t("presets.default")}</SelectItem>
            <SelectItem value="alphanumeric">
              {t("presets.alphanumeric")}
            </SelectItem>
            <SelectItem value="numbers">{t("presets.numbers")}</SelectItem>
            <SelectItem value="lowercase">{t("presets.lowercase")}</SelectItem>
            <SelectItem value="uppercase">{t("presets.uppercase")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Custom Alphabet */}
      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {t("alphabet")}
        </label>
        <Input
          type="text"
          value={config.alphabet}
          onChange={(e) => handleChange("alphabet", e.target.value)}
          placeholder={t("alphabetPlaceholder")}
          className="font-mono"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Leave empty to use the selected preset
        </p>
      </div>

      {/* Conflict Probability */}
      <div className="md:col-span-2">
        <div className="p-3 bg-blue-500/10 dark:bg-blue-400/5 rounded-lg border border-blue-500/20 dark:border-blue-400/20 backdrop-blur-sm">
          <div className="mb-2">
            <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
              Real-world Collision Risk:
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
            Probability of ID collisions in different system scales
          </p>
          <div className="mt-2 pt-2 border-t border-blue-200 dark:border-blue-700">
            <p className="text-xs text-blue-600 dark:text-blue-400">
              💡 For production: Consider using the{" "}
              <code className="font-mono bg-blue-100 dark:bg-blue-900 px-1 rounded">
                nanoid
              </code>{" "}
              npm package
            </p>
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="md:col-span-2">
        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
            Preview format:
          </p>
          <code className="text-sm font-mono text-gray-900 dark:text-gray-100">
            {"V1StGXR8_Z5jdHi6B-myT".substring(0, config.length)}
          </code>
        </div>
      </div>
    </div>
  );
}
