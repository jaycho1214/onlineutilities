/**
 * File Tree Node Component
 * Renders individual nodes in the file tree with expand/collapse and selection
 */

"use client";

import React from "react";
import {
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  File,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "@/features/shared/ui/button";
import { Checkbox } from "@/features/shared/ui/checkbox";
import { Badge } from "@/features/shared/ui/badge";
import { useLlmsTxtMaker } from "../lib/llms-txt-maker-context";
import { formatFileSize } from "../types";
import type { FileTreeNode, RepositoryFile } from "../types";

interface FileTreeNodeProps {
  node: FileTreeNode;
  selectedFiles: Set<string>;
  expandedFolders: Set<string>;
  onToggleFileSelection: (path: string) => void;
  onSelectFolder: (folderPath: string) => void;
  onDeselectFolder: (folderPath: string) => void;
  onToggleFolderExpanded: (folderPath: string) => void;
  showPreview?: string | null;
  setShowPreview?: (path: string | null) => void;
}

export function FileTreeNode({
  node,
  selectedFiles,
  expandedFolders,
  onToggleFileSelection,
  onSelectFolder,
  onDeselectFolder,
  onToggleFolderExpanded,
  showPreview,
  setShowPreview,
}: FileTreeNodeProps) {
  const { loadFileContent } = useLlmsTxtMaker();
  const isExpanded = node.type === "folder" && expandedFolders.has(node.path);
  const isSelected = node.type === "file" && selectedFiles.has(node.path);

  // For folders, check if all children are selected
  const getFolderSelectionState = () => {
    if (node.type === "file") return null;
    if (!node.children || node.children.length === 0) return "none";

    const fileChildren = node.children.filter((child) => child.type === "file");
    if (fileChildren.length === 0) return "none";

    const selectedChildren = fileChildren.filter((child) =>
      selectedFiles.has(child.path),
    );

    if (selectedChildren.length === 0) return "none";
    if (selectedChildren.length === fileChildren.length) return "all";
    return "partial";
  };

  const folderSelectionState = getFolderSelectionState();

  const handleFolderToggle = () => {
    if (node.type === "folder") {
      onToggleFolderExpanded(node.path);
    }
  };

  const handleFolderSelection = () => {
    if (node.type === "folder") {
      if (folderSelectionState === "all") {
        onDeselectFolder(node.path);
      } else {
        onSelectFolder(node.path);
      }
    }
  };

  const handleFileSelection = () => {
    if (node.type === "file") {
      onToggleFileSelection(node.path);
    }
  };

  const renderFileNode = (file: RepositoryFile) => (
    <div className="flex items-center gap-3 min-w-0 flex-1">
      {/* Checkbox */}
      <div className="flex-shrink-0">
        <Checkbox
          checked={isSelected}
          onCheckedChange={handleFileSelection}
          disabled={file.isExcluded}
        />
      </div>

      {/* File icon */}
      <File className="size-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />

      {/* File info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">
            {file.name}
          </span>
          <Badge variant="secondary" className="text-xs">
            {file.type}
          </Badge>
        </div>

        <div className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-2">
          <span>{formatFileSize(file.size)}</span>
          {file.isDotFile && (
            <Badge variant="outline" className="text-xs">
              Dot file
            </Badge>
          )}
          {file.isLargeFile && (
            <Badge variant="destructive" className="text-xs">
              Large file
            </Badge>
          )}
        </div>
      </div>

      {/* Preview button */}
      {file.downloadUrl && !file.isLargeFile && setShowPreview && (
        <Button
          variant="ghost"
          size="sm"
          onClick={async () => {
            if (showPreview === file.path) {
              // Hide preview
              setShowPreview(null);
            } else {
              // Show preview - load content if not already loaded
              if (!file.content) {
                await loadFileContent(file);
              }
              setShowPreview(file.path);
            }
          }}
        >
          {showPreview === file.path ? (
            <EyeOff className="size-4" />
          ) : (
            <Eye className="size-4" />
          )}
        </Button>
      )}
    </div>
  );

  const renderFolderNode = () => (
    <div className="flex items-center gap-2 min-w-0 flex-1">
      {/* Expand/collapse button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleFolderToggle}
        className="p-0 h-auto w-auto hover:bg-transparent"
      >
        {isExpanded ? (
          <ChevronDown className="size-4 text-gray-500 dark:text-gray-400" />
        ) : (
          <ChevronRight className="size-4 text-gray-500 dark:text-gray-400" />
        )}
      </Button>

      {/* Folder checkbox */}
      <div className="flex-shrink-0">
        <Checkbox
          checked={
            folderSelectionState === "all" || folderSelectionState === "partial"
          }
          onCheckedChange={handleFolderSelection}
        />
      </div>

      {/* Folder icon */}
      {isExpanded ? (
        <FolderOpen className="size-4 text-blue-500 flex-shrink-0" />
      ) : (
        <Folder className="size-4 text-blue-500 flex-shrink-0" />
      )}

      {/* Folder name */}
      <span className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">
        {node.name}
      </span>
    </div>
  );

  return (
    <div>
      {/* Current node */}
      <div
        className={`flex items-start p-2 rounded-lg transition-all duration-200 ${
          node.type === "file" && isSelected
            ? "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
            : "hover:bg-gray-50 dark:hover:bg-gray-800"
        }`}
        style={{ paddingLeft: `${node.level * 20 + 8}px` }}
      >
        {node.type === "file" && node.file
          ? renderFileNode(node.file)
          : renderFolderNode()}
      </div>

      {/* File preview */}
      {node.type === "file" &&
        node.file &&
        showPreview === node.path &&
        node.file.content && (
          <div
            className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700"
            style={{ paddingLeft: `${(node.level + 1) * 20 + 8}px` }}
          >
            <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
              Preview
            </div>
            <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded text-xs font-mono max-h-32 overflow-auto">
              <pre className="whitespace-pre-wrap text-gray-800 dark:text-gray-200">
                {node.file.content.slice(0, 500)}
                {node.file.content.length > 500 && "..."}
              </pre>
            </div>
          </div>
        )}

      {/* Children */}
      {node.type === "folder" && isExpanded && node.children && (
        <div>
          {node.children.map((child) => (
            <FileTreeNode
              key={child.path}
              node={child}
              selectedFiles={selectedFiles}
              expandedFolders={expandedFolders}
              onToggleFileSelection={onToggleFileSelection}
              onSelectFolder={onSelectFolder}
              onDeselectFolder={onDeselectFolder}
              onToggleFolderExpanded={onToggleFolderExpanded}
              showPreview={showPreview}
              setShowPreview={setShowPreview}
            />
          ))}
        </div>
      )}
    </div>
  );
}
