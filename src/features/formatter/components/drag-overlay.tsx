"use client";

import { memo } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { Upload, FileText } from "lucide-react";

interface DragOverlayProps {
  isVisible: boolean;
  className?: string;
}

function DragOverlayComponent({ isVisible, className }: DragOverlayProps) {
  const t = useTranslations("Formatter.dragDrop");

  if (!isVisible) {
    return null;
  }

  return (
    <div
      className={cn(
        "absolute inset-0 z-50 flex items-center justify-center",
        "bg-black/20 dark:bg-white/10 backdrop-blur-md",
        "border-2 border-dashed border-blue-500/50 rounded-xl",
        "transition-all duration-200 ease-in-out",
        "animate-in fade-in-0 zoom-in-95",
        className
      )}
    >
      <div className="text-center space-y-4 p-8">
        {/* Icon */}
        <div className="relative">
          <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl animate-pulse" />
          <div className="relative bg-white/10 dark:bg-black/10 backdrop-blur-md rounded-full p-6 border border-white/20">
            <Upload className="h-12 w-12 text-blue-400 mx-auto" />
          </div>
        </div>

        {/* Title and subtitle */}
        <div className="space-y-2">
          <h3 className="text-2xl font-semibold text-white drop-shadow-lg">
            {t("overlay.title")}
          </h3>
          <p className="text-white/80 text-lg drop-shadow">
            {t("overlay.subtitle")}
          </p>
        </div>

        {/* Supported files info */}
        <div className="flex items-center justify-center gap-2 text-white/70 text-sm">
          <FileText className="h-4 w-4" />
          <span>{t("overlay.supportedFiles")}</span>
        </div>

        {/* Animated border effect */}
        <div className="absolute inset-2 border-2 border-dashed border-blue-400/30 rounded-lg animate-pulse" />
      </div>
    </div>
  );
}

export const DragOverlay = memo(DragOverlayComponent);