"use client";

import { createContext, useContext, useCallback, ReactNode, memo } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { calculatorService } from "@/features/calculator/lib/calculator-service";
import { calculatorDb } from "@/features/calculator/lib/calculator-db";
import type { CalculationEntry } from "@/features/calculator/types";

interface CalculatorContextValue {
  history: CalculationEntry[];
  isLoading: boolean;
  addToHistory: (entry: CalculationEntry) => Promise<void>;
  clearHistory: () => Promise<void>;
}

const CalculatorContext = createContext<CalculatorContextValue | null>(null);

export function useCalculator() {
  const context = useContext(CalculatorContext);
  if (!context) {
    throw new Error("useCalculator must be used within a CalculatorProvider");
  }
  return context;
}

interface CalculatorProviderProps {
  children: ReactNode;
}

function CalculatorProviderComponent({ children }: CalculatorProviderProps) {
  // Use useLiveQuery to get real-time calculation history
  const history = useLiveQuery<CalculationEntry[]>(
    async (): Promise<CalculationEntry[]> => {
      try {
        return await calculatorDb.calculations
          .orderBy("createdAt")
          .reverse()
          .limit(20)
          .toArray();
      } catch (error) {
        console.error("Failed to fetch calculation history:", error);
        return [];
      }
    },
    [], // No dependencies - always watch calculations
  );

  const isLoading = history === undefined;

  const addToHistory = useCallback(async (entry: CalculationEntry) => {
    try {
      await calculatorService.addCalculation(entry.expression, entry.result);
    } catch (error) {
      console.error("Failed to add calculation to history:", error);
    }
  }, []);

  const clearHistory = useCallback(async () => {
    try {
      await calculatorService.clearHistory();
    } catch (error) {
      console.error("Failed to clear calculation history:", error);
    }
  }, []);

  const contextValue: CalculatorContextValue = {
    history: history || [],
    isLoading,
    addToHistory,
    clearHistory,
  };

  return (
    <CalculatorContext.Provider value={contextValue}>
      {children}
    </CalculatorContext.Provider>
  );
}

export const CalculatorProvider = memo(CalculatorProviderComponent);
