"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { GlassSurface } from "@/features/shared/ui/glass-surface";
import { Textarea } from "@/features/shared/ui/textarea";
import { FileText } from "lucide-react";
import { useTextDiff } from "../lib/text-diff-context";

export function TextDiffInputArea() {
  const t = useTranslations("TextDiff");
  const { state, setOriginalText, setModifiedText } = useTextDiff();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Original Text Panel */}
      <GlassSurface className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <FileText className="size-4 text-muted-foreground" />
            <h3 className="font-medium text-sm">{t("inputs.originalText")}</h3>
          </div>
          <span className="text-xs text-muted-foreground">
            {state.originalText.split("\n").length} lines
          </span>
        </div>
        <Textarea
          value={state.originalText}
          onChange={(e) => setOriginalText(e.target.value)}
          placeholder={t("inputs.originalPlaceholder")}
          className="h-48 md:h-64 p-3 font-mono text-sm"
          spellCheck={false}
        />
      </GlassSurface>

      {/* Modified Text Panel */}
      <GlassSurface className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <FileText className="size-4 text-muted-foreground" />
            <h3 className="font-medium text-sm">{t("inputs.modifiedText")}</h3>
          </div>
          <span className="text-xs text-muted-foreground">
            {state.modifiedText.split("\n").length} lines
          </span>
        </div>
        <Textarea
          value={state.modifiedText}
          onChange={(e) => setModifiedText(e.target.value)}
          placeholder={t("inputs.modifiedPlaceholder")}
          className="h-48 md:h-64 p-3 font-mono text-sm"
          spellCheck={false}
        />
      </GlassSurface>
    </div>
  );
}
