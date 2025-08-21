/**
 * Collision Probability Utilities
 *
 * Shared utilities for calculating and formatting collision probabilities
 * for different random generation scenarios.
 */

export interface CollisionScenario {
  users: number;
  label: string;
  probability: number;
}

/**
 * Calculate collision probability using birthday paradox
 * @param numberOfItems - Number of items to generate
 * @param totalPossibleValues - Total possible unique values
 * @returns Probability as percentage (0-100)
 */
export function calculateCollisionProbability(
  numberOfItems: number,
  totalPossibleValues: number,
): number {
  if (numberOfItems >= totalPossibleValues) {
    return 100; // Guaranteed collision
  }

  // Birthday paradox: probability of at least one collision
  const probability =
    1 - Math.exp(-Math.pow(numberOfItems, 2) / (2 * totalPossibleValues));
  return probability * 100;
}

/**
 * Calculate collision scenarios for different user counts
 * @param totalPossibleValues - Total possible unique values
 * @param scenarios - Array of scenarios with user counts and labels
 * @returns Array of scenarios with calculated probabilities
 */
export function calculateCollisionScenarios(
  totalPossibleValues: number,
  scenarios: Pick<CollisionScenario, "users" | "label">[],
): CollisionScenario[] {
  return scenarios.map((scenario) => ({
    ...scenario,
    probability: calculateCollisionProbability(
      scenario.users,
      totalPossibleValues,
    ),
  }));
}

/**
 * Format probability percentage for display
 * @param probability - Probability as percentage (0-100)
 * @param format - Formatting style
 * @returns Formatted probability string
 */
export function formatProbability(
  probability: number,
  format: "standard" | "scientific" | "uuid" = "standard",
): string {
  switch (format) {
    case "uuid":
      // Ultra-low probabilities for UUID-like scenarios
      if (probability < 0.000000001) return "< 0.000000001%";
      if (probability < 0.001) return probability.toExponential(2) + "%";
      if (probability < 1) return probability.toFixed(6) + "%";
      return probability.toFixed(2) + "%";

    case "scientific":
      if (probability < 0.001) return probability.toExponential(2) + "%";
      return probability.toFixed(3) + "%";

    case "standard":
    default:
      if (probability < 0.001) return "< 0.001%";
      if (probability < 1) return probability.toFixed(3) + "%";
      if (probability < 10) return probability.toFixed(2) + "%";
      if (probability < 100) return probability.toFixed(1) + "%";
      return "~100%";
  }
}

/**
 * Get common collision risk scenarios
 */
export const COMMON_COLLISION_SCENARIOS = {
  password: [
    { users: 1000, label: "Small org (1K)" },
    { users: 10000, label: "Medium org (10K)" },
    { users: 100000, label: "Large org (100K)" },
    { users: 1000000, label: "Enterprise (1M)" },
  ],
  uuid: [
    { users: 1000000, label: "1 Million UUIDs" },
    { users: 1000000000, label: "1 Billion UUIDs" },
    { users: 1000000000000, label: "1 Trillion UUIDs" },
    { users: 1000000000000000, label: "1 Quadrillion UUIDs" },
  ],
};

/**
 * Get probability color class based on risk level
 * @param probability - Probability as percentage (0-100)
 * @returns Tailwind CSS color classes
 */
export function getProbabilityColorClass(probability: number): string {
  if (probability < 0.1) return "text-green-600 dark:text-green-400";
  if (probability < 1) return "text-yellow-600 dark:text-yellow-400";
  return "text-red-600 dark:text-red-400";
}
