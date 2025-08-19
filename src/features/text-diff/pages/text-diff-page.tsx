"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { TextDiffProvider, useTextDiff } from "../lib/text-diff-context";
import { TextDiffInputArea } from "../components/text-diff-input-area";
import { TextDiffControls } from "../components/text-diff-controls";
import { DiffViewSideBySide } from "../components/diff-view-side-by-side";
import { DiffViewUnified } from "../components/diff-view-unified";
import { TextDiffSettingsDialog } from "../components/text-diff-settings-dialog";
import { TextDiffExportDialog } from "../components/text-diff-export-dialog";
import { TextDiffHistoryDialog } from "../components/text-diff-history-dialog";
import { GradientBackground } from "@/features/shared/ui/gradient-background";
import { GlassSurface } from "@/features/shared/ui/glass-surface";
import { Button } from "@/features/shared/ui/button";
import { FileDiff, Copy, Check } from "lucide-react";

function TextDiffPageContent() {
  const t = useTranslations("TextDiff");
  const { state, saveToHistory } = useTextDiff();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [mergedTextCopied, setMergedTextCopied] = useState(false);

  // Auto-save to history when diff is computed
  React.useEffect(() => {
    if (state.diffResult && state.originalText && state.modifiedText) {
      saveToHistory();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.diffResult]);

  const handleCopyMergedText = async () => {
    try {
      await navigator.clipboard.writeText(state.mergedText);
      setMergedTextCopied(true);
      setTimeout(() => setMergedTextCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <div className="min-h-screen pb-20">
      <GradientBackground />

      <div className="mx-auto px-4 py-8 max-w-[95vw] 2xl:max-w-[1400px]">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center justify-between flex-shrink-0">
            {/* Left side - Title and description */}
            <div className="space-y-1 sm:space-y-2 min-w-0 flex-1">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 rounded-lg bg-foreground/5 backdrop-blur-sm flex-shrink-0">
                  <FileDiff className="size-4 sm:size-5 text-foreground/70" />
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-lg sm:text-xl font-semibold text-foreground/90 truncate">
                    {t("title")}
                  </h1>
                  <div className="text-xs sm:text-sm text-foreground/60 line-clamp-2 sm:line-clamp-1">
                    {t("description")}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Controls - Moved to top */}
        <div className="mb-6">
          <TextDiffControls
            onSettingsClick={() => setSettingsOpen(true)}
            onExportClick={() => setExportOpen(true)}
            onHistoryClick={() => setHistoryOpen(true)}
          />
        </div>

        {/* Input Area */}
        <div className="mb-6">
          <TextDiffInputArea />
        </div>

        {/* Diff View */}
        {state.diffResult && (
          <div className="mb-6">
            {state.viewMode === "side-by-side" ? (
              <DiffViewSideBySide />
            ) : (
              <DiffViewUnified />
            )}
          </div>
        )}

        {/* Merged Result (if any) */}
        {state.mergedText && (
          <div className="mb-6">
            <GlassSurface className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-sm">
                  {t("merge.mergedResult")}
                </h3>
                <Button
                  variant="outline"
                  onClick={handleCopyMergedText}
                  className="size-8 p-0"
                >
                  {mergedTextCopied ? (
                    <Check className="size-3" />
                  ) : (
                    <Copy className="size-3" />
                  )}
                </Button>
              </div>
              <textarea
                value={state.mergedText}
                readOnly
                className="w-full h-64 p-3 bg-background/50 border border-border/50 rounded-lg resize-none font-mono text-sm"
                spellCheck={false}
              />
            </GlassSurface>
          </div>
        )}

        {/* Dialogs */}
        <TextDiffSettingsDialog
          open={settingsOpen}
          onOpenChange={setSettingsOpen}
        />
        <TextDiffExportDialog open={exportOpen} onOpenChange={setExportOpen} />
        <TextDiffHistoryDialog
          open={historyOpen}
          onOpenChange={setHistoryOpen}
        />
      </div>
    </div>
  );
}

export function TextDiffPage() {
  return (
    <TextDiffProvider>
      <TextDiffPageContent />
    </TextDiffProvider>
  );
}
