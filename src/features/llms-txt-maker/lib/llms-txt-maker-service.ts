/**
 * llms.txt Maker Service
 * Handles CRUD operations for generation history and configurations
 */

import { BaseService } from "@/lib/base-service";
import llmsTxtMakerDb, { type LlmsTxtMakerDB } from "./llms-txt-maker-db";
import type {
  LlmsTxtGenerationModel,
  LlmsTxtConfigModel,
  ProcessedRepository,
  GeneratorSettings,
  LlmsTxtOutput,
  RepositoryFile,
} from "../types";
import { estimateLlmsTxtTokens } from "../types";

// ========================================================================
// GENERATION SERVICE
// ========================================================================

export class LlmsTxtGenerationService extends BaseService<
  LlmsTxtGenerationModel,
  LlmsTxtMakerDB
> {
  protected db = llmsTxtMakerDb;
  protected tableName = "generations";

  // ========================================================================
  // CRUD OPERATIONS
  // ========================================================================

  /**
   * Save a generation to history
   */
  async create(data: {
    repositoryUrl: string;
    repositoryName: string;
    repositoryOwner: string;
    settings: GeneratorSettings;
    selectedFiles: string[];
    output: LlmsTxtOutput;
  }): Promise<LlmsTxtGenerationModel> {
    try {
      const generation = this.createBaseModel({
        ...data,
      });

      // Use transaction for atomic operation
      return await this.db.transaction("rw", [this.getTable()], async () => {
        await this.getTable().add(generation);
        this.dispatchEvent("generationCreated", generation);

        // Clean up old entries to maintain performance (async, non-blocking)
        this.deleteOldEntries(100).catch((error) => {
          console.warn("Failed to clean up old entries:", error);
        });

        return generation;
      });
    } catch (error) {
      throw this.handleError("create generation", error, null);
    }
  }

  /**
   * Update an existing generation
   */
  async update(
    id: string,
    updates: Partial<LlmsTxtGenerationModel>,
  ): Promise<LlmsTxtGenerationModel | null> {
    try {
      const existing = await this.getById(id);
      if (!existing) return null;

      const updated = this.updateModel(existing, updates);
      await this.getTable().put(updated);
      this.dispatchEvent("generationUpdated", updated);

      return updated;
    } catch (error) {
      return this.handleError(`update generation ${id}`, error, null);
    }
  }

  /**
   * Get generations by repository
   */
  async getByRepository(
    repositoryUrl: string,
    limit: number = 10,
  ): Promise<LlmsTxtGenerationModel[]> {
    try {
      return await this.getTable()
        .where("repositoryUrl")
        .equals(repositoryUrl)
        .reverse()
        .sortBy("createdAt")
        .then((results: LlmsTxtGenerationModel[]) => results.slice(0, limit));
    } catch (error) {
      return this.handleError(
        `get generations for ${repositoryUrl}`,
        error,
        [],
      );
    }
  }

  /**
   * Search generations by repository name or owner
   * Uses indexed queries where possible for better performance
   */
  async search(
    query: string,
    limit: number = 20,
  ): Promise<LlmsTxtGenerationModel[]> {
    try {
      const lowerQuery = query.toLowerCase();

      // Try indexed queries first (faster)
      const [nameResults, ownerResults, urlResults] = await Promise.all([
        // Search by repository name (indexed)
        this.getTable()
          .where("repositoryName")
          .startsWithIgnoreCase(query)
          .limit(limit)
          .toArray(),

        // Search by repository owner (indexed)
        this.getTable()
          .where("repositoryOwner")
          .startsWithIgnoreCase(query)
          .limit(limit)
          .toArray(),

        // Search by repository URL (indexed)
        this.getTable()
          .where("repositoryUrl")
          .startsWithIgnoreCase(query)
          .limit(limit)
          .toArray(),
      ]);

      // Combine results and remove duplicates
      const combinedResults = new Map<string, LlmsTxtGenerationModel>();

      [...nameResults, ...ownerResults, ...urlResults].forEach((result) => {
        combinedResults.set(result.id, result);
      });

      // If we don't have enough results, fall back to filter search
      if (combinedResults.size < limit && query.length >= 2) {
        const filterResults = await this.getTable()
          .filter(
            (generation: LlmsTxtGenerationModel) =>
              generation.repositoryName.toLowerCase().includes(lowerQuery) ||
              generation.repositoryOwner.toLowerCase().includes(lowerQuery) ||
              generation.repositoryUrl.toLowerCase().includes(lowerQuery),
          )
          .limit(limit)
          .toArray();

        filterResults.forEach((result: LlmsTxtGenerationModel) => {
          combinedResults.set(result.id, result);
        });
      }

      // Sort by creation date (newest first) and apply limit
      return Array.from(combinedResults.values())
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )
        .slice(0, limit);
    } catch (error) {
      return this.handleError("search generations", error, []);
    }
  }

  /**
   * Get generation statistics
   * Optimized to use count() and avoid loading all data
   */
  async getStats(): Promise<{
    totalGenerations: number;
    totalRepositories: number;
    recentActivity: { date: string; count: number }[];
  }> {
    try {
      // Use count() for total (more efficient)
      const totalGenerations = await this.getTable().count();

      // Calculate date 30 days ago
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const thirtyDaysAgoISO = thirtyDaysAgo.toISOString();

      // Get only recent generations and repository URLs for counting
      const [recentGenerations, allRepoUrls] = await Promise.all([
        this.getTable().where("createdAt").above(thirtyDaysAgoISO).toArray(),

        // Get only repositoryUrl field for unique counting (more efficient)
        this.getTable().orderBy("repositoryUrl").uniqueKeys(),
      ]);

      const totalRepositories = allRepoUrls.length;

      // Calculate recent activity
      const activityMap = new Map<string, number>();
      recentGenerations.forEach((g: LlmsTxtGenerationModel) => {
        const date = g.createdAt.split("T")[0]; // Get just the date part
        activityMap.set(date, (activityMap.get(date) || 0) + 1);
      });

      const recentActivity = Array.from(activityMap.entries())
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date));

      return {
        totalGenerations,
        totalRepositories,
        recentActivity,
      };
    } catch (error) {
      return this.handleError("get generation stats", error, {
        totalGenerations: 0,
        totalRepositories: 0,
        recentActivity: [],
      });
    }
  }
}

