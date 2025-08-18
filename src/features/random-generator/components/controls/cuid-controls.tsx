"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/features/shared/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { CuidConfig } from "../../types";

interface CuidControlsProps {
  config: CuidConfig;
  onChange: (config: CuidConfig) => void;
}

export function CuidControls({ config, onChange }: CuidControlsProps) {
  const t = useTranslations("RandomGenerator.cuid");

  const handleChange = <K extends keyof CuidConfig>(field: K, value: CuidConfig[K]) => {
    onChange({ ...config, [field]: value });
  };

  // Calculate conflict probability based on CUID specifications
  const calculateConflictProbability = () => {
    // CUID2: 24-25 characters with 36^(~20-21) random bits
    // CUID Legacy: variable length with 36^(~12-16) random bits
    const randomBits = config.version === "cuid2" ? 21 : 14;
    const totalPossibleCuids = Math.pow(36, randomBits);
    
    const scenarios = [
      { users: 1000, label: "Small system (1K)" },
      { users: 10000, label: "Medium system (10K)" },
      { users: 100000, label: "Large system (100K)" },
      { users: 1000000, label: "Enterprise (1M)" }
    ];
    
    return scenarios.map(scenario => {
      if (scenario.users >= totalPossibleCuids) return { ...scenario, probability: 100 };
      
      // Birthday paradox: probability of at least one collision
      const probability = 1 - Math.exp(-Math.pow(scenario.users, 2) / (2 * totalPossibleCuids));
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

      {/* Version */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t("version")}
        </label>
        <Select 
          value={config.version} 
          onValueChange={(value: "cuid" | "cuid2") => handleChange("version", value)}
        >
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="cuid2">{t("versions.cuid2")}</SelectItem>
            <SelectItem value="cuid">{t("versions.cuid")}</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {config.version === "cuid2" ? t("versionInfo.cuid2") : t("versionInfo.cuid")}
        </p>
      </div>

      {/* Custom Fingerprint */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t("fingerprint")}
        </label>
        <Input
          type="text"
          value={config.fingerprint || ""}
          onChange={(e) => handleChange("fingerprint", e.target.value)}
          placeholder={t("fingerprintPlaceholder")}
          className="font-mono"
          maxLength={config.version === "cuid2" ? 2 : 4}
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {t("fingerprintInfo")}
        </p>
      </div>

      {/* Conflict Probability */}
      <div>
        <div className="p-3 bg-blue-500/10 dark:bg-blue-400/5 rounded-lg border border-blue-500/20 dark:border-blue-400/20 backdrop-blur-sm">
          <div className="mb-2">
            <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
              Real-world Collision Risk ({config.version.toUpperCase()}):
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
            {config.version === "cuid2" 
              ? "CUID2 is more secure and has better collision resistance" 
              : "Legacy CUID has lower entropy than CUID2"
            }
          </p>
          <div className="mt-2 pt-2 border-t border-blue-200 dark:border-blue-700">
            <p className="text-xs text-blue-600 dark:text-blue-400">
              💡 For production: Consider using the <code className="font-mono bg-blue-100 dark:bg-blue-900 px-1 rounded">@paralleldrive/cuid2</code> npm package
            </p>
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Preview format:</p>
        <code className="text-sm font-mono text-gray-900 dark:text-gray-100">
          {config.version === "cuid2" 
            ? "c" + "lh3p" + "k" + "fp" + "abcdefghijk12345"
            : "c" + "jld2cjxh0000qzrmn831i7rn"
          }
        </code>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {config.version === "cuid2" 
            ? "Format: c + timestamp + counter + fingerprint + random"
            : "Format: c + timestamp + counter + fingerprint + random"
          }
        </p>
      </div>
    </div>
  );
}