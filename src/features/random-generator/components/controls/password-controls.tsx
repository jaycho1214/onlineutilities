"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/features/shared/ui/input";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import type { PasswordConfig } from "../../types";

interface PasswordControlsProps {
  config: PasswordConfig;
  onChange: (config: PasswordConfig) => void;
}

export function PasswordControls({ config, onChange }: PasswordControlsProps) {
  const t = useTranslations("RandomGenerator.password");

  const handleChange = <K extends keyof PasswordConfig>(field: K, value: PasswordConfig[K]) => {
    onChange({ ...config, [field]: value });
  };

  const hasAnyCharacterType = 
    config.includeUppercase || 
    config.includeLowercase || 
    config.includeNumbers || 
    config.includeSymbols ||
    config.customCharacters.length > 0;

  // Calculate conflict probability
  const getAlphabetSize = () => {
    if (config.customCharacters.length > 0) {
      return new Set(config.customCharacters).size; // Remove duplicates
    }
    
    let size = 0;
    if (config.includeUppercase) size += 26; // A-Z
    if (config.includeLowercase) size += 26; // a-z  
    if (config.includeNumbers) size += 10; // 0-9
    if (config.includeSymbols) size += 32; // Common symbols
    
    // Apply exclusions
    if (config.excludeSimilar) size -= Math.min(size, 8); // Remove similar chars like 0O1lI
    if (config.excludeAmbiguous) size -= Math.min(size, 6); // Remove ambiguous chars
    
    return Math.max(size, 1);
  };

  const calculateConflictProbability = () => {
    const alphabetSize = getAlphabetSize();
    const totalPossiblePasswords = Math.pow(alphabetSize, config.length);
    
    // Real-world usage scenarios for collision probability
    const scenarios = [
      { users: 1000, label: "Small org (1K)" },
      { users: 10000, label: "Medium org (10K)" },
      { users: 100000, label: "Large org (100K)" },
      { users: 1000000, label: "Enterprise (1M)" }
    ];
    
    return scenarios.map(scenario => {
      if (scenario.users >= totalPossiblePasswords) return { ...scenario, probability: 100 };
      
      // Birthday paradox: probability of at least one collision
      const probability = 1 - Math.exp(-Math.pow(scenario.users, 2) / (2 * totalPossiblePasswords));
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
          {t("length")}: {config.length}
        </label>
        <Slider
          value={[config.length]}
          onValueChange={([value]) => handleChange("length", value)}
          min={4}
          max={128}
          step={1}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>4</span>
          <span>128</span>
        </div>
      </div>

      {/* Character Types */}
      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t("characterTypes")}
        </label>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="uppercase"
              checked={config.includeUppercase}
              onCheckedChange={(checked) => handleChange("includeUppercase", !!checked)}
            />
            <label 
              htmlFor="uppercase"
              className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer"
            >
              {t("includeUppercase")}
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="lowercase"
              checked={config.includeLowercase}
              onCheckedChange={(checked) => handleChange("includeLowercase", !!checked)}
            />
            <label 
              htmlFor="lowercase"
              className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer"
            >
              {t("includeLowercase")}
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="numbers"
              checked={config.includeNumbers}
              onCheckedChange={(checked) => handleChange("includeNumbers", !!checked)}
            />
            <label 
              htmlFor="numbers"
              className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer"
            >
              {t("includeNumbers")}
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="symbols"
              checked={config.includeSymbols}
              onCheckedChange={(checked) => handleChange("includeSymbols", !!checked)}
            />
            <label 
              htmlFor="symbols"
              className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer"
            >
              {t("includeSymbols")}
            </label>
          </div>
        </div>

        {!hasAnyCharacterType && (
          <p className="text-sm text-red-600 dark:text-red-400 mt-2">
            {t("noCharacters")}
          </p>
        )}
      </div>

      {/* Exclusions */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t("exclusions")}
        </label>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="excludeSimilar"
              checked={config.excludeSimilar}
              onCheckedChange={(checked) => handleChange("excludeSimilar", !!checked)}
            />
            <label 
              htmlFor="excludeSimilar"
              className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer"
            >
              {t("excludeSimilar")}
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="excludeAmbiguous"
              checked={config.excludeAmbiguous}
              onCheckedChange={(checked) => handleChange("excludeAmbiguous", !!checked)}
            />
            <label 
              htmlFor="excludeAmbiguous"
              className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer"
            >
              {t("excludeAmbiguous")}
            </label>
          </div>
        </div>
      </div>

      {/* Custom Characters */}
      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {t("customCharacters")}
        </label>
        <Input
          type="text"
          value={config.customCharacters}
          onChange={(e) => handleChange("customCharacters", e.target.value)}
          placeholder={t("customCharactersPlaceholder")}
          className="font-mono"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {t("customCharactersInfo")}
        </p>
      </div>

      {/* Conflict Probability */}
      {hasAnyCharacterType && (
        <div className="md:col-span-2">
          <div className="p-3 bg-blue-500/10 dark:bg-blue-400/5 rounded-lg border border-blue-500/20 dark:border-blue-400/20 backdrop-blur-sm">
            <div className="mb-2">
              <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                {t("collisionRisk")}:
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
              {t("collisionInfo")}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}