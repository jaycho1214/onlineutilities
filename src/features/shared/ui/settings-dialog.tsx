"use client";

import { Dialog, DialogContent } from "./dialog";
import { GlassSurface } from "./glass-surface";
import { useTheme } from "next-themes";
import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { savePersonalName } from "@/lib/actions";
import { X, User, Palette, ArrowUp, Info } from "lucide-react";
import { useTranslations } from "next-intl";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type SettingsTab = "personal" | "appearance" | "about";

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const t = useTranslations("Settings");
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<SettingsTab>("personal");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [personalName, setPersonalName] = useState("");
  const [tempPersonalName, setTempPersonalName] = useState("");

  // Helper function to get cookie value (client-side fallback)
  const getCookie = useCallback((name: string): string | null => {
    if (typeof document === "undefined") return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
    return null;
  }, []);

  useEffect(() => {
    // Load personal name from cookie
    const savedName = getCookie("personalName");
    if (savedName) {
      setPersonalName(savedName);
      setTempPersonalName(savedName);
    }
  }, [getCookie]);

  const handleSaveName = useCallback(async () => {
    await savePersonalName(tempPersonalName);
    const trimmedName = tempPersonalName.trim();
    setPersonalName(trimmedName);
    // Refresh the page to update the greeting
    window.location.reload();
  }, [tempPersonalName]);

  const sidebarItems = [
    { id: "personal" as const, label: t("personalization.title"), icon: User },
    { id: "appearance" as const, label: t("appearance.title"), icon: Palette },
    { id: "about" as const, label: "About", icon: Info },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="w-full max-w-sm sm:max-w-2xl h-[90vh] sm:h-[500px] p-2 sm:p-3 overflow-hidden"
        showCloseButton={false}
      >
        {/* Custom Close Button */}
        <button
          onClick={() => onOpenChange(false)}
          className="absolute top-4 right-4 z-10 w-7 h-7 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center hover:bg-white/20 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>

        <div className="flex flex-col sm:flex-row h-full gap-2 sm:gap-3">
          {/* Sidebar */}
          <div className="w-full sm:w-48 flex-shrink-0 flex flex-col gap-2 sm:gap-3">
            {/* Settings Header - Hidden on mobile, shown on desktop */}
            <GlassSurface className="shadow-lg hidden sm:block">
              <div className="p-3">
                <h2 className="text-base font-bold text-left">{t("title")}</h2>
              </div>
            </GlassSurface>

            {/* Navigation Buttons */}
            <GlassSurface className="flex-1 sm:flex-1 shadow-lg">
              <div className="p-2">
                <nav className="flex sm:flex-col sm:space-y-1 space-x-1 sm:space-x-0 overflow-x-auto sm:overflow-x-visible">
                  {sidebarItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={cn(
                          "flex-shrink-0 sm:w-full flex items-center sm:items-start gap-2 sm:gap-2.5 px-2 sm:px-2 py-2 rounded-lg text-left transition-all duration-200 text-sm justify-center sm:justify-start whitespace-nowrap",
                          activeTab === item.id
                            ? "bg-white/20 shadow-lg backdrop-blur-sm border border-white/30"
                            : "hover:bg-white/10 border border-transparent",
                        )}
                      >
                        <Icon className="w-4 h-4 sm:mt-0.5" />
                        <span className="font-medium text-left hidden sm:inline">
                          {item.label}
                        </span>
                      </button>
                    );
                  })}
                </nav>
              </div>
            </GlassSurface>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto min-h-0">
            <div className="p-3 sm:p-4">
              {activeTab === "personal" && (
                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold mb-1">
                      {t("personalization.title")}
                    </h3>
                    <p className="text-foreground/70 text-sm">
                      {t("personalization.nameDescription")}
                    </p>
                  </div>

                  <GlassSurface>
                    <div className="p-3 sm:p-4">
                      <div className="space-y-4">
                        <div>
                          <label
                            htmlFor="name"
                            className="text-sm font-medium mb-2 block"
                          >
                            {t("personalization.name")}
                          </label>
                          <div className="flex gap-2">
                            <input
                              id="name"
                              type="text"
                              value={tempPersonalName}
                              onChange={(e) =>
                                setTempPersonalName(e.target.value)
                              }
                              placeholder={t("personalization.namePlaceholder")}
                              className="flex-1 px-3 py-2.5 text-sm bg-white/5 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 backdrop-blur-sm transition-colors"
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  handleSaveName();
                                }
                              }}
                            />
                            <button
                              onClick={handleSaveName}
                              className="px-3 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-lg transition-colors flex items-center justify-center text-sm font-medium"
                              title="Save name"
                            >
                              <ArrowUp className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </GlassSurface>
                </div>
              )}

              {activeTab === "appearance" && (
                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold mb-1">
                      {t("appearance.title")}
                    </h3>
                    <p className="text-foreground/70 text-sm">
                      Customize how the app looks
                    </p>
                  </div>

                  <GlassSurface>
                    <div className="p-3 sm:p-4">
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-medium mb-2">{t("appearance.theme")}</p>
                          <div className="flex rounded-lg bg-white/5 backdrop-blur-sm border border-white/20 overflow-hidden">
                            <button
                              onClick={() => setTheme("light")}
                              className={cn(
                                "flex-1 px-3 py-2.5 text-sm font-medium transition-all duration-200",
                                theme === "light"
                                  ? "bg-white/15 backdrop-blur-sm border border-white/30 shadow-sm"
                                  : "hover:bg-white/10",
                              )}
                            >
                              {t("appearance.light")}
                            </button>
                            <button
                              onClick={() => setTheme("dark")}
                              className={cn(
                                "flex-1 px-3 py-2.5 text-sm font-medium transition-all duration-200 border-x border-white/20",
                                theme === "dark"
                                  ? "bg-white/15 backdrop-blur-sm border border-white/30 shadow-sm"
                                  : "hover:bg-white/10",
                              )}
                            >
                              {t("appearance.dark")}
                            </button>
                            <button
                              onClick={() => setTheme("system")}
                              className={cn(
                                "flex-1 px-3 py-2.5 text-sm font-medium transition-all duration-200",
                                theme === "system"
                                  ? "bg-white/15 backdrop-blur-sm border border-white/30 shadow-sm"
                                  : "hover:bg-white/10",
                              )}
                            >
                              {t("appearance.system")}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </GlassSurface>
                </div>
              )}

              {activeTab === "about" && (
                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold mb-1">
                      About
                    </h3>
                    <p className="text-foreground/70 text-sm">
                      Information about Online Utilities
                    </p>
                  </div>

                  <GlassSurface>
                    <div className="p-3 sm:p-4">
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-base font-semibold mb-2">
                            Online Utilities
                          </h4>
                          <p className="text-sm text-foreground/80">
                            Free online tools and utilities for daily tasks -
                            gradient generator, notepad, timers, calculators,
                            and more.
                          </p>
                        </div>

                        <div className="pt-3 border-t border-white/10">
                          <p className="text-xs text-foreground/60 mb-3">
                            Copyright © 2025 Online Utilities.
                          </p>

                          <div className="flex gap-3">
                            <a
                              href="/privacy"
                              className="text-xs text-blue-500 hover:text-blue-400 transition-colors"
                            >
                              Privacy Policy
                            </a>
                            <span className="text-foreground/40">·</span>
                            <a
                              href="https://github.com/jaycho1214"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-500 hover:text-blue-400 transition-colors"
                            >
                              GitHub
                            </a>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-white/10">
                          <p className="text-xs text-foreground/60">
                            Built by Jaeyoung Cho
                          </p>
                        </div>
                      </div>
                    </div>
                  </GlassSurface>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
