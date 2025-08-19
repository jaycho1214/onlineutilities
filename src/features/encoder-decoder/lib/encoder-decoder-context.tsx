/**
 * Encoder/Decoder Context
 * 
 * React context for managing encoder/decoder state and operations.
 */

"use client";

import React, { createContext, useContext, useReducer, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import type { 
  EncoderDecoderState, 
  EncodingType, 
  Operation 
} from "../types";
import { encoderDecoderService } from "./encoder-decoder-db";
import { getEncoder, detectEncoding } from "../encoders/encoder-registry";

// ============================================================================
// TYPES
// ============================================================================

type EncoderDecoderAction =
  | { type: "SET_TYPE"; payload: EncodingType }
  | { type: "SET_OPERATION"; payload: Operation }
  | { type: "SET_INPUT"; payload: string }
  | { type: "SET_OUTPUT"; payload: string }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_PROCESSING"; payload: boolean }
  | { type: "SET_AUTO_CONVERT"; payload: boolean }
  | { type: "SET_SAVE_HISTORY"; payload: boolean }
  | { type: "SET_SIZE_LIMIT_EXCEEDED"; payload: boolean }
  | { type: "SET_DRAG_OVER"; payload: boolean }
  | { type: "RESET" }
  | { type: "CLEAR_ALL" };

interface EncoderDecoderContextType {
  state: EncoderDecoderState;
  // Core operations
  setType: (type: EncodingType) => void;
  setOperation: (operation: Operation) => void;
  setInput: (input: string) => void;
  processInput: () => void;
  clearAll: () => void;
  reset: () => void;
  // Auto-detection
  detectAndSetType: (input: string) => boolean;
  // Clipboard operations
  copyInput: () => Promise<void>;
  copyOutput: () => Promise<void>;
  pasteToInput: () => Promise<void>;
  pasteToOutput: () => Promise<void>;
  autoCopyOutput: () => Promise<void>;
  // Settings
  toggleAutoConvert: () => void;
  toggleSaveHistory: () => void;
  // Drag and drop
  handleDragEnter: (e: React.DragEvent) => void;
  handleDragLeave: (e: React.DragEvent) => void;
  handleDragOver: (e: React.DragEvent) => void;
  handleDrop: (e: React.DragEvent) => void;
}

// ============================================================================
// SETTINGS PERSISTENCE
// ============================================================================

const STORAGE_KEY = "encoder-decoder-settings";

interface StoredSettings {
  autoConvert: boolean;
  saveHistory: boolean;
  type: EncodingType;
}

const getStoredSettings = (): Partial<StoredSettings> => {
  if (typeof window === "undefined") return {};
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.warn("Failed to load encoder-decoder settings:", error);
    return {};
  }
};

const saveSettings = (settings: Partial<StoredSettings>) => {
  if (typeof window === "undefined") return;
  
  try {
    const existing = getStoredSettings();
    const updated = { ...existing, ...settings };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.warn("Failed to save encoder-decoder settings:", error);
  }
};

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialState: EncoderDecoderState = {
  type: "base64",
  operation: "encode",
  input: "",
  output: "",
  isValid: true,
  error: null,
  isProcessing: false,
  autoConvert: true,
  saveHistory: true,
  sizeLimitExceeded: false,
  dragDrop: {
    isDragOver: false,
  },
};

// ============================================================================
// REDUCER
// ============================================================================

function encoderDecoderReducer(
  state: EncoderDecoderState,
  action: EncoderDecoderAction,
): EncoderDecoderState {
  switch (action.type) {
    case "SET_TYPE":
      return { ...state, type: action.payload, error: null };
    case "SET_OPERATION":
      return { ...state, operation: action.payload, error: null };
    case "SET_INPUT":
      return { 
        ...state, 
        input: action.payload,
        sizeLimitExceeded: action.payload.length > (1024 * 1024), // MAX_INPUT_SIZE
        error: null 
      };
    case "SET_OUTPUT":
      return { ...state, output: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload, isValid: !action.payload };
    case "SET_PROCESSING":
      return { ...state, isProcessing: action.payload };
    case "SET_AUTO_CONVERT":
      return { ...state, autoConvert: action.payload };
    case "SET_SAVE_HISTORY":
      return { ...state, saveHistory: action.payload };
    case "SET_SIZE_LIMIT_EXCEEDED":
      return { ...state, sizeLimitExceeded: action.payload };
    case "SET_DRAG_OVER":
      return { 
        ...state, 
        dragDrop: { ...state.dragDrop, isDragOver: action.payload } 
      };
    case "RESET":
      return { ...initialState, autoConvert: state.autoConvert, saveHistory: state.saveHistory };
    case "CLEAR_ALL":
      return { 
        ...state, 
        input: "", 
        output: "", 
        error: null, 
        isValid: true, 
        sizeLimitExceeded: false 
      };
    default:
      return state;
  }
}

// ============================================================================
// CONTEXT
// ============================================================================

const EncoderDecoderContext = createContext<EncoderDecoderContextType | null>(null);

// ============================================================================
// PROVIDER
// ============================================================================

