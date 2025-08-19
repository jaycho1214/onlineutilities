"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
  useMemo,
} from "react";
import { textDiffReducer, initialState } from "./text-diff-reducer";
import { computeLineDiff } from "./diff-engine";
import { textDiffService } from "./text-diff-db";
import type {
  TextDiffState,
  TextDiffAction,
  MergeAction,
  DiffViewMode,
} from "../types";

interface TextDiffContextType {
  state: TextDiffState;
  dispatch: React.Dispatch<TextDiffAction>;
  // Text operations
  setOriginalText: (text: string) => void;
  setModifiedText: (text: string) => void;
  swapTexts: () => void;
  clearAll: () => void;
  // Diff operations
  computeDiff: () => void;
  applyMerge: (blockId: string, action: MergeAction) => void;
  // View operations
  setViewMode: (mode: DiffViewMode) => void;
  // Settings
  updateDiffOptions: (options: Partial<TextDiffState["diffOptions"]>) => void;
  updateUISettings: (settings: Partial<TextDiffState["uiSettings"]>) => void;
  // History operations
  saveToHistory: (title?: string) => Promise<void>;
  loadFromHistory: (id: string) => Promise<void>;
}

const TextDiffContext = createContext<TextDiffContextType | undefined>(
  undefined,
);

export function TextDiffProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(textDiffReducer, initialState);

  // Load settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      const settings = await textDiffService.getSettings();
      if (settings) {
        dispatch({
          type: "UPDATE_UI_SETTINGS",
          payload: {
            showLineNumbers: settings.lineNumbers,
            wordWrap: settings.wordWrap,
            fontSize: settings.fontSize,
            theme: settings.theme,
          },
        });
        dispatch({
          type: "UPDATE_DIFF_OPTIONS",
          payload: settings.defaultOptions,
        });
        dispatch({
          type: "SET_VIEW_MODE",
          payload: settings.defaultViewMode,
        });
      }
    };
    loadSettings();
  }, []);

  // Text operations
  const setOriginalText = useCallback((text: string) => {
    dispatch({ type: "SET_ORIGINAL_TEXT", payload: text });
  }, []);

  const setModifiedText = useCallback((text: string) => {
    dispatch({ type: "SET_MODIFIED_TEXT", payload: text });
  }, []);

  const swapTexts = useCallback(() => {
    dispatch({ type: "SWAP_TEXTS" });
  }, []);

  const clearAll = useCallback(() => {
    dispatch({ type: "CLEAR_ALL" });
  }, []);

  // Diff operations - optimized with useCallback
  const computeDiff = useCallback(() => {
    if (!state.originalText && !state.modifiedText) {
      dispatch({ type: "SET_ERROR", payload: "Please enter text to compare" });
      return;
    }

    dispatch({ type: "SET_LOADING", payload: true });

    // Use timeout for large diffs to prevent blocking UI
    const timeoutId = setTimeout(() => {
      try {
        const result = computeLineDiff(
          state.originalText,
          state.modifiedText,
          state.diffOptions,
        );
        dispatch({ type: "SET_DIFF_RESULT", payload: result });
        dispatch({ type: "SET_ERROR", payload: null });
      } catch (error) {
        dispatch({
          type: "SET_ERROR",
          payload:
            error instanceof Error ? error.message : "Failed to compute diff",
        });
      }
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [state.originalText, state.modifiedText, state.diffOptions]);

  const applyMerge = useCallback((blockId: string, action: MergeAction) => {
    dispatch({
      type: "APPLY_MERGE_ACTION",
      payload: { blockId, action },
    });
  }, []);

  // View operations
  const setViewMode = useCallback((mode: DiffViewMode) => {
    dispatch({ type: "SET_VIEW_MODE", payload: mode });
  }, []);

  // Settings operations
  const updateDiffOptions = useCallback(
    (options: Partial<TextDiffState["diffOptions"]>) => {
      dispatch({ type: "UPDATE_DIFF_OPTIONS", payload: options });
    },
    [],
  );

  const updateUISettings = useCallback(
    (settings: Partial<TextDiffState["uiSettings"]>) => {
      dispatch({ type: "UPDATE_UI_SETTINGS", payload: settings });
    },
    [],
  );

  // History operations - optimized to prevent unnecessary re-renders
  const saveToHistory = useCallback(
    async (title?: string) => {
      if (!state.originalText && !state.modifiedText) {
        return;
      }

      try {
        await textDiffService.addEntry({
          originalText: state.originalText,
          modifiedText: state.modifiedText,
          mergedText: state.mergedText,
          viewMode: state.viewMode,
          diffOptions: state.diffOptions,
          title: title || `Diff ${new Date().toLocaleString()}`,
        });
      } catch (error) {
        console.error("Failed to save to history:", error);
      }
    },
    [
      state.originalText,
      state.modifiedText,
      state.mergedText,
      state.viewMode,
      state.diffOptions,
    ],
  );

  const loadFromHistory = useCallback(async (id: string) => {
    try {
      const entry = await textDiffService.getEntry(id);
      if (entry) {
        dispatch({
          type: "LOAD_FROM_HISTORY",
          payload: {
            originalText: entry.originalText,
            modifiedText: entry.modifiedText,
            mergedText: entry.mergedText || "",
            viewMode: entry.viewMode,
            diffOptions: entry.diffOptions,
          },
        });
      }
    } catch (error) {
      console.error("Failed to load from history:", error);
    }
  }, []);

  // Save settings when they change
  useEffect(() => {
    const saveSettings = async () => {
      await textDiffService.saveSettings({
        defaultViewMode: state.viewMode,
        defaultOptions: state.diffOptions,
        lineNumbers: state.uiSettings.showLineNumbers,
        wordWrap: state.uiSettings.wordWrap,
        fontSize: state.uiSettings.fontSize,
        theme: state.uiSettings.theme,
      });
    };
    saveSettings();
  }, [state.viewMode, state.diffOptions, state.uiSettings]);

  const contextValue = useMemo(
    () => ({
      state,
      dispatch,
      setOriginalText,
      setModifiedText,
      swapTexts,
      clearAll,
      computeDiff,
      applyMerge,
      setViewMode,
      updateDiffOptions,
      updateUISettings,
      saveToHistory,
      loadFromHistory,
    }),
    [
      state,
      setOriginalText,
      setModifiedText,
      swapTexts,
      clearAll,
      computeDiff,
      applyMerge,
      setViewMode,
      updateDiffOptions,
      updateUISettings,
      saveToHistory,
      loadFromHistory,
    ],
  );

  return (
    <TextDiffContext.Provider value={contextValue}>
      {children}
    </TextDiffContext.Provider>
  );
}

export function useTextDiff() {
  const context = useContext(TextDiffContext);
  if (!context) {
    throw new Error("useTextDiff must be used within a TextDiffProvider");
  }
  return context;
}
