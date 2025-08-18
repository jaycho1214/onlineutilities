import React from "react";
import { useTranslations } from "next-intl";

export const ColorPickerHeader: React.FC = () => {
  const t = useTranslations("ColorPicker");

  return (
    <div className="text-left space-y-2">
      <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
        {t("title")}
      </h1>
      <p className="text-muted-foreground">{t("description")}</p>
    </div>
  );
};
