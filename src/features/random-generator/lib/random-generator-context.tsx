"use client";

import React, { createContext, useContext, useReducer, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { randomGeneratorService, type GeneratorType } from "./random-generator-db";
import type {
  GeneratorConfig,
  GenerationEntry,
  GeneratorPreset,
  GeneratorSettings,
} from "../types";
import { DEFAULT_CONFIGS as CONFIGS } from "../types";

// ============================================================================
// CONTEXT STATE TYPES
// ============================================================================

interface RandomGeneratorContextState {
  // Current state
  activeType: GeneratorType;
  isGenerating: boolean;
  lastResults: string[];
  error: string | null;
  
  // Configurations
  configs: Record<GeneratorType, GeneratorConfig>;
  
  // Data
  history: GenerationEntry[];
  presets: GeneratorPreset[];
  settings: GeneratorSettings;
  
  // Loading states
  isLoadingHistory: boolean;
  isLoadingPresets: boolean;
  isLoadingSettings: boolean;
}

// ============================================================================
// ACTIONS
// ============================================================================

type RandomGeneratorAction =
  | { type: "SET_ACTIVE_TYPE"; payload: GeneratorType }
  | { type: "SET_GENERATING"; payload: boolean }
  | { type: "SET_RESULTS"; payload: string[] }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "UPDATE_CONFIG"; payload: { type: GeneratorType; config: GeneratorConfig } }
  | { type: "SET_HISTORY"; payload: GenerationEntry[] }
  | { type: "SET_PRESETS"; payload: GeneratorPreset[] }
  | { type: "SET_SETTINGS"; payload: GeneratorSettings }
  | { type: "SET_LOADING_HISTORY"; payload: boolean }
  | { type: "SET_LOADING_PRESETS"; payload: boolean }
  | { type: "SET_LOADING_SETTINGS"; payload: boolean }
  | { type: "ADD_HISTORY_ENTRY"; payload: GenerationEntry }
  | { type: "ADD_PRESET"; payload: GeneratorPreset }
  | { type: "UPDATE_PRESET"; payload: GeneratorPreset }
  | { type: "DELETE_PRESET"; payload: string }
  | { type: "CLEAR_HISTORY" };

// ============================================================================
// REDUCER
// ============================================================================

const initialState: RandomGeneratorContextState = {
  activeType: "password",
  isGenerating: false,
  lastResults: [],
  error: null,
  configs: CONFIGS,
  history: [],
  presets: [],
  settings: {
    id: "user",
    autoCopy: false,
    showStrength: true,
    saveHistory: true,
    updatedAt: new Date().toISOString(),
  },
  isLoadingHistory: false,
  isLoadingPresets: false,
  isLoadingSettings: false,
};

function randomGeneratorReducer(
  state: RandomGeneratorContextState,
  action: RandomGeneratorAction
): RandomGeneratorContextState {
  switch (action.type) {
    case "SET_ACTIVE_TYPE":
      return { ...state, activeType: action.payload, error: null };
    
    case "SET_GENERATING":
      return { ...state, isGenerating: action.payload };
    
    case "SET_RESULTS":
      return { ...state, lastResults: action.payload, error: null };
    
    case "SET_ERROR":
      return { ...state, error: action.payload, isGenerating: false };
    
    case "UPDATE_CONFIG":
      return {
        ...state,
        configs: {
          ...state.configs,
          [action.payload.type]: action.payload.config,
        },
      };
    
    case "SET_HISTORY":
      return { ...state, history: action.payload };
    
    case "SET_PRESETS":
      return { ...state, presets: action.payload };
    
    case "SET_SETTINGS":
      return { ...state, settings: action.payload };
    
    case "SET_LOADING_HISTORY":
      return { ...state, isLoadingHistory: action.payload };
    
    case "SET_LOADING_PRESETS":
      return { ...state, isLoadingPresets: action.payload };
    
    case "SET_LOADING_SETTINGS":
      return { ...state, isLoadingSettings: action.payload };
    
    case "ADD_HISTORY_ENTRY":
      return { ...state, history: [action.payload, ...state.history] };
    
    case "ADD_PRESET":
      return { ...state, presets: [action.payload, ...state.presets] };
    
    case "UPDATE_PRESET":
      return {
        ...state,
        presets: state.presets.map(preset =>
          preset.id === action.payload.id ? action.payload : preset
        ),
      };
    
    case "DELETE_PRESET":
      return {
        ...state,
        presets: state.presets.filter(preset => preset.id !== action.payload),
      };
    
    case "CLEAR_HISTORY":
      return { ...state, history: [] };
    
    default:
      return state;
  }
}

// ============================================================================
// CONTEXT INTERFACE
// ============================================================================

interface RandomGeneratorContextInterface {
  // State
  state: RandomGeneratorContextState;
  
