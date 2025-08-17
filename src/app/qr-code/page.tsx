import { QRCodeGenerator } from "@/features/qr-code/components/qr-code-generator";

export const metadata = {
  title: "QR Code Generator - Online Utilities",
  description:
    "Generate highly customizable QR codes with various styles, colors, logos, and download formats.",
};

export default function Page() {
  return <QRCodeGenerator />;
}