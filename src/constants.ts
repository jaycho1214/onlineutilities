import {
  Timer,
  Clock,
  NotebookPen,
  Palette,
  QrCode,
  Calculator,
  Code2,
  Dices,
  type LucideIcon,
} from "lucide-react";

export const baseUrl = "https://onlineutilities.org";

export interface Utility {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  href: string;
  category?: string;
  keywords?: string[];
}

export const utilities: Utility[] = [
  {
    id: "timer",
    name: "Timer",
    description: "Set countdown timers",
    icon: Timer,
    href: "/timer",
    category: "Time",
    keywords: ["countdown", "alarm", "reminder", "time"],
  },
  {
    id: "stopwatch",
    name: "Stopwatch",
    description: "Track elapsed time",
    icon: Clock,
    href: "/stopwatch",
    category: "Time",
    keywords: ["time", "track", "measure", "elapsed"],
  },
  {
    id: "notepad",
    name: "Notepad",
    description: "Quick notes & text",
    icon: NotebookPen,
    href: "/notepad",
    category: "Text",
    keywords: ["notes", "text", "write", "memo"],
  },
  {
    id: "color-picker",
    name: "Color Picker",
    description: "Colors & palettes",
    icon: Palette,
    href: "/color-picker",
    category: "Design",
    keywords: ["color", "palette", "picker", "design", "hex"],
  },
  {
    id: "qr-code",
    name: "QR Code",
    description: "Generate QR codes",
    icon: QrCode,
    href: "/qr-code",
    category: "Generator",
    keywords: ["qr", "code", "generate", "barcode"],
  },
  {
    id: "calculator",
    name: "Calculator",
    description: "Basic calculator with history",
    icon: Calculator,
    href: "/calculator",
    category: "Math",
    keywords: ["calculate", "math", "arithmetic", "numbers"],
  },
  {
    id: "formatter",
    name: "Formatter",
    description: "Format & validate JSON, CSV, XML, YAML with smart detection",
    icon: Code2,
    href: "/formatter",
    category: "Text",
    keywords: [
      "format",
      "json",
      "csv",
      "xml",
      "validate",
      "prettify",
      "minify",
      "detect",
      "auto-format",
      "javascript",
      "html",
      "yaml",
    ],
  },
  {
    id: "random-generator",
    name: "Random Generator",
    description: "Generate passwords, UUIDs, random numbers, strings and more",
    icon: Dices,
    href: "/random-generator",
    category: "Generator",
    keywords: [
      "password",
      "uuid",
      "nanoid",
      "random",
      "generator",
      "string",
      "number",
      "security",
      "entropy",
    ],
  },
];

export const getUtilityById = (id: string): Utility | undefined => {
  return utilities.find((utility) => utility.id === id);
};

export const getUtilitiesByCategory = (category: string): Utility[] => {
  return utilities.filter((utility) => utility.category === category);
};

export const searchUtilities = (query: string): Utility[] => {
  const lowercaseQuery = query.toLowerCase();
  return utilities.filter(
    (utility) =>
      utility.name.toLowerCase().includes(lowercaseQuery) ||
      utility.description.toLowerCase().includes(lowercaseQuery) ||
      utility.keywords?.some((keyword) => keyword.includes(lowercaseQuery)),
  );
};

// Pages that support sidebar functionality
export const SIDEBAR_SUPPORTED_PAGES = [
  "/notepad",
  "/calculator",
  "/formatter",
  "/random-generator",
  // Add more pages here as needed
];

export const isSidebarSupported = (pathname: string): boolean => {
  return SIDEBAR_SUPPORTED_PAGES.some((page) => pathname.startsWith(page));
};
