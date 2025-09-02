"use client";

import { useEffect } from "react";

export type TranscriptSnippet = {
  text: string;
  start: number;
  duration: number;
};

interface UseYouTubeTranscriptShortcutsParams {
  snippets: TranscriptSnippet[];
  selectedIndex: number;
  setSelectedIndex: (
    updater: (idx: number) => number,
  ) => void | ((idx: number) => void);
  seekTo: (seconds: number) => void;
  handleCopyAll: () => void;
  exportSrt: () => void;
  exportVtt: () => void;
  toggleTimestamps: () => void;
  showShortcutDialog: () => void;
}

export function useYouTubeTranscriptShortcuts({
  snippets,
  selectedIndex,
  setSelectedIndex,
  seekTo,
  handleCopyAll,
  exportSrt,
  exportVtt,
  toggleTimestamps,
  showShortcutDialog,
}: UseYouTubeTranscriptShortcutsParams) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = document.activeElement as HTMLElement | null;
      if (
        el &&
        (el.tagName === "INPUT" ||
          el.tagName === "TEXTAREA" ||
          el.isContentEditable)
      )
        return;

      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((idx) =>
          Math.max(0, (typeof idx === "number" ? idx : selectedIndex) - 1),
        );
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((idx) =>
          Math.min(
            snippets.length - 1,
            (typeof idx === "number" ? idx : selectedIndex) + 1,
          ),
        );
        return;
      }
      if (e.key === "Enter") {
        e.preventDefault();
        const s = snippets[selectedIndex];
        if (s) seekTo(Math.max(0, Math.floor(s.start)));
        return;
      }
      if (e.key.toLowerCase() === "j") {
        e.preventDefault();
        setSelectedIndex((idx) => {
          const val = typeof idx === "number" ? idx : selectedIndex;
          const next = Math.max(0, val - 1);
          const s = snippets[next];
          if (s) seekTo(Math.max(0, Math.floor(s.start)));
          return next;
        });
        return;
      }
      if (e.key.toLowerCase() === "l") {
        e.preventDefault();
        setSelectedIndex((idx) => {
          const val = typeof idx === "number" ? idx : selectedIndex;
          const next = Math.min(snippets.length - 1, val + 1);
          const s = snippets[next];
          if (s) seekTo(Math.max(0, Math.floor(s.start)));
          return next;
        });
        return;
      }
      if (e.key.toLowerCase() === "t") {
        e.preventDefault();
        toggleTimestamps();
        return;
      }
      if (e.key.toLowerCase() === "c") {
        e.preventDefault();
        handleCopyAll();
        return;
      }
      if (e.key.toLowerCase() === "s") {
        e.preventDefault();
        exportSrt();
        return;
      }
      if (e.key.toLowerCase() === "v") {
        e.preventDefault();
        exportVtt();
        return;
      }
      if (e.key === " ") {
        e.preventDefault();
        // let the player handle play/pause via space if it has focus; otherwise ignore here
        return;
      }
      if (e.key === "?") {
        e.preventDefault();
        showShortcutDialog();
        return;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [
    snippets,
    selectedIndex,
    setSelectedIndex,
    seekTo,
    handleCopyAll,
    exportSrt,
    exportVtt,
    toggleTimestamps,
    showShortcutDialog,
  ]);
}
