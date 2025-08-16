import { SidebarInset } from "@/features/shared/ui/sidebar";
import { NotepadSidebar } from "@/features/notepad/components/notepad-sidebar";
import { NotepadProvider } from "@/features/notepad/lib/notepad-context";

interface NotepadLayoutProps {
  children: React.ReactNode;
}

export default function NotepadLayout({ children }: NotepadLayoutProps) {
  return (
    <NotepadProvider>
      <div className="flex flex-row h-[calc(100vh-3rem)] pt-2">
        <NotepadSidebar />
        <SidebarInset className="flex-1 flex flex-col overflow-hidden">
          {children}
        </SidebarInset>
      </div>
    </NotepadProvider>
  );
}
