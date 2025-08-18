import type { Metadata } from "next";
import { FormatterPage } from "@/features/formatter/pages/formatter-page";

export const metadata: Metadata = {
  title: "Code Formatter",
  description:
    "Free online formatter and validator for JSON, CSV, XML, YAML, HTML, and JavaScript. Features smart format detection, trailing comma support, comment handling, syntax validation, and instant beautification. Format and validate your code with one click.",
  keywords: [
    "json formatter",
    "json validator",
    "json beautifier",
    "json5 formatter",
    "jsonc formatter",
    "csv formatter",
    "csv validator",
    "csv to table",
    "xml formatter",
    "xml validator",
    "xml beautifier",
    "yaml formatter",
    "yaml validator",
    "html formatter",
    "html beautifier",
    "javascript formatter",
    "js beautifier",
    "code formatter online",
    "code beautifier",
    "format json with comments",
    "json trailing comma",
    "auto format detection",
    "online code formatter",
    "free formatter tool",
    "syntax validator",
    "code validator online",
    "prettify json",
    "minify json",
    "format code online",
  ],
  openGraph: {
    title: "Free Online Code Formatter & Validator - JSON, CSV, XML & More",
    description:
      "Format and validate JSON, CSV, XML, YAML, HTML, and JavaScript online. Smart format detection, trailing comma support, and instant beautification.",
    type: "website",
    images: [
      {
        url: "/og-formatter.png",
        width: 1200,
        height: 630,
        alt: "Online Code Formatter & Validator Tool",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Online Code Formatter & Validator",
    description:
      "Format and validate JSON, CSV, XML, YAML, HTML, and JS online. Smart detection & instant beautification.",
    images: ["/og-formatter.png"],
  },
  alternates: {
    canonical: "https://onlineutilities.org/formatter",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function Page() {
  return <FormatterPage />;
}
