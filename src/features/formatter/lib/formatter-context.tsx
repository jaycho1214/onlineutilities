"use client";

/**
 * Formatter Context Module
 *
 * This module provides React context for managing formatter state and operations.
 * It handles state management, formatting operations, and history management.
 */

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

import type {
  FormatterContextValue,
  FormatterState,
  FormatterEntry,
  FormatterType,
  CsvDelimiter,
  CsvViewMode,
} from "../types";
import { formatterService } from "./formatter-db";
import {
  formatEnhanced,
  validateEnhanced,
  minifyEnhanced,
  handleFileLoadEnhanced,
  parseCsvToTable,
} from "./enhanced-formatter-utils";

// ============================================================================
// CONTEXT CREATION
// ============================================================================

const FormatterContext = createContext<FormatterContextValue | undefined>(undefined);

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialState: FormatterState = {
  type: "json",
  input: "",
  output: "",
  isValid: true,
  csvDelimiter: "comma",
  csvViewMode: "raw",
  fileLoading: {
    isLoading: false,
  },
  dragDrop: {
    isDragOver: false,
    dragCount: 0,
  },
  tabSize: 2,
  useTabs: false,
};

// ============================================================================
// PROVIDER COMPONENT
// ============================================================================

interface FormatterProviderProps {
  children: ReactNode;
}

