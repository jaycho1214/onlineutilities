"use client";

import React from "react";
import { GlassSurface } from "@/features/shared/ui/glass-surface";
import { useCommand } from "@/features/shared/providers/command-provider";
import { Search } from "lucide-react";
import { getModifierKey } from "@/lib/utils";
import { useTranslations } from "next-intl";

export const SearchInterface = React.memo(function SearchInterface() {
  const t = useTranslations("Search");
  const { setOpen } = useCommand();

  return (
    <div className="max-w-2xl mx-auto">
      <GlassSurface className="w-full shadow-lg hover:shadow-xl transition-all duration-200 motion-reduce:transition-none rounded-xl">
        <div
          className="flex items-center gap-3 px-4 py-3 cursor-text w-full"
          onClick={() => setOpen(true)}
        >
          <Search className="h-5 w-5 text-muted-foreground/60" />
          <div className="flex-1 text-left">
            <span className="text-base text-muted-foreground/70">
              {t("placeholder")}
            </span>
          </div>
          <kbd className="inline-flex h-5 select-none items-center gap-1 rounded border bg-muted/40 px-1.5 font-mono text-xs text-muted-foreground/60">
            <span>{getModifierKey()}</span>K
          </kbd>
        </div>
      </GlassSurface>
    </div>
  );
});
