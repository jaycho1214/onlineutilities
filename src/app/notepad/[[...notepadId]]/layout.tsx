import { SidebarInset } from "@/features/shared/ui/sidebar";
import { NotepadSidebar } from "@/features/notepad/components/notepad-sidebar";
import { NotepadProvider } from "@/features/notepad/lib/notepad-context";
import { GradientBackground } from "@/features/shared/ui/gradient-background";

interface NotepadLayoutProps {
  children: React.ReactNode;
  params: Promise<{
    notepadId?: string[];
  }>;
}

export default async function NotepadLayout({
  children,
  params,
}: NotepadLayoutProps) {
  const { notepadId } = await params;
  const id = notepadId?.[0];

  return (
    <NotepadProvider initialNoteId={id}>
      <GradientBackground enhanced={true} />
      <div className="flex flex-row h-[calc(100vh-3rem)] pt-2">
        <NotepadSidebar />
        <SidebarInset className="flex-1 flex flex-col overflow-hidden">
          {children}
        </SidebarInset>
      </div>
    </NotepadProvider>
  );
}