// ========================================================================
// CONFIG SERVICE
// ========================================================================

export class LlmsTxtConfigService extends BaseService<
  LlmsTxtConfigModel,
  LlmsTxtMakerDB
> {
  protected db = llmsTxtMakerDb;
  protected tableName = "configs";

  /**
   * Create a new configuration
   */
  async create(data: {
    name: string;
    description?: string;
    settings: GeneratorSettings;
    isDefault?: boolean;
  }): Promise<LlmsTxtConfigModel> {
    try {
      const config = this.createBaseModel({
        ...data,
        isDefault: data.isDefault || false,
      });

      // Use transaction for atomic operation
      return await this.db.transaction("rw", [this.getTable()], async () => {
        // If this is set as default, unset other defaults
        if (data.isDefault) {
          await this.clearDefaultFlags();
        }

        await this.getTable().add(config);
        this.dispatchEvent("configCreated", config);

        return config;
      });
    } catch (error) {
      throw this.handleError("create config", error, null);
    }
  }

  /**
   * Update an existing configuration
   */
  async update(
    id: string,
    updates: Partial<LlmsTxtConfigModel>,
  ): Promise<LlmsTxtConfigModel | null> {
    try {
      return await this.db.transaction("rw", [this.getTable()], async () => {
        const existing = await this.getById(id);
        if (!existing) return null;

        // If setting as default, clear other defaults first
        if (updates.isDefault && !existing.isDefault) {
          await this.clearDefaultFlags();
        }

        const updated = this.updateModel(existing, {
          ...updates,
          updatedAt: new Date().toISOString(),
        });
        await this.getTable().put(updated);
        this.dispatchEvent("configUpdated", updated);

        return updated;
      });
    } catch (error) {
      return this.handleError(`update config ${id}`, error, null);
    }
  }

  /**
   * Get the default configuration
   */
  async getDefault(): Promise<LlmsTxtConfigModel | null> {
    try {
      const defaultConfig = await this.getTable()
        .where("isDefault")
        .equals(1)
        .first();

      return defaultConfig || null;
    } catch (error) {
      return this.handleError("get default config", error, null);
    }
  }

  /**
   * Search configurations by name
   */
  async search(
    query: string,
    limit: number = 10,
  ): Promise<LlmsTxtConfigModel[]> {
    try {
      const lowerQuery = query.toLowerCase();

      return await this.getTable()
        .filter(
          (config: LlmsTxtConfigModel) =>
            config.name.toLowerCase().includes(lowerQuery) ||
            (config.description &&
              config.description.toLowerCase().includes(lowerQuery)),
        )
        .reverse()
        .sortBy("createdAt")
        .then((results: LlmsTxtConfigModel[]) => results.slice(0, limit));
    } catch (error) {
      return this.handleError("search configs", error, []);
    }
  }

  /**
   * Clear default flags from all configs
   */
  private async clearDefaultFlags(): Promise<void> {
    try {
      const defaultConfigs = await this.getTable()
        .where("isDefault")
        .equals(1)
        .toArray();

      for (const config of defaultConfigs) {
        await this.getTable().update(config.id, { isDefault: false });
      }
    } catch (error) {
      console.error("Failed to clear default flags:", error);
    }
  }
}

