import { ColorPicker } from "@/features/color-picker/pages/color-picker-page";
import { GradientBackground } from "@/features/shared/ui/gradient-background";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Color Picker",
  description:
    "Advanced color picker tool with support for multiple color formats, screen color picking, and image color extraction. Get HEX, RGB, HSL, HSV, CMYK, and LAB values instantly.",
  keywords: [
    "color picker",
    "online color picker",
    "color palette",
    "hex color picker",
    "rgb color picker",
    "hsl color picker",
    "hsv color picker",
    "cmyk color picker",
    "lab color picker",
    "screen color picker",
    "eyedropper tool",
    "image color extraction",
    "color formats",
    "color harmony",
    "complementary colors",
    "triadic colors",
    "color wheel",
    "free color tool",
  ],
  openGraph: {
    title: "Color Picker",
    description:
      "Advanced color picker with multiple formats, screen picking, and image color extraction.",
    type: "website",
  },
  alternates: {
    canonical: "https://onlineutilities.org/color-picker",
  },
};

export default function ColorPickerPage() {
  return (
    <>
      <GradientBackground />
      <ColorPicker />
    </>
  );
}
