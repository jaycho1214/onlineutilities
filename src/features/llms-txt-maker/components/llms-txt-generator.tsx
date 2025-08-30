/**
 * llms.txt Generator Component
 * Handles generation settings and output display
 */

"use client";

import React from "react";
import { Settings, Download, Copy, FileText, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/features/shared/ui/button";
import { Input } from "@/features/shared/ui/input";
import { Textarea } from "@/features/shared/ui/textarea";
import { Label } from "@/features/shared/ui/label";
import { Checkbox } from "@/features/shared/ui/checkbox";
import { Badge } from "@/features/shared/ui/badge";
import { GlassSurface } from "@/features/shared/ui/glass-surface";
import { Separator } from "@/features/shared/ui/separator";
import { useLlmsTxtMaker } from "../lib/llms-txt-maker-context";
import { formatFileSize } from "../types";

export function LlmsTxtGenerator() {
  const t = useTranslations("GitHubToLlmsTxt");
  const {
    state,
    updateSettings,
    generateLlmsTxt,
    downloadLlmsTxt,
    copyToClipboard,
  } = useLlmsTxtMaker();

  const selectedCount = state.selectedFiles.size;
  const canGenerate =
    state.repository && selectedCount > 0 && !state.loading.isLoading;

  const handleGenerate = async () => {
    if (canGenerate) {
      await generateLlmsTxt();
    }
  };

  const handleDownload = () => {
    if (state.output) {
      const filename = `${state.settings.projectName || state.repository?.name || "repository"}-llms.txt`;
      downloadLlmsTxt(filename);
    }
  };

  const handleCopy = async () => {
    if (state.output) {
      await copyToClipboard(state.output.content);
    }
  };

  return (
    <div className="space-y-6">
      {/* Generator Settings */}
      <GlassSurface className="p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gray-100/50 dark:bg-gray-800/50">
              <Settings className="size-5 text-gray-600 dark:text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {t("generator.title")}
            </h3>
          </div>

          <div className="grid gap-4">
            {/* Project Name */}
            <div className="space-y-2">
              <Label htmlFor="project-name">{t("generator.projectName")}</Label>
              <Input
                id="project-name"
                placeholder={t("generator.projectNamePlaceholder")}
                value={state.settings.projectName}
                onChange={(e) =>
                  updateSettings({ projectName: e.target.value })
                }
              />
            </div>

            {/* Project Description */}
            <div className="space-y-2">
              <Label htmlFor="project-description">
                {t("generator.projectDescription")}
              </Label>
              <Textarea
                id="project-description"
                placeholder={t("generator.projectDescriptionPlaceholder")}
                value={state.settings.projectDescription}
                onChange={(e) =>
                  updateSettings({ projectDescription: e.target.value })
                }
                rows={2}
              />
            </div>

            {/* Content Options */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Content Options</Label>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include-repo-info"
                    checked={state.settings.includeRepositoryInfo}
                    onCheckedChange={(checked) =>
                      updateSettings({ includeRepositoryInfo: !!checked })
                    }
                  />
                  <Label htmlFor="include-repo-info" className="text-sm">
                    {t("generator.includeMetadata")}
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include-file-list"
                    checked={state.settings.includeFileList}
                    onCheckedChange={(checked) =>
                      updateSettings({ includeFileList: !!checked })
                    }
                  />
                  <Label htmlFor="include-file-list" className="text-sm">
                    {t("generator.includeFileList")}
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include-file-content"
                    checked={state.settings.includeFileContent}
                    onCheckedChange={(checked) =>
                      updateSettings({ includeFileContent: !!checked })
                    }
                  />
                  <Label htmlFor="include-file-content" className="text-sm">
                    {t("generator.includeContent")}
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include-timestamp"
                    checked={state.settings.includeTimestamp}
                    onCheckedChange={(checked) =>
                      updateSettings({ includeTimestamp: !!checked })
                    }
                  />
                  <Label htmlFor="include-timestamp" className="text-sm">
                    Include timestamp
                  </Label>
                </div>
              </div>
            </div>
          </div>

          {/* Generate Button */}
          <div className="pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
            <Button
              onClick={handleGenerate}
              disabled={!canGenerate}
              variant="action"
              size="lg"
              className="w-full"
            >
              {state.loading.isLoading ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  {state.loading.loadingMessage || t("generator.generating")}
                </>
              ) : (
                <>
                  <FileText className="size-4 mr-2" />
                  {t("generator.generateButton")}
                </>
              )}
            </Button>

            {/* Status info */}
            <div className="mt-2 text-center">
              {!state.repository ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Load a repository first
                </p>
              ) : selectedCount === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Select files to include
                </p>
              ) : (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Ready to generate with {selectedCount} file
                  {selectedCount !== 1 ? "s" : ""}
                </p>
              )}
            </div>
          </div>

          {/* Loading Progress */}
          {state.loading.isLoading && state.loading.progress !== undefined && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>{state.loading.loadingMessage}</span>
                <span>{state.loading.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${state.loading.progress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </GlassSurface>

      {/* Output Display */}
      {state.output && (
        <GlassSurface className="p-6">
          <div className="space-y-4">
            {/* Output Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {t("output.title")}
              </h3>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopy}
                  title={t("output.copy")}
                >
                  <Copy className="size-4" />
                </Button>
                <Button
                  variant="action"
                  size="icon"
                  onClick={handleDownload}
                  title={t("output.download")}
                >
                  <Download className="size-4" />
                </Button>
              </div>
            </div>

            {/* Metadata */}
            <div className="flex flex-wrap gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Badge variant="outline" className="text-xs">
                {state.output.metadata.characterCount.toLocaleString()} chars
              </Badge>
              <Badge variant="outline" className="text-xs">
                {state.output.metadata.lineCount.toLocaleString()} lines
              </Badge>
              <Badge variant="outline" className="text-xs">
                {formatFileSize(state.output.metadata.totalSize)}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {state.output.metadata.filesIncluded} files
              </Badge>
              <Badge variant="secondary" className="text-xs font-semibold">
                ~{state.output.metadata.tokenEstimate.total.toLocaleString()}{" "}
                tokens
              </Badge>
              <Badge
                variant="outline"
                className="text-xs text-green-600 border-green-200"
              >
                GPT: {state.output.metadata.tokenEstimate.gpt4.toLocaleString()}
              </Badge>
              <Badge
                variant="outline"
                className="text-xs text-purple-600 border-purple-200"
              >
                Claude:{" "}
                {state.output.metadata.tokenEstimate.claude.toLocaleString()}
              </Badge>
            </div>

            <Separator />

            {/* Preview */}
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 max-h-96 overflow-auto">
              <pre className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap font-mono">
                {state.output.content}
              </pre>
            </div>
          </div>
        </GlassSurface>
      )}

      {/* Empty State */}
      {!state.output && !state.loading.isLoading && (
        <GlassSurface className="p-8">
          <div className="text-center text-gray-500 dark:text-gray-400">
            <FileText className="size-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
            <p className="font-medium">{t("output.emptyOutput")}</p>
            <p className="text-sm mt-1">
              Configure your settings and click generate to create your llms.txt
              file.
            </p>
          </div>
        </GlassSurface>
      )}
    </div>
  );
}
