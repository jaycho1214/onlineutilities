import { TextDiffProvider } from "@/features/text-diff/lib/text-diff-context";
import { Sidebar } from "@/features/shared/ui/sidebar";
import { TextDiffHistorySidebar } from "@/features/text-diff/components/text-diff-history-sidebar";

export default function TextDiffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TextDiffProvider>
      <div className="flex min-h-screen">
        <Sidebar>
          <TextDiffHistorySidebar />
        </Sidebar>
        <div className="flex-1">
          {children}
        </div>
      </div>
    </TextDiffProvider>
  );
}