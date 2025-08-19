import { TextDiffProvider } from "@/features/text-diff/lib/text-diff-context";
import { TextDiffHistorySidebar } from "@/features/text-diff/components/text-diff-history-sidebar";

export default function TextDiffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TextDiffProvider>
      <div className="flex flex-row">
        <TextDiffHistorySidebar />
        <div className="flex-1">{children}</div>
      </div>
    </TextDiffProvider>
  );
}
