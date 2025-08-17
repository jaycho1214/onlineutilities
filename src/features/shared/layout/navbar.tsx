"use client";

import { GlassSurface } from "@/features/shared/ui/glass-surface";
import { Button } from "@/features/shared/ui/button";
import Link from "next/link";
import { Search, Settings, PanelLeftIcon } from "lucide-react";
import { useCommand } from "@/features/shared/providers/command-provider";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/features/shared/ui/tooltip";
import { getModifierKey, cn } from "@/lib/utils";
import { useState } from "react";
import { SettingsDialog } from "@/features/shared/ui/settings-dialog";
import { usePageTitle } from "@/hooks/use-page-title";
import { usePathname } from "next/navigation";
import { isSidebarSupported } from "@/constants";
import { useSidebar } from "@/features/shared/ui/sidebar";
import { useTranslations } from "next-intl";

export function Navbar() {
  const t = useTranslations("Navigation");
  const { setOpen } = useCommand();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const pageTitle = usePageTitle();
  const pathname = usePathname();
  const { toggleSidebar } = useSidebar();

  const showSidebarButton = isSidebarSupported(pathname);

  return (
    <nav className="fixed inset-x-0 top-0 z-50 p-3">
      <div className="flex items-center justify-between gap-4">
        {/* Left Glass Surface */}
        <div className="flex items-center gap-2">
          {/* Sidebar Toggle - Only show on supported pages */}
          {showSidebarButton && (
            <Tooltip>
              <TooltipTrigger asChild>
                <GlassSurface
                  className={cn(
                    "flex-shrink-0 h-9 aspect-square cursor-pointer",
                    "hover:scale-105 hover:rotate-1 hover:shadow-lg",
                    "transition-all duration-300 ease-out group",
                  )}
                >
                  <button
                    onClick={toggleSidebar}
                    className="w-full h-full flex items-center justify-center"
                  >
                    <PanelLeftIcon className="size-4 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 ease-out" />
                  </button>
                </GlassSurface>
              </TooltipTrigger>
              <TooltipContent sideOffset={20}>
                <span>{t("toggleSidebar")}</span>
              </TooltipContent>
            </Tooltip>
          )}

          {/* Title */}
          <GlassSurface className="flex-shrink-0 h-9">
            <div className="py-1 px-3 h-full flex items-center">
              <Button variant="ghost" size="none" disableGlass asChild>
                <Link href="/">
                  <h1 className="font-bold text-lg tracking-tight font-eb-garamond">
                    {pageTitle}
                  </h1>
                </Link>
              </Button>
            </div>
          </GlassSurface>
        </div>

        {/* Right Glass Surfaces */}
        <div className="flex items-center gap-2">
          {/* Settings Glass Surface */}
          <Tooltip>
            <TooltipTrigger asChild>
              <GlassSurface
                className={cn(
                  "flex-shrink-0 h-9 aspect-square cursor-pointer",
                  "hover:scale-105 hover:rotate-1 hover:shadow-lg",
                  "transition-all duration-300 ease-out group",
                )}
              >
                <button
                  onClick={() => setSettingsOpen(true)}
                  aria-label={t("openSettings")}
                  className="w-full h-full flex items-center justify-center"
                >
                  <Settings className="size-4 group-hover:scale-110 group-hover:rotate-180 transition-all duration-300 ease-out" />
                </button>
              </GlassSurface>
            </TooltipTrigger>
            <TooltipContent sideOffset={20}>
              <span>{t("settings")}</span>
            </TooltipContent>
          </Tooltip>

          {/* Search Glass Surface */}
          <Tooltip>
            <TooltipTrigger asChild>
              <GlassSurface
                className={cn(
                  "flex-shrink-0 h-9 aspect-square cursor-pointer",
                  "hover:scale-105 hover:rotate-1 hover:shadow-lg",
                  "transition-all duration-300 ease-out group",
                )}
              >
                <button
                  onClick={() => setOpen(true)}
                  aria-label={t("openSearch")}
                  className="w-full h-full flex items-center justify-center"
                >
                  <Search className="size-4 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 ease-out" />
                </button>
              </GlassSurface>
            </TooltipTrigger>
            <TooltipContent sideOffset={20}>
              <div className="flex items-center gap-2">
                <span>{t("search")}</span>
                <kbd className="inline-flex h-5 select-none items-center gap-1 rounded border bg-muted/40 px-1.5 font-mono text-xs">
                  <span>{getModifierKey()}</span>K
                </kbd>
              </div>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </nav>
  );
}
