"use client";

import { GlassSurface } from "@/features/shared/ui/glass-surface";
import { PanelLeftIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/features/shared/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/features/shared/ui/tooltip";

export function SidebarToggleButton() {
  const { toggleSidebar } = useSidebar();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <GlassSurface
          className={cn(
            "fixed top-4 left-4 z-50",
            "flex-shrink-0 h-12 aspect-square cursor-pointer",
            "hover:scale-105 hover:rotate-1 hover:shadow-lg",
            "transition-all duration-300 ease-out group",
          )}
        >
          <button
            onClick={toggleSidebar}
            className="w-full h-full flex items-center justify-center"
          >
            <PanelLeftIcon className="size-5 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 ease-out" />
          </button>
        </GlassSurface>
      </TooltipTrigger>
      <TooltipContent sideOffset={20}>
        <span>Toggle Sidebar</span>
      </TooltipContent>
    </Tooltip>
  );
}
