"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { GlassSurface } from "@/features/shared/ui/glass-surface";
import { Button } from "@/features/shared/ui/button";
import { Check, X, Merge, Plus, Minus, Edit, BarChart3 } from "lucide-react";
import { useTextDiff } from "../lib/text-diff-context";
import { formatSideBySideView } from "../lib/diff-engine";
import { cn } from "@/lib/utils";
import type { DiffLine, DiffBlock } from "../types";

export function DiffViewSideBySide() {
  const t = useTranslations("TextDiff");
  const { state, applyMerge } = useTextDiff();

  if (!state.diffResult) return null;

  const { left, right } = formatSideBySideView(state.diffResult.changes);

  const renderLine = (line: DiffLine) => {
    const lineNumberWidth = "w-12";
    const lineTypeStyles = {
      added: "bg-green-500/10 border-l-2 border-green-500",
      removed: "bg-red-500/10 border-l-2 border-red-500",
      modified: "bg-yellow-500/10 border-l-2 border-yellow-500",
      unchanged: "",
    };

    const lineTypeSymbols = {
      added: "+",
      removed: "-",
      modified: "~",
      unchanged: " ",
    };

    return (
      <div
        className={cn(
          "flex group hover:bg-muted/30 transition-colors",
          lineTypeStyles[line.type]
        )}
      >
        {state.uiSettings.showLineNumbers && (
          <div
            className={cn(
              lineNumberWidth,
              "text-xs text-muted-foreground text-right pr-2 py-1 select-none border-r border-border/50"
            )}
          >
            {line.lineNumber || ""}
          </div>
        )}
        <div className="flex-1 px-3 py-1 font-mono text-sm whitespace-pre">
          <span className="text-muted-foreground mr-2">
            {lineTypeSymbols[line.type]}
          </span>
          {line.wordDiffs ? (
            <span>
              {line.wordDiffs.map((wordDiff, idx) => (
                <span
                  key={idx}
                  className={cn(
                    wordDiff.type === "added" && "bg-green-500/20 text-green-700 dark:text-green-300",
                    wordDiff.type === "removed" && "bg-red-500/20 text-red-700 dark:text-red-300",
                    wordDiff.type === "unchanged" && ""
                  )}
                >
                  {wordDiff.content}
                </span>
              ))}
            </span>
          ) : (
            line.content || "\u00A0"
          )}
        </div>
      </div>
    );
  };

  const renderMergeControls = (block: DiffBlock) => {
    return (
      <div className="flex items-center gap-1 bg-background/95 backdrop-blur-sm border border-border/60 rounded-md px-2 py-1 text-[10px] mb-1">
        <span className="text-muted-foreground mr-1">Merge:</span>
        <Button
          variant="ghost"
          className={cn(
            "h-5 px-1.5 text-[10px]",
            block.mergeAction === "accept-current" 
              ? "bg-blue-500/30 text-blue-700 dark:text-blue-300" 
              : "hover:bg-blue-500/20"
          )}
          onClick={() => applyMerge(block.id, "accept-current")}
          title="Accept original version"
        >
          <Check className="size-2.5" />
          <span className="ml-0.5">Original</span>
        </Button>
        <Button
          variant="ghost"
          className={cn(
            "h-5 px-1.5 text-[10px]",
            block.mergeAction === "accept-incoming" 
              ? "bg-green-500/30 text-green-700 dark:text-green-300" 
              : "hover:bg-green-500/20"
          )}
          onClick={() => applyMerge(block.id, "accept-incoming")}
          title="Accept modified version"
        >
          <X className="size-2.5" />
          <span className="ml-0.5">Modified</span>
        </Button>
        <Button
          variant="ghost"
          className={cn(
            "h-5 px-1.5 text-[10px]",
            block.mergeAction === "accept-both" 
              ? "bg-purple-500/30 text-purple-700 dark:text-purple-300" 
              : "hover:bg-purple-500/20"
          )}
          onClick={() => applyMerge(block.id, "accept-both")}
          title="Accept both versions"
        >
          <Merge className="size-2.5" />
          <span className="ml-0.5">Both</span>
        </Button>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Stats Bar */}
      <GlassSurface className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="size-5 text-primary" />
            <h3 className="font-semibold text-sm">{t("stats.title")}</h3>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <div className="flex items-center gap-1">
                <Plus className="size-4 text-green-600" />
                <span className="text-sm font-medium">{t("diff.insertions", { count: state.diffResult.stats.additions })}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="flex items-center gap-1">
                <Minus className="size-4 text-red-600" />
                <span className="text-sm font-medium">{t("diff.deletions", { count: state.diffResult.stats.deletions })}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="flex items-center gap-1">
                <Edit className="size-4 text-yellow-600" />
                <span className="text-sm font-medium">{t("diff.modifications", { count: state.diffResult.stats.modifications })}</span>
              </div>
            </div>
          </div>
        </div>
      </GlassSurface>

      {/* Diff Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 min-h-[60vh]">
        {/* Left Panel - Original */}
        <GlassSurface className="overflow-hidden flex flex-col h-full">
        <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-sm border-b border-border/50 px-4 py-2">
          <h3 className="font-medium text-sm">{t("inputs.originalText")}</h3>
        </div>
        <div className="overflow-x-auto flex-1">
          <div className="min-w-max h-full px-2 py-2">
            {/* Render change blocks with merge controls */}
            {state.diffResult?.blocks.map((block, blockIndex) => (
              <div key={block.id} className="mb-4">
                {/* Render merge controls at the top of each block */}
                {renderMergeControls(block)}
                
                {/* Render lines for this block */}
                <div className="border border-border/30 rounded-md overflow-hidden">
                  {left
                    .filter(line => 
                      line.lineNumber && 
                      line.lineNumber >= block.oldStartLine && 
                      line.lineNumber <= block.oldEndLine
                    )
                    .map((line, lineIndex) => (
                      <div key={`${blockIndex}-${lineIndex}`}>
                        {renderLine(line)}
                      </div>
                    ))}
                </div>
              </div>
            ))}
            
            {/* Render unchanged lines separately */}
            {left
              .filter(line => line.type === "unchanged")
              .map((line, index) => (
                <div key={`unchanged-${index}`}>
                  {renderLine(line)}
                </div>
              ))}
          </div>
        </div>
      </GlassSurface>

        {/* Right Panel - Modified */}
        <GlassSurface className="overflow-hidden flex flex-col h-full">
        <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-sm border-b border-border/50 px-4 py-2">
          <h3 className="font-medium text-sm">{t("inputs.modifiedText")}</h3>
        </div>
        <div className="overflow-x-auto flex-1">
          <div className="min-w-max h-full px-2 py-2">
            {/* Render change blocks with merge controls */}
            {state.diffResult?.blocks.map((block, blockIndex) => (
              <div key={block.id} className="mb-4">
                {/* Render merge controls at the top of each block */}
                {renderMergeControls(block)}
                
                {/* Render lines for this block */}
                <div className="border border-border/30 rounded-md overflow-hidden">
                  {right
                    .filter(line => 
                      line.lineNumber && 
                      line.lineNumber >= block.newStartLine && 
                      line.lineNumber <= block.newEndLine
                    )
                    .map((line, lineIndex) => (
                      <div key={`${blockIndex}-${lineIndex}`}>
                        {renderLine(line)}
                      </div>
                    ))}
                </div>
              </div>
            ))}
            
            {/* Render unchanged lines separately */}
            {right
              .filter(line => line.type === "unchanged")
              .map((line, index) => (
                <div key={`unchanged-${index}`}>
                  {renderLine(line)}
                </div>
              ))}
          </div>
        </div>
        </GlassSurface>
      </div>
    </div>
  );
}