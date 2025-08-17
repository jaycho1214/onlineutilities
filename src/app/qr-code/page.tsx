import type { Metadata } from "next";
import { QRCodeGenerator } from "@/features/qr-code/pages/qr-code-generator-page";

export const metadata: Metadata = {
  title: "QR Code Generator",
  description:
    "Generate QR codes instantly for free. Create QR codes for URLs, text, emails, phone numbers, WiFi, and more. Customize colors, size, and download in multiple formats.",
  keywords: [
    "QR code generator",
    "free QR code",
    "QR code maker",
    "generate QR code",
    "QR code creator",
    "barcode generator",
    "URL QR code",
    "WiFi QR code",
    "text QR code",
    "email QR code",
    "phone QR code",
    "vCard QR code",
    "custom QR code",
  ],
  openGraph: {
    title: "QR Code Generator",
    description:
      "Generate QR codes instantly for URLs, text, emails, and more. Customize and download for free.",
    type: "website",
  },
  alternates: {
    canonical: "https://onlineutilities.org/qr-code",
  },
};

export default function Page() {
  return <QRCodeGenerator />;
}
