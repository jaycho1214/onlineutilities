import { RandomGeneratorProvider } from "@/features/random-generator/lib/random-generator-context";
import { RandomGeneratorSidebar } from "@/features/random-generator/components/random-generator-sidebar";

export default function RandomGeneratorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RandomGeneratorProvider>
      <div className="flex flex-row">
        <RandomGeneratorSidebar />
        <div className="flex-1">
          {children}
        </div>
      </div>
    </RandomGeneratorProvider>
  );
}
