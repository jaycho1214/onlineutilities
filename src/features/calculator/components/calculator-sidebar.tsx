"use client";

import { useCallback, memo } from "react";
import { Button } from "@/features/shared/ui/button";
import { Trash2, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useCalculator } from "../lib/calculator-context";
import {
  SidebarHeader,
  SidebarContent,
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
      <SidebarHeader className="flex flex-row items-center justify-between p-4">
        <h2 className="text-lg font-semibold text-foreground/90">
          {t("history.title")}
        </h2>
        {history.length > 0 && (
          <Button
            onClick={handleClearHistory}
            variant="outline"
            size="icon"
            className="h-8 w-8"
            title={t("history.clearAll")}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </SidebarHeader>

      <SidebarContent className="flex-1 p-4 pt-0">
        <div className="space-y-2">
          {isLoading ? (
            <div className="flex items-center justify-center h-32 text-foreground/60">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-6 w-6 animate-spin" />
                <p className="text-sm text-center">Loading history...</p>
              </div>
            </div>
          ) : history.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-foreground/60">
              <p className="text-sm text-center">{t("history.noHistory")}</p>
            </div>
          ) : (
            history.map((calc) => (
              <div
                key={calc.id}
                className="p-3 border border-white/10 rounded-lg bg-transparent hover:bg-white/5 transition-colors"
              >
                <div
                  className="text-sm text-foreground/70 cursor-pointer"
                  onClick={() => copyToClipboard(calc.expression, "expression")}
                  title={t("actions.copyExpression")}
                >
                  {calc.expression}
                </div>
                <div
                  className="text-lg font-mono text-foreground/90 cursor-pointer"
                  onClick={() => copyToClipboard(calc.result, "result")}
                  title={t("actions.copyResult")}
                >
                  = {calc.result}
                </div>
              </div>
            ))
          )}
        </div>
      </SidebarContent>
    </Sidebar>
  );
}

export const CalculatorSidebar = memo(CalculatorSidebarComponent);
