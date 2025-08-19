/**
 * Diff Engine Module
 * 
 * This module provides the core diff functionality using the jsdiff library.
 * It handles all diff operations and transformations.
 */

import * as diff from "diff";
import type { Change } from "diff";
import { nanoid } from "nanoid";
import type { DiffOptions, DiffResult, DiffBlock, DiffLine, WordDiff, DiffChange } from "../types";

/**
 * Utility function to process diff value into meaningful lines
 * Optimized to eliminate code duplication throughout the file
 */
function processValueToLines(value: string | undefined): string[] {
  return (value || "").split("\n").filter((_, i, arr) => 
    i < arr.length - 1 || arr[i] !== ""
  );
}

/**
 * Memoization cache for processed lines to avoid repeated processing
 */
const lineProcessingCache = new Map<string, string[]>();

/**
 * Optimized line processing with memoization for performance
 */
function processValueToLinesCached(value: string | undefined): string[] {
  const key = value || "";
  if (lineProcessingCache.has(key)) {
    return lineProcessingCache.get(key)!;
  }
  
  const result = processValueToLines(value);
  
  // Limit cache size to prevent memory leaks
  if (lineProcessingCache.size > 1000) {
    const firstKey = lineProcessingCache.keys().next().value;
    if (firstKey !== undefined) {
      lineProcessingCache.delete(firstKey);
    }
  }
  
  lineProcessingCache.set(key, result);
  return result;
}

/**
 * Perform a line-by-line diff between two texts
 */
export function computeLineDiff(
  originalText: string,
  modifiedText: string,
  options: DiffOptions
): DiffResult {
  // Configure jsdiff options based on our DiffOptions
  const jsDiffOptions = {
    ignoreWhitespace: options.ignoreWhitespace,
    ignoreNewlineAtEof: options.ignoreNewlineAtEof,
    stripTrailingCr: options.stripTrailingCr,
    newlineIsToken: options.newlineIsToken,
  } as const;

  // If ignoreCase is true, convert both texts to lowercase for comparison
  const textA = options.ignoreCase ? originalText.toLowerCase() : originalText;
  const textB = options.ignoreCase ? modifiedText.toLowerCase() : modifiedText;

  // Perform the diff
  const changes = diff.diffLines(textA, textB, jsDiffOptions);

  // Convert changes to diff blocks
  const blocks = convertChangesToBlocks(changes);

  // Calculate statistics
  const stats = calculateStats(changes);

  return {
    changes,
    blocks,
    stats,
  };
}

/**
 * Perform a word-by-word diff between two texts
 */
export function computeWordDiff(
  originalText: string,
  modifiedText: string,
  options: Pick<DiffOptions, "ignoreCase">
): Change[] {
  const jsDiffOptions = {
    ignoreCase: options.ignoreCase,
  } as const;

  return diff.diffWords(originalText, modifiedText, jsDiffOptions);
}

/**
 * Perform a character-by-character diff between two texts
 */
export function computeCharDiff(
  originalText: string,
  modifiedText: string,
  options: Pick<DiffOptions, "ignoreCase">
): Change[] {
  const jsDiffOptions = {
    ignoreCase: options.ignoreCase,
  } as const;

  return diff.diffChars(originalText, modifiedText, jsDiffOptions);
}

/**
 * Compute word-level differences for two lines
 */
function computeWordDiffsForLines(oldLine: string, newLine: string): WordDiff[] {
  const wordChanges = diff.diffWords(oldLine, newLine);
  return wordChanges.map(change => ({
    type: change.added ? "added" : change.removed ? "removed" : "unchanged",
    content: change.value
  }));
}

/**
 * Convert diff changes to diff blocks for easier rendering and merging
 */
