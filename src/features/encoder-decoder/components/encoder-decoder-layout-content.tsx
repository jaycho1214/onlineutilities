"use client";

import { SidebarInset } from "@/features/shared/ui/sidebar";
import { EncoderDecoderSidebar } from "./encoder-decoder-sidebar";

interface EncoderDecoderLayoutContentProps {
  children: React.ReactNode;
}

export function EncoderDecoderLayoutContent({
  children,
}: EncoderDecoderLayoutContentProps) {
  return (
    <div className="flex flex-row h-[calc(100vh-3rem)] pt-2">
      <EncoderDecoderSidebar />
      <SidebarInset className="flex-1 flex flex-col overflow-hidden">
        {children}
      </SidebarInset>
    </div>
  );
}
