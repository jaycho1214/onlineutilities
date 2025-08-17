import { CalculatorPage } from "@/features/calculator/components/calculator-page";
import { GradientBackground } from "@/features/shared/ui/gradient-background";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Calculator",
  description:
    "Basic calculator with arithmetic operations and calculation history",
};

export default function Calculator() {
  return (
    <>
      <GradientBackground />
      <CalculatorPage />
    </>
  );
}
