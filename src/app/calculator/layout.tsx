import { SidebarInset } from "@/features/shared/ui/sidebar";
import { CalculatorSidebar } from "@/features/calculator/components/calculator-sidebar";
import { CalculatorProvider } from "@/features/calculator/lib/calculator-context";

interface CalculatorLayoutProps {
  children: React.ReactNode;
}

export default function CalculatorLayout({ children }: CalculatorLayoutProps) {
  return (
    <CalculatorProvider>
      <div className="flex flex-row h-[calc(100vh-3rem)] pt-2">
        <CalculatorSidebar />
        <SidebarInset className="flex-1 flex flex-col overflow-hidden">
          {children}
        </SidebarInset>
      </div>
    </CalculatorProvider>
  );
}