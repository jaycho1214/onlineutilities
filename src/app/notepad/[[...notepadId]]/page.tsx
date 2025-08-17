import { Notepad } from "@/features/notepad/pages/notepad-page";

export default function Page() {
  return <Notepad />;
}

export const metadata = {
  title: "Notepad",
  description: "Free online notepad and text editor with automatic browser storage. Create, edit, and organize notes with markdown support. No registration required.",
  keywords: [
    "notepad",
    "online notepad",
    "text editor",
    "notes",
    "markdown editor",
    "auto save",
    "browser storage",
    "free notepad",
  ],
  openGraph: {
    title: "Notepad",
    description: "Free online notepad and text editor with automatic browser storage and markdown support.",
    type: "website",
  },
  alternates: {
    canonical: "https://onlineutilities.org/notepad",
  },
};
