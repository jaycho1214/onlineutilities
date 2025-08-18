"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/features/shared/ui/button";
import { Copy, RotateCcw } from "lucide-react";
import { useRandomGenerator } from "../lib/random-generator-context";
import type { GeneratorType } from "../types";
import { cn } from "@/lib/utils";

interface RandomGeneratorResultsProps {
  results: string[];
  isGenerating: boolean;
  error: string | null;
  type: GeneratorType;
}

export function RandomGeneratorResults({
  results,
  isGenerating,
  error,
  type,
}: RandomGeneratorResultsProps) {
  const t = useTranslations("RandomGenerator");
  const { copyToClipboard, copyAllResults, generateValues, state } = useRandomGenerator();

  const handleCopyResult = async (result: string) => {
    await copyToClipboard(result);
  };

  const handleCopyAll = async () => {
    await copyAllResults();
  };

  const handleRegenerate = async () => {
    const config = state.configs[state.activeType];
    try {
      await generateValues(state.activeType, config);
    } catch (error) {
      console.error("Regeneration failed:", error);
    }
  };

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 dark:text-red-400 mb-4">
          <p className="font-medium">Error generating values</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
        <Button
          onClick={handleRegenerate}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <RotateCcw className="size-4" />
          Try Again
        </Button>
      </div>
    );
  }

  if (isGenerating) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-400">
          Generating values...
        </p>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <p>{t("output.empty")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Action buttons */}
      {results.length > 1 && (
        <div className="flex gap-2 justify-end">
          <Button
            onClick={handleCopyAll}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <Copy className="size-4" />
            {t("actions.copyAll")}
          </Button>
        </div>
      )}

      {/* Results list */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {results.map((result, index) => (
          <ResultItem
            key={index}
            result={result}
            index={index}
            type={type}
            onCopy={handleCopyResult}
          />
        ))}
      </div>

      {/* Stats */}
      <div className="text-sm text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-700">
        Generated {results.length} {results.length === 1 ? "value" : "values"}
      </div>
    </div>
  );
}

interface ResultItemProps {
  result: string;
  index: number;
  type: GeneratorType;
  onCopy: (result: string) => void;
}

function ResultItem({ result, type, onCopy }: ResultItemProps) {
  const isColor = type === "color";
  const isPassword = type === "password";
  
  return (
    <div className="group relative flex items-center gap-3 p-3 rounded-lg border border-black/10 dark:border-white/10 bg-white/30 dark:bg-white/5 backdrop-blur-sm hover:bg-white/40 dark:hover:bg-white/10 transition-all duration-200 shadow-sm">
      {/* Color preview for color results */}
      {isColor && (
        <div
          className="w-6 h-6 rounded border border-black/20 dark:border-white/20 flex-shrink-0 shadow-sm"
          style={{ backgroundColor: result }}
        />
      )}

      {/* Result text */}
      <div className="flex-1 min-w-0">
        <code className={cn(
          "block font-mono text-sm break-all",
          isPassword && "tracking-wider",
          "text-gray-900 dark:text-gray-100"
        )}>
          {result}
        </code>
      </div>

      {/* Copy button */}
      <Button
        onClick={() => onCopy(result)}
        variant="ghost"
        size="sm"
        className="opacity-0 group-hover:opacity-100 transition-opacity gap-1 text-xs flex-shrink-0"
      >
        <Copy className="size-3" />
        Copy
      </Button>
    </div>
  );
}