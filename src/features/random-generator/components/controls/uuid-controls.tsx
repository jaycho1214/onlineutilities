"use client";

import React from "react";
import { useTranslations } from "next-intl";
import {
  NumberField,
  CheckboxField,
} from "@/features/shared/components/form-field";
import { CollisionProbabilityDisplay } from "@/features/shared/components/collision-probability-display";
import {
  calculateCollisionScenarios,
  COMMON_COLLISION_SCENARIOS,
} from "../../lib/collision-probability";
import type { UuidConfig } from "../../types";

interface UuidControlsProps {
  config: UuidConfig;
  onChange: (config: UuidConfig) => void;
}

export const UuidControls = React.memo<UuidControlsProps>(
  ({ config, onChange }) => {
    const t = useTranslations("RandomGenerator.uuid");

    const handleChange = React.useCallback(
      <K extends keyof UuidConfig>(field: K, value: UuidConfig[K]) => {
        onChange({ ...config, [field]: value });
      },
      [config, onChange],
    );

    // UUID v4 has 2^122 possible values (extremely low collision probability)
    const collisionScenarios = React.useMemo(() => {
      // UUID v4 has 122 random bits = 2^122 ≈ 5.3 × 10^36 possible values
      const totalPossibleUuids = Math.pow(2, 122);
      return calculateCollisionScenarios(
        totalPossibleUuids,
        COMMON_COLLISION_SCENARIOS.uuid,
      );
    }, []);

    return (
      <div className="space-y-6">
        {/* Count */}
        <NumberField
          label={t("count")}
          value={config.count}
          onChange={(value) => handleChange("count", value)}
          min={1}
          max={100}
          inputClassName="w-24"
        />

        {/* Options */}
        <div className="space-y-3">
          <CheckboxField
            id="uppercase"
            label={t("uppercase")}
            checked={config.uppercase}
            onChange={(checked) => handleChange("uppercase", checked)}
          />
          <CheckboxField
            id="hyphenated"
            label={t("hyphenated")}
            checked={config.hyphenated}
            onChange={(checked) => handleChange("hyphenated", checked)}
          />
        </div>

        {/* Collision Probability */}
        <CollisionProbabilityDisplay
          title="Collision Risk (UUID v4):"
          scenarios={collisionScenarios}
          formatType="uuid"
          description="UUID v4 is cryptographically secure with virtually zero collision risk"
          tip="💡 For production: Consider using the uuid npm package"
        />

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
  },
);

UuidControls.displayName = "UuidControls";
