"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { ActionButton } from "./action-button";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <ActionButton 
        icon={<div className="w-5 h-5 rounded-full bg-muted animate-pulse" />}
        variant="ghost" 
        size="default"
        disabled
        tooltip="Toggle theme"
      />
    );
  }

  const isDarkMode = theme === "dark";

  return (
    <ActionButton
      icon={isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      variant="ghost"
      size="default"
      onClick={() => setTheme(isDarkMode ? "light" : "dark")}
      tooltip="Toggle theme"
    />
  );
}
