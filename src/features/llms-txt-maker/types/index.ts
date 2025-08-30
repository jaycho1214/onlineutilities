/**
 * Types and interfaces for the llms.txt maker feature
 */

import type { ServiceModel } from "@/lib/base-service";

// ========================================================================
// GITHUB API TYPES
// ========================================================================

export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  owner: GitHubUser;
  description: string | null;
  private: boolean;
  html_url: string;
  clone_url: string;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  archived: boolean;
  disabled: boolean;
  pushed_at: string;
  created_at: string;
  updated_at: string;
  default_branch: string;
}

export interface GitHubUser {
  id: number;
  login: string;
  avatar_url: string;
  html_url: string;
  type: string;
}

export interface GitHubContent {
  name: string;
  path: string;
  sha: string;
  size: number;
  url: string;
  html_url: string;
  git_url: string;
  download_url: string | null;
  type: "file" | "dir";
  content?: string; // Base64 encoded
  encoding?: string;
}

export interface GitHubTree {
  sha: string;
  url: string;
  tree: GitHubTreeItem[];
  truncated: boolean;
}

export interface GitHubTreeItem {
  path: string;
  mode: string;
  type: "blob" | "tree";
  sha: string;
  size?: number;
  url: string;
}

// ========================================================================
// PROCESSED DATA TYPES
// ========================================================================

export interface RepositoryFile {
  path: string;
  name: string;
  size: number;
  type: string;
  extension: string;
  sha: string;
  url: string;
  downloadUrl: string | null;
  content?: string;
  isSelected: boolean;
  isExcluded: boolean;
  isDotFile: boolean;
  isLargeFile: boolean;
}

export interface ProcessedRepository {
  id: number;
  name: string;
  fullName: string;
  owner: string;
  description: string | null;
  isPrivate: boolean;
  htmlUrl: string;
  language: string | null;
  stars: number;
  forks: number;
  isArchived: boolean;
  lastUpdated: string;
  defaultBranch: string;
  files: RepositoryFile[];
  totalFiles: number;
  loadedAt: string;
}

// ========================================================================
// GENERATION SETTINGS
// ========================================================================

export interface GeneratorSettings {
  projectName: string;
  projectDescription: string;
  includeRepositoryInfo: boolean;
  includeFileList: boolean;
  includeFileContent: boolean;
  includeTimestamp: boolean;
  maxFileSize: number; // in KB
  excludeDotFiles: boolean;
  excludeLargeFiles: boolean;
  fileEncoding: string;
  lineEndings: "unix" | "windows" | "auto";
}

export interface FileSelectionConfig {
  selectedExtensions: string[];
  showSelectedOnly: boolean;
  filterQuery: string;
  expandedFolders: Set<string>;
}

// Tree structure types
export interface FileTreeNode {
  name: string;
  path: string;
  type: "file" | "folder";
  file?: RepositoryFile; // Only present for files
  children?: FileTreeNode[];
  isExpanded?: boolean;
  level: number;
}

// ========================================================================
// LLMS.TXT OUTPUT
// ========================================================================

export interface LlmsTxtOutput {
  content: string;
  metadata: {
    projectName: string;
    repositoryUrl: string;
    generatedAt: string;
    filesIncluded: number;
    totalSize: number; // in bytes
    characterCount: number;
    lineCount: number;
    tokenEstimate: {
      total: number;
      gpt4: number;
      claude: number;
      breakdown: {
        content: number;
        metadata: number;
      };
    };
  };
}

// ========================================================================
// DATABASE MODELS
// ========================================================================

export type LlmsTxtGenerationModel = ServiceModel<{
  repositoryUrl: string;
  repositoryName: string;
  repositoryOwner: string;
  settings: GeneratorSettings;
  selectedFiles: string[]; // array of file paths
  output: LlmsTxtOutput;
  generatedAt?: string; // deprecated: use createdAt instead
}>;

export type LlmsTxtConfigModel = ServiceModel<{
  name: string;
  description?: string;
  settings: GeneratorSettings;
  isDefault: boolean;
}>;

// ========================================================================
// ERROR TYPES
// ========================================================================

export type GitHubErrorType =
  | "INVALID_URL"
  | "REPOSITORY_NOT_FOUND"
  | "RATE_LIMITED"
  | "UNAUTHORIZED"
  | "NETWORK_ERROR"
  | "UNKNOWN";

export interface GitHubError extends Error {
  type: GitHubErrorType;
  statusCode?: number;
  rateLimitReset?: number; // timestamp
}

// ========================================================================
// UI STATE TYPES
// ========================================================================

export interface LoadingState {
  isLoading: boolean;
  loadingMessage?: string;
  progress?: number;
}

export interface LlmsTxtMakerState {
  // Repository data
  repositoryUrl: string;
  repository: ProcessedRepository | null;

  // File selection
  selectedFiles: Set<string>;
  fileSelectionConfig: FileSelectionConfig;

