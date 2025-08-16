import {
  Timer,
  Clock,
  NotebookPen,
  Calculator,
  Calendar,
  Palette,
  Hash,
  QrCode,
  Image,
  FileText,
  Link,
  type LucideIcon,
} from "lucide-react";

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
    id: "calculator",
    name: "Calculator",
    description: "Basic calculations",
    icon: Calculator,
    href: "/calculator",
    category: "Math",
    keywords: ["math", "calculate", "arithmetic", "numbers"],
  },
  {
    id: "calendar",
    name: "Calendar",
    description: "Date calculations",
    icon: Calendar,
    href: "/calendar",
    category: "Time",
    keywords: ["date", "calendar", "schedule", "time"],
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
    id: "hash-generator",
    name: "Hash Generator",
    description: "Generate hashes",
    icon: Hash,
    href: "/hash-generator",
    category: "Security",
    keywords: ["hash", "md5", "sha", "encrypt", "security"],
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
    id: "image-converter",
    name: "Image Converter",
    description: "Convert images",
    icon: Image,
    href: "/image-converter",
    category: "Media",
    keywords: ["image", "convert", "format", "jpg", "png"],
  },
  {
    id: "text-formatter",
    name: "Text Formatter",
    description: "Format & transform text",
    icon: FileText,
    href: "/text-formatter",
    category: "Text",
    keywords: ["text", "format", "transform", "case", "style"],
  },
  {
    id: "url-shortener",
    name: "URL Shortener",
    description: "Shorten long URLs",
    icon: Link,
    href: "/url-shortener",
    category: "Web",
    keywords: ["url", "link", "shorten", "redirect"],
  },
  {
    id: "gradient-generator",
    name: "Gradient Generator",
    description: "Create CSS gradients",
    icon: Palette,
    href: "/gradient-generator",
    category: "Design",
    keywords: ["gradient", "css", "design", "colors", "background"],
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
  // Add more pages here as needed
];

export const isSidebarSupported = (pathname: string): boolean => {
  return SIDEBAR_SUPPORTED_PAGES.some((page) => pathname.startsWith(page));
};
