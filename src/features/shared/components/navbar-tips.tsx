"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { AnimatedTips } from "@/features/shared/ui/animated-tips";

// Helper function to get feature key from pathname
const getFeatureKeyFromPathname = (pathname: string): string | null => {
  if (pathname.startsWith("/notepad")) return "notepad";
  if (pathname.startsWith("/timer")) return "timer";
  if (pathname.startsWith("/stopwatch")) return "stopwatch";
  if (pathname.startsWith("/qr-code")) return "qr-code";
  if (pathname.startsWith("/color-picker")) return "color-picker";
  if (pathname.startsWith("/formatter")) return "formatter";
  if (pathname.startsWith("/random-generator")) return "random-generator";
  if (pathname.startsWith("/text-diff")) return "text-diff";
  return null;
};

export const NavbarTips: React.FC = () => {
  const pathname = usePathname();
  const navbarTipsT = useTranslations("NavbarTips");

  // Determine which feature tips to show based on pathname
  const featureKey = React.useMemo(() => {
    return getFeatureKeyFromPathname(pathname);
  }, [pathname]);

  // Get tips from translations based on the current feature
  const tips = React.useMemo(() => {
    if (!featureKey) return [];

    try {
      const tipsArray = navbarTipsT.raw(featureKey);
      return Array.isArray(tipsArray) ? tipsArray : [];
    } catch {
      // Feature tips don't exist yet, return empty array
      return [];
    }
  }, [navbarTipsT, featureKey]);

  if (tips.length === 0) {
    return null;
  }

  return (
    <div className="hidden md:block xl:min-w-[400px] 2xl:min-w-[500px]">
      <AnimatedTips
        tips={tips}
        className="text-sm text-muted-foreground/80"
        randomOrder={true}
      />
    </div>
  );
};
