const STORAGE_KEYS = {
  RECENT_COLORS: "color-picker-recent-colors",
  LAST_COLOR_FORMAT: "color-picker-last-format",
} as const;

export const storage = {
  // Recent colors
  getRecentColors: (): string[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.RECENT_COLORS);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },

  setRecentColors: (colors: string[]): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.RECENT_COLORS, JSON.stringify(colors));
    } catch {
      // Ignore storage errors
    }
  },

  // Last used color format
  getLastColorFormat: (): string | null => {
    try {
      return localStorage.getItem(STORAGE_KEYS.LAST_COLOR_FORMAT);
    } catch {
      return null;
    }
  },

  setLastColorFormat: (format: string): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.LAST_COLOR_FORMAT, format);
    } catch {
      // Ignore storage errors
    }
  },
};
