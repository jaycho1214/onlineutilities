/**
 * GitHub API Service for fetching repository data
 * Handles repository information, file tree, and file content fetching
 */

import {
  type GitHubRepository,
  type GitHubTree,
  type ProcessedRepository,
  type RepositoryFile,
  type GitHubError,
  type GitHubErrorType,
  parseGitHubUrl,
  getFileExtension,
  isDotFile,
  isLargeFile,
} from "../types";

// ========================================================================
// CONSTANTS
// ========================================================================

const GITHUB_API_BASE = "https://api.github.com";
const RATE_LIMIT_THRESHOLD = 10; // Reserve some requests
const SUPPORTED_FILE_TYPES = new Set([
  ".md",
  ".mdx",
  ".markdown",
  ".txt",
  ".rst",
  ".js",
  ".jsx",
  ".ts",
  ".tsx",
  ".mjs",
  ".cjs",
  ".py",
  ".pyx",
  ".pyi",
  ".java",
  ".cpp",
  ".c",
  ".h",
  ".go",
  ".rs",
  ".php",
  ".rb",
  ".swift",
  ".kt",
  ".json",
  ".yaml",
  ".yml",
  ".toml",
  ".ini",
  ".env",
  ".xml",
  ".html",
  ".css",
  ".scss",
  ".sass",
  ".less",
  ".sql",
  ".sh",
  ".bash",
  ".zsh",
  ".ps1",
  ".bat",
  ".dockerfile",
  ".gitignore",
  ".gitattributes",
  ".license",
  ".readme",
  ".changelog",
  ".contributing",
]);

// ========================================================================
// GITHUB API SERVICE CLASS
// ========================================================================

export class GitHubApiService {
  private apiToken?: string;
  private rateLimitRemaining = 60; // Default for unauthenticated requests
  private rateLimitReset = 0;

  constructor(apiToken?: string) {
    this.apiToken = apiToken;
  }

  // ========================================================================
  // PUBLIC METHODS
  // ========================================================================

  /**
   * Fetch repository information and file tree
   */
  async fetchRepository(url: string): Promise<ProcessedRepository> {
    const parsedUrl = parseGitHubUrl(url);
    if (!parsedUrl) {
      throw this.createError("INVALID_URL", "Invalid GitHub repository URL");
    }

    const { owner, repo } = parsedUrl;

    try {
      // Fetch repository info and tree in parallel
      const [repository, tree] = await Promise.all([
        this.fetchRepositoryInfo(owner, repo),
        this.fetchRepositoryTree(owner, repo),
      ]);

      // Process files from tree
      const files = this.processTreeToFiles(tree, repository.default_branch);

      return {
        id: repository.id,
        name: repository.name,
        fullName: repository.full_name,
        owner: repository.owner.login,
        description: repository.description,
        isPrivate: repository.private,
        htmlUrl: repository.html_url,
        language: repository.language,
        stars: repository.stargazers_count,
        forks: repository.forks_count,
        isArchived: repository.archived,
        lastUpdated: repository.pushed_at,
        defaultBranch: repository.default_branch,
        files,
        totalFiles: files.length,
        loadedAt: new Date().toISOString(),
      };
    } catch (error) {
      if (error instanceof Error && error.name === "GitHubApiError") {
        throw error;
      }
      throw this.createError(
        "NETWORK_ERROR",
        `Failed to fetch repository: ${error}`,
      );
    }
  }

