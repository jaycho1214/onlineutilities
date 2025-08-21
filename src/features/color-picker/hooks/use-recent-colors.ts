import { useState, useEffect, useCallback, useRef } from "react";
import { ColorDB } from "@/features/color-picker/lib/color-service";

export const useRecentColors = () => {
  const [recentColors, setRecentColors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const debouncedTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const loadRecentColors = useCallback(async () => {
    try {
      const colors = await ColorDB.getRecentColors();
      setRecentColors(colors);
    } catch (error) {
      console.error("Failed to load recent colors:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addRecentColor = useCallback(
    async (color: string) => {
      // Clear existing timeout
      if (debouncedTimeoutRef.current) {
        clearTimeout(debouncedTimeoutRef.current);
      }

      // Debounce the addition of colors to avoid excessive DB calls
      debouncedTimeoutRef.current = setTimeout(async () => {
        try {
          await ColorDB.addRecentColor(color);
          // Refresh the list after adding
          await loadRecentColors();
        } catch (error) {
          console.error("Failed to add recent color:", error);
        }
      }, 500); // 500ms debounce
    },
    [loadRecentColors],
  );

  const clearRecentColors = useCallback(async () => {
    try {
      await ColorDB.clearRecentColors();
      setRecentColors([]);
    } catch (error) {
      console.error("Failed to clear recent colors:", error);
    }
  }, []);

  useEffect(() => {
    loadRecentColors();
  }, [loadRecentColors]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debouncedTimeoutRef.current) {
        clearTimeout(debouncedTimeoutRef.current);
      }
    };
  }, []);

  return {
    recentColors,
    isLoading,
    addRecentColor,
    clearRecentColors,
    refreshRecentColors: loadRecentColors,
  };
};
