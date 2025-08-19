import type { TextDiffState, TextDiffAction } from "../types";
import { applyAllMergeActions } from "./diff-engine";

export const initialState: TextDiffState = {
  originalText: "",
  modifiedText: "",
  mergedText: "",
  viewMode: "side-by-side",
  diffResult: null,
  mergeBlocks: [],
  isLoading: false,
  error: null,
  diffOptions: {
    ignoreCase: false,
    ignoreWhitespace: false,
    ignoreNewlineAtEof: false,
    stripTrailingCr: false,
    newlineIsToken: false,
    context: 3,
  },
  uiSettings: {
    showLineNumbers: true,
    wordWrap: false,
    fontSize: 14,
    theme: "auto",
    highlightSyntax: false,
    showMinimap: false,
  },
};

export function textDiffReducer(
  state: TextDiffState,
  action: TextDiffAction,
): TextDiffState {
  switch (action.type) {
    case "SET_ORIGINAL_TEXT":
      return {
        ...state,
        originalText: action.payload,
        diffResult: null,
      };

    case "SET_MODIFIED_TEXT":
      return {
        ...state,
        modifiedText: action.payload,
        diffResult: null,
      };

    case "SET_MERGED_TEXT":
      return {
        ...state,
        mergedText: action.payload,
      };

    case "SET_VIEW_MODE":
      return {
        ...state,
        viewMode: action.payload,
      };

    case "SET_DIFF_RESULT":
      return {
        ...state,
        diffResult: action.payload,
        isLoading: false,
      };

    case "SET_LOADING":
      return {
        ...state,
        isLoading: action.payload,
      };

    case "SET_ERROR":
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };

    case "UPDATE_DIFF_OPTIONS":
      return {
        ...state,
        diffOptions: {
          ...state.diffOptions,
          ...action.payload,
        },
        diffResult: null, // Clear result to trigger re-computation
      };

    case "UPDATE_UI_SETTINGS":
      return {
        ...state,
        uiSettings: {
          ...state.uiSettings,
          ...action.payload,
        },
      };

    case "APPLY_MERGE_ACTION":
      if (!state.diffResult) return state;

      // Update the merge action for the specific block
      const updatedBlocks = state.diffResult.blocks.map((block) =>
        block.id === action.payload.blockId
          ? { ...block, mergeAction: action.payload.action }
          : block,
      );

      // Apply all merge actions to generate final merged text
      const mergedText = applyAllMergeActions(
        state.originalText,
        state.modifiedText,
        updatedBlocks,
      );

      return {
        ...state,
        diffResult: {
          ...state.diffResult,
          blocks: updatedBlocks,
        },
        mergedText,
      };

    case "SWAP_TEXTS":
      return {
        ...state,
        originalText: state.modifiedText,
        modifiedText: state.originalText,
        diffResult: null,
      };

    case "CLEAR_ALL":
      return {
        ...initialState,
        diffOptions: state.diffOptions,
        uiSettings: state.uiSettings,
      };

    case "LOAD_FROM_HISTORY":
      return {
        ...state,
        ...action.payload,
      };

    default:
      return state;
  }
}
