import { SidebarInset } from "@/features/shared/ui/sidebar";
import { FormatterSidebar } from "@/features/formatter/components/formatter-sidebar";
import { FormatterProvider } from "@/features/formatter/lib/formatter-context";

export default function FormatterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <FormatterProvider>
      <div className="flex flex-row h-[calc(100vh-3rem)] pt-2">
        <FormatterSidebar />
        <SidebarInset className="flex-1 flex flex-col overflow-hidden">
          {children}
        </SidebarInset>
      </div>
    </FormatterProvider>
  );
}