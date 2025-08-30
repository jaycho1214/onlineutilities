"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "quicknote-content";
const AUTO_SAVE_DELAY = 500; // 500ms debounce

export function Quicknote() {
  const t = useTranslations("Quicknote");
  const [content, setContent] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedContentRef = useRef("");

  // Load content from localStorage on mount
  useEffect(() => {
    const savedContent = localStorage.getItem(STORAGE_KEY) || "";
    setContent(savedContent);
    lastSavedContentRef.current = savedContent;
    setIsLoaded(true);

    // Auto-focus the textarea after a brief delay to ensure it's rendered
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }, 100);
  }, []);

  // Debounced auto-save function
  const debouncedSave = useCallback(
    (value: string) => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(() => {
        if (value !== lastSavedContentRef.current) {
          try {
            localStorage.setItem(STORAGE_KEY, value);
            lastSavedContentRef.current = value;
            // Silent save - no notification for quicknote
          } catch (error) {
            console.error("Failed to save quicknote:", error);
            toast.error(t("notifications.saveError"));
          }
        }
      }, AUTO_SAVE_DELAY);
    },
    [t],
  );

  // Handle content change
  const handleContentChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value;
      setContent(value);
      debouncedSave(value);
    },
    [debouncedSave],
  );

  // Global keypress handler - typing anywhere focuses the textarea
  useEffect(() => {
    const handleGlobalKeyPress = (e: KeyboardEvent) => {
      // Don't interfere if user is typing in another input/textarea
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement ||
        (e.target as Element)?.closest('[contenteditable="true"]')
      ) {
        return;
      }

      // Don't interfere with keyboard shortcuts
      if (e.ctrlKey || e.metaKey || e.altKey) {
        return;
      }

      // Don't interfere with navigation keys
      if (
        [
          "Tab",
          "Enter",
          "Escape",
          "ArrowUp",
          "ArrowDown",
          "ArrowLeft",
          "ArrowRight",
        ].includes(e.key)
      ) {
        return;
      }

      // Focus textarea for printable characters
      if (e.key.length === 1 && textareaRef.current) {
        textareaRef.current.focus();
        // Let the character be typed naturally
      }
    };

    document.addEventListener("keypress", handleGlobalKeyPress);
    return () => document.removeEventListener("keypress", handleGlobalKeyPress);
  }, []);

  // Global click handler for the fullscreen area
  const handleContainerClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      // Focus the textarea when clicking anywhere in the container
      if (
        textareaRef.current &&
        !textareaRef.current.contains(e.target as Node)
      ) {
        textareaRef.current.focus();
      }
    },
    [],
  );

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      className="fixed inset-0 w-screen h-screen cursor-text"
      onClick={handleContainerClick}
    >
      {/* Fullscreen textarea with glassmorphism */}
      <textarea
        ref={textareaRef}
        value={content}
        onChange={handleContentChange}
        placeholder={t("placeholder")}
        disabled={!isLoaded}
        className={cn(
          // Fullscreen positioning
          "fixed inset-0 w-full h-full",
          // Remove all borders, outlines, and visible UI chrome
          "border-0 outline-none resize-none",
          // Transparent background with subtle glassmorphism
          "bg-white/5 dark:bg-black/5",
          "backdrop-blur-[2px] backdrop-saturate-[0.3]",
          // Text styling
          "text-base leading-relaxed text-foreground",
          "placeholder:text-muted-foreground/50",
          // Padding for comfortable reading
          "p-8 md:p-12 lg:p-16",
          // Selection colors
          "selection:bg-primary selection:text-primary-foreground",
          // Remove focus rings and visible focus states
          "focus:ring-0 focus:outline-none focus-visible:ring-0",
          // Smooth transitions
          "transition-all duration-200",
        )}
        style={{
          // Ensure no browser default styling
          background: "transparent",
          // Improve text rendering
          WebkitFontSmoothing: "antialiased",
          MozOsxFontSmoothing: "grayscale",
        }}
      />

      {/* Subtle floating indicator in bottom right - only shown when content exists */}
      {content && (
        <div className="fixed bottom-6 right-6 pointer-events-none">
          <div className="px-3 py-1 rounded-lg bg-black/10 dark:bg-white/10 backdrop-blur-sm text-xs text-muted-foreground space-y-0.5">
            <div>{t("stats.characters", { count: content.length })}</div>
            <div>
              {t("stats.words", {
                count: content.trim() ? content.trim().split(/\s+/).length : 0,
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
