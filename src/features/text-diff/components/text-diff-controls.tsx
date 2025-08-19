"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { GlassSurface } from "@/features/shared/ui/glass-surface";
import { ButtonGroup, ButtonGroupItem } from "@/features/shared/ui/button-group";
import { ActionButton } from "@/features/shared/ui/action-button";
import {
  Columns2,
  FileText,
  Settings,
  Download,
  History,
  FilePlay,
} from "lucide-react";
import { useTextDiff } from "../lib/text-diff-context";

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
          <ActionButton
            icon={<FilePlay className="size-4" />}
            onClick={handleComputeDiff}
            disabled={!state.originalText && !state.modifiedText}
            variant="info"
            size="lg"
            tooltip={t("actions.compare")}
          />

          <ActionButton
            icon={<Download className="size-4" />}
            onClick={onExportClick}
            disabled={!state.diffResult}
            variant="outline"
            size="lg"
            tooltip={t("actions.export")}
          />

          <ActionButton
            icon={<History className="size-4" />}
            onClick={onHistoryClick}
            variant="outline"
            size="lg"
            tooltip={t("history.title")}
          />

          <ActionButton
            icon={<Settings className="size-4" />}
            onClick={onSettingsClick}
            variant="outline"
            size="lg"
            tooltip={t("settings.title")}
          />
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