function convertChangesToBlocks(
  changes: Change[]
): DiffBlock[] {
  const blocks: DiffBlock[] = [];
  let oldLineNumber = 1;
  let newLineNumber = 1;

  changes.forEach((change) => {
    const lines = processValueToLines(change.value);

    if (change.removed) {
      // Create a removed block
      blocks.push({
        id: nanoid(8),
        type: "removed",
        oldStartLine: oldLineNumber,
        oldEndLine: oldLineNumber + lines.length - 1,
        newStartLine: newLineNumber,
        newEndLine: newLineNumber - 1,
        oldLines: lines,
        newLines: [],
        canMerge: true,
      });
      oldLineNumber += lines.length;
    } else if (change.added) {
      // Check if the previous block was a removal - if so, it's a modification
      const lastBlock = blocks[blocks.length - 1];
      if (lastBlock && lastBlock.type === "removed") {
        // Merge into a modified block
        lastBlock.type = "modified";
        lastBlock.newEndLine = newLineNumber + lines.length - 1;
        lastBlock.newLines = lines;
      } else {
        // Create an added block
        blocks.push({
          id: nanoid(8),
          type: "added",
          oldStartLine: oldLineNumber,
          oldEndLine: oldLineNumber - 1,
          newStartLine: newLineNumber,
          newEndLine: newLineNumber + lines.length - 1,
          oldLines: [],
          newLines: lines,
          canMerge: true,
        });
      }
      newLineNumber += lines.length;
    } else {
      // Unchanged lines
      oldLineNumber += lines.length;
      newLineNumber += lines.length;
    }
  });

  return blocks;
}

/**
 * Calculate statistics from diff changes
 */
function calculateStats(changes: Change[]): DiffResult["stats"] {
  let additions = 0;
  let deletions = 0;
  let modifications = 0;

  let i = 0;
  while (i < changes.length) {
    const change = changes[i];
    const lines = processValueToLines(change.value).length;

    if (change.removed) {
      // Check if next change is an addition (modification)
      if (i + 1 < changes.length && changes[i + 1].added) {
        const addedLines = processValueToLines(changes[i + 1].value).length;
        modifications += Math.max(lines, addedLines);
        i += 2; // Skip the next change since we processed it
      } else {
        deletions += lines;
        i++;
      }
    } else if (change.added) {
      additions += lines;
      i++;
    } else {
      i++;
    }
  }

  return { additions, deletions, modifications };
}

/**
 * Create a unified diff patch
 */
export function createUnifiedPatch(
  originalText: string,
  modifiedText: string,
  options: DiffOptions
): string {
  const patchOptions = {
    context: options.context,
    stripTrailingCr: options.stripTrailingCr,
    ignoreWhitespace: options.ignoreWhitespace,
  } as const;

  return diff.createTwoFilesPatch(
    "Original",
    "Modified",
    originalText,
    modifiedText,
    "",
    "",
    patchOptions
  );
}

/**
 * Apply a merge action to the texts
 */
export function applyMergeAction(
  originalText: string,
  modifiedText: string,
  blocks: DiffBlock[],
  blockId: string,
  action: "accept-current" | "accept-incoming" | "accept-both"
): string {
  const block = blocks.find((b) => b.id === blockId);
  if (!block) return originalText;

  const originalLines = originalText.split("\n");
  const resultLines = [...originalLines];

  switch (action) {
    case "accept-current":
      // Keep the original text (do nothing)
      break;

    case "accept-incoming":
      // Replace with modified text
      if (block.type === "removed") {
        // Remove the lines
        resultLines.splice(block.oldStartLine - 1, block.oldLines.length);
      } else if (block.type === "added") {
        // Insert the new lines
        resultLines.splice(block.oldStartLine - 1, 0, ...block.newLines);
      } else if (block.type === "modified") {
        // Replace old lines with new lines
        resultLines.splice(
          block.oldStartLine - 1,
          block.oldLines.length,
          ...block.newLines
        );
      }
      break;

    case "accept-both":
      // Include both versions
      if (block.type === "modified") {
        // Keep original and add new after
        resultLines.splice(block.oldEndLine, 0, ...block.newLines);
      } else if (block.type === "added") {
        // Insert the new lines
        resultLines.splice(block.oldStartLine - 1, 0, ...block.newLines);
      }
      // For removed, we keep the original (don't remove)
      break;
  }

  return resultLines.join("\n");
}

/**
 * Apply all merge actions to generate the final merged text
 */
