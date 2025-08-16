import type { Metadata } from "next";
import { EB_Garamond, Poppins } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/features/shared/layout/navbar";
import { ThemeProvider } from "@/features/shared/providers/theme-provider";
import { CommandProvider } from "@/features/shared/providers/command-provider";
import { CommandPalette } from "@/features/shared/ui/command-palette";
import { Toaster } from "@/features/shared/ui/sonner";
import { GradientBackground } from "@/features/shared/ui/gradient-background";
import { ErrorBoundary } from "@/features/shared/ui/error-boundary";
import { SidebarProvider } from "@/features/shared/ui/sidebar";

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
  title: {
    default: "Online Utilities",
    template: "%s | Online Utilities",
  },
  description:
    "Free online tools and utilities for daily tasks - gradient generator, notepad, timers, calculators, and more.",
  keywords: [
    "online tools",
    "utilities",
    "gradient generator",
    "notepad",
    "calculator",
    "timer",
    "free tools",
  ],
  authors: [{ name: "Online Utilities" }],
  creator: "Online Utilities",
  openGraph: {
    type: "website",
    title: "Online Utilities",
    description: "Free online tools and utilities for daily tasks",
    siteName: "Online Utilities",
  },
  twitter: {
    card: "summary_large_image",
    title: "Online Utilities",
    description: "Free online tools and utilities for daily tasks",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${poppins.variable} ${ebGaramond.variable} font-sans antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ErrorBoundary>
            <SidebarProvider>
              <CommandProvider>
                <CommandPalette />
                <Navbar />
                <main className="pt-9">{children}</main>
                <Toaster />
              </CommandProvider>
            </SidebarProvider>
          </ErrorBoundary>
        </ThemeProvider>
      </body>
    </html>
  );
}
