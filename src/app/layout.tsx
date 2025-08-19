import "./globals.css";

import type { Metadata } from "next";
import { EB_Garamond, Poppins } from "next/font/google";
import { Navbar } from "@/features/shared/layout/navbar";
import { ThemeProvider } from "@/features/shared/providers/theme-provider";
import { CommandProvider } from "@/features/shared/providers/command-provider";
import { CommandPalette } from "@/features/shared/ui/command-palette";
import { Toaster } from "@/features/shared/ui/sonner";
import { ErrorBoundary } from "@/features/shared/ui/error-boundary";
import { SidebarProvider } from "@/features/shared/ui/sidebar";
import { getLocale } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";

const ebGaramond = EB_Garamond({
  variable: "--font-eb-garamond",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://onlineutilities.org"),
  title: {
    default: "Online Utilities",
    template: "%s | Online Utilities",
  },
  description:
    "Free online tools and utilities for daily productivity. Calculator, timer, stopwatch, notepad, color picker, QR code generator and more. No registration required.",
  keywords: [
    "online tools",
    "web utilities",
    "free calculator",
    "online timer",
    "stopwatch",
    "notepad online",
    "color picker",
    "QR code generator",
    "productivity tools",
    "browser tools",
  ],
  authors: [{ name: "Online Utilities", url: "https://onlineutilities.org" }],
  creator: "Online Utilities",
  publisher: "Online Utilities",
  category: "Technology",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://onlineutilities.org",
    title: {
      default: "Online Utilities",
      template: "%s | Online Utilities",
    },
    description:
      "Free online tools and utilities for daily productivity. Calculator, timer, stopwatch, notepad, color picker, QR code generator and more.",
    siteName: "Online Utilities",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Online Utilities - Free Web Tools",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Online Utilities - Free Web Tools for Daily Tasks",
    description:
      "Free online tools and utilities for daily productivity. Calculator, timer, stopwatch, notepad, color picker, QR code generator and more.",
    images: ["/og-image.jpg"],
    creator: "@onlineutilities",
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
    yandex: process.env.YANDEX_VERIFICATION,
    yahoo: process.env.YAHOO_SITE_VERIFICATION,
  },
  alternates: {
    canonical: "https://onlineutilities.org",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={`${poppins.variable} ${ebGaramond.variable} font-sans antialiased`}
      >
        <NextIntlClientProvider>
          <ErrorBoundary>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <SidebarProvider>
                <CommandProvider>
                  <CommandPalette />
                  <Navbar />
                  <main className="pt-9">{children}</main>
                  <Toaster />
                </CommandProvider>
              </SidebarProvider>
            </ThemeProvider>
          </ErrorBoundary>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
