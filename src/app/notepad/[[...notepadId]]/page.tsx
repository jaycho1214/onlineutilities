import { NotepadPage } from "@/features/notepad/components/notepad-page";

interface NotepadPageProps {
  params: Promise<{
    notepadId?: string[];
  }>;
}

export default async function Page({ params }: NotepadPageProps) {
  const { notepadId } = await params;
  // Extract the ID from the array - if array is empty or undefined, we're on /notepad
  const id = notepadId?.[0];
  return <NotepadPage notepadId={id} />;
}

export const metadata = {
  title: "Notepad",
  description: "Quick notes and text editor with automatic browser storage",
};