interface EncoderDecoderProviderProps {
  children: React.ReactNode;
}

export function EncoderDecoderProvider({ children }: EncoderDecoderProviderProps) {
  const [state, dispatch] = useReducer(encoderDecoderReducer, initialState);
  const t = useTranslations("EncoderDecoder");

  // Hydrate settings from localStorage after mount
  useEffect(() => {
    const storedSettings = getStoredSettings();
    if (storedSettings.autoConvert !== undefined && storedSettings.autoConvert !== state.autoConvert) {
      dispatch({ type: "SET_AUTO_CONVERT", payload: storedSettings.autoConvert });
    }
    if (storedSettings.saveHistory !== undefined && storedSettings.saveHistory !== state.saveHistory) {
      dispatch({ type: "SET_SAVE_HISTORY", payload: storedSettings.saveHistory });
    }
    if (storedSettings.type && storedSettings.type !== state.type) {
      dispatch({ type: "SET_TYPE", payload: storedSettings.type });
    }
  }, [state.autoConvert, state.saveHistory, state.type]);

  // ========================================================================
  // CORE OPERATIONS
  // ========================================================================

  const setType = useCallback((type: EncodingType) => {
    dispatch({ type: "SET_TYPE", payload: type });
    saveSettings({ type });
  }, []);

  const setOperation = useCallback((operation: Operation) => {
    dispatch({ type: "SET_OPERATION", payload: operation });
  }, []);

  const setInput = useCallback((input: string) => {
    dispatch({ type: "SET_INPUT", payload: input });
  }, []);

  const processInput = useCallback(async () => {
    if (!state.input.trim()) {
      dispatch({ type: "SET_OUTPUT", payload: "" });
      dispatch({ type: "SET_ERROR", payload: null });
      toast.error(t("notifications.emptyInput"));
      return;
    }

    dispatch({ type: "SET_PROCESSING", payload: true });
    dispatch({ type: "SET_ERROR", payload: null });

    try {
      const encoder = getEncoder(state.type);
      const result = state.operation === "encode" 
        ? encoder.encode(state.input)
        : encoder.decode(state.input);

      if (result.success) {
        dispatch({ type: "SET_OUTPUT", payload: result.result || "" });
        dispatch({ type: "SET_ERROR", payload: null });

        // Save to history if enabled
        if (state.saveHistory) {
          try {
            await encoderDecoderService.addEntry({
              type: state.type,
              operation: state.operation,
              input: state.input,
              output: result.result || "",
              isValid: true,
            });
          } catch (error) {
            console.warn("Failed to save to history:", error);
          }
        }
      } else {
        const errorMessage = result.error || "Processing failed";
        dispatch({ type: "SET_OUTPUT", payload: "" });
        dispatch({ type: "SET_ERROR", payload: errorMessage });
        
        toast.error(t(`notifications.${state.operation}Failed`, { 
          error: errorMessage 
        }));
        
        // Save failed attempt to history if enabled
        if (state.saveHistory) {
          try {
            await encoderDecoderService.addEntry({
              type: state.type,
              operation: state.operation,
              input: state.input,
              output: "",
              error: errorMessage,
              isValid: false,
            });
          } catch (error) {
            console.warn("Failed to save to history:", error);
          }
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      dispatch({ type: "SET_OUTPUT", payload: "" });
      dispatch({ type: "SET_ERROR", payload: errorMessage });
      
      toast.error(t(`notifications.${state.operation}Failed`, { 
        error: errorMessage 
      }));
    } finally {
      dispatch({ type: "SET_PROCESSING", payload: false });
    }
  }, [state.input, state.type, state.operation, state.saveHistory, t]);

  // Auto-process when input changes and auto-convert is enabled
  useEffect(() => {
    if (state.autoConvert && !state.sizeLimitExceeded && state.input.trim()) {
      const timeoutId = setTimeout(() => {
        processInput();
      }, 800); // Increased debounce for better typing experience

      return () => clearTimeout(timeoutId);
    } else if (!state.input.trim()) {
      dispatch({ type: "SET_OUTPUT", payload: "" });
      dispatch({ type: "SET_ERROR", payload: null });
    }
  }, [state.input, state.type, state.operation, state.autoConvert, state.sizeLimitExceeded, processInput]);

  const clearAll = useCallback(() => {
    dispatch({ type: "CLEAR_ALL" });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: "RESET" });
  }, []);

  // ========================================================================
  // AUTO-DETECTION
  // ========================================================================

  const detectAndSetType = useCallback((input: string): boolean => {
    if (!input.trim()) return false;

    const detectionResults = detectEncoding(input);
    if (detectionResults.length > 0 && detectionResults[0].confidence > 0.6) {
      const bestMatch = detectionResults[0];
      dispatch({ type: "SET_TYPE", payload: bestMatch.type });
      // For high-confidence detection, assume decode operation
      dispatch({ type: "SET_OPERATION", payload: "decode" });
      return true;
    }

    return false;
  }, []);

  // ========================================================================
  // CLIPBOARD OPERATIONS
  // ========================================================================

  const copyInput = useCallback(async (): Promise<void> => {
    if (!state.input) {
      toast.error(t("notifications.noInputToCopy"));
      return;
    }
    
    try {
      await navigator.clipboard.writeText(state.input);
    } catch (error) {
      console.warn("Failed to copy input:", error);
      toast.error(t("notifications.copyError"));
    }
  }, [state.input, t]);

  const copyOutput = useCallback(async (): Promise<void> => {
    if (!state.output) {
      toast.error(t("notifications.noOutputToCopy"));
      return;
    }
    
    try {
      await navigator.clipboard.writeText(state.output);
    } catch (error) {
      console.warn("Failed to copy output:", error);
      toast.error(t("notifications.copyError"));
    }
  }, [state.output, t]);

  const pasteToInput = useCallback(async (): Promise<void> => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        dispatch({ type: "SET_INPUT", payload: text });
        
        // Try auto-detection on paste
        if (state.autoConvert) {
          detectAndSetType(text);
        }
      } else {
        toast.error(t("notifications.clipboardEmpty"));
      }
    } catch (error) {
      console.warn("Failed to paste:", error);
      toast.error(t("notifications.pasteError"));
    }
  }, [state.autoConvert, detectAndSetType, t]);

  const pasteToOutput = useCallback(async (): Promise<void> => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        // If input is empty, perform action reversal
        if (!state.input.trim()) {
          // Reverse the operation
          const reversedOperation = state.operation === "encode" ? "decode" : "encode";
          
          // Set the pasted text as input and reverse the operation
          dispatch({ type: "SET_INPUT", payload: text });
          dispatch({ type: "SET_OPERATION", payload: reversedOperation });
          
          // Try auto-detection on the pasted text
          if (state.autoConvert) {
            detectAndSetType(text);
          }
          
          // No success notification, just perform the action silently
        } else {
          // If input is not empty, just paste to output (normal behavior)
          dispatch({ type: "SET_OUTPUT", payload: text });
        }
      } else {
        toast.error(t("notifications.clipboardEmpty"));
      }
    } catch (error) {
      console.warn("Failed to paste to output:", error);
      toast.error(t("notifications.pasteError"));
    }
  }, [state.input, state.operation, state.autoConvert, detectAndSetType, t]);

  const autoCopyOutput = useCallback(async (): Promise<void> => {
    if (state.output) {
      await copyOutput();
    }
  }, [state.output, copyOutput]);

  // ========================================================================
  // SETTINGS
  // ========================================================================

  const toggleAutoConvert = useCallback(() => {
    const newValue = !state.autoConvert;
    dispatch({ type: "SET_AUTO_CONVERT", payload: newValue });
    saveSettings({ autoConvert: newValue });
  }, [state.autoConvert]);

  const toggleSaveHistory = useCallback(() => {
    const newValue = !state.saveHistory;
    dispatch({ type: "SET_SAVE_HISTORY", payload: newValue });
    saveSettings({ saveHistory: newValue });
  }, [state.saveHistory]);

  // ========================================================================
  // DRAG AND DROP
  // ========================================================================

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch({ type: "SET_DRAG_OVER", payload: true });
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Only hide overlay if leaving the main container
    if (e.currentTarget === e.target) {
      dispatch({ type: "SET_DRAG_OVER", payload: false });
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    dispatch({ type: "SET_DRAG_OVER", payload: false });

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      const file = files[0];
      
      // Check file size (1MB limit)
      if (file.size > 1024 * 1024) {
        dispatch({ type: "SET_ERROR", payload: "File size exceeds 1MB limit" });
        return;
      }

      try {
        const text = await file.text();
        dispatch({ type: "SET_INPUT", payload: text });
        
        // Try auto-detection
        if (state.autoConvert) {
          detectAndSetType(text);
        }
      } catch {
        dispatch({ type: "SET_ERROR", payload: "Failed to read file" });
      }
    } else {
      // Handle text drag
      const text = e.dataTransfer.getData("text");
      if (text) {
        dispatch({ type: "SET_INPUT", payload: text });
        
        if (state.autoConvert) {
          detectAndSetType(text);
        }
      }
    }
  }, [state.autoConvert, detectAndSetType]);

  // ========================================================================
  // CONTEXT VALUE
  // ========================================================================

  const contextValue: EncoderDecoderContextType = {
    state,
    // Core operations
    setType,
    setOperation,
    setInput,
    processInput,
    clearAll,
    reset,
    // Auto-detection
    detectAndSetType,
    // Clipboard operations
    copyInput,
    copyOutput,
    pasteToInput,
    pasteToOutput,
    autoCopyOutput,
    // Settings
    toggleAutoConvert,
    toggleSaveHistory,
    // Drag and drop
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleDrop,
  };

  return (
    <EncoderDecoderContext.Provider value={contextValue}>
      {children}
    </EncoderDecoderContext.Provider>
  );
}

// ============================================================================
// HOOK
// ============================================================================

export function useEncoderDecoder(): EncoderDecoderContextType {
  const context = useContext(EncoderDecoderContext);
  if (!context) {
    throw new Error("useEncoderDecoder must be used within EncoderDecoderProvider");
  }
  return context;
}