  // Generator settings
  settings: GeneratorSettings;

  // Output
  output: LlmsTxtOutput | null;

  // UI state
  loading: LoadingState;
  error: GitHubError | null;

  // History
  showHistory: boolean;
  historyItems: LlmsTxtGenerationModel[];
}

// ========================================================================
// ACTION TYPES
// ========================================================================

export type LlmsTxtMakerAction =
  | { type: "SET_REPOSITORY_URL"; payload: string }
  | { type: "SET_LOADING"; payload: LoadingState }
  | { type: "SET_ERROR"; payload: GitHubError | null }
  | { type: "SET_REPOSITORY"; payload: ProcessedRepository | null }
  | { type: "TOGGLE_FILE_SELECTION"; payload: string }
  | { type: "SELECT_ALL_FILES" }
  | { type: "DESELECT_ALL_FILES" }
  | { type: "SELECT_FILES_BY_EXTENSION"; payload: string[] }
  | { type: "SELECT_FOLDER"; payload: string }
  | { type: "DESELECT_FOLDER"; payload: string }
  | { type: "TOGGLE_FOLDER_EXPANDED"; payload: string }
  | { type: "SET_FILE_SELECTION_CONFIG"; payload: Partial<FileSelectionConfig> }
  | { type: "UPDATE_SETTINGS"; payload: Partial<GeneratorSettings> }
  | { type: "SET_OUTPUT"; payload: LlmsTxtOutput | null }
  | { type: "SET_FILE_CONTENT"; payload: { path: string; content: string } }
  | { type: "RESET_STATE" }
  | { type: "SET_HISTORY_ITEMS"; payload: LlmsTxtGenerationModel[] }
  | { type: "TOGGLE_HISTORY"; payload?: boolean };

// ========================================================================
// UTILITY TYPES
// ========================================================================

export type FileExtensionGroup = {
  id: string;
  label: string;
  extensions: string[];
};

export const FILE_EXTENSION_GROUPS: FileExtensionGroup[] = [
  {
    id: "markdown",
    label: "Markdown",
    extensions: [".md", ".mdx", ".markdown"],
  },
  {
    id: "javascript",
    label: "JavaScript/TypeScript",
    extensions: [".js", ".jsx", ".ts", ".tsx", ".mjs", ".cjs"],
  },
  {
    id: "python",
    label: "Python",
    extensions: [".py", ".pyx", ".pyi", ".ipynb"],
  },
  {
    id: "documentation",
    label: "Documentation",
    extensions: [".md", ".rst", ".txt", ".doc", ".docx"],
  },
  {
    id: "config",
    label: "Configuration",
    extensions: [".json", ".yaml", ".yml", ".toml", ".ini", ".env"],
  },
  {
    id: "code",
    label: "Code Files",
    extensions: [".js", ".py", ".go", ".rs", ".java", ".cpp", ".c", ".php"],
  },
];

export const DEFAULT_SETTINGS: GeneratorSettings = {
  projectName: "",
  projectDescription: "",
  includeRepositoryInfo: true,
  includeFileList: true,
  includeFileContent: true,
  includeTimestamp: true,
  maxFileSize: 1024, // 1MB
  excludeDotFiles: true,
  excludeLargeFiles: true,
  fileEncoding: "utf-8",
  lineEndings: "unix",
};

export const DEFAULT_FILE_SELECTION_CONFIG: FileSelectionConfig = {
  selectedExtensions: [],
  showSelectedOnly: false,
  filterQuery: "",
  expandedFolders: new Set<string>(),
};

// ========================================================================
// UTILITY FUNCTIONS
// ========================================================================

export function parseGitHubUrl(
  url: string,
): { owner: string; repo: string } | null {
  const patterns = [
    /^https?:\/\/github\.com\/([^\/]+)\/([^\/]+)(?:\.git)?(?:\/.*)?$/,
    /^git@github\.com:([^\/]+)\/([^\/]+)\.git$/,
    /^([^\/]+)\/([^\/]+)$/, // Simple owner/repo format
  ];

  for (const pattern of patterns) {
    const match = url.trim().match(pattern);
    if (match) {
      return {
        owner: match[1],
        repo: match[2].replace(/\.git$/, ""),
      };
    }
  }

  return null;
}

