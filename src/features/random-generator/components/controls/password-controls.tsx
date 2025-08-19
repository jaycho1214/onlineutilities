"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { NumberField, SliderField, CheckboxField, TextField } from "@/features/shared/components/form-field";
import { CollisionProbabilityDisplay } from "@/features/shared/components/collision-probability-display";
import { 
  calculateCollisionScenarios, 
  COMMON_COLLISION_SCENARIOS 
} from "../../lib/collision-probability";
import type { PasswordConfig } from "../../types";

interface PasswordControlsProps {
  config: PasswordConfig;
  onChange: (config: PasswordConfig) => void;
}

export const PasswordControls = React.memo<PasswordControlsProps>(({ config, onChange }) => {
  const t = useTranslations("RandomGenerator.password");

  const handleChange = React.useCallback(<K extends keyof PasswordConfig>(
    field: K,
    value: PasswordConfig[K],
  ) => {
    onChange({ ...config, [field]: value });
  }, [config, onChange]);

  const hasAnyCharacterType = React.useMemo(() =>
    config.includeUppercase ||
    config.includeLowercase ||
    config.includeNumbers ||
    config.includeSymbols ||
    config.customCharacters.length > 0,
    [config.includeUppercase, config.includeLowercase, config.includeNumbers, config.includeSymbols, config.customCharacters]
  );

  // Optimized alphabet size calculation with memoization
  const alphabetSize = React.useMemo(() => {
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
  }, [config.includeUppercase, config.includeLowercase, config.includeNumbers, config.includeSymbols, config.customCharacters, config.excludeSimilar, config.excludeAmbiguous]);

  const collisionScenarios = React.useMemo(() => {
    const totalPossiblePasswords = Math.pow(alphabetSize, config.length);
    return calculateCollisionScenarios(totalPossiblePasswords, COMMON_COLLISION_SCENARIOS.password);
  }, [alphabetSize, config.length]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Count */}
      <NumberField
        label={t("count")}
        value={config.count}
        onChange={(value) => handleChange("count", value)}
        min={1}
        max={100}
      />

      {/* Length */}
      <SliderField
        label={t("length")}
        value={config.length}
        onChange={(value) => handleChange("length", value)}
        min={4}
        max={128}
        step={1}
        showValue
      />

      {/* Character Types */}
      <div className="md:col-span-2">
        <div className="mb-2">
          <span className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t("characterTypes")}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <CheckboxField
            id="uppercase"
            label={t("includeUppercase")}
            checked={config.includeUppercase}
            onChange={(checked) => handleChange("includeUppercase", checked)}
          />
          <CheckboxField
            id="lowercase"
            label={t("includeLowercase")}
            checked={config.includeLowercase}
            onChange={(checked) => handleChange("includeLowercase", checked)}
          />
          <CheckboxField
            id="numbers"
            label={t("includeNumbers")}
            checked={config.includeNumbers}
            onChange={(checked) => handleChange("includeNumbers", checked)}
          />
          <CheckboxField
            id="symbols"
            label={t("includeSymbols")}
            checked={config.includeSymbols}
            onChange={(checked) => handleChange("includeSymbols", checked)}
          />
        </div>

        {!hasAnyCharacterType && (
          <p className="text-sm text-red-600 dark:text-red-400 mt-2">
            {t("noCharacters")}
          </p>
        )}
      </div>

      {/* Exclusions */}
      <div>
        <div className="mb-2">
          <span className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t("exclusions")}
          </span>
        </div>
        <div className="space-y-2">
          <CheckboxField
            id="excludeSimilar"
            label={t("excludeSimilar")}
            checked={config.excludeSimilar}
            onChange={(checked) => handleChange("excludeSimilar", checked)}
          />
          <CheckboxField
            id="excludeAmbiguous"
            label={t("excludeAmbiguous")}
            checked={config.excludeAmbiguous}
            onChange={(checked) => handleChange("excludeAmbiguous", checked)}
          />
        </div>
      </div>

      {/* Custom Characters */}
      <TextField
        label={t("customCharacters")}
        value={config.customCharacters}
        onChange={(value) => handleChange("customCharacters", value)}
        placeholder={t("customCharactersPlaceholder")}
        helpText={t("customCharactersInfo")}
        className="md:col-span-2"
      />

      {/* Collision Probability */}
      {hasAnyCharacterType && (
        <div className="md:col-span-2">
          <CollisionProbabilityDisplay
            title={`${t("collisionRisk")}:`}
            scenarios={collisionScenarios}
            formatType="standard"
            description={t("collisionInfo")}
          />
        </div>
      )}
    </div>
  );
});

PasswordControls.displayName = "PasswordControls";
