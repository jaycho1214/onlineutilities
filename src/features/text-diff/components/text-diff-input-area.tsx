"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { GlassSurface } from "@/features/shared/ui/glass-surface";
import { Button } from "@/features/shared/ui/button";
import { ArrowLeftRight, FileText, Trash2 } from "lucide-react";
import { useTextDiff } from "../lib/text-diff-context";

export function TextDiffInputArea() {
  const t = useTranslations("TextDiff");
  const { state, setOriginalText, setModifiedText, swapTexts, clearAll } = useTextDiff();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Original Text Panel */}
      <GlassSurface className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <FileText className="size-4 text-muted-foreground" />
            <h3 className="font-medium text-sm">
              {t("inputs.originalText")}
            </h3>
          </div>
          <span className="text-xs text-muted-foreground">
            {state.originalText.split("\n").length} lines
          </span>
        </div>
        <textarea
          value={state.originalText}
          onChange={(e) => setOriginalText(e.target.value)}
          placeholder={t("inputs.originalPlaceholder")}
          className="w-full h-48 md:h-64 p-3 bg-background/50 border border-border/50 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 font-mono text-sm"
          spellCheck={false}
        />
      </GlassSurface>

      {/* Modified Text Panel */}
      <GlassSurface className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <FileText className="size-4 text-muted-foreground" />
            <h3 className="font-medium text-sm">
              {t("inputs.modifiedText")}
            </h3>
          </div>
          <span className="text-xs text-muted-foreground">
            {state.modifiedText.split("\n").length} lines
          </span>
        </div>
        <textarea
          value={state.modifiedText}
          onChange={(e) => setModifiedText(e.target.value)}
          placeholder={t("inputs.modifiedPlaceholder")}
          className="w-full h-48 md:h-64 p-3 bg-background/50 border border-border/50 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 font-mono text-sm"
          spellCheck={false}
        />
      </GlassSurface>

      {/* Action Buttons */}
      <div className="md:col-span-2 flex justify-center gap-2">
        <Button
          onClick={swapTexts}
          variant="outline"
          className="h-9 px-4"
          disabled={!state.originalText && !state.modifiedText}
        >
          <ArrowLeftRight className="size-4" />
          {t("actions.swap")}
        </Button>
        <Button
          onClick={clearAll}
          variant="outline"
          className="h-9 px-4"
          disabled={!state.originalText && !state.modifiedText}
        >
          <Trash2 className="size-4" />
          {t("actions.clear")}
        </Button>
      </div>
    </div>
  );
}