export function getFileExtension(filename: string): string {
  const lastDot = filename.lastIndexOf(".");
  return lastDot !== -1 ? filename.slice(lastDot) : "";
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";

  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

export function isLargeFile(size: number, maxSizeKB: number = 1024): boolean {
  return size > maxSizeKB * 1024; // Convert KB to bytes
}

export function isDotFile(path: string): boolean {
  const filename = path.split("/").pop() || "";
  return filename.startsWith(".");
}

/**
 * Build a tree structure from a flat array of repository files
 */
export function buildFileTree(files: RepositoryFile[]): FileTreeNode[] {
  const root: FileTreeNode[] = [];
  const nodeMap = new Map<string, FileTreeNode>();

  // Sort files by path to ensure consistent ordering
  const sortedFiles = [...files].sort((a, b) => a.path.localeCompare(b.path));

  for (const file of sortedFiles) {
    const pathParts = file.path.split("/");

    // Build folder structure from root to file
    for (let i = 0; i < pathParts.length; i++) {
      const isFile = i === pathParts.length - 1;
      const currentPath = pathParts.slice(0, i + 1).join("/");
      const parentPath = i === 0 ? null : pathParts.slice(0, i).join("/");

      // Skip if node already exists
      if (nodeMap.has(currentPath)) continue;

      const node: FileTreeNode = {
        name: pathParts[i],
        path: currentPath,
        type: isFile ? "file" : "folder",
        file: isFile ? file : undefined,
        children: isFile ? undefined : [],
        level: i,
      };

      nodeMap.set(currentPath, node);

      // Add to parent or root
      if (parentPath && nodeMap.has(parentPath)) {
        const parent = nodeMap.get(parentPath)!;
        if (parent.children) {
          parent.children.push(node);
        }
      } else if (i === 0) {
        root.push(node);
      }
    }
  }

  // Sort children recursively
  const sortChildrenRecursively = (nodes: FileTreeNode[]) => {
    nodes.forEach((node) => {
      if (node.children && node.children.length > 0) {
        // Sort children: folders first, then files, both alphabetically
        node.children.sort((a, b) => {
          if (a.type !== b.type) {
            return a.type === "folder" ? -1 : 1;
          }
          return a.name.localeCompare(b.name);
        });
        // Recursively sort children of children
        sortChildrenRecursively(node.children);
      }
    });
  };

  // Sort root level and all children
  root.sort((a, b) => {
    if (a.type !== b.type) {
      return a.type === "folder" ? -1 : 1;
    }
    return a.name.localeCompare(b.name);
  });

  sortChildrenRecursively(root);

  return root;
}

/**
 * Get all file paths within a folder (recursively)
 */
export function getFilesInFolder(node: FileTreeNode): string[] {
  const files: string[] = [];

  if (node.type === "file") {
    files.push(node.path);
  } else if (node.children) {
    for (const child of node.children) {
      files.push(...getFilesInFolder(child));
    }
  }

  return files;
}

/**
 * Flatten tree structure back to array of files
 */
export function flattenFileTree(nodes: FileTreeNode[]): RepositoryFile[] {
  const files: RepositoryFile[] = [];

  const traverse = (node: FileTreeNode) => {
    if (node.type === "file" && node.file) {
      files.push(node.file);
    } else if (node.children) {
      node.children.forEach(traverse);
    }
  };

  nodes.forEach(traverse);
  return files;
}

/**
 * Estimate token count for text content
 * Uses approximation: 1 token ≈ 4 characters for English text
 */
export function estimateTokens(text: string): {
  total: number;
  gpt4: number;
  claude: number;
} {
  if (!text) {
    return { total: 0, gpt4: 0, claude: 0 };
  }

  // Basic character-based estimation
  const charCount = text.length;

  // Different models have different tokenization ratios
  // GPT: ~4 chars per token for English
  // Claude: ~3.5 chars per token (slightly more efficient)
  const gptTokens = Math.ceil(charCount / 4);
  const claudeTokens = Math.ceil(charCount / 3.5);

  // Use GPT as baseline for "total"
  const totalTokens = gptTokens;

  return {
    total: totalTokens,
    gpt4: gptTokens,
    claude: claudeTokens,
  };
}

/**
 * Estimate token count for llms.txt content with breakdown
 */
export function estimateLlmsTxtTokens(content: string): {
  total: number;
  gpt4: number;
  claude: number;
  breakdown: {
    content: number;
    metadata: number;
  };
} {
  if (!content) {
    return {
      total: 0,
      gpt4: 0,
      claude: 0,
      breakdown: { content: 0, metadata: 0 },
    };
  }

  // Split content into sections to estimate breakdown
  const lines = content.split("\n");
  let metadataLines = 0;
  let inFileContent = false;

  for (const line of lines) {
    if (line.startsWith("## File Contents")) {
      inFileContent = true;
    } else if (line.startsWith("## ") && inFileContent) {
      inFileContent = false;
    }

    if (!(inFileContent || line.startsWith("```"))) {
      metadataLines++;
    }
  }

  const metadataText = lines.slice(0, metadataLines).join("\n");
  const contentText = lines.slice(metadataLines).join("\n");

  const metadataTokens = estimateTokens(metadataText);
  const contentTokensEst = estimateTokens(contentText);

  return {
    total: metadataTokens.total + contentTokensEst.total,
    gpt4: metadataTokens.gpt4 + contentTokensEst.gpt4,
    claude: metadataTokens.claude + contentTokensEst.claude,
    breakdown: {
      content: contentTokensEst.total,
      metadata: metadataTokens.total,
    },
  };
}