  // Actions
  setActiveType: (type: GeneratorType) => void;
  updateConfig: (type: GeneratorType, config: GeneratorConfig) => void;
  generateValues: (type: GeneratorType, config: GeneratorConfig) => Promise<string[]>;
  
  // History management
  loadHistory: () => Promise<void>;
  clearHistory: () => Promise<void>;
  deleteHistoryEntry: (id: string) => Promise<void>;
  
  // Preset management
  loadPresets: () => Promise<void>;
  savePreset: (name: string, type: GeneratorType, config: GeneratorConfig) => Promise<void>;
  updatePreset: (id: string, updates: Partial<GeneratorPreset>) => Promise<void>;
  deletePreset: (id: string) => Promise<void>;
  loadPreset: (preset: GeneratorPreset) => void;
  
  // Settings management
  loadSettings: () => Promise<void>;
  updateSettings: (updates: Partial<GeneratorSettings>) => Promise<void>;
  
  // Utilities
  copyToClipboard: (text: string) => Promise<void>;
  copyAllResults: () => Promise<void>;
}

// ============================================================================
// CONTEXT CREATION
// ============================================================================

const RandomGeneratorContext = createContext<RandomGeneratorContextInterface | undefined>(undefined);

// ============================================================================
// PROVIDER COMPONENT
// ============================================================================