export function FormatterProvider({ children }: FormatterProviderProps) {
  const t = useTranslations("Formatter");
  
  // State management
  const [state, setState] = useState<FormatterState>(initialState);
  const [history, setHistory] = useState<FormatterEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // =========================================================================
  // EFFECTS
  // =========================================================================

  // Load history on mount
  useEffect(() => {
    const loadHistory = async () => {
      setIsLoading(true);
      try {
        const entries = await formatterService.getRecentEntries(50);
        setHistory(entries);
      } catch {
        // Failed to load formatter history
      } finally {
        setIsLoading(false);
      }
    };

    loadHistory();
  }, []);

  // Update CSV table data when input or delimiter changes
  useEffect(() => {
    if (state.type === "csv" && state.input && state.csvViewMode === "table") {
      const tableData = parseCsvToTable(state.input, state.csvDelimiter);
      setState(prev => ({ ...prev, csvTableData: tableData || undefined }));
    }
  }, [state.input, state.csvDelimiter, state.type, state.csvViewMode]);

  // =========================================================================
  // CONTENT AUTO-DETECTION
  // =========================================================================
  
  const detectContentType = useCallback((content: string, filename?: string): FormatterType => {
    const trimmed = content.trim();
    
    // Check file extension first
    if (filename) {
      const ext = filename.toLowerCase().split('.').pop();
      if (ext === 'json') return 'json';
      if (ext === 'csv') return 'csv';
      if (ext === 'xml') return 'xml';
      if (ext === 'yaml' || ext === 'yml') return 'yaml';
    }
    
    // Content-based detection - order matters for accuracy
    
    // YAML detection (check before JSON since YAML can sometimes be mistaken for other formats)
    if (trimmed.startsWith('---') || 
        trimmed.includes('apiVersion:') || 
        trimmed.includes('kind:') ||
        trimmed.includes('metadata:')) {
      return 'yaml';
    }
    
    // Look for YAML patterns: key-value with colons and proper indentation
    const lines = trimmed.split('\n');
    let yamlLikeLines = 0;
    let meaningfulLines = 0;
    
    for (const line of lines.slice(0, 10)) { // Check first 10 lines
      const trimmedLine = line.trim();
      if (!trimmedLine || trimmedLine.startsWith('#')) continue;
      
      meaningfulLines++;
      
      // YAML key-value pattern
      if (/^[a-zA-Z_][a-zA-Z0-9_\-\s]*\s*:/.test(trimmedLine) ||
          /^-\s+/.test(trimmedLine) ||
          /^\s{2,}[a-zA-Z_][a-zA-Z0-9_\-\s]*\s*:/.test(line)) {
        yamlLikeLines++;
      }
    }
    
    if (meaningfulLines > 0 && yamlLikeLines / meaningfulLines > 0.6) {
      return 'yaml';
    }
    
    // JSON detection
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      try {
        JSON.parse(trimmed);
        return 'json';
      } catch {
        // Not valid JSON
      }
    }
    
    // XML detection
    if (trimmed.startsWith('<') && (trimmed.includes('<?xml') || trimmed.includes('</'))) {
      return 'xml';
    }
    
    // CSV detection - look for comma-separated values
    const csvLines = trimmed.split('\n').slice(0, 5); // Check first 5 lines
    if (csvLines.length > 1 && csvLines.every(line => line.includes(','))) {
      return 'csv';
    }
    
    // Default to json
    return 'json';
  }, []);

  // =========================================================================
  // STATE ACTIONS
  // =========================================================================

  const setType = useCallback((type: FormatterType) => {
    setState(prev => ({
      ...prev,
      type,
      input: "",
      output: "",
      isValid: true,
      validationError: undefined,
      csvTableData: undefined,
      fileLoading: {
        isLoading: false,
      },
    }));
  }, []);

  const setInput = useCallback((input: string) => {
    setState(prev => ({ ...prev, input, output: "", isValid: true, validationError: undefined }));
    
    // Auto-detect content type if significant content is pasted
    if (input.trim().length > 50) {
      const detectedType = detectContentType(input);
      if (detectedType !== state.type) {
        
        // Show a toast suggesting format change
        toast.info(`Content appears to be ${detectedType.toUpperCase()}. Switch format?`, {
          action: {
            label: "Switch",
            onClick: () => setType(detectedType)
          }
        });
      }
    }
  }, [detectContentType, state.type, setType]);

  const setOutput = useCallback((output: string) => {
    setState(prev => ({ ...prev, output }));
  }, []);

  const setCsvDelimiter = useCallback((delimiter: CsvDelimiter) => {
    setState(prev => ({ ...prev, csvDelimiter: delimiter }));
  }, []);

  const setCsvViewMode = useCallback((mode: CsvViewMode) => {
    setState(prev => ({ ...prev, csvViewMode: mode }));
  }, []);

  const setTabSize = useCallback((tabSize: number) => {
    setState(prev => ({ ...prev, tabSize }));
  }, []);

  const setUseTabs = useCallback((useTabs: boolean) => {
    setState(prev => ({ ...prev, useTabs }));
  }, []);

  // =========================================================================
  // FORMATTER OPERATIONS
  // =========================================================================

  const formatInput = useCallback(async () => {
    if (!state.input.trim()) {
      toast.error(t("notifications.emptyInput", { type: state.type.toUpperCase() }));
      return;
    }

    try {
      const options = {
        ...(state.type === "csv" ? { csvDelimiter: state.csvDelimiter } : {}),
        tabSize: state.tabSize,
        useTabs: state.useTabs,
      };
      const result = formatEnhanced(state.input, state.type, options);

      if (result.success && result.output) {
        setState(prev => ({
          ...prev,
          output: result.output!,
          isValid: true,
          validationError: undefined,
        }));

        // Add to history
        const entry: Omit<FormatterEntry, "id" | "timestamp"> = {
          type: state.type,
          input: state.input,
          output: result.output,
          operation: "format",
          isValid: true,
          ...(state.type === "csv" && { delimiter: state.csvDelimiter }),
        };

        const savedEntry = await formatterService.addEntry(entry);
        setHistory(prev => [savedEntry, ...prev.slice(0, 49)]);

        toast.success(t("notifications.formatted", { type: state.type.toUpperCase() }));
      } else {
        setState(prev => ({
          ...prev,
          output: "",
          isValid: false,
          validationError: { message: result.error || "Unknown error" },
        }));
        toast.error(result.error || t("notifications.error", { type: state.type.toUpperCase() }));
      }
    } catch {
      
      toast.error(t("notifications.error", { type: state.type.toUpperCase() }));
    }
  }, [state.input, state.type, state.csvDelimiter, state.tabSize, state.useTabs, t]);

  const validateInput = useCallback(async () => {
    if (!state.input.trim()) {
      toast.error(t("notifications.emptyInput", { type: state.type.toUpperCase() }));
      return;
    }

    try {
      const result = validateEnhanced(state.input, state.type);

      if (result.isValid) {
        setState(prev => ({
          ...prev,
          isValid: true,
          validationError: undefined,
        }));

        // Add to history
        const entry: Omit<FormatterEntry, "id" | "timestamp"> = {
          type: state.type,
          input: state.input,
          output: state.input, // For validation, output is same as input
          operation: "validate",
          isValid: true,
          ...(state.type === "csv" && { delimiter: state.csvDelimiter }),
        };

        const savedEntry = await formatterService.addEntry(entry);
        setHistory(prev => [savedEntry, ...prev.slice(0, 49)]);

        toast.success(t("notifications.validated", { type: state.type.toUpperCase() }));
      } else {
        setState(prev => ({
          ...prev,
          isValid: false,
          validationError: result.error,
        }));

        // Still add to history for invalid entries
        const entry: Omit<FormatterEntry, "id" | "timestamp"> = {
          type: state.type,
          input: state.input,
          output: result.error?.message || "Invalid",
          operation: "validate",
          isValid: false,
          ...(state.type === "csv" && { delimiter: state.csvDelimiter }),
        };

        const savedEntry = await formatterService.addEntry(entry);
        setHistory(prev => [savedEntry, ...prev.slice(0, 49)]);

        toast.error(result.error?.message || t("notifications.error", { type: state.type.toUpperCase() }));
      }
    } catch {
      
      toast.error(t("notifications.error", { type: state.type.toUpperCase() }));
    }
  }, [state.input, state.type, state.csvDelimiter, t]);

  const minifyInput = useCallback(async () => {
    if (!state.input.trim()) {
      toast.error(t("notifications.emptyInput", { type: state.type.toUpperCase() }));
      return;
    }

    try {
      const result = minifyEnhanced(state.input, state.type);

      if (result.success && result.output) {
        setState(prev => ({
          ...prev,
          output: result.output!,
          isValid: true,
          validationError: undefined,
        }));

        // Add to history
        const entry: Omit<FormatterEntry, "id" | "timestamp"> = {
          type: state.type,
          input: state.input,
          output: result.output,
          operation: "minify",
          isValid: true,
          ...(state.type === "csv" && { delimiter: state.csvDelimiter }),
        };

        const savedEntry = await formatterService.addEntry(entry);
        setHistory(prev => [savedEntry, ...prev.slice(0, 49)]);

        toast.success(t("notifications.minified", { type: state.type.toUpperCase() }));
      } else {
        setState(prev => ({
          ...prev,
          output: "",
          isValid: false,
          validationError: { message: result.error || "Unknown error" },
        }));
        toast.error(result.error || t("notifications.error", { type: state.type.toUpperCase() }));
      }
    } catch {
      
      toast.error(t("notifications.error", { type: state.type.toUpperCase() }));
    }
  }, [state.input, state.type, state.csvDelimiter, t]);

  const clearInput = useCallback(() => {
    setState(prev => ({ ...prev, input: "", isValid: true, validationError: undefined }));
  }, []);

  const clearOutput = useCallback(() => {
    setState(prev => ({ ...prev, output: "", isValid: true, validationError: undefined }));
  }, []);

  const clearAll = useCallback(() => {
    setState(prev => ({
      ...prev,
      input: "",
      output: "",
      isValid: true,
      validationError: undefined,
      csvTableData: undefined,
      fileLoading: {
        isLoading: false,
      },
    }));
  }, []);

  // =========================================================================
  // HISTORY OPERATIONS
  // =========================================================================

  const addToHistory = useCallback((entry: FormatterEntry) => {
    setHistory(prev => [entry, ...prev.slice(0, 49)]);
  }, []);

  const clearHistory = useCallback(async () => {
    try {
      await formatterService.clearHistory();
      setHistory([]);
      toast.success(t("notifications.historyCleared"));
    } catch {
      
      toast.error("Failed to clear history");
    }
  }, [t]);

  const loadHistoryItem = useCallback((entry: FormatterEntry) => {
    setState(prev => ({
      ...prev,
      type: entry.type,
      input: entry.input,
      output: entry.output,
      isValid: entry.isValid,
      csvDelimiter: entry.delimiter || "comma",
      validationError: entry.isValid ? undefined : { message: entry.output },
    }));
  }, []);

  // =========================================================================
  // DRAG AND DROP OPERATIONS
  // =========================================================================

  const handleDragEnter = useCallback(() => {
    
    setState(prev => ({
      ...prev,
      dragDrop: {
        ...prev.dragDrop,
        dragCount: prev.dragDrop.dragCount + 1,
        isDragOver: true,
      },
    }));
  }, []);

  const handleDragLeave = useCallback(() => {
    setState(prev => {
      const newDragCount = prev.dragDrop.dragCount - 1;
      return {
        ...prev,
        dragDrop: {
          ...prev.dragDrop,
          dragCount: newDragCount,
          isDragOver: newDragCount > 0,
        },
      };
    });
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    
    e.preventDefault();
    e.stopPropagation();
    
    // Always allow drop during dragover
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = "copy";
    }
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    
    
    
    
    e.preventDefault();
    e.stopPropagation();

    // Reset drag state
    setState(prev => ({
      ...prev,
      dragDrop: {
        isDragOver: false,
        dragCount: 0,
      },
    }));

    if (!e.dataTransfer?.files || e.dataTransfer.files.length === 0) {
      
      toast.error(t("notifications.unsupportedFile"));
      return;
    }
    
    

    // Get the first file (simple version)
    const file = e.dataTransfer.files[0];
    
    
    // Simple file type validation
    const validExtensions = ['.json', '.csv', '.xml', '.txt'];
    const hasValidExtension = validExtensions.some(ext => 
      file.name.toLowerCase().endsWith(ext)
    );
    
    if (!hasValidExtension) {
      toast.error("Unsupported file type. Please use .json, .csv, .xml, or .txt files.");
      return;
    }
    
    // Read file content
    try {
      setState(prev => ({
        ...prev,
        fileLoading: {
          isLoading: true,
          fileName: file.name,
          fileSize: Math.round(file.size / 1024),
        },
      }));
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        
        
        if (content) {
          // Detect content type
          const detectedType = detectContentType(content, file.name);
          
          
          // Switch to detected format first, then set content
          
          
          
          // Update state with content AND type together
          setState(prev => ({
            ...prev,
            type: detectedType,
            input: content,
            output: "",
            isValid: true,
            validationError: undefined,
            csvTableData: undefined,
            fileLoading: {
              isLoading: false,
              fileName: file.name,
              fileSize: Math.round(file.size / 1024),
            },
          }));
          
          toast.success(`File loaded and format detected: ${detectedType.toUpperCase()}`);
        } else {
          
          setState(prev => ({
            ...prev,
            fileLoading: { isLoading: false },
          }));
          toast.error("Failed to read file content");
        }
      };
      
      reader.onerror = () => {
        setState(prev => ({
          ...prev,
          fileLoading: { isLoading: false },
        }));
        toast.error("Failed to read file");
      };
      
      reader.readAsText(file);
    } catch {
      
      setState(prev => ({
        ...prev,
        fileLoading: { isLoading: false },
      }));
      toast.error("Error reading file");
    }
  }, [t, detectContentType]);

  const handleFileLoadInternal = useCallback(async (file: File) => {
    // Set initial loading state
    setState(prev => ({
      ...prev,
      fileLoading: {
        isLoading: true,
        fileName: file.name,
        fileSize: Math.round(file.size / 1024),
      },
    }));

    try {
      // Start format detection
      setState(prev => ({
        ...prev,
        fileLoading: {
          ...prev.fileLoading,
          isDetecting: true,
        },
      }));

      const result = await handleFileLoadEnhanced(file);

      if (result.success && result.content) {
        // Set the content and detection results
        setState(prev => ({
          ...prev,
          input: result.content!,
          output: "",
          isValid: true,
          validationError: undefined,
          csvTableData: undefined,
          fileLoading: {
            isLoading: false,
            isDetecting: false,
            fileName: result.fileName,
            fileSize: result.fileSize,
            detectedFormat: result.detectedFormat,
            detectionConfidence: result.detectionConfidence,
            detectedAlternatives: result.detectedAlternatives?.map(alt => ({
              format: alt.format,
              confidence: alt.confidence,
            })),
          },
        }));

        // Handle format detection and switching
        if (result.detectedFormat && result.detectedFormat !== state.type) {
          const confidence = result.detectionConfidence || 0;
          
          if (confidence >= 70) {
            // High confidence - auto switch with notification
            setState(prev => ({ ...prev, type: result.detectedFormat! }));
            toast.success(t("notifications.formatDetected", { type: result.detectedFormat!.toUpperCase() }));
          } else if (confidence >= 40) {
            // Medium confidence - show confirmation dialog
            // Note: In a real implementation, you'd show the FormatDetectionDialog here
            toast.info(t("notifications.formatDetectionConfirm", { type: result.detectedFormat!.toUpperCase() }));
          } else {
            // Low confidence - just notify
            toast.warning(t("notifications.lowConfidenceDetection", { confidence }));
          }
        }

        toast.success(t("notifications.fileLoaded"));
      } else {
        setState(prev => ({
          ...prev,
          fileLoading: {
            isLoading: false,
            isDetecting: false,
          },
        }));
        
        toast.error(result.error || t("notifications.fileError"));
      }
    } catch {
      setState(prev => ({
        ...prev,
        fileLoading: {
          isLoading: false,
          isDetecting: false,
        },
      }));
      
      
      toast.error(t("notifications.fileError"));
    }
  }, [state.type, t]);

  const handleFileLoadAPI = useCallback(async (file: File) => {
    await handleFileLoadInternal(file);
  }, [handleFileLoadInternal]);

  // =========================================================================
  // UTILITY OPERATIONS
  // =========================================================================

  const copyInput = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(state.input);
      toast.success(t("notifications.inputCopied"));
    } catch {
      
      toast.error(t("notifications.copyError"));
    }
  }, [state.input, t]);

  const copyOutput = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(state.output);
      toast.success(t("notifications.outputCopied"));
    } catch {
      
      toast.error(t("notifications.copyError"));
    }
  }, [state.output, t]);

  const pasteToInput = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text.trim()) {
        toast.success(t("notifications.autoPasted"));
        setInput(text);
      }
    } catch {
      
      toast.error(t("notifications.pasteError"));
    }
  }, [setInput, t]);

  const autoCopyOutput = useCallback(async () => {
    if (!state.output.trim()) {
      toast.error(t("notifications.noOutputToCopy"));
      return;
    }
    
    try {
      await navigator.clipboard.writeText(state.output);
      toast.success(t("notifications.autoCopied"));
    } catch {
      
      toast.error(t("notifications.copyError"));
    }
  }, [state.output, t]);

  // =========================================================================
  // CONTEXT VALUE
  // =========================================================================

  const contextValue = useMemo<FormatterContextValue>(() => ({
    state,
    history,
    isLoading,
    // State actions
    setType,
    setInput,
    setOutput,
    setCsvDelimiter,
    setCsvViewMode,
    setTabSize,
    setUseTabs,
    // Formatter operations
    formatInput,
    validateInput,
    minifyInput,
    clearInput,
    clearOutput,
    clearAll,
    // History operations
    addToHistory,
    clearHistory,
    loadHistoryItem,
    // Utility operations
    copyInput,
    copyOutput,
    pasteToInput,
    autoCopyOutput,
    // Drag and drop operations
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleDrop,
    handleFileLoad: handleFileLoadAPI,
  }), [
    state,
    history,
    isLoading,
    setType,
    setInput,
    setOutput,
    setCsvDelimiter,
    setCsvViewMode,
    setTabSize,
    setUseTabs,
    formatInput,
    validateInput,
    minifyInput,
    clearInput,
    clearOutput,
    clearAll,
    addToHistory,
    clearHistory,
    loadHistoryItem,
    copyInput,
    copyOutput,
    pasteToInput,
    autoCopyOutput,
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleDrop,
    handleFileLoadAPI,
  ]);

  return (
    <FormatterContext.Provider value={contextValue}>
      {children}
    </FormatterContext.Provider>
  );
}

// ============================================================================
// HOOK
// ============================================================================

/**
 * Hook to use the formatter context
 * @returns FormatterContextValue - The formatter context value
 * @throws Error if used outside of FormatterProvider
 */
export function useFormatter(): FormatterContextValue {
  const context = useContext(FormatterContext);
  
  if (context === undefined) {
    throw new Error("useFormatter must be used within a FormatterProvider");
  }
  
  return context;
}