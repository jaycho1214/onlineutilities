"use client";

import { useCallback, memo } from "react";
import { ActionButton } from "@/features/shared/ui/action-button";
import { Trash2, Loader2, FileText } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useCalculator } from "../lib/calculator-context";
import {
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  Sidebar,
} from "@/features/shared/ui/sidebar";

function CalculatorSidebarComponent() {
  const t = useTranslations("Calculator");
  const { history, isLoading, clearHistory } = useCalculator();

  const copyToClipboard = useCallback(
    async (text: string, type: string) => {
      try {
        await navigator.clipboard.writeText(text);
        if (type === "result") {
          toast.success(t("notifications.resultCopied"));
        } else {
          toast.success(t("notifications.expressionCopied"));
        }
      } catch (error) {
        console.error("Failed to copy to clipboard:", error);
      }
    },
    [t],
  );

  const handleClearHistory = useCallback(async () => {
    await clearHistory();
    toast.success(t("notifications.historyCleared"));
  }, [clearHistory, t]);

  return (
    <Sidebar className="h-full">
      <SidebarHeader className="flex-shrink-0">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">{t("history.title")}</h2>
          {history.length > 0 && (
            <ActionButton
              icon={<Trash2 />}
              onClick={handleClearHistory}
              variant="destructive"
              size="default"
              tooltip={t("history.clearAll")}
            />
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 text-center text-muted-foreground">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <p className="text-sm text-center">Loading history...</p>
            </div>
          </div>
        ) : history.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">{t("history.noHistory")}</p>
            <p className="text-xs">Calculations will appear here</p>
          </div>
        ) : (
          <SidebarMenu>
            {history.map((calc) => (
              <SidebarMenuItem key={calc.id}>
                <SidebarMenuButton className="flex flex-col items-start h-auto py-2 transition-all duration-150 cursor-pointer hover:bg-accent/50">
                  <div className="flex items-center justify-between w-full">
                    <span className="font-medium text-sm truncate">
                      {calc.expression}
                    </span>
                  </div>
                  <div className="flex flex-col items-start w-full mt-1">
                    <p
                      className="text-lg font-mono text-muted-foreground cursor-pointer"
                      onClick={() => copyToClipboard(calc.result, "result")}
                      title={t("actions.copyResult")}
                    >
                      = {calc.result}
                    </p>
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        )}
      </SidebarContent>
    </Sidebar>
  );
}

export const CalculatorSidebar = memo(CalculatorSidebarComponent);
