import React from "react";
import {
  Timer,
  Clock,
  NotebookPen,
  Palette,
  QrCode,
  Calculator,
  Code2,
  Dices,
  FileDiff,
  Lock,
  Focus,
  StickyNote,
  type LucideIcon,
  Captions,
} from "lucide-react";
import { GitHubIcon } from "@/components/icons/github-icon";

export const baseUrl = "https://onlineutilities.org";

export interface Utility {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon | React.ComponentType<{ className?: string }>;
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
  {
    id: "text-diff",
    name: "Text Diff",
    description:
      "Compare two texts and visualize differences with git-like formatting",
    icon: FileDiff,
    href: "/text-diff",
    category: "Text",
    keywords: [
      "diff",
      "compare",
      "text",
      "merge",
      "changes",
      "git",
      "differences",
      "version",
    ],
  },
  {
    id: "encoder-decoder",
    name: "Encoder/Decoder",
    description:
      "Encode and decode text with Base64, URL, HTML entities, Hex, ASCII, Binary, Unicode, and more formats",
    icon: Lock,
    href: "/encoder-decoder",
    category: "Text",
    keywords: [
      "encode",
      "decode",
      "base64",
      "url",
      "html",
      "hex",
      "ascii",
      "binary",
      "unicode",
      "punycode",
      "base58",
      "rot13",
      "morse",
      "escape",
      "unescape",
      "encryption",
      "conversion",
    ],
  },
  {
    id: "pomodoro",
    name: "Pomodoro",
    description:
      "Focus timer with sessions, todo lists, and customizable breaks",
    icon: Focus,
    href: "/pomodoro",
    category: "Time",
    keywords: [
      "pomodoro",
      "focus",
      "productivity",
      "timer",
      "work",
      "break",
      "session",
      "todo",
      "tasks",
      "concentration",
    ],
  },
  {
    id: "github-to-llms-txt",
    name: "GitHub to llms.txt",
    description:
      "Generate llms.txt files from GitHub repositories with file selection and formatting",
    icon: GitHubIcon,
    href: "/llms-txt-maker",
    category: "Generator",
    keywords: [
      "llms.txt",
      "github",
      "repository",
      "markdown",
      "ai",
      "llm",
      "context",
      "documentation",
      "files",
      "generate",
    ],
  },
  {
    id: "quicknote",
    name: "Quicknote",
    description: "Lightning-fast note taking with instant saving",
    icon: StickyNote,
    href: "/quicknote",
    category: "Text",
    keywords: ["quicknote", "note", "fast", "simple", "text", "memo", "write"],
  },
  {
    id: "youtube-transcription",
    name: "YouTube Transcription",
    description: "Extract and copy YouTube subtitles",
    icon: Captions,
    href: "/yt",
    category: "Text",
    keywords: ["youtube", "transcript", "subtitle", "captions", "video", "cc"],
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
  "/text-diff",
  "/encoder-decoder",
  "/llms-txt-maker",
];

export const isSidebarSupported = (pathname: string): boolean => {
  return SIDEBAR_SUPPORTED_PAGES.some((page) => pathname.startsWith(page));
};
