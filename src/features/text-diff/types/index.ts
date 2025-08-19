export type DiffViewMode = 'side-by-side' | 'unified'

export type MergeAction = 'accept-current' | 'accept-incoming' | 'accept-both'

export interface DiffOptions {
  ignoreCase?: boolean
  ignoreWhitespace?: boolean
  newlineIsToken?: boolean
  ignoreNewlineAtEof?: boolean
  stripTrailingCr?: boolean
  context?: number
  maxEditLength?: number
  timeout?: number
  intlSegmenter?: Intl.Segmenter
}

export interface DiffChange {
  value: string
  added: boolean
  removed: boolean
  count?: number
  lineNumber?: number
}

export interface DiffResult {
  changes: DiffChange[]
  blocks: DiffBlock[]
  stats: {
    additions: number
    deletions: number
    modifications: number
  }
}

export interface MergeBlock {
  id: string
  startLine: number
  endLine: number
  currentText: string
  incomingText: string
  mergeAction?: MergeAction
}

export interface DiffLine {
  type: "added" | "removed" | "modified" | "unchanged"
  content: string
  lineNumber?: number
  oldLineNumber?: number
  newLineNumber?: number
  wordDiffs?: WordDiff[]
}

export interface WordDiff {
  type: "added" | "removed" | "unchanged"
  content: string
}

export interface DiffBlock {
  id: string
  type: "added" | "removed" | "modified"
  oldStartLine: number
  oldEndLine: number
  newStartLine: number
  newEndLine: number
  oldLines: string[]
  newLines: string[]
  canMerge: boolean
  mergeAction?: MergeAction
}

export interface UISettings {
  showLineNumbers: boolean
  wordWrap: boolean
  fontSize: number
  theme?: "light" | "dark" | "auto"
  highlightSyntax: boolean
  showMinimap: boolean
}

export interface TextDiffState {
  originalText: string
  modifiedText: string
  viewMode: DiffViewMode
  diffOptions: DiffOptions
  diffResult: DiffResult | null
  mergeBlocks: MergeBlock[]
  mergedText: string
  isLoading: boolean
  error: string | null
  uiSettings: UISettings
}

export type TextDiffAction = 
  | { type: "SET_ORIGINAL_TEXT"; payload: string }
  | { type: "SET_MODIFIED_TEXT"; payload: string }
  | { type: "SET_VIEW_MODE"; payload: DiffViewMode }
  | { type: "SWAP_TEXTS" }
  | { type: "CLEAR_ALL" }
  | { type: "SET_DIFF_RESULT"; payload: DiffResult }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "UPDATE_DIFF_OPTIONS"; payload: Partial<DiffOptions> }
  | { type: "UPDATE_UI_SETTINGS"; payload: Partial<UISettings> }
  | { type: "SET_MERGED_TEXT"; payload: string }
  | { type: "APPLY_MERGE_ACTION"; payload: { blockId: string; action: MergeAction } }
  | { type: "LOAD_FROM_HISTORY"; payload: { originalText: string; modifiedText: string; mergedText: string; viewMode: DiffViewMode; diffOptions: DiffOptions } }