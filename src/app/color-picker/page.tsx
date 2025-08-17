import { ColorPicker } from "@/features/color-picker/pages/color-picker-page";
import { GradientBackground } from "@/features/shared/ui/gradient-background";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Color Picker",
  description: "Advanced color picker tool with support for multiple color formats, screen color picking, and image color extraction. Get HEX, RGB, HSL, HSV, CMYK, and LAB values.",
  keywords: [
    "color picker",
    "color palette",
    "hex color",
    "rgb color",
    "hsl color",
    "hsv color",
    "cmyk color",
    "lab color",
    "screen color picker",
    "image color extraction",
    "color formats",
    "color harmony",
    "complementary colors",
    "triadic colors",
    "eyedropper",
    "color tool"
  ],
};

export default function ColorPickerPage() {
  return (
    <>
      <GradientBackground />
      <ColorPicker />
    </>
  );
}