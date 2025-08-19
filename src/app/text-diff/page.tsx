import { TextDiffPage } from "@/features/text-diff/pages/text-diff-page";
import { TextDiffProvider } from "@/features/text-diff/lib/text-diff-context";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Text Diff",
  description:
    "Compare two texts and visualize differences with git-like formatting. Interactive merge capabilities and export options.",
  keywords: [
    "text diff",
    "compare text",
    "merge text",
    "git diff",
    "text comparison",
    "difference viewer",
  ],
};

// This component doesn't need to be a client component
// as it only wraps other components
export default function Page() {
  return (
    <TextDiffProvider>
      <TextDiffPage />
    </TextDiffProvider>
  );
}
