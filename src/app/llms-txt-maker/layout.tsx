import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { SidebarInset } from "@/features/shared/ui/sidebar";
import { LlmsTxtMakerProvider } from "@/features/llms-txt-maker/lib/llms-txt-maker-context";
import { LlmsTxtMakerSidebar } from "@/features/llms-txt-maker/components/llms-txt-maker-sidebar";
import { GradientBackground } from "@/features/shared/ui/gradient-background";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("GitHubToLlmsTxt");

  return {
    title: t("title"),
    description: t("description"),
    keywords: [
      "llms.txt",
      "github",
      "repository",
      "markdown",
      "ai",
      "llm",
      "context",
      "documentation",
      "files",
      "generate",
      "machine learning",
      "artificial intelligence",
    ],
    openGraph: {
      title: t("title"),
      description: t("description"),
    },
  };
}

export default function LlmsTxtMakerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LlmsTxtMakerProvider>
      <GradientBackground enhanced={true} />
      <div className="flex flex-row h-[calc(100vh-3rem)] pt-2">
        <LlmsTxtMakerSidebar />
        <SidebarInset className="flex-1 flex flex-col overflow-hidden">
          {children}
        </SidebarInset>
      </div>
    </LlmsTxtMakerProvider>
  );
}
