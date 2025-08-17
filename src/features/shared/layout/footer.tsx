"use client";

import { GlassSurface } from "@/features/shared/ui/glass-surface";
import { Button } from "@/features/shared/ui/button";
import Link from "next/link";
import { useTranslations } from "next-intl";

export function Footer() {
  const t = useTranslations("Footer");
  
  return (
    <footer className="relative bottom-0 inset-x-0 p-4 w-full">
      <div className="flex flex-col gap-2 sm:flex-row justify-center sm:justify-between items-end text-xs">
        <GlassSurface className="py-2 px-4">
          <p className="text-center text-muted-foreground">
            {t("copyright")}
          </p>
        </GlassSurface>
        <GlassSurface className="py-2 px-4">
          <div className="flex flex-row gap-2 justify-center">
            <Button variant="link" disableGlass asChild>
              <Link href="/privacy" className="text-xs">
                {t("privacyPolicy")}
              </Link>
            </Button>
            <p className="text-muted-foreground">·</p>
            <Button variant="link" disableGlass asChild>
              <Link
                href="https://github.com/jaycho1214"
                target="_blank"
                className="text-xs"
              >
                {t("github")}
              </Link>
            </Button>
          </div>
        </GlassSurface>
      </div>
    </footer>
  );
}
