"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { useTextDiff } from "../lib/text-diff-context";
import { TextDiffInputArea } from "../components/text-diff-input-area";
import { TextDiffControls } from "../components/text-diff-controls";
import { DiffViewSideBySide } from "../components/diff-view-side-by-side";
import { DiffViewUnified } from "../components/diff-view-unified";
import { TextDiffSettingsDialog } from "../components/text-diff-settings-dialog";
import { TextDiffExportDialog } from "../components/text-diff-export-dialog";
import { GlassSurface } from "@/features/shared/ui/glass-surface";
import { Button } from "@/features/shared/ui/button";
import { Textarea } from "@/features/shared/ui/textarea";
import { Copy, Check } from "lucide-react";

export function TextDiffPage() {
  const t = useTranslations("TextDiff");
  const { state, saveToHistory } = useTextDiff();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
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
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Follow random generator pattern */}
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {t("title")}
        </h1>
        <p className="text-gray-600 dark:text-gray-300">{t("description")}</p>
      </div>

      {/* Main Content */}
      <div className="space-y-4">
        {/* Controls */}
        <TextDiffControls
          onSettingsClick={() => setSettingsOpen(true)}
          onExportClick={() => setExportOpen(true)}
        />

        {/* Input Area */}
        <TextDiffInputArea />

        {/* Diff View */}
        {state.diffResult && (
          <GlassSurface className="p-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Comparison Result
            </h2>
            {state.viewMode === "side-by-side" ? (
              <DiffViewSideBySide />
            ) : (
              <DiffViewUnified />
            )}
          </GlassSurface>
        )}

        {/* Merged Result (if any) */}
        {state.mergedText && (
          <GlassSurface className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
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
            <Textarea
              value={state.mergedText}
              readOnly
              className="h-64 p-3 font-mono text-sm"
              spellCheck={false}
            />
          </GlassSurface>
        )}
      </div>

      {/* Dialogs */}
      <TextDiffSettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
      />
      <TextDiffExportDialog open={exportOpen} onOpenChange={setExportOpen} />
    </div>
  );
}
