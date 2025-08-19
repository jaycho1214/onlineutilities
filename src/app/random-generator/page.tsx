import { RandomGeneratorPage } from "@/features/random-generator/pages/random-generator-page";
import { GradientBackground } from "@/features/shared/ui/gradient-background";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Random Generator",
  description:
    "Generate secure passwords, UUIDs, random numbers, strings and more. Customizable random generators with history and presets. All processing happens locally.",
  keywords: [
    "random generator",
    "password generator",
    "uuid generator",
    "nanoid generator",
    "random number",
    "random string",
    "secure password",
    "entropy",
    "random tools",
  ],
  openGraph: {
    title: "Random Generator",
    description:
      "Generate secure passwords, UUIDs, random numbers, strings and more with customizable options.",
    type: "website",
  },
  alternates: {
    canonical: "https://onlineutilities.org/random-generator",
  },
};

export default function RandomGenerator() {
  return (
    <>
      <GradientBackground />
      <RandomGeneratorPage />
    </>
  );
}
