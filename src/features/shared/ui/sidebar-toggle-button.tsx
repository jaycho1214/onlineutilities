"use client";

import { Button } from "@/features/shared/ui/button";
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
        <Button
          variant="ghost"
          size="none"
          onClick={toggleSidebar}
          className={cn(
            "fixed top-4 left-4 z-50",
            "flex-shrink-0 h-12 w-12 cursor-pointer",
            "hover:scale-105 hover:rotate-1 hover:shadow-lg",
            "transition-all duration-300 ease-out group",
          )}
        >
          <PanelLeftIcon className="size-5 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 ease-out" />
        </Button>
      </TooltipTrigger>
      <TooltipContent sideOffset={20}>
        <span>Toggle Sidebar</span>
      </TooltipContent>
    </Tooltip>
  );
}
