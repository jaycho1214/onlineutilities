import { GradientBackground } from "@/features/shared/ui/gradient-background";
import { getTranslations } from "next-intl/server";

export default async function NotFound() {
  const t = await getTranslations("NotFound");
  return (
    <div className="max-w-2xl mx-auto p-6 pt-20">
      <GradientBackground />
      <div className="text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-6xl font-bold font-[family-name:var(--font-eb-garamond)] text-foreground/80">
            {t("title")}
          </h1>
          <h2 className="text-2xl font-semibold">{t("heading")}</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            {t("description")}
          </p>
        </div>
      </div>
    </div>
  );
}
