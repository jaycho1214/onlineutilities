/**
 * llms.txt Maker Context Provider
 * Manages global state for the llms.txt maker feature
 */

"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
} from "react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import type {
  LlmsTxtMakerState,
  LlmsTxtMakerAction,
  RepositoryFile,
  GeneratorSettings,
  GitHubError,
  FileSelectionConfig,
  LlmsTxtGenerationModel,
} from "../types";
import { DEFAULT_SETTINGS, DEFAULT_FILE_SELECTION_CONFIG } from "../types";
import { githubApi } from "./github-api";
import {
  llmsTxtGenerationService,
  LlmsTxtGenerator,
} from "./llms-txt-maker-service";

// ========================================================================
// INITIAL STATE
// ========================================================================

const initialState: LlmsTxtMakerState = {
  repositoryUrl: "",
  repository: null,
  selectedFiles: new Set<string>(),
  fileSelectionConfig: DEFAULT_FILE_SELECTION_CONFIG,
  settings: DEFAULT_SETTINGS,
  output: null,
  loading: { isLoading: false },
  error: null,
  showHistory: false,
  historyItems: [],
};

// ========================================================================
// REDUCER
// ========================================================================

function llmsTxtMakerReducer(
  state: LlmsTxtMakerState,
  action: LlmsTxtMakerAction,
): LlmsTxtMakerState {
  switch (action.type) {
    case "SET_REPOSITORY_URL":
      return {
        ...state,
        repositoryUrl: action.payload,
        error: null,
      };

    case "SET_LOADING":
      return {
        ...state,
        loading: action.payload,
      };

    case "SET_ERROR":
      return {
        ...state,
        error: action.payload,
        loading: { isLoading: false },
      };

    case "SET_REPOSITORY":
      return {
        ...state,
        repository: action.payload,
        selectedFiles: new Set<string>(),
        output: null,
        loading: { isLoading: false },
        error: null,
      };

    case "TOGGLE_FILE_SELECTION": {
      const newSelectedFiles = new Set(state.selectedFiles);
      if (newSelectedFiles.has(action.payload)) {
        newSelectedFiles.delete(action.payload);
      } else {
        newSelectedFiles.add(action.payload);
      }
      return {
        ...state,
        selectedFiles: newSelectedFiles,
        output: null, // Clear output when selection changes
      };
    }

    case "SELECT_ALL_FILES": {
      if (!state.repository) return state;

      const availableFiles = state.repository.files
        .filter((f) => !f.isExcluded)
        .map((f) => f.path);

      return {
        ...state,
        selectedFiles: new Set(availableFiles),
        output: null,
      };
    }

    case "DESELECT_ALL_FILES":
      return {
        ...state,
        selectedFiles: new Set<string>(),
        output: null,
      };

    case "SELECT_FILES_BY_EXTENSION": {
      if (!state.repository) return state;

      const filesToSelect = state.repository.files
        .filter((f) => !f.isExcluded && action.payload.includes(f.extension))
        .map((f) => f.path);

      const newSelectedFiles = new Set(state.selectedFiles);
      filesToSelect.forEach((path) => newSelectedFiles.add(path));

      return {
        ...state,
        selectedFiles: newSelectedFiles,
        output: null,
      };
    }

    case "SELECT_FOLDER": {
      if (!state.repository) return state;

      const folderPath = action.payload;
      const filesToSelect = state.repository.files
        .filter((f) => !f.isExcluded && f.path.startsWith(folderPath + "/"))
        .map((f) => f.path);

      const newSelectedFiles = new Set(state.selectedFiles);
      filesToSelect.forEach((path) => newSelectedFiles.add(path));

      return {
        ...state,
        selectedFiles: newSelectedFiles,
        output: null,
      };
    }

    case "DESELECT_FOLDER": {
      if (!state.repository) return state;

      const folderPath = action.payload;
      const filesToDeselect = state.repository.files
        .filter((f) => f.path.startsWith(folderPath + "/"))
        .map((f) => f.path);

      const newSelectedFiles = new Set(state.selectedFiles);
      filesToDeselect.forEach((path) => newSelectedFiles.delete(path));

      return {
        ...state,
        selectedFiles: newSelectedFiles,
        output: null,
      };
    }

    case "TOGGLE_FOLDER_EXPANDED": {
      const folderPath = action.payload;
      const newExpandedFolders = new Set(
        state.fileSelectionConfig.expandedFolders,
      );

      if (newExpandedFolders.has(folderPath)) {
        newExpandedFolders.delete(folderPath);
      } else {
        newExpandedFolders.add(folderPath);
      }

      return {
        ...state,
        fileSelectionConfig: {
          ...state.fileSelectionConfig,
          expandedFolders: newExpandedFolders,
        },
      };
    }

    case "SET_FILE_SELECTION_CONFIG":
      return {
        ...state,
        fileSelectionConfig: {
          ...state.fileSelectionConfig,
          ...action.payload,
        },
      };

    case "UPDATE_SETTINGS":
      return {
        ...state,
        settings: {
          ...state.settings,
          ...action.payload,
        },
        output: null, // Clear output when settings change
      };

    case "SET_OUTPUT":
      return {
        ...state,
        output: action.payload,
      };

    case "SET_FILE_CONTENT":
      if (!state.repository) return state;

      const updatedFiles = state.repository.files.map((file) =>
        file.path === action.payload.path
          ? { ...file, content: action.payload.content }
          : file,
      );

      return {
        ...state,
        repository: {
          ...state.repository,
          files: updatedFiles,
        },
      };

    case "RESET_STATE":
      return {
        ...initialState,
        historyItems: state.historyItems, // Preserve history
      };

    case "SET_HISTORY_ITEMS":
      return {
        ...state,
        historyItems: action.payload,
      };

    case "TOGGLE_HISTORY":
      return {
        ...state,
        showHistory:
          action.payload !== undefined ? action.payload : !state.showHistory,
      };

    default:
      return state;
  }
}

