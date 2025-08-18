"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/features/shared/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import type { NumberConfig, NumberType } from "../../types";

interface NumberControlsProps {
  config: NumberConfig;
  onChange: (config: NumberConfig) => void;
}

export function NumberControls({ config, onChange }: NumberControlsProps) {
  const t = useTranslations("RandomGenerator.number");

  const handleChange = <K extends keyof NumberConfig>(field: K, value: NumberConfig[K]) => {
    onChange({ ...config, [field]: value });
  };

  // Calculate conflict probability
  const calculateConflictProbability = () => {
    const range = config.max - config.min + 1;
    const totalPossibleNumbers = config.type === "float" 
      ? range * Math.pow(10, config.decimalPlaces)
      : range;
    
    // Real-world usage scenarios for collision probability
    const scenarios = [
      { users: 1000, label: "Small dataset (1K)" },
      { users: 10000, label: "Medium dataset (10K)" },
      { users: 100000, label: "Large dataset (100K)" },
      { users: 1000000, label: "Massive dataset (1M)" }
    ];
    
    return scenarios.map(scenario => {
      if (config.unique) return { ...scenario, probability: 0 }; // No collisions when unique is enabled
      if (scenario.users >= totalPossibleNumbers) return { ...scenario, probability: 100 };
      
      // Birthday paradox: probability of at least one collision
      const probability = 1 - Math.exp(-Math.pow(scenario.users, 2) / (2 * totalPossibleNumbers));
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

      {/* Number Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {t("type")}
        </label>
        <Select 
          value={config.type} 
          onValueChange={(value) => handleChange("type", value as NumberType)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="integer">{t("types.integer")}</SelectItem>
            <SelectItem value="float">{t("types.float")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Range */}
      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Range
        </label>
        <div className="grid grid-cols-2 gap-2">
          <Input
            type="number"
            placeholder="Min"
            value={config.min}
            onChange={(e) => handleChange("min", parseFloat(e.target.value) || 0)}
          />
          <Input
            type="number"
            placeholder="Max"
            value={config.max}
            onChange={(e) => handleChange("max", parseFloat(e.target.value) || 100)}
          />
        </div>
      </div>

      {/* Decimal Places (for floats) */}
      {config.type === "float" && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t("decimalPlaces")}
          </label>
          <Input
            type="number"
            min={0}
            max={10}
            value={config.decimalPlaces}
            onChange={(e) => handleChange("decimalPlaces", parseInt(e.target.value) || 2)}
            className="w-20"
          />
        </div>
      )}

      {/* Options */}
      <div className="md:col-span-2 space-y-2">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="unique"
            checked={config.unique}
            onCheckedChange={(checked) => handleChange("unique", !!checked)}
          />
          <label 
            htmlFor="unique"
            className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer"
          >
            {t("unique")}
          </label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="sorted"
            checked={config.sorted}
            onCheckedChange={(checked) => handleChange("sorted", !!checked)}
          />
          <label 
            htmlFor="sorted"
            className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer"
          >
            {t("sorted")}
          </label>
        </div>
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
                  config.unique
                    ? "text-gray-500 dark:text-gray-400"
                    : scenario.probability < 0.1 
                      ? "text-green-600 dark:text-green-400" 
                      : scenario.probability < 1 
                        ? "text-yellow-600 dark:text-yellow-400"
                        : "text-red-600 dark:text-red-400"
                }`}>
                  {config.unique ? "0%" : formatProbability(scenario.probability)}
                </span>
              </div>
            ))}
          </div>
          <p className="text-xs text-blue-700 dark:text-blue-300 mt-2">
            {config.unique 
              ? "Unique option enabled - no collisions possible"
              : "Probability of number collisions in different dataset sizes"
            }
          </p>
        </div>
      </div>
    </div>
  );
}