  /**
   * Fetch content for multiple files
   */
  async fetchFileContents(
    owner: string,
    repo: string,
    files: RepositoryFile[],
    onProgress?: (loaded: number, total: number) => void,
  ): Promise<RepositoryFile[]> {
    const filesWithContent: RepositoryFile[] = [...files];
    let loaded = 0;

    // Process files in batches to avoid rate limiting
    const batchSize = 10;
    const batches = this.chunkArray(files, batchSize);

    for (const batch of batches) {
      await Promise.all(
        batch.map(async (file) => {
          try {
            if (file.downloadUrl && !file.isLargeFile) {
              const content = await this.fetchFileContent(file.downloadUrl);
              const fileIndex = files.indexOf(file);
              if (fileIndex !== -1) {
                filesWithContent[fileIndex] = {
                  ...file,
                  content,
                };
              }
            }
          } catch (error) {
            console.warn(`Failed to fetch content for ${file.path}:`, error);
            // Continue with other files even if one fails
          } finally {
            loaded++;
            onProgress?.(loaded, files.length);
          }
        }),
      );

      // Add delay between batches to respect rate limits
      if (batches.indexOf(batch) < batches.length - 1) {
        await this.delay(100);
      }
    }

    return filesWithContent;
  }

  /**
   * Fetch content for a single file
   */
  async fetchSingleFileContent(downloadUrl: string): Promise<string> {
    return this.fetchFileContent(downloadUrl);
  }

  /**
   * Check rate limit status
   */
  async checkRateLimit(): Promise<{ remaining: number; resetTime: number }> {
    try {
      const response = await this.makeRequest(`${GITHUB_API_BASE}/rate_limit`);
      const data = await response.json();

      return {
        remaining: data.resources.core.remaining,
        resetTime: data.resources.core.reset * 1000, // Convert to milliseconds
      };
    } catch {
      // Return cached values if API call fails
      return {
        remaining: this.rateLimitRemaining,
        resetTime: this.rateLimitReset,
      };
    }
  }

  // ========================================================================
  // PRIVATE METHODS
  // ========================================================================

  /**
   * Fetch repository information from GitHub API
   */
  private async fetchRepositoryInfo(
    owner: string,
    repo: string,
  ): Promise<GitHubRepository> {
    const url = `${GITHUB_API_BASE}/repos/${owner}/${repo}`;
    const response = await this.makeRequest(url);

    if (!response.ok) {
      if (response.status === 404) {
        throw this.createError(
          "REPOSITORY_NOT_FOUND",
          "Repository not found or is private",
        );
      }
      if (response.status === 403) {
        throw this.createError(
          "RATE_LIMITED",
          "GitHub API rate limit exceeded",
        );
      }
      throw this.createError(
        "NETWORK_ERROR",
        `HTTP ${response.status}: ${response.statusText}`,
      );
    }

    return response.json();
  }

  /**
   * Fetch repository file tree
   */
  private async fetchRepositoryTree(
    owner: string,
    repo: string,
    branch?: string,
  ): Promise<GitHubTree> {
    // Use recursive=1 to get the full tree
    const url = `${GITHUB_API_BASE}/repos/${owner}/${repo}/git/trees/${branch || "HEAD"}?recursive=1`;
    const response = await this.makeRequest(url);

    if (!response.ok) {
      throw this.createError(
        "NETWORK_ERROR",
        `Failed to fetch repository tree: ${response.statusText}`,
      );
    }

    return response.json();
  }

  /**
   * Fetch individual file content
   */
  private async fetchFileContent(downloadUrl: string): Promise<string> {
    const response = await fetch(downloadUrl);

    if (!response.ok) {
      throw new Error(`Failed to fetch file content: ${response.statusText}`);
    }

    return response.text();
  }