export function applyAllMergeActions(
  originalText: string,
  modifiedText: string,
  blocks: DiffBlock[]
): string {
  const originalLines = originalText.split("\n");
  const resultLines = [...originalLines];
  
  // Sort blocks by line position to apply changes in reverse order
  // This prevents line number shifts from affecting subsequent operations
  const sortedBlocks = [...blocks].sort((a, b) => b.oldStartLine - a.oldStartLine);
  
  for (const block of sortedBlocks) {
    if (!block.mergeAction) continue; // Skip blocks without merge decisions
    
    const startIndex = block.oldStartLine - 1;
    const deleteCount = block.oldLines.length;
    
    switch (block.mergeAction) {
      case "accept-current":
        // Keep original lines (do nothing)
        break;
        
      case "accept-incoming":
        if (block.type === "removed") {
          // Remove the lines
          resultLines.splice(startIndex, deleteCount);
        } else if (block.type === "added") {
          // Insert new lines at the position
          resultLines.splice(startIndex, 0, ...block.newLines);
        } else if (block.type === "modified") {
          // Replace old lines with new lines
          resultLines.splice(startIndex, deleteCount, ...block.newLines);
        }
        break;
        
      case "accept-both":
        if (block.type === "modified") {
          // Keep original and add new lines after
          resultLines.splice(startIndex + deleteCount, 0, ...block.newLines);
        } else if (block.type === "added") {
          // Insert new lines
          resultLines.splice(startIndex, 0, ...block.newLines);
        }
        // For removed type, we keep the original (don't remove)
        break;
    }
  }
  
  return resultLines.join("\n");
}

/**
 * Format lines for side-by-side view
 */
export function formatSideBySideView(
  changes: DiffChange[]
): { left: DiffLine[]; right: DiffLine[] } {
  const leftLines: DiffLine[] = [];
  const rightLines: DiffLine[] = [];
  let leftLineNumber = 1;
  let rightLineNumber = 1;

  for (let i = 0; i < changes.length; i++) {
    const change = changes[i];
    const lines = processValueToLinesCached(change.value);

    if (change.removed) {
      // Check if next change is an addition (modification)
      if (i + 1 < changes.length && changes[i + 1].added) {
        const nextChange = changes[i + 1];
        const nextLines = processValueToLinesCached(nextChange.value);

        // This is a modification - show both sides with ~ symbol and word-level diffs
        const maxLines = Math.max(lines.length, nextLines.length);
        
        for (let j = 0; j < maxLines; j++) {
          const oldLine = lines[j] || "";
          const newLine = nextLines[j] || "";
          const wordDiffs = oldLine && newLine ? computeWordDiffsForLines(oldLine, newLine) : undefined;
          
          leftLines.push({
            type: "modified",
            content: oldLine,
            lineNumber: j < lines.length ? leftLineNumber++ : undefined,
            wordDiffs: wordDiffs
          });
          rightLines.push({
            type: "modified",
            content: newLine,
            lineNumber: j < nextLines.length ? rightLineNumber++ : undefined,
            wordDiffs: wordDiffs
          });
        }
        
        // Skip the next change since we processed it
        i++;
      } else {
        // Pure removal
        lines.forEach((line) => {
          leftLines.push({
            type: "removed",
            content: line,
            lineNumber: leftLineNumber++,
          });
        });
        // Add empty lines to right side to maintain alignment
        for (let j = 0; j < lines.length; j++) {
          rightLines.push({
            type: "unchanged",
            content: "",
            lineNumber: undefined,
          });
        }
      }
    } else if (change.added) {
      // This should only be pure additions (not part of modifications)
      // Add empty lines to left side to maintain alignment
      for (let j = 0; j < lines.length; j++) {
        leftLines.push({
          type: "unchanged",
          content: "",
          lineNumber: undefined,
        });
      }
      lines.forEach((line) => {
        rightLines.push({
          type: "added",
          content: line,
          lineNumber: rightLineNumber++,
        });
      });
    } else {
      // Unchanged lines
      lines.forEach((line) => {
        leftLines.push({
          type: "unchanged",
          content: line,
          lineNumber: leftLineNumber++,
        });
        rightLines.push({
          type: "unchanged",
          content: line,
          lineNumber: rightLineNumber++,
        });
      });
    }
  }

  return { left: leftLines, right: rightLines };
}

/**
 * Format lines for unified view
 */
