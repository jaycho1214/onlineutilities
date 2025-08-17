import { QRCodeGenerator } from "@/features/qr-code/components/qr-code-generator";
import { getTranslations } from "next-intl/server";

export async function generateMetadata() {
  const t = await getTranslations("QRCode");
  
  return {
    title: `${t("title")} - Online Utilities`,
    description: t("description"),
  };
}

export default function Page() {
  return <QRCodeGenerator />;
}