// ========================================================================
// LLMS.TXT GENERATOR SERVICE
// ========================================================================

export class LlmsTxtGenerator {
  /**
   * Generate llms.txt content from repository and selected files
   */
  static async generate(
    repository: ProcessedRepository,
    selectedFiles: RepositoryFile[],
    settings: GeneratorSettings,
  ): Promise<LlmsTxtOutput> {
    try {
      // Filter and prepare files
      // If includeFileContent is true, only include files that have content
      // If includeFileContent is false, include all selected files
      const filesToInclude = settings.includeFileContent
        ? selectedFiles.filter((f) => f.content)
        : selectedFiles;

      // Generate content sections
      const sections: string[] = [];

      // Header with project name
      const projectName = settings.projectName || repository.name;
      sections.push(`# ${projectName}`);

      // Optional project description
      if (settings.projectDescription) {
        sections.push("", `> ${settings.projectDescription}`);
      } else if (repository.description) {
        sections.push("", `> ${repository.description}`);
      }

      // Repository information section
      if (settings.includeRepositoryInfo) {
        sections.push("", "## Repository Information");
        sections.push(
          `- **Repository**: [${repository.fullName}](${repository.htmlUrl})`,
        );
        sections.push(`- **Owner**: ${repository.owner}`);
        if (repository.language) {
          sections.push(`- **Primary Language**: ${repository.language}`);
        }
        sections.push(`- **Stars**: ${repository.stars.toLocaleString()}`);
        sections.push(`- **Forks**: ${repository.forks.toLocaleString()}`);
        sections.push(
          `- **Last Updated**: ${new Date(repository.lastUpdated).toLocaleDateString()}`,
        );

        if (settings.includeTimestamp) {
          sections.push(`- **Generated**: ${new Date().toISOString()}`);
        }
      }

      // File list section
      if (settings.includeFileList && filesToInclude.length > 0) {
        sections.push("", "## Files Included");
        filesToInclude.forEach((file) => {
          sections.push(
            `- [${file.name}](${repository.htmlUrl}/blob/${repository.defaultBranch}/${file.path})`,
          );
        });
      }

      // File contents section
      if (settings.includeFileContent && filesToInclude.length > 0) {
        sections.push("", "## File Contents");

        filesToInclude.forEach((file) => {
          if (file.content) {
            sections.push("", `### ${file.path}`);
            sections.push("", "```" + file.type);
            sections.push(file.content);
            sections.push("```");
          }
        });
      }

      // Join all sections
      const content = sections.join("\n");

      // Calculate metadata with token estimation
      const tokenEstimate = estimateLlmsTxtTokens(content);
      const metadata = {
        projectName,
        repositoryUrl: repository.htmlUrl,
        generatedAt: new Date().toISOString(),
        filesIncluded: filesToInclude.length,
        totalSize: new Blob([content]).size,
        characterCount: content.length,
        lineCount: content.split("\n").length,
        tokenEstimate,
      };

      return {
        content,
        metadata,
      };
    } catch (error) {
      throw new Error(`Failed to generate llms.txt: ${error}`);
    }
  }

  /**
   * Download llms.txt file
   */
  static downloadLlmsTxt(output: LlmsTxtOutput, filename?: string): void {
    try {
      const blob = new Blob([output.content], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download =
        filename ||
        `${output.metadata.projectName.replace(/[^a-zA-Z0-9]/g, "-")}-llms.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      throw new Error(`Failed to download file: ${error}`);
    }
  }

  /**
   * Copy content to clipboard
   */
  static async copyToClipboard(content: string): Promise<void> {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(content);
      } else {
        // Fallback for older browsers
        const textArea = document.createElement("textarea");
        textArea.value = content;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }
    } catch (error) {
      throw new Error(`Failed to copy to clipboard: ${error}`);
    }
  }
}

// ========================================================================
// SERVICE INSTANCES
// ========================================================================

export const llmsTxtGenerationService = new LlmsTxtGenerationService();
export const llmsTxtConfigService = new LlmsTxtConfigService();
