import { RandomGeneratorProvider } from "@/features/random-generator/lib/random-generator-context";
import { Sidebar } from "@/features/shared/ui/sidebar";
import { RandomGeneratorSidebar } from "@/features/random-generator/components/random-generator-sidebar";

export default function RandomGeneratorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RandomGeneratorProvider>
      <div className="flex min-h-screen">
        <Sidebar>
          <RandomGeneratorSidebar />
        </Sidebar>
        <div className="flex-1">
          {children}
        </div>
      </div>
    </RandomGeneratorProvider>
  );
}