// ========================================================================
// CONTEXT DEFINITION
// ========================================================================

interface LlmsTxtMakerContextValue {
  // State
  state: LlmsTxtMakerState;

  // Actions
  setRepositoryUrl: (url: string) => void;
  loadRepository: (url: string) => Promise<void>;
  loadFileContent: (file: RepositoryFile) => Promise<void>;
  toggleFileSelection: (path: string) => void;
  selectAllFiles: () => void;
  deselectAllFiles: () => void;
  selectFilesByExtension: (extensions: string[]) => void;
  selectFolder: (folderPath: string) => void;
  deselectFolder: (folderPath: string) => void;
  toggleFolderExpanded: (folderPath: string) => void;
  updateFileSelectionConfig: (config: Partial<FileSelectionConfig>) => void;
  updateSettings: (settings: Partial<GeneratorSettings>) => void;
  generateLlmsTxt: () => Promise<void>;
  downloadLlmsTxt: (filename?: string) => void;
  copyToClipboard: (content: string) => Promise<void>;
  resetState: () => void;

  // History
  loadHistory: () => Promise<void>;
  clearHistory: () => Promise<void>;
  toggleHistory: (show?: boolean) => void;
  regenerateFromHistory: (item: LlmsTxtGenerationModel) => Promise<void>;

  // Utility functions
  getFilteredFiles: () => RepositoryFile[];
  getSelectedFilesWithContent: () => RepositoryFile[];
}

const LlmsTxtMakerContext = createContext<LlmsTxtMakerContextValue | undefined>(
  undefined,
);

// ========================================================================
// PROVIDER COMPONENT
// ========================================================================

