import React, { useEffect } from "react";
import { GlassSurface } from "@/features/shared/ui/glass-surface";
import { Button } from "@/features/shared/ui/button";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/features/shared/ui/tooltip";
import { Trash2 } from "lucide-react";
import { useRecentColors } from "@/features/color-picker/hooks/use-recent-colors";
import { CopyButton } from "./copy-button";

interface RecentColorsPanelProps {
  onColorSelect: (color: string) => void;
}

export const RecentColorsPanel: React.FC<RecentColorsPanelProps> = ({
  onColorSelect,
}) => {
  const { recentColors, isLoading, clearRecentColors, refreshRecentColors } =
    useRecentColors();

  // Refresh recent colors when component receives focus (for cross-tab sync)
  useEffect(() => {
    const handleFocus = () => {
      refreshRecentColors();
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [refreshRecentColors]);

  if (isLoading) {
    return (
      <GlassSurface className="p-6">
        <div className="space-y-4">
          <h3 className="font-semibold">Recent Colors</h3>
          <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-12 gap-2">
            {Array.from({ length: 12 }).map((_, index) => (
              <div
                key={index}
                className="aspect-square rounded-lg bg-white/10 animate-pulse"
              />
            ))}
          </div>
        </div>
      </GlassSurface>
    );
  }

  if (recentColors.length === 0) {
    return (
      <GlassSurface className="p-6">
        <div className="text-center py-8">
          <div className="text-4xl opacity-20 mb-2">🎨</div>
          <h3 className="font-semibold text-foreground/80 mb-1">
            No Recent Colors
          </h3>
          <p className="text-sm text-muted-foreground">
            Colors you pick will appear here for quick access
          </p>
        </div>
      </GlassSurface>
    );
  }

  return (
    <GlassSurface className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Recent Colors</h3>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearRecentColors}
                className="h-10 w-10 text-muted-foreground hover:text-destructive"
              >
                <Trash2 />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Clear recent colors</TooltipContent>
          </Tooltip>
        </div>

        <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-12 gap-2">
          {recentColors.map((color, index) => (
            <div key={`${color}-${index}`} className="relative group">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className="aspect-square w-full rounded-lg border border-white/20 hover:scale-105 hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 relative overflow-hidden cursor-pointer"
                    style={{ backgroundColor: color }}
                    onClick={() => onColorSelect(color)}
                    role="button"
                    tabIndex={0}
                    aria-label={`Select color ${color}`}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onColorSelect(color);
                      }
                    }}
                  >
                    {/* Copy button overlay */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                      <CopyButton
                        value={color}
                        size="icon"
                        className="h-6 w-6 bg-white/20 hover:bg-white/30 text-white border-white/30"
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent color selection when copying
                        }}
                      />
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="text-center">
                    <div className="font-mono text-xs">
                      {color.toUpperCase()}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Click to select • Hover to copy
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            </div>
          ))}
        </div>

        {recentColors.length > 0 && (
          <p className="text-xs text-muted-foreground text-center">
            {recentColors.length} color{recentColors.length !== 1 ? "s" : ""}{" "}
            saved • Click to select, hover to copy
          </p>
        )}
      </div>
    </GlassSurface>
  );
};
