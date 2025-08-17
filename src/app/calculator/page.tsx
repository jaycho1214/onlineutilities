import { CalculatorPage } from "@/features/calculator/components/calculator-page";
import { GradientBackground } from "@/features/shared/ui/gradient-background";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Calculator",
  description:
    "Free online calculator for basic arithmetic operations. Includes calculation history, keyboard support, and clean interface. No download required.",
  keywords: [
    "calculator",
    "online calculator",
    "free calculator",
    "arithmetic",
    "math calculator",
    "calculation history",
    "web calculator",
  ],
  openGraph: {
    title: "Calculator",
    description:
      "Free online calculator for basic arithmetic operations with calculation history and keyboard support.",
    type: "website",
  },
  alternates: {
    canonical: "https://onlineutilities.org/calculator",
  },
};

export default function Calculator() {
  return (
    <>
      <GradientBackground />
      <CalculatorPage />
    </>
  );
}
