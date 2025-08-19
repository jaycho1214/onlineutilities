"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { GlassSurface } from "@/features/shared/ui/glass-surface";
import { Button } from "@/features/shared/ui/button";
import { useRandomGenerator } from "../lib/random-generator-context";
import { RandomGeneratorControls } from "../components/random-generator-controls";
import { RandomGeneratorResults } from "../components/random-generator-results";
import { RandomGeneratorTypeSelector } from "../components/random-generator-type-selector";
import type { GeneratorType } from "../types";

export function RandomGeneratorPage() {
  const t = useTranslations("RandomGenerator");
  const { state, setActiveType, generateValues } = useRandomGenerator();

  const handleTypeChange = (type: GeneratorType) => {
    setActiveType(type);
  };

  const handleGenerate = async () => {
    const config = state.configs[state.activeType];
    try {
      await generateValues(state.activeType, config);
    } catch (error) {
      console.error("Generation failed:", error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {t("title")}
        </h1>
        <p className="text-gray-600 dark:text-gray-300">{t("description")}</p>
      </div>

      {/* Generator Type Selector */}
      <div className="mb-4">
        <RandomGeneratorTypeSelector
          activeType={state.activeType}
          onTypeChange={handleTypeChange}
        />
      </div>

      {/* Main Content */}
      <div className="space-y-4">
        {/* Controls */}
        <GlassSurface className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {t(`${state.activeType}.title` as any)}
            </h2>
            <Button
              onClick={handleGenerate}
              disabled={state.isGenerating}
              variant="action"
              size="default"
            >
              {state.isGenerating ? "Generating..." : t("actions.generate")}
            </Button>
          </div>

          <RandomGeneratorControls
            type={state.activeType}
            config={state.configs[state.activeType]}
            onConfigChange={() => {}}
          />
        </GlassSurface>

        {/* Results */}
        <GlassSurface className="p-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {t("output.title")}
          </h2>
          <RandomGeneratorResults
            results={state.lastResults}
            isGenerating={state.isGenerating}
            error={state.error}
            type={state.activeType}
          />
        </GlassSurface>
      </div>
    </div>
  );
}
