"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/features/shared/ui/dialog";
import { Button } from "@/features/shared/ui/button";
import { Download, Copy, FileText, FileCode, FileJson } from "lucide-react";
import { useTextDiff } from "../lib/text-diff-context";
import { exportFormats } from "../lib/diff-engine";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface TextDiffExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type ExportFormat = "unified" | "json" | "markdown" | "html";

export function TextDiffExportDialog({
  open,
  onOpenChange,
}: TextDiffExportDialogProps) {
  const t = useTranslations("TextDiff");
  const { state } = useTextDiff();
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>("unified");

  const handleExport = () => {
    if (!state.diffResult) return;

    let content: string;
    let filename: string;
    let mimeType: string;

    switch (selectedFormat) {
      case "unified":
        content = exportFormats.unifiedDiff(
          state.originalText,
          state.modifiedText,
          state.diffOptions
        );
        filename = "diff.patch";
        mimeType = "text/plain";
        break;
      case "json":
        content = exportFormats.json(state.diffResult);
        filename = "diff.json";
        mimeType = "application/json";
        break;
      case "markdown":
        content = exportFormats.markdown(state.diffResult);
        filename = "diff.md";
        mimeType = "text/markdown";
        break;
      case "html":
        content = exportFormats.html(state.diffResult);
        filename = "diff.html";
        mimeType = "text/html";
        break;
    }

    // Create blob and download
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success(t("notifications.exported"));
    onOpenChange(false);
  };

  const handleCopyToClipboard = async () => {
    if (!state.diffResult) return;

    let content: string;
    switch (selectedFormat) {
      case "unified":
        content = exportFormats.unifiedDiff(
          state.originalText,
          state.modifiedText,
          state.diffOptions
        );
        break;
      case "json":
        content = exportFormats.json(state.diffResult);
        break;
      case "markdown":
        content = exportFormats.markdown(state.diffResult);
        break;
      case "html":
        content = exportFormats.html(state.diffResult);
        break;
    }

    try {
      await navigator.clipboard.writeText(content);
      toast.success(t("notifications.copied"));
    } catch {
      toast.error(t("notifications.copyError"));
    }
  };

  const formats = [
    {
      id: "unified" as ExportFormat,
      name: t("export.formats.diff"),
      icon: FileText,
      description: "Standard patch format compatible with Git and other tools",
    },
    {
      id: "json" as ExportFormat,
      name: t("export.formats.json"),
      icon: FileJson,
      description: "Structured data format for programmatic use",
    },
    {
      id: "markdown" as ExportFormat,
      name: "Markdown",
      icon: FileText,
      description: "Formatted text with syntax highlighting for documentation",
    },
    {
      id: "html" as ExportFormat,
      name: t("export.formats.html"),
      icon: FileCode,
      description: "Standalone web page with styled diff visualization",
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="size-5" />
            {t("export.title")}
          </DialogTitle>
          <DialogDescription>
            Choose a format to export your diff comparison
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 my-4">
          {formats.map((format) => {
            const Icon = format.icon;
            return (
              <button
                key={format.id}
                onClick={() => setSelectedFormat(format.id)}
                className={cn(
                  "w-full p-3 rounded-lg border text-left transition-all",
                  selectedFormat === format.id
                    ? "bg-primary/10 border-primary"
                    : "bg-background/50 border-border hover:bg-muted/50"
                )}
              >
                <div className="flex items-start gap-3">
                  <Icon className="size-5 mt-0.5 text-muted-foreground" />
                  <div className="flex-1">
                    <div className="font-medium text-sm text-foreground">
                      {format.name}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {format.description}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            size="sm"
          >
            {t("actions.close")}
          </Button>
          <Button variant="outline" onClick={handleCopyToClipboard} size="sm">
            <Copy className="size-4" />
            {t("actions.copy")}
          </Button>
          <Button onClick={handleExport} size="sm">
            <Download className="size-4" />
            {t("actions.download")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
