"use client";

import { useCallback, memo } from "react";
import { ActionButton } from "@/features/shared/ui/action-button";
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
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  Sidebar,
} from "@/features/shared/ui/sidebar";
import { cn } from "@/lib/utils";

function FormatterSidebarComponent() {
  const t = useTranslations("Formatter");
  const { history, isLoading, clearHistory, loadHistoryItem } = useFormatter();

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
            <p className="text-xs">Format text to see history</p>
          </div>
        ) : (
          <SidebarMenu>
            {history.map((entry) => (
              <SidebarMenuItem key={entry.id}>
                <SidebarMenuButton
                  onClick={() => handleLoadHistoryItem(entry)}
                  className="flex flex-col items-start h-auto py-2 transition-all duration-150 cursor-pointer hover:bg-accent/50"
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "text-xs font-semibold uppercase",
                          getTypeColor(entry.type),
                        )}
                      >
                        {entry.type}
                      </span>
                      <div className="flex items-center gap-1">
                        {getOperationIcon(entry.operation)}
                        <span className="text-xs">{entry.operation}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {entry.isValid ? (
                        <CheckCircle className="h-3 w-3 text-green-500" />
                      ) : (
                        <XCircle className="h-3 w-3 text-red-500" />
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-start w-full mt-1">
                    <p className="text-xs text-muted-foreground line-clamp-2 text-left font-mono">
                      {entry.input.length > 60
                        ? `${entry.input.substring(0, 60)}...`
                        : entry.input}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatTimestamp(entry.createdAt)}
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

export const FormatterSidebar = memo(FormatterSidebarComponent);
