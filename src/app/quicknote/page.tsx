import { Quicknote } from "@/features/quicknote/pages/quicknote-page";

export default function Page() {
  return <Quicknote />;
}

export const metadata = {
  title: "Quicknote",
  description:
    "Lightning-fast note taking with instant saving. Simple, fast, and distraction-free note editor with automatic localStorage persistence.",
  keywords: [
    "quicknote",
    "fast notes",
    "instant save",
    "simple notepad",
    "local storage",
    "text editor",
    "note taking",
    "minimal",
  ],
  openGraph: {
    title: "Quicknote - Lightning-fast note taking",
    description:
      "Lightning-fast note taking with instant saving. Simple and distraction-free.",
    type: "website",
  },
  alternates: {
    canonical: "https://onlineutilities.org/quicknote",
  },
};