export function RandomGeneratorProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(randomGeneratorReducer, initialState);
  const t = useTranslations("RandomGenerator");

  // ========================================================================
  // LOAD DATA ON MOUNT
  // ========================================================================

  useEffect(() => {
    loadSettings();
    loadHistory();
    loadPresets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ========================================================================
  // BASIC ACTIONS
  // ========================================================================

  const setActiveType = useCallback((type: GeneratorType) => {
    dispatch({ type: "SET_ACTIVE_TYPE", payload: type });
  }, []);

  const updateConfig = useCallback((type: GeneratorType, config: GeneratorConfig) => {
    dispatch({ type: "UPDATE_CONFIG", payload: { type, config } });
  }, []);

  // ========================================================================
  // GENERATION LOGIC
  // ========================================================================

  const generateValues = useCallback(async (type: GeneratorType, config: GeneratorConfig): Promise<string[]> => {
    dispatch({ type: "SET_GENERATING", payload: true });
    dispatch({ type: "SET_ERROR", payload: null });

    try {
      // Import the specific generator function
      const { generators } = await import("../lib/generators");
      const generator = generators[type];

      if (!generator) {
        throw new Error(`Generator for type ${type} not found`);
      }

      // Generate values
      const results = await (generator as (config: GeneratorConfig) => Promise<string[]>)(config);
      
      dispatch({ type: "SET_RESULTS", payload: results });

      // Save to history if enabled
      if (state.settings.saveHistory) {
        const historyEntry = await randomGeneratorService.addToHistory(type, config as unknown as Record<string, unknown>, results);
        dispatch({ type: "ADD_HISTORY_ENTRY", payload: historyEntry });
      }

      // Auto-copy if enabled
      if (state.settings.autoCopy && results.length > 0) {
        await copyToClipboard(results.length === 1 ? results[0] : results.join("\n"));
      }

      toast.success(t("notifications.generated", { count: results.length }));
      return results;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      dispatch({ type: "SET_ERROR", payload: errorMessage });
      toast.error(errorMessage);
      throw error;
    } finally {
      dispatch({ type: "SET_GENERATING", payload: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.settings.saveHistory, state.settings.autoCopy, t]);

  // ========================================================================
  // HISTORY MANAGEMENT
  // ========================================================================

  const loadHistory = useCallback(async () => {
    dispatch({ type: "SET_LOADING_HISTORY", payload: true });
    try {
      const history = await randomGeneratorService.getRecentHistory(50);
      dispatch({ type: "SET_HISTORY", payload: history });
    } catch (error) {
      console.error("Failed to load history:", error);
    } finally {
      dispatch({ type: "SET_LOADING_HISTORY", payload: false });
    }
  }, []);

  const clearHistory = useCallback(async () => {
    try {
      await randomGeneratorService.clearHistory();
      dispatch({ type: "CLEAR_HISTORY" });
      toast.success(t("notifications.historyCleared"));
    } catch (error) {
      console.error("Failed to clear history:", error);
      toast.error("An error occurred");
    }
  }, [t]);

  const deleteHistoryEntry = useCallback(async (id: string) => {
    try {
      const success = await randomGeneratorService.deleteHistoryEntry(id);
      if (success) {
        dispatch({ type: "SET_HISTORY", payload: state.history.filter(entry => entry.id !== id) });
      }
    } catch (error) {
      console.error("Failed to delete history entry:", error);
      toast.error("An error occurred");
    }
  }, [state.history]);

  // ========================================================================
  // PRESET MANAGEMENT
  // ========================================================================

  const loadPresets = useCallback(async () => {
    dispatch({ type: "SET_LOADING_PRESETS", payload: true });
    try {
      const presets = await randomGeneratorService.getAllPresets();
      dispatch({ type: "SET_PRESETS", payload: presets });
    } catch (error) {
      console.error("Failed to load presets:", error);
    } finally {
      dispatch({ type: "SET_LOADING_PRESETS", payload: false });
    }
  }, []);

  const savePreset = useCallback(async (name: string, type: GeneratorType, config: GeneratorConfig) => {
    try {
      const exists = await randomGeneratorService.presetNameExists(name, type);
      if (exists) {
        toast.error(t("notifications.presetNameExists"));
        return;
      }

      const preset = await randomGeneratorService.savePreset(name, type, config as unknown as Record<string, unknown>);
      dispatch({ type: "ADD_PRESET", payload: preset });
      toast.success(t("notifications.presetSaved"));
    } catch (error) {
      console.error("Failed to save preset:", error);
      toast.error("An error occurred");
    }
  }, [t]);

  const updatePreset = useCallback(async (id: string, updates: Partial<GeneratorPreset>) => {
    try {
      const success = await randomGeneratorService.updatePreset(id, updates);
      if (success) {
        const updatedPreset = { ...state.presets.find(p => p.id === id)!, ...updates };
        dispatch({ type: "UPDATE_PRESET", payload: updatedPreset });
        toast.success(t("notifications.presetLoaded"));
      }
    } catch (error) {
      console.error("Failed to update preset:", error);
      toast.error("An error occurred");
    }
  }, [state.presets, t]);

  const deletePreset = useCallback(async (id: string) => {
    try {
      const success = await randomGeneratorService.deletePreset(id);
      if (success) {
        dispatch({ type: "DELETE_PRESET", payload: id });
        toast.success(t("notifications.presetDeleted"));
      }
    } catch (error) {
      console.error("Failed to delete preset:", error);
      toast.error("An error occurred");
    }
  }, [t]);

  const loadPreset = useCallback((preset: GeneratorPreset) => {
    dispatch({ type: "SET_ACTIVE_TYPE", payload: preset.type });
    dispatch({ type: "UPDATE_CONFIG", payload: { type: preset.type, config: preset.config as unknown as GeneratorConfig } });
    toast.success(t("notifications.presetLoaded"));
  }, [t]);

  // ========================================================================
  // SETTINGS MANAGEMENT
  // ========================================================================

  const loadSettings = useCallback(async () => {
    dispatch({ type: "SET_LOADING_SETTINGS", payload: true });
    try {
      const settings = await randomGeneratorService.getSettings();
      dispatch({ type: "SET_SETTINGS", payload: settings });
    } catch (error) {
      console.error("Failed to load settings:", error);
    } finally {
      dispatch({ type: "SET_LOADING_SETTINGS", payload: false });
    }
  }, []);

  const updateSettings = useCallback(async (updates: Partial<GeneratorSettings>) => {
    try {
      const updatedSettings = await randomGeneratorService.updateSettings(updates);
      dispatch({ type: "SET_SETTINGS", payload: updatedSettings });
      toast.success(t("notifications.settingsUpdated"));
    } catch (error) {
      console.error("Failed to update settings:", error);
      toast.error("An error occurred");
    }
  }, [t]);

  // ========================================================================
  // UTILITIES
  // ========================================================================

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(t("notifications.copied"));
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
      toast.error(t("notifications.copyError"));
    }
  }, [t]);

  const copyAllResults = useCallback(async () => {
    if (state.lastResults.length === 0) {
      toast.error(t("output.empty"));
      return;
    }

    const text = state.lastResults.join("\n");
    await copyToClipboard(text);
  }, [state.lastResults, copyToClipboard, t]);

  // ========================================================================
  // CONTEXT VALUE
  // ========================================================================

  const contextValue: RandomGeneratorContextInterface = {
    state,
    setActiveType,
    updateConfig,
    generateValues,
    loadHistory,
    clearHistory,
    deleteHistoryEntry,
    loadPresets,
    savePreset,
    updatePreset,
    deletePreset,
    loadPreset,
    loadSettings,
    updateSettings,
    copyToClipboard,
    copyAllResults,
  };

  return (
    <RandomGeneratorContext.Provider value={contextValue}>
      {children}
    </RandomGeneratorContext.Provider>
  );
}

// ============================================================================
// HOOK
// ============================================================================

export function useRandomGenerator() {
  const context = useContext(RandomGeneratorContext);
  if (context === undefined) {
    throw new Error("useRandomGenerator must be used within a RandomGeneratorProvider");
  }
  return context;
}