  /**
   * Process GitHub tree response into RepositoryFile objects
   */
  private processTreeToFiles(
    tree: GitHubTree,
    branch: string,
  ): RepositoryFile[] {
    return tree.tree
      .filter((item) => item.type === "blob") // Only include files, not directories
      .map((item) => {
        const extension = getFileExtension(item.path);
        const fileName = item.path.split("/").pop() || item.path;
        const size = item.size || 0;
        const isDot = isDotFile(item.path);
        const isLarge = isLargeFile(size);

        // Create download URL for raw content
        const downloadUrl = item.url
          ? `https://raw.githubusercontent.com/${tree.url.match(/\/repos\/([^\/]+\/[^\/]+)\//)?.[1]}/${branch}/${item.path}`
          : null;

        return {
          path: item.path,
          name: fileName,
          size,
          type: this.getFileType(extension),
          extension,
          sha: item.sha,
          url: item.url,
          downloadUrl,
          isSelected: false,
          isExcluded: isDot || isLarge || !this.isSupportedFileType(extension),
          isDotFile: isDot,
          isLargeFile: isLarge,
        };
      })
      .sort((a, b) => {
        // Sort by path for consistent ordering
        return a.path.localeCompare(b.path);
      });
  }

  /**
   * Get file type based on extension
   */
  private getFileType(extension: string): string {
    const typeMap: Record<string, string> = {
      ".md": "markdown",
      ".mdx": "markdown",
      ".markdown": "markdown",
      ".js": "javascript",
      ".jsx": "javascript",
      ".ts": "typescript",
      ".tsx": "typescript",
      ".py": "python",
      ".java": "java",
      ".cpp": "cpp",
      ".c": "c",
      ".go": "go",
      ".rs": "rust",
      ".php": "php",
      ".rb": "ruby",
      ".json": "json",
      ".yaml": "yaml",
      ".yml": "yaml",
      ".xml": "xml",
      ".html": "html",
      ".css": "css",
      ".txt": "text",
    };

    return typeMap[extension.toLowerCase()] || "unknown";
  }

  /**
   * Check if file type is supported for content inclusion
   */
  private isSupportedFileType(extension: string): boolean {
    return SUPPORTED_FILE_TYPES.has(extension.toLowerCase());
  }

  /**
   * Make HTTP request with proper headers and error handling
   */
  private async makeRequest(url: string): Promise<Response> {
    const headers: Record<string, string> = {
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "llms-txt-maker/1.0.0",
    };

    if (this.apiToken) {
      headers["Authorization"] = `token ${this.apiToken}`;
    }

    const response = await fetch(url, { headers });

    // Update rate limit info from response headers
    const remaining = response.headers.get("x-ratelimit-remaining");
    const reset = response.headers.get("x-ratelimit-reset");

    if (remaining) this.rateLimitRemaining = parseInt(remaining);
    if (reset) this.rateLimitReset = parseInt(reset) * 1000;

    // Check for rate limiting
    if (
      response.status === 403 &&
      remaining &&
      parseInt(remaining) < RATE_LIMIT_THRESHOLD
    ) {
      throw this.createError(
        "RATE_LIMITED",
        "GitHub API rate limit exceeded",
        response.status,
      );
    }

    return response;
  }

  /**
   * Create standardized error object
   */
  private createError(
    type: GitHubErrorType,
    message: string,
    statusCode?: number,
  ): GitHubError {
    const error = new Error(message) as GitHubError;
    error.name = "GitHubApiError";
    error.type = type;
    error.statusCode = statusCode;

    if (type === "RATE_LIMITED") {
      error.rateLimitReset = this.rateLimitReset;
    }

    return error;
  }

  /**
   * Split array into chunks
   */
  private chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }

  /**
   * Simple delay utility
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// ========================================================================
// SINGLETON INSTANCE
// ========================================================================

export const githubApi = new GitHubApiService();

// ========================================================================
// UTILITY FUNCTIONS
// ========================================================================

/**
 * Validate GitHub repository URL
 */
export function validateGitHubUrl(url: string): boolean {
  return parseGitHubUrl(url) !== null;
}

/**
 * Extract owner and repo from URL
 */
export function extractRepoInfo(
  url: string,
): { owner: string; repo: string } | null {
  return parseGitHubUrl(url);
}

/**
 * Format repository URL for display
 */
export function formatRepositoryUrl(owner: string, repo: string): string {
  return `https://github.com/${owner}/${repo}`;
}
