"use client";

import { useCallback, memo } from "react";
import { Button } from "@/features/shared/ui/button";
import {
  Trash2,
  Loader2,
  Copy,
  FileText,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useFormatter } from "../lib/formatter-context";
import {
  SidebarHeader,
  SidebarContent,
  Sidebar,
} from "@/features/shared/ui/sidebar";
import { cn } from "@/lib/utils";

function FormatterSidebarComponent() {
  const t = useTranslations("Formatter");
  const { history, isLoading, clearHistory, loadHistoryItem } = useFormatter();

  const copyToClipboard = useCallback(
    async (text: string, type: "input" | "output") => {
      try {
        await navigator.clipboard.writeText(text);
        if (type === "input") {
          toast.success(t("notifications.inputCopied"));
        } else {
          toast.success(t("notifications.outputCopied"));
        }
      } catch {
        toast.error(t("notifications.copyError"));
      }
    },
    [t],
  );

  const handleClearHistory = useCallback(async () => {
    await clearHistory();
  }, [clearHistory]);

  const handleLoadHistoryItem = useCallback(
    (entry: (typeof history)[0]) => {
      loadHistoryItem(entry);
      toast.success("Loaded from history");
    },
    [loadHistoryItem],
  );

  const formatTimestamp = useCallback((timestamp: string) => {
    return new Date(timestamp).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }, []);

  const getOperationIcon = useCallback((operation: string) => {
    switch (operation) {
      case "format":
        return <FileText className="h-3 w-3" />;
      case "validate":
        return <CheckCircle className="h-3 w-3" />;
      case "minify":
        return <Copy className="h-3 w-3" />;
      default:
        return <FileText className="h-3 w-3" />;
    }
  }, []);

  const getTypeColor = useCallback((type: string) => {
    switch (type) {
      case "json":
        return "text-blue-400";
      case "csv":
        return "text-green-400";
      case "xml":
        return "text-yellow-400";
      default:
        return "text-foreground/70";
    }
  }, []);

  return (
    <Sidebar
      className="h-full"
      side="left"
      variant="floating"
      collapsible="offcanvas"
      style={
        {
          "--sidebar-width": "25rem", // 400px
        } as React.CSSProperties
      }
    >
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
            history.map((entry) => (
              <div
                key={entry.id}
                className="p-2 border border-black/20 dark:border-white/10 rounded-lg bg-black/5 dark:bg-transparent hover:bg-black/10 dark:hover:bg-white/5 transition-colors cursor-pointer group"
                onClick={() => handleLoadHistoryItem(entry)}
              >
                {/* Header with type, operation, and timestamp */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "text-xs font-semibold uppercase",
                        getTypeColor(entry.type),
                      )}
                    >
                      {entry.type}
                    </span>
                    <div className="flex items-center gap-1 text-foreground/50">
                      {getOperationIcon(entry.operation)}
                      <span className="text-xs">{entry.operation}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {entry.isValid ? (
                      <CheckCircle className="h-3 w-3 text-green-500" />
                    ) : (
                      <XCircle className="h-3 w-3 text-red-500" />
                    )}
                    <span className="text-xs text-foreground/50">
                      {formatTimestamp(entry.timestamp)}
                    </span>
                  </div>
                </div>

                {/* Input preview */}
                <div className="mb-2">
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-xs text-foreground/50">Input:</div>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        copyToClipboard(entry.input, "input");
                      }}
                      variant="ghost"
                      className="h-6 w-6 p-0 opacity-50 hover:opacity-100"
                    >
                      <Copy className="size-3" />
                    </Button>
                  </div>
                  <div className="text-sm text-foreground/80 font-mono bg-black/20 p-2 rounded text-ellipsis overflow-hidden">
                    {entry.input.length > 100
                      ? `${entry.input.substring(0, 100)}...`
                      : entry.input}
                  </div>
                </div>

                {/* Output preview (for successful operations) */}
                {entry.isValid && entry.operation !== "validate" && (
                  <div className="mb-2">
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-xs text-foreground/50">Output:</div>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          copyToClipboard(entry.output, "output");
                        }}
                        variant="ghost"
                        className="h-6 w-6 p-0 opacity-50 hover:opacity-100"
                      >
                        <Copy className="size-3" />
                      </Button>
                    </div>
                    <div className="text-sm text-foreground/80 font-mono bg-black/20 p-2 rounded text-ellipsis overflow-hidden">
                      {entry.output.length > 100
                        ? `${entry.output.substring(0, 100)}...`
                        : entry.output}
                    </div>
                  </div>
                )}

                {/* Error message (for failed operations) */}
                {!entry.isValid && (
                  <div className="mb-2">
                    <div className="text-xs text-red-600 dark:text-red-400 mb-1">
                      Error:
                    </div>
                    <div className="text-sm text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900/20 p-2 rounded border border-red-300 dark:border-red-800">
                      {entry.output}
                    </div>
                  </div>
                )}

                {/* CSV delimiter info */}
                {entry.type === "csv" && entry.delimiter && (
                  <div className="text-xs text-foreground/50">
                    Delimiter: {entry.delimiter}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </SidebarContent>
    </Sidebar>
  );
}

export const FormatterSidebar = memo(FormatterSidebarComponent);
