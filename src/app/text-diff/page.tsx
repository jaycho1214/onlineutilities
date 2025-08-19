import { TextDiffPage } from "@/features/text-diff/pages/text-diff-page";
import { GradientBackground } from "@/features/shared/ui/gradient-background";
import type { Metadata } from "next";

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
  openGraph: {
    title: "Text Diff",
    description:
      "Compare two texts and visualize differences with git-like formatting and interactive merge capabilities.",
    type: "website",
  },
  alternates: {
    canonical: "https://onlineutilities.org/text-diff",
  },
};

export default function TextDiff() {
  return (
    <>
      <GradientBackground />
      <TextDiffPage />
    </>
  );
}
