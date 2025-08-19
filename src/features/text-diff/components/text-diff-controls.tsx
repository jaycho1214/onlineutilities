"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { GlassSurface } from "@/features/shared/ui/glass-surface";
import { Button } from "@/features/shared/ui/button";
import {
  Columns2,
  FileText,
  Settings,
  Download,
  History,
  FilePlay,
} from "lucide-react";
import { useTextDiff } from "../lib/text-diff-context";
import { cn } from "@/lib/utils";

interface TextDiffControlsProps {
  onSettingsClick?: () => void;
  onExportClick?: () => void;
  onHistoryClick?: () => void;
}

export function TextDiffControls({
  onSettingsClick,
  onExportClick,
  onHistoryClick,
}: TextDiffControlsProps) {
  const t = useTranslations("TextDiff");
  const { state, setViewMode, computeDiff } = useTextDiff();

  const handleComputeDiff = () => {
    computeDiff();
  };

  return (
    <GlassSurface className="p-4">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between flex-shrink-0">
        {/* Left side - View mode */}
        <div className="flex flex-wrap items-center gap-3">
          {/* View mode selector */}
          <div className="flex gap-1 p-1 bg-background/50 rounded-lg">
            <button
              onClick={() => setViewMode("side-by-side")}
              className={cn(
                "px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2",
                state.viewMode === "side-by-side"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <Columns2 className="size-4" />
              {t("views.sideBySide")}
            </button>
            <button
              onClick={() => setViewMode("unified")}
              className={cn(
                "px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2",
                state.viewMode === "unified"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <FileText className="size-4" />
              {t("views.unified")}
            </button>
          </div>
        </div>

        {/* Right side - Action buttons */}
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={handleComputeDiff}
            disabled={!state.originalText && !state.modifiedText}
            variant="secondary"
            className="h-10 w-10 rounded-full p-0"
            title={t("actions.compare")}
          >
            <FilePlay className="size-4" />
          </Button>

          <Button
            variant="outline"
            className="h-10 w-10 rounded-full p-0"
            disabled={!state.diffResult}
            onClick={onExportClick}
            title={t("actions.export")}
          >
            <Download className="size-4" />
          </Button>

          <Button
            variant="outline"
            className="h-10 w-10 rounded-full p-0"
            onClick={onHistoryClick}
            title={t("history.title")}
          >
            <History className="size-4" />
          </Button>

          <Button
            variant="outline"
            className="h-10 w-10 rounded-full p-0"
            onClick={onSettingsClick}
            title={t("settings.title")}
          >
            <Settings className="size-4" />
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {state.error && (
        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-600 dark:text-red-400">
          {state.error}
        </div>
      )}
    </GlassSurface>
  );
}