export function formatUnifiedView(changes: DiffChange[]): DiffLine[] {
  const lines: DiffLine[] = [];
  let oldLineNumber = 1;
  let newLineNumber = 1;

  for (let i = 0; i < changes.length; i++) {
    const change = changes[i];
    const changeLines = processValueToLinesCached(change.value);

    if (change.removed) {
      // Check if next change is an addition (modification)
      if (i + 1 < changes.length && changes[i + 1].added) {
        const nextChange = changes[i + 1];
        const nextLines = processValueToLinesCached(nextChange.value);

        // This is a modification - show old lines first, then new lines with word-level diffs
        const maxLinesUnified = Math.max(changeLines.length, nextLines.length);
        
        for (let j = 0; j < maxLinesUnified; j++) {
          const oldLine = changeLines[j] || "";
          const newLine = nextLines[j] || "";
          const wordDiffs = oldLine && newLine ? computeWordDiffsForLines(oldLine, newLine) : undefined;
          
          if (j < changeLines.length) {
            lines.push({
              type: "modified",
              content: oldLine,
              oldLineNumber: oldLineNumber++,
              newLineNumber: undefined,
              wordDiffs: wordDiffs
            });
          }
          
          if (j < nextLines.length) {
            lines.push({
              type: "modified",
              content: newLine,
              oldLineNumber: undefined,
              newLineNumber: newLineNumber++,
              wordDiffs: wordDiffs
            });
          }
        }
        
        // Skip the next change since we processed it
        i++;
      } else {
        // Pure removal
        changeLines.forEach((line) => {
          lines.push({
            type: "removed",
            content: line,
            oldLineNumber: oldLineNumber++,
            newLineNumber: undefined,
          });
        });
      }
    } else if (change.added) {
      // This should only be pure additions (not part of modifications)
      changeLines.forEach((line) => {
        lines.push({
          type: "added",
          content: line,
          oldLineNumber: undefined,
          newLineNumber: newLineNumber++,
        });
      });
    } else {
      // Unchanged lines
      changeLines.forEach((line) => {
        lines.push({
          type: "unchanged",
          content: line,
          oldLineNumber: oldLineNumber++,
          newLineNumber: newLineNumber++,
        });
      });
    }
  }

  return lines;
}

/**
 * Export diff as various formats
 */
export const exportFormats = {
  unifiedDiff: (originalText: string, modifiedText: string, options: DiffOptions): string => {
    return createUnifiedPatch(originalText, modifiedText, options);
  },

  json: (diffResult: DiffResult): string => {
    return JSON.stringify(diffResult, null, 2);
  },

  markdown: (diffResult: DiffResult): string => {
    const parts = [
      "# Diff Report\n",
      "## Statistics\n",
      `- **Additions**: ${diffResult.stats.additions} lines`,
      `- **Deletions**: ${diffResult.stats.deletions} lines`,
      `- **Modifications**: ${diffResult.stats.modifications} lines\n`,
      "## Changes\n",
      "```diff"
    ];
    
    diffResult.changes.forEach((change) => {
      const lines = processValueToLinesCached(change.value);
      const prefix = change.added ? "+" : change.removed ? "-" : " ";
      lines.forEach((line) => {
        if (line) parts.push(`${prefix} ${line}`);
      });
    });
    
    parts.push("```");
    return parts.join("\n");
  },

  html: (diffResult: DiffResult): string => {
    let html = `<!DOCTYPE html>
<html>
<head>
  <title>Diff Report</title>
  <style>
    body { font-family: monospace; }
    .added { background-color: #d4f4dd; }
    .removed { background-color: #fee8e9; }
    .line { white-space: pre; }
  </style>
</head>
<body>
  <h1>Diff Report</h1>
  <h2>Statistics</h2>
  <ul>
    <li>Additions: ${diffResult.stats.additions} lines</li>
    <li>Deletions: ${diffResult.stats.deletions} lines</li>
    <li>Modifications: ${diffResult.stats.modifications} lines</li>
  </ul>
  <h2>Changes</h2>
  <div class="diff">`;

    diffResult.changes.forEach((change) => {
      const lines = processValueToLinesCached(change.value);
      const className = change.added ? "added" : change.removed ? "removed" : "";
      lines.forEach((line) => {
        if (line) {
          html += `<div class="line ${className}">${escapeHtml(line)}</div>`;
        }
      });
    });

    html += `  </div>
</body>
</html>`;
    return html;
  },
};

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}