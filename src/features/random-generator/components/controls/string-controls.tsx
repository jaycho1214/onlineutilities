"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/features/shared/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import type { StringConfig, CharsetType } from "../../types";

interface StringControlsProps {
  config: StringConfig;
  onChange: (config: StringConfig) => void;
}

export function StringControls({ config, onChange }: StringControlsProps) {
  const t = useTranslations("RandomGenerator.string");

  const handleChange = <K extends keyof StringConfig>(field: K, value: StringConfig[K]) => {
    onChange({ ...config, [field]: value });
  };

  // Calculate conflict probability
  const getAlphabetSize = () => {
    if (config.charset === "custom") {
      return config.customCharset ? new Set(config.customCharset).size : 1;
    }
    
    switch (config.charset) {
      case "alphanumeric": return 62; // a-z, A-Z, 0-9
      case "alphabetic": return 52; // a-z, A-Z
      case "numeric": return 10; // 0-9
      case "lowercase": return 26; // a-z
      case "uppercase": return 26; // A-Z
      case "symbols": return 32; // Common symbols
      default: return 62;
    }
  };

  const calculateConflictProbability = () => {
    const alphabetSize = getAlphabetSize();
    const effectiveLength = config.usePattern ? config.pattern.length : config.length;
    const totalPossibleStrings = Math.pow(alphabetSize, effectiveLength);
    
    // Real-world usage scenarios for collision probability
    const scenarios = [
      { users: 1000, label: "Small app (1K)" },
      { users: 10000, label: "Medium app (10K)" },
      { users: 100000, label: "Large app (100K)" },
      { users: 1000000, label: "Major service (1M)" }
    ];
    
    return scenarios.map(scenario => {
      if (scenario.users >= totalPossibleStrings) return { ...scenario, probability: 100 };
      
      // Birthday paradox: probability of at least one collision
      const probability = 1 - Math.exp(-Math.pow(scenario.users, 2) / (2 * totalPossibleStrings));
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
          onChange={(e) => handleChange("length", parseInt(e.target.value) || 10)}
          className="w-20"
        />
      </div>

      {/* Character Set */}
      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {t("charset")}
        </label>
        <Select 
          value={config.charset} 
          onValueChange={(value: CharsetType) => handleChange("charset", value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="alphanumeric">{t("charsets.alphanumeric")}</SelectItem>
            <SelectItem value="alphabetic">{t("charsets.alphabetic")}</SelectItem>
            <SelectItem value="numeric">{t("charsets.numeric")}</SelectItem>
            <SelectItem value="lowercase">{t("charsets.lowercase")}</SelectItem>
            <SelectItem value="uppercase">{t("charsets.uppercase")}</SelectItem>
            <SelectItem value="symbols">{t("charsets.symbols")}</SelectItem>
            <SelectItem value="custom">{t("charsets.custom")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Custom Character Set */}
      {config.charset === "custom" && (
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t("customCharset")}
          </label>
          <Input
            type="text"
            value={config.customCharset}
            onChange={(e) => handleChange("customCharset", e.target.value)}
            placeholder={t("customCharsetPlaceholder")}
            className="font-mono"
          />
        </div>
      )}

      {/* Pattern Option */}
      <div className="md:col-span-2 space-y-3">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="usePattern"
            checked={config.usePattern}
            onCheckedChange={(checked) => handleChange("usePattern", !!checked)}
          />
          <label 
            htmlFor="usePattern"
            className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer"
          >
            {t("usePattern")}
          </label>
        </div>

        {config.usePattern && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t("pattern")}
            </label>
            <Input
              type="text"
              value={config.pattern}
              onChange={(e) => handleChange("pattern", e.target.value)}
              placeholder={t("patternPlaceholder")}
              className="font-mono"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              X = random character, 9 = digit, A = letter, others = literal
            </p>
          </div>
        )}
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
              <div key={index} className="flex items-center justify-between text-xs">
                <span className="text-blue-800 dark:text-blue-200">
                  {scenario.label}:
                </span>
                <span className={`font-mono ${
                  scenario.probability < 0.1 
                    ? "text-green-600 dark:text-green-400" 
                    : scenario.probability < 1 
                      ? "text-yellow-600 dark:text-yellow-400"
                      : "text-red-600 dark:text-red-400"
                }`}>
                  {formatProbability(scenario.probability)}
                </span>
              </div>
            ))}
          </div>
          <p className="text-xs text-blue-700 dark:text-blue-300 mt-2">
            Probability of string collisions in different application scales
          </p>
        </div>
      </div>
    </div>
  );
}