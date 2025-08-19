"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { GlassSurface } from "@/features/shared/ui/glass-surface";
import { Button } from "@/features/shared/ui/button";
import { Check, X, Merge } from "lucide-react";
import { useTextDiff } from "../lib/text-diff-context";
import { formatUnifiedView } from "../lib/diff-engine";
import { cn } from "@/lib/utils";
import type { DiffLine, DiffBlock } from "../types";

export function DiffViewUnified() {
  const t = useTranslations("TextDiff");
  const { state, applyMerge } = useTextDiff();

  if (!state.diffResult) return null;

  const lines = formatUnifiedView(state.diffResult.changes);

  const renderLine = (line: DiffLine, index: number) => {
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

    // Find block for this line if it's a change
    let block: DiffBlock | undefined;
    if (line.type !== "unchanged") {
      block = state.diffResult?.blocks.find((b) => {
        if (line.oldLineNumber && b.type === "removed") {
          return (
            line.oldLineNumber >= b.oldStartLine &&
            line.oldLineNumber <= b.oldEndLine
          );
        }
        if (
          line.newLineNumber &&
          (b.type === "added" || b.type === "modified")
        ) {
          return (
            line.newLineNumber >= b.newStartLine &&
            line.newLineNumber <= b.newEndLine
          );
        }
        return false;
      });
    }

    return (
      <div
        key={index}
        className={cn(
          "flex group hover:bg-muted/30 transition-colors relative",
          lineTypeStyles[line.type],
        )}
      >
        {state.uiSettings.showLineNumbers && (
          <>
            <div
              className={cn(
                lineNumberWidth,
                "text-xs text-muted-foreground text-right pr-2 py-1 select-none border-r border-border/50",
              )}
            >
              {line.oldLineNumber || ""}
            </div>
            <div
              className={cn(
                lineNumberWidth,
                "text-xs text-muted-foreground text-right pr-2 py-1 select-none border-r border-border/50",
              )}
            >
              {line.newLineNumber || ""}
            </div>
          </>
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
                    wordDiff.type === "added" &&
                      "bg-green-500/20 text-green-700 dark:text-green-300",
                    wordDiff.type === "removed" &&
                      "bg-red-500/20 text-red-700 dark:text-red-300",
                    wordDiff.type === "unchanged" && "",
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

        {/* Merge controls for the first line of each block */}
        {block &&
          index ===
            lines.findIndex(
              (l) =>
                (l.oldLineNumber === block.oldStartLine &&
                  block.type === "removed") ||
                (l.newLineNumber === block.newStartLine &&
                  (block.type === "added" || block.type === "modified")),
            ) && (
            <div className="absolute right-2 top-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
              <Button
                variant="ghost"
                className="h-6 px-2 text-xs"
                onClick={() => applyMerge(block.id, "accept-current")}
                title={t("merge.selectOriginal")}
              >
                <Check className="size-3" />
                {t("merge.selectOriginal")}
              </Button>
              <Button
                variant="ghost"
                className="h-6 px-2 text-xs"
                onClick={() => applyMerge(block.id, "accept-incoming")}
                title={t("merge.selectModified")}
              >
                <X className="size-3" />
                {t("merge.selectModified")}
              </Button>
              <Button
                variant="ghost"
                className="h-6 px-2 text-xs"
                onClick={() => applyMerge(block.id, "accept-both")}
                title={t("merge.selectBoth")}
              >
                <Merge className="size-3" />
                {t("merge.selectBoth")}
              </Button>
            </div>
          )}
      </div>
    );
  };

  return (
    <GlassSurface className="overflow-hidden min-h-[400px]">
      <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-sm border-b border-border/50 px-4 py-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <h3 className="font-medium text-sm">{t("views.unified")}</h3>
        <div className="flex flex-wrap gap-2 sm:gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 bg-green-500/20 border border-green-500 rounded-sm"></span>
            {t("diff.insertions", { count: state.diffResult.stats.additions })}
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 bg-red-500/20 border border-red-500 rounded-sm"></span>
            {t("diff.deletions", { count: state.diffResult.stats.deletions })}
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 bg-yellow-500/20 border border-yellow-500 rounded-sm"></span>
            {t("diff.modifications", {
              count: state.diffResult.stats.modifications,
            })}
          </span>
        </div>
      </div>
      <div className="overflow-x-auto">
        <div className="min-w-max">
          {lines.map((line, index) => renderLine(line, index))}
        </div>
      </div>
    </GlassSurface>
  );
}
