"use client";

import { usePathname } from "next/navigation";
import { utilities, getUtilityById } from "@/constants";

export function usePageTitle() {
  const pathname = usePathname();

  if (pathname === "/") {
    return "Online Utilities";
  }

  // First try to find by href (direct match)
  const utilityByHref = utilities.find((u) => u.href === pathname);
  if (utilityByHref) {
    return utilityByHref.name;
  }

  // Extract potential utility ID from pathname for nested routes
  // e.g., /notepad/settings -> notepad
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length > 0) {
    const potentialId = segments[0];
    const utilityById = getUtilityById(potentialId);
    if (utilityById) {
      return utilityById.name;
    }
  }

  // Handle special pages that aren't utilities
  const specialPages: Record<string, string> = {
    "/privacy": "Privacy Policy",
    "/not-found": "Page Not Found",
  };

  return specialPages[pathname] || "Online Utilities";
}
