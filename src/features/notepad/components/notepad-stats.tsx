"use client";

import { memo } from "react";
import { GlassSurface } from "@/features/shared/ui/glass-surface";
import { FileText, Hash, Timer } from "lucide-react";
import { useTranslations } from "next-intl";

interface NotepadStatsProps {
  wordCount: number;
  charCount: number;
  readingTime: number;
}

function NotepadStatsComponent({
  wordCount,
  charCount,
  readingTime,
}: NotepadStatsProps) {
  const t = useTranslations("Notepad.stats");
  
  return (
    <GlassSurface className="px-2 py-1.5 md:px-2 md:py-2">
      <div className="flex flex-row md:flex-col gap-3 md:gap-3">
        {/* Word Count */}
        <div className="flex flex-row md:flex-col items-center gap-1.5 md:gap-1">
          <div className="flex items-center justify-center w-5 h-5 md:w-6 md:h-6 rounded-full bg-gradient-to-br from-blue-500/20 to-blue-600/20">
            <FileText className="w-2.5 h-2.5 md:w-3 md:h-3 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex flex-col md:items-center">
            <span className="font-semibold text-foreground text-xs md:text-sm leading-none">
              {wordCount.toLocaleString()}
            </span>
            <span className="text-muted-foreground text-[9px] md:text-[10px] leading-none hidden md:block">
              {t("word", { count: wordCount })}
            </span>
          </div>
        </div>

        {/* Character Count */}
        <div className="flex flex-row md:flex-col items-center gap-1.5 md:gap-1">
          <div className="flex items-center justify-center w-5 h-5 md:w-6 md:h-6 rounded-full bg-gradient-to-br from-green-500/20 to-green-600/20">
            <Hash className="w-2.5 h-2.5 md:w-3 md:h-3 text-green-600 dark:text-green-400" />
          </div>
          <div className="flex flex-col md:items-center">
            <span className="font-semibold text-foreground text-xs md:text-sm leading-none">
              {charCount.toLocaleString()}
            </span>
            <span className="text-muted-foreground text-[9px] md:text-[10px] leading-none hidden md:block">
              {t("chars")}
            </span>
          </div>
        </div>

        {/* Reading Time */}
        {wordCount > 0 && (
          <div className="flex flex-row md:flex-col items-center gap-1.5 md:gap-1">
            <div className="flex items-center justify-center w-5 h-5 md:w-6 md:h-6 rounded-full bg-gradient-to-br from-purple-500/20 to-purple-600/20">
              <Timer className="w-2.5 h-2.5 md:w-3 md:h-3 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="flex flex-col md:items-center">
              <span className="font-semibold text-foreground text-xs md:text-sm leading-none">
                {readingTime}
              </span>
              <span className="text-muted-foreground text-[9px] md:text-[10px] leading-none hidden md:block">
                {t("min")}
              </span>
            </div>
          </div>
        )}
      </div>
    </GlassSurface>
  );
}

// Memoize to prevent re-renders when parent re-renders
export const NotepadStats = memo(NotepadStatsComponent);
