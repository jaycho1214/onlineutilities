"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { GlassSurface } from "@/features/shared/ui/glass-surface";
import { Button } from "@/features/shared/ui/button";
import { ButtonGroup, ButtonGroupItem } from "@/features/shared/ui/button-group";
import {
  Columns2,
  FileText,
  Settings,
  Download,
  History,
  FilePlay,
} from "lucide-react";
import { useTextDiff } from "../lib/text-diff-context";
import { DiffViewMode } from "../types";
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
          <ButtonGroup
            value={state.viewMode}
            onValueChange={setViewMode}
            variant="default"
          >
            <ButtonGroupItem value="side-by-side">
              <Columns2 />
              {t("views.sideBySide")}
            </ButtonGroupItem>
            <ButtonGroupItem value="unified">
              <FileText />
              {t("views.unified")}
            </ButtonGroupItem>
          </ButtonGroup>
        </div>

        {/* Right side - Action buttons */}
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={handleComputeDiff}
            disabled={!state.originalText && !state.modifiedText}
            variant="action"
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