export function LlmsTxtMakerProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, dispatch] = useReducer(llmsTxtMakerReducer, initialState);
  const t = useTranslations("GitHubToLlmsTxt");

  // ========================================================================
  // REPOSITORY ACTIONS
  // ========================================================================

  const setRepositoryUrl = useCallback((url: string) => {
    dispatch({ type: "SET_REPOSITORY_URL", payload: url });
  }, []);

  const loadRepository = useCallback(
    async (url: string) => {
      if (!url.trim()) {
        const error = new Error(t("errors.invalidUrl")) as GitHubError;
        error.type = "INVALID_URL";
        dispatch({
          type: "SET_ERROR",
          payload: error,
        });
        return;
      }

      dispatch({
        type: "SET_LOADING",
        payload: {
          isLoading: true,
          loadingMessage: t("input.loading"),
        },
      });

      try {
        const repository = await githubApi.fetchRepository(url);

        // Set default project name if not set
        if (!state.settings.projectName) {
          dispatch({
            type: "UPDATE_SETTINGS",
            payload: { projectName: repository.name },
          });
        }

        dispatch({ type: "SET_REPOSITORY", payload: repository });
        toast.success(t("notifications.repositoryLoaded"));
      } catch (error) {
        console.error("Failed to load repository:", error);

        const gitHubError = error as GitHubError;
        dispatch({ type: "SET_ERROR", payload: gitHubError });

        // Show user-friendly error message
        let errorMessage = t("errors.fetchFailed");
        if (gitHubError.type === "REPOSITORY_NOT_FOUND") {
          errorMessage = t("errors.repositoryNotFound");
        } else if (gitHubError.type === "RATE_LIMITED") {
          errorMessage = t("errors.rateLimited");
        } else if (gitHubError.type === "INVALID_URL") {
          errorMessage = t("errors.invalidUrl");
        }

        toast.error(errorMessage);
      }
    },
    [state.settings.projectName, t],
  );

  const loadFileContent = useCallback(
    async (file: RepositoryFile) => {
      if (!file.downloadUrl || file.isLargeFile || file.content) {
        return; // Skip if no download URL, too large, or already loaded
      }

      try {
        const content = await githubApi.fetchSingleFileContent(
          file.downloadUrl,
        );
        dispatch({
          type: "SET_FILE_CONTENT",
          payload: { path: file.path, content },
        });
      } catch (error) {
        console.warn(`Failed to load content for ${file.path}:`, error);
        toast.error(t("errors.failedToLoadFile", { filename: file.name }));
      }
    },
    [t],
  );

  // ========================================================================
  // FILE SELECTION ACTIONS
  // ========================================================================

  const toggleFileSelection = useCallback((path: string) => {
    dispatch({ type: "TOGGLE_FILE_SELECTION", payload: path });
  }, []);

  const selectAllFiles = useCallback(() => {
    dispatch({ type: "SELECT_ALL_FILES" });
    if (state.repository) {
      const availableCount = state.repository.files.filter(
        (f) => !f.isExcluded,
      ).length;
      toast.success(
        t("notifications.filesSelected", { count: availableCount }),
      );
    }
  }, [state.repository, t]);

  const deselectAllFiles = useCallback(() => {
    dispatch({ type: "DESELECT_ALL_FILES" });
    toast.success(t("notifications.filesSelected", { count: 0 }));
  }, [t]);

  const selectFilesByExtension = useCallback(
    (extensions: string[]) => {
      dispatch({ type: "SELECT_FILES_BY_EXTENSION", payload: extensions });
      if (state.repository) {
        const matchingFiles = state.repository.files.filter(
          (f) => !f.isExcluded && extensions.includes(f.extension),
        );
        toast.success(
          t("notifications.filesSelected", { count: matchingFiles.length }),
        );
      }
    },
    [state.repository, t],
  );

  const selectFolder = useCallback(
    (folderPath: string) => {
      dispatch({ type: "SELECT_FOLDER", payload: folderPath });
      if (state.repository) {
        const folderFiles = state.repository.files.filter(
          (f) => !f.isExcluded && f.path.startsWith(folderPath + "/"),
        );
        toast.success(
          t("notifications.filesSelected", { count: folderFiles.length }),
        );
      }
    },
    [state.repository, t],
  );

  const deselectFolder = useCallback(
    (folderPath: string) => {
      dispatch({ type: "DESELECT_FOLDER", payload: folderPath });
      if (state.repository) {
        const folderFiles = state.repository.files.filter((f) =>
          f.path.startsWith(folderPath + "/"),
        );
        toast.success(
          t("notifications.filesDeselected") + ` (${folderFiles.length})`,
        );
      }
    },
    [state.repository, t],
  );

  const toggleFolderExpanded = useCallback((folderPath: string) => {
    dispatch({ type: "TOGGLE_FOLDER_EXPANDED", payload: folderPath });
  }, []);

  const updateFileSelectionConfig = useCallback(
    (config: Partial<FileSelectionConfig>) => {
      dispatch({ type: "SET_FILE_SELECTION_CONFIG", payload: config });
    },
    [],
  );

  // ========================================================================
  // SETTINGS ACTIONS
  // ========================================================================

  const updateSettings = useCallback((settings: Partial<GeneratorSettings>) => {
    dispatch({ type: "UPDATE_SETTINGS", payload: settings });
  }, []);

  // ========================================================================
  // GENERATION ACTIONS
  // ========================================================================

  const generateLlmsTxt = useCallback(async () => {
    if (!state.repository) {
      toast.error(t("errors.fetchFailed"));
      return;
    }

    const selectedFilePaths = Array.from(state.selectedFiles);
    if (selectedFilePaths.length === 0) {
      toast.error(t("errors.noFilesSelected"));
      return;
    }

    dispatch({
      type: "SET_LOADING",
      payload: {
        isLoading: true,
        loadingMessage: t("generator.generating"),
      },
    });

    try {
      // Get selected files with their metadata
      const selectedFiles = state.repository.files.filter((f) =>
        state.selectedFiles.has(f.path),
      );

      // Fetch file contents if needed
      let filesWithContent: RepositoryFile[];

      if (state.settings.includeFileContent) {
        // Fetch content only for non-large files
        const filesToFetch = selectedFiles.filter((f) => !f.isLargeFile);
        const fetchedFiles = await githubApi.fetchFileContents(
          state.repository.owner,
          state.repository.name,
          filesToFetch,
          (loaded, total) => {
            dispatch({
              type: "SET_LOADING",
              payload: {
                isLoading: true,
                loadingMessage: t("generator.generating"),
                progress: Math.round((loaded / total) * 100),
              },
            });
          },
        );

        // Merge fetched content with all selected files
        filesWithContent = selectedFiles.map((file) => {
          const fetchedFile = fetchedFiles.find((f) => f.path === file.path);
          return {
            ...file,
            content: fetchedFile?.content || file.content,
            isSelected: true,
          };
        });
      } else {
        filesWithContent = selectedFiles.map((f) => ({
          ...f,
          isSelected: true,
        }));
      }

      // Generate llms.txt content
      const output = await LlmsTxtGenerator.generate(
        state.repository,
        filesWithContent,
        state.settings,
      );

      dispatch({ type: "SET_OUTPUT", payload: output });
      dispatch({ type: "SET_LOADING", payload: { isLoading: false } });

      // Save to history
      try {
        await llmsTxtGenerationService.create({
          repositoryUrl: state.repository.htmlUrl,
          repositoryName: state.repository.name,
          repositoryOwner: state.repository.owner,
          settings: state.settings,
          selectedFiles: selectedFilePaths,
          output,
        });
      } catch (error) {
        console.warn("Failed to save to history:", error);
        // Don't show error to user, as generation succeeded
      }

      toast.success(t("notifications.generated"));
    } catch (error) {
      console.error("Failed to generate llms.txt:", error);
      const githubError = new Error(
        t("errors.generationFailed"),
      ) as GitHubError;
      githubError.type = "UNKNOWN";
      dispatch({
        type: "SET_ERROR",
        payload: githubError,
      });
      toast.error(t("errors.generationFailed"));
    }
  }, [state.repository, state.selectedFiles, state.settings, t]);

  const downloadLlmsTxt = useCallback(
    (filename?: string) => {
      if (!state.output) {
        toast.error(t("errors.downloadFailed"));
        return;
      }

      try {
        LlmsTxtGenerator.downloadLlmsTxt(state.output, filename);
        toast.success(t("notifications.downloaded"));
      } catch (error) {
        console.error("Failed to download:", error);
        toast.error(t("errors.downloadFailed"));
      }
    },
    [state.output, t],
  );

  const copyToClipboard = useCallback(
    async (content: string) => {
      try {
        await LlmsTxtGenerator.copyToClipboard(content);
        toast.success(t("notifications.copied"));
      } catch (error) {
        console.error("Failed to copy:", error);
        toast.error(t("errors.copyFailed"));
      }
    },
    [t],
  );

  // ========================================================================
  // UTILITY FUNCTIONS
  // ========================================================================

  const getFilteredFiles = useCallback((): RepositoryFile[] => {
    if (!state.repository) return [];

    let files = state.repository.files;

    // Apply exclusion filters
    files = files.filter((f) => {
      if (f.isExcluded) return false;
      return true;
    });

    // Apply selection filter
    if (state.fileSelectionConfig.showSelectedOnly) {
      files = files.filter((f) => state.selectedFiles.has(f.path));
    }

    // Apply search filter
    if (state.fileSelectionConfig.filterQuery) {
      const query = state.fileSelectionConfig.filterQuery.toLowerCase();
      files = files.filter(
        (f) =>
          f.path.toLowerCase().includes(query) ||
          f.name.toLowerCase().includes(query),
      );
    }

    return files;
  }, [state.repository, state.fileSelectionConfig, state.selectedFiles]);

  const getSelectedFilesWithContent = useCallback((): RepositoryFile[] => {
    if (!state.repository) return [];

    return state.repository.files.filter(
      (f) => state.selectedFiles.has(f.path) && f.content,
    );
  }, [state.repository, state.selectedFiles]);

  // ========================================================================
  // HISTORY ACTIONS
  // ========================================================================

  const loadHistory = useCallback(async () => {
    try {
      const history = await llmsTxtGenerationService.getRecent(50);
      dispatch({ type: "SET_HISTORY_ITEMS", payload: history });
    } catch (error) {
      console.error("Failed to load history:", error);
      // Set empty array on error to prevent further issues
      dispatch({ type: "SET_HISTORY_ITEMS", payload: [] });
    }
  }, []);

  const clearHistory = useCallback(async () => {
    try {
      await llmsTxtGenerationService.clearAll();
      dispatch({ type: "SET_HISTORY_ITEMS", payload: [] });
      toast.success(t("notifications.historyCleared"));
    } catch (error) {
      console.error("Failed to clear history:", error);
      toast.error("Failed to clear history");
    }
  }, [t]);

  const toggleHistory = useCallback((show?: boolean) => {
    dispatch({ type: "TOGGLE_HISTORY", payload: show });
  }, []);

  const regenerateFromHistory = useCallback(
    async (item: LlmsTxtGenerationModel) => {
      // Load repository and settings from history item
      try {
        setRepositoryUrl(item.repositoryUrl);
        await loadRepository(item.repositoryUrl);

        // Update settings
        dispatch({ type: "UPDATE_SETTINGS", payload: item.settings });

        // Select the same files
        dispatch({ type: "DESELECT_ALL_FILES" });
        item.selectedFiles.forEach((path: string) => {
          dispatch({ type: "TOGGLE_FILE_SELECTION", payload: path });
        });
      } catch (error) {
        console.error("Failed to regenerate from history:", error);
        toast.error("Failed to regenerate from history");
      }
    },
    [loadRepository, setRepositoryUrl],
  );

  const resetState = useCallback(() => {
    dispatch({ type: "RESET_STATE" });
  }, []);

  // ========================================================================
  // EFFECTS
  // ========================================================================

  // Load history on mount (only in browser)
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Add a small delay to ensure DOM is ready
      const timeoutId = setTimeout(() => {
        loadHistory();
      }, 100);

      return () => clearTimeout(timeoutId);
    }
  }, [loadHistory]);

  // ========================================================================
  // CONTEXT VALUE
  // ========================================================================

  const contextValue: LlmsTxtMakerContextValue = {
    state,
    setRepositoryUrl,
    loadRepository,
    loadFileContent,
    toggleFileSelection,
    selectAllFiles,
    deselectAllFiles,
    selectFilesByExtension,
    selectFolder,
    deselectFolder,
    toggleFolderExpanded,
    updateFileSelectionConfig,
    updateSettings,
    generateLlmsTxt,
    downloadLlmsTxt,
    copyToClipboard,
    resetState,
    loadHistory,
    clearHistory,
    toggleHistory,
    regenerateFromHistory,
    getFilteredFiles,
    getSelectedFilesWithContent,
  };

  return (
    <LlmsTxtMakerContext.Provider value={contextValue}>
      {children}
    </LlmsTxtMakerContext.Provider>
  );
}

// ========================================================================
// CUSTOM HOOK
// ========================================================================

export function useLlmsTxtMaker() {
  const context = useContext(LlmsTxtMakerContext);
  if (context === undefined) {
    throw new Error(
      "useLlmsTxtMaker must be used within a LlmsTxtMakerProvider",
    );
  }
  return context;
}
