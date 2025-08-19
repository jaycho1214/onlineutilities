/**
 * Collision Probability Display Component
 * 
 * Reusable component for displaying collision risk scenarios
 * across different random generation features.
 */

import React from "react";
import {
  type CollisionScenario,
  formatProbability,
  getProbabilityColorClass,
} from "@/features/random-generator/lib/collision-probability";

interface CollisionProbabilityDisplayProps {
  title: string;
  scenarios: CollisionScenario[];
  formatType?: "standard" | "scientific" | "uuid";
  description?: string;
  tip?: string;
  className?: string;
}

export function CollisionProbabilityDisplay({
  title,
  scenarios,
  formatType = "standard",
  description,
  tip,
  className = "",
}: CollisionProbabilityDisplayProps) {
  return (
    <div className={`p-3 bg-blue-500/10 dark:bg-blue-400/5 rounded-lg border border-blue-500/20 dark:border-blue-400/20 backdrop-blur-sm ${className}`}>
      <div className="mb-2">
        <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
          {title}
        </span>
      </div>
      
      <div className="space-y-1">
        {scenarios.map((scenario, index) => (
          <div
            key={index}
            className="flex items-center justify-between text-xs"
          >
            <span className="text-blue-800 dark:text-blue-200">
              {scenario.label}:
            </span>
            <span 
              className={`font-mono ${
                formatType === "uuid" 
                  ? "text-green-600 dark:text-green-400" 
                  : getProbabilityColorClass(scenario.probability)
              }`}
            >
              {formatProbability(scenario.probability, formatType)}
            </span>
          </div>
        ))}
      </div>
      
      {description && (
        <p className="text-xs text-blue-700 dark:text-blue-300 mt-2">
          {description}
        </p>
      )}
      
      {tip && (
        <div className="mt-2 pt-2 border-t border-blue-200 dark:border-blue-700">
          <p className="text-xs text-blue-600 dark:text-blue-400">
            {tip}
          </p>
        </div>
      )}
    </div>
  );
}