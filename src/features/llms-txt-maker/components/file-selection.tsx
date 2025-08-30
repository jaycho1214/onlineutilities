/**
 * File Selection Component
 * Provides interface for selecting files to include in llms.txt
 */

"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  Filter,
  CheckSquare,
  Square,
  ChevronDown,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/features/shared/ui/button";
import { Input } from "@/features/shared/ui/input";
import { GlassSurface } from "@/features/shared/ui/glass-surface";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/features/shared/ui/select";
import { useLlmsTxtMaker } from "../lib/llms-txt-maker-context";
import { FileTreeNode } from "./file-tree-node";
import {
  FILE_EXTENSION_GROUPS,
  buildFileTree,
  flattenFileTree,
} from "../types";
import type { FileTreeNode as FileTreeNodeType } from "../types";

export function FileSelection() {
  const t = useTranslations("GitHubToLlmsTxt");
  const {
    state,
    toggleFileSelection,
    selectAllFiles,
    deselectAllFiles,
    selectFilesByExtension,
    selectFolder,
    deselectFolder,
    toggleFolderExpanded,
    updateFileSelectionConfig,
  } = useLlmsTxtMaker();

  const [showPreview, setShowPreview] = useState<string | null>(null);

  // Build tree structure with filtering - only run if we have a repository
  const fileTree = useMemo(() => {
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

    return buildFileTree(files);
  }, [state.repository, state.fileSelectionConfig, state.selectedFiles]);

  // Calculate stats from tree
  const filteredFiles = useMemo(() => flattenFileTree(fileTree), [fileTree]);
  const selectedCount = state.selectedFiles.size;
  const availableFiles =
    state.repository?.files.filter((f) => !f.isExcluded) || [];

  if (!state.repository) return null;

  const handleFilterChange = (query: string) => {
    updateFileSelectionConfig({ filterQuery: query });
  };

  const handleShowSelectedToggle = () => {
    updateFileSelectionConfig({
      showSelectedOnly: !state.fileSelectionConfig.showSelectedOnly,
    });
  };

  const handleBulkSelection = (extensionGroupId: string) => {
    const group = FILE_EXTENSION_GROUPS.find((g) => g.id === extensionGroupId);
    if (group) {
      selectFilesByExtension(group.extensions);
    }
  };

  // Collect all folder paths from the tree
  const getAllFolderPaths = (nodes: FileTreeNodeType[]): string[] => {
    const paths: string[] = [];
    const traverse = (node: FileTreeNodeType) => {
      if (node.type === "folder") {
        paths.push(node.path);
        if (node.children) {
          node.children.forEach(traverse);
        }
      }
    };
    nodes.forEach(traverse);
    return paths;
  };

  const handleExpandAll = () => {
    const allFolderPaths = getAllFolderPaths(fileTree);
    updateFileSelectionConfig({
      expandedFolders: new Set([
        ...state.fileSelectionConfig.expandedFolders,
        ...allFolderPaths,
      ]),
    });
  };

  const handleCollapseAll = () => {
    updateFileSelectionConfig({
      expandedFolders: new Set(),
    });
  };

  return (
    <GlassSurface className="p-6">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {t("files.title")}
          </h3>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {t("files.selectedFiles", { count: selectedCount })} /{" "}
            {availableFiles.length}
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-3">
          {/* Search */}
          <div className="relative">
            <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder={t("files.filterFiles")}
              value={state.fileSelectionConfig.filterQuery}
              onChange={(e) => handleFilterChange(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={selectAllFiles}
              disabled={availableFiles.length === 0}
              className="text-xs"
            >
              <CheckSquare className="size-3 mr-1" />
              {t("files.selectAll")}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={deselectAllFiles}
              disabled={selectedCount === 0}
              className="text-xs"
            >
              <Square className="size-3 mr-1" />
              {t("files.deselectAll")}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleShowSelectedToggle}
              className="text-xs col-span-2 sm:col-span-1"
            >
              <Filter className="size-3 mr-1" />
              {state.fileSelectionConfig.showSelectedOnly
                ? t("files.showAll")
                : t("files.showSelected")}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleExpandAll}
              disabled={fileTree.length === 0}
              className="text-xs"
            >
              <ChevronDown className="size-3 mr-1" />
              Expand All
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleCollapseAll}
              disabled={fileTree.length === 0}
              className="text-xs"
            >
              <ChevronRight className="size-3 mr-1" />
              Collapse All
            </Button>
          </div>

          {/* Bulk selection by extension */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400 shrink-0">
              {t("files.byExtension")}:
            </span>
            <Select onValueChange={handleBulkSelection}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Select file type" />
              </SelectTrigger>
              <SelectContent>
                {FILE_EXTENSION_GROUPS.map((group) => (
                  <SelectItem key={group.id} value={group.id}>
                    {group.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* File Tree */}
        <div className="max-h-96 overflow-y-auto overflow-x-hidden">
          {state.loading.isLoading && filteredFiles.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="size-6 animate-spin text-gray-400" />
            </div>
          ) : fileTree.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              {state.fileSelectionConfig.showSelectedOnly &&
              selectedCount === 0 ? (
                <div>
                  <p className="font-medium">{t("files.noFilesSelected")}</p>
                  <p className="text-sm mt-1">{t("files.selectFilesPrompt")}</p>
                </div>
              ) : (
                <p>No files match your filter criteria</p>
              )}
            </div>
          ) : (
            <div className="space-y-1 min-w-0">
              {fileTree.map((node) => (
                <FileTreeNode
                  key={node.path}
                  node={node}
                  selectedFiles={state.selectedFiles}
                  expandedFolders={state.fileSelectionConfig.expandedFolders}
                  onToggleFileSelection={toggleFileSelection}
                  onSelectFolder={selectFolder}
                  onDeselectFolder={deselectFolder}
                  onToggleFolderExpanded={toggleFolderExpanded}
                  showPreview={showPreview}
                  setShowPreview={setShowPreview}
                />
              ))}
            </div>
          )}
        </div>

        {/* File type summary */}
        {state.repository.files.length > 0 && (
          <div className="pt-3 border-t border-gray-200/50 dark:border-gray-700/50">
            <div className="text-xs text-gray-600 dark:text-gray-400">
              <div className="flex flex-wrap gap-2">
                <span>Available: {availableFiles.length}</span>
                <span>•</span>
                <span>
                  Excluded:{" "}
                  {state.repository.files.length - availableFiles.length}
                </span>
                <span>•</span>
                <span>Selected: {selectedCount}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </GlassSurface>
  );
}
