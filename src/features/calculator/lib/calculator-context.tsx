"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
  memo,
} from "react";
import { calculatorService } from "./calculator-db";
import { type CalculationEntry } from "./calculator-db";

interface CalculatorContextValue {
  history: CalculationEntry[];
  isLoading: boolean;
  addToHistory: (entry: CalculationEntry) => void;
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
  const [history, setHistory] = useState<CalculationEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadHistory = useCallback(async () => {
    setIsLoading(true);
    try {
      const calculations = await calculatorService.getRecentCalculations(20);
      setHistory(calculations);
    } catch (error) {
      console.error("Failed to load calculation history:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load history on mount
  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const addToHistory = useCallback((entry: CalculationEntry) => {
    setHistory((prev) => [entry, ...prev.slice(0, 19)]);
  }, []);

  const clearHistory = useCallback(async () => {
    await calculatorService.clearHistory();
    setHistory([]);
  }, []);

  const contextValue: CalculatorContextValue = {
    history,
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
