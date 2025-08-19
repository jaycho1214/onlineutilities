"use client";

import { useState, useCallback, memo, useEffect } from "react";
import { GradientBackground } from "@/features/shared/ui/gradient-background";
import { Button } from "@/features/shared/ui/button";
import {
  ButtonGroup,
  ButtonGroupItem,
} from "@/features/shared/ui/button-group";
import { Textarea } from "@/features/shared/ui/textarea";
import { CopyButton } from "@/features/shared/components/copy-button";
import { useTranslations } from "next-intl";
import { useFormatter } from "../lib/formatter-context";
import { cn } from "@/lib/utils";
import { DragOverlay } from "../components/drag-overlay";
import { FormatDetectionDialog } from "../components/format-detection-dialog";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/features/shared/ui/command";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/features/shared/ui/select";
import {
  Code2,
  FileText,
  CheckCircle,
  XCircle,
  RotateCcw,
  Minimize2,
  Eye,
  Table,
  AlertCircle,
  ChevronDown,
  Globe,
  Braces,
} from "lucide-react";
import type { FormatterType, CsvDelimiter } from "../types";
import {
  getAvailableFormatters,
  formatterSupports,
} from "../lib/enhanced-formatter-utils";

function FormatterPageComponent() {
  const t = useTranslations("Formatter");
  const {
    state,
    setType,
    setInput,
    setCsvDelimiter,
    setCsvViewMode,
    setTabSize,
    setUseTabs,
    formatInput,
    validateInput,
    minifyInput,
    clearAll,
    copyInput,
    copyOutput,
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleDrop,
    pasteToInput,
    autoCopyOutput,
  } = useFormatter();

  // Local state for UI
  const [inputFocused, setInputFocused] = useState(false);
  const [outputFocused, setOutputFocused] = useState(false);
  const [formatterDialogOpen, setFormatterDialogOpen] = useState(false);
  const [showDetectionDialog, setShowDetectionDialog] = useState(false);
  const [detectionData, setDetectionData] = useState<{
    detectedFormat: FormatterType;
    confidence: number;
    alternatives?: Array<{ format: FormatterType; confidence: number }>;
    fileName?: string;
  } | null>(null);

  // Get available formatters for the UI
  const availableFormatters = getAvailableFormatters();

  // Auto paste/copy keyboard event listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle shortcuts when the page has focus and not typing in inputs
      const isTypingInInput =
        document.activeElement?.tagName === "TEXTAREA" ||
        document.activeElement?.tagName === "INPUT";

      if (isTypingInInput) return;

      const isCmd = e.metaKey || e.ctrlKey;

      // Auto paste (Ctrl/Cmd + V)
      if (isCmd && e.key === "v") {
        e.preventDefault();
        pasteToInput();
      }

      // Auto copy (Ctrl/Cmd + C)
      if (isCmd && e.key === "c") {
        e.preventDefault();
        autoCopyOutput();
      }
    };

    // Add event listeners
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [pasteToInput, autoCopyOutput]);

  const handleTypeChange = useCallback(
    (value: string) => {
      setType(value as FormatterType);
      setFormatterDialogOpen(false);
    },
    [setType]
  );

  const handleDelimiterChange = useCallback(
    (value: string) => {
      setCsvDelimiter(value as CsvDelimiter);
    },
    [setCsvDelimiter]
  );

  const handleViewModeChange = useCallback(
    (mode: "raw" | "table") => {
      setCsvViewMode(mode);
    },
    [setCsvViewMode]
  );

  const handleIndentTypeChange = useCallback(
    (value: string) => {
      setUseTabs(value === "tabs");
    },
    [setUseTabs]
  );

  // Format detection dialog handlers
  const handleFormatDetectionConfirm = useCallback(
    (selectedFormat: FormatterType) => {
      setType(selectedFormat);
      setShowDetectionDialog(false);
      setDetectionData(null);
    },
    [setType]
  );

  const handleFormatDetectionClose = useCallback(() => {
    setShowDetectionDialog(false);
    setDetectionData(null);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setInput(e.target.value);
    },
    [setInput]
  );

  // Page-level drag and drop is handled on the main container

  const getTypeIcon = useCallback((type: FormatterType) => {
    switch (type) {
      case "json":
        return <Code2 className="h-4 w-4" />;
      case "csv":
        return <Table className="h-4 w-4" />;
      case "xml":
        return <FileText className="h-4 w-4" />;
      case "javascript":
        return <Braces className="h-4 w-4" />;
      case "html":
        return <Globe className="h-4 w-4" />;
      case "yaml":
        return <FileText className="h-4 w-4" />;
      default:
        return <Code2 className="h-4 w-4" />;
    }
  }, []);

  const getStatusIcon = useCallback(() => {
    if (state.validationError) {
      return <XCircle className="h-4 w-4 text-red-500" />;
    }
    if (state.isValid && state.output) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    return null;
  }, [state.isValid, state.output, state.validationError]);

  const renderCsvTable = useCallback(() => {
    if (!state.csvTableData) return null;

    return (
      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              {state.csvTableData.headers.map((header, index) => (
                <th
                  key={index}
                  className="px-3 py-2 text-left text-foreground/80 font-medium"
                >
                  {header || `Column ${index + 1}`}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {state.csvTableData.rows.map((row, rowIndex) => (
              <tr key={rowIndex} className="border-b border-white/5">
                {row.map((cell, cellIndex) => (
                  <td
                    key={cellIndex}
                    className="px-3 py-2 text-foreground/70 font-mono text-xs"
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }, [state.csvTableData]);

  return (
    <div
      className="h-full flex flex-col overflow-hidden"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <GradientBackground enhanced />
      <div className="flex-1 p-4 sm:p-6 min-h-0">
        <div className="h-full flex flex-col gap-3 sm:gap-4 min-h-0">
          {/* Header Controls */}
          <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center justify-between flex-shrink-0 w-full">
            <div className="flex flex-wrap items-center gap-3 min-w-0">
              <Button
                onClick={() => setFormatterDialogOpen(true)}
                variant="outline"
                className="h-10 px-4 flex items-center gap-2 hover:bg-white/5"
                title="Click to change formatter"
              >
                {getTypeIcon(state.type)}
                <span className="font-medium">
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {t(`types.${state.type}` as any)}
                </span>
                <ChevronDown className="h-4 w-4 ml-1 opacity-50" />
              </Button>

              {/* CSV-specific controls */}
              {state.type === "csv" && (
                <>
                  <Select
                    value={state.csvDelimiter}
                    onValueChange={handleDelimiterChange}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="comma">
                        {t("csv.delimiters.comma")}
                      </SelectItem>
                      <SelectItem value="semicolon">
                        {t("csv.delimiters.semicolon")}
                      </SelectItem>
                      <SelectItem value="tab">
                        {t("csv.delimiters.tab")}
                      </SelectItem>
                      <SelectItem value="pipe">
                        {t("csv.delimiters.pipe")}
                      </SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="flex border border-white/10 rounded-lg overflow-hidden">
                    <Button
                      onClick={() => handleViewModeChange("raw")}
                      variant={
                        state.csvViewMode === "raw" ? "default" : "ghost"
                      }
                      size="sm"
                      className="rounded-none border-0"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      {t("csv.rawView")}
                    </Button>
                    <Button
                      onClick={() => handleViewModeChange("table")}
                      variant={
                        state.csvViewMode === "table" ? "default" : "ghost"
                      }
                      size="sm"
                      className="rounded-none border-0 border-l border-white/10"
                    >
                      <Table className="h-4 w-4 mr-1" />
                      {t("csv.tableView")}
                    </Button>
                  </div>
                </>
              )}

              {/* Tab Configuration Controls (for JSON/XML) */}
              {(state.type === "json" || state.type === "xml") && (
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-sm text-foreground/60 whitespace-nowrap">
                    {t("labels.indent")}:
                  </span>
                  <Select
                    value={state.tabSize.toString()}
                    onValueChange={(value) => setTabSize(parseInt(value))}
                  >
                    <SelectTrigger className="w-16">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2">2</SelectItem>
                      <SelectItem value="4">4</SelectItem>
                      <SelectItem value="8">8</SelectItem>
                    </SelectContent>
                  </Select>
                  <ButtonGroup
                    value={state.useTabs ? "tabs" : "spaces"}
                    onValueChange={handleIndentTypeChange}
                    className="h-8 bg-black/10 dark:bg-white/5 backdrop-blur-md border border-white/10"
                  >
                    <ButtonGroupItem value="spaces" className="h-6 px-2">
                      {t("labels.spaces")}
                    </ButtonGroupItem>
                    <ButtonGroupItem value="tabs" className="h-6 px-2">
                      {t("labels.tabs")}
                    </ButtonGroupItem>
                  </ButtonGroup>
                </div>
              )}
            </div>

            {/* Status indicator */}
            <div className="flex items-center gap-2">
              {getStatusIcon()}
              {state.validationError && (
                <span className="text-sm text-red-400">
                  {t("validation.syntaxError")}
                  {state.validationError.line && (
                    <span className="ml-1">
                      {t("validation.line", {
                        line: state.validationError.line,
                      })}
                    </span>
                  )}
                </span>
              )}
              {state.isValid && state.output && (
                <span className="text-sm text-green-400">
                  {t("output.valid", { type: state.type.toUpperCase() })}
                </span>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-start">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 p-2 bg-black/10 dark:bg-white/5 backdrop-blur-md border border-white/10 rounded-xl">
              <Button
                onClick={formatInput}
                variant="action"
                disabled={!state.input.trim()}
                className="h-12 px-4 gap-2"
                size="sm"
              >
                <Code2 className="h-4 w-4" />
                {t("actions.format")}
              </Button>
              <Button
                onClick={validateInput}
                variant="ghost"
                disabled={!state.input.trim()}
                className="h-12 px-4 gap-2"
                size="sm"
              >
                <CheckCircle className="h-4 w-4" />
                {t("actions.validate")}
              </Button>
              {formatterSupports(state.type, "minify") ? (
                <Button
                  onClick={minifyInput}
                  variant="ghost"
                  disabled={!state.input.trim()}
                  className="h-12 px-4 gap-2"
                  size="sm"
                >
                  <Minimize2 className="h-4 w-4" />
                  {t("actions.minify")}
                </Button>
              ) : (
                <div />
              )}
              <Button
                onClick={clearAll}
                variant="destructive"
                disabled={!state.input.trim() && !state.output.trim()}
                className="h-12 px-4 gap-2"
                size="sm"
              >
                <RotateCcw className="h-4 w-4" />
                {t("actions.clear")}
              </Button>
            </div>
          </div>

          {/* Input/Output Areas */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-0 overflow-hidden">
            {/* Input Area */}
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-foreground/80">
                  {t("labels.input")}
                </h3>
                <CopyButton
                  size="sm"
                  variant="ghost"
                  title={t("actions.copy")}
                  onClick={() => copyInput()}
                />
              </div>

              <Textarea
                value={state.input}
                onChange={handleInputChange}
                onFocus={() => setInputFocused(true)}
                onBlur={() => setInputFocused(false)}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                placeholder={t(`input.placeholder.${state.type}` as any)}
                className={cn(
                  "flex-1 h-full p-4 rounded-xl font-mono text-sm text-foreground/90 placeholder:text-foreground/40",
                  "transition-all duration-200",
                  inputFocused && "ring-2 ring-blue-500/50 border-blue-500/30",
                  state.dragDrop.isDragOver &&
                    "border-blue-500/50 bg-blue-500/5"
                )}
                spellCheck={false}
                disabled={state.fileLoading.isLoading}
              />
            </div>

            {/* Output Area */}
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-foreground/80">
                  {t("labels.output")}
                </h3>
                <CopyButton
                  size="sm"
                  variant="ghost"
                  title={t("actions.copy")}
                  onClick={() => copyOutput()}
                />
              </div>
              <div
                className={cn(
                  "flex-1 p-4 bg-black/10 dark:bg-white/5 backdrop-blur-md border border-white/10 rounded-xl",
                  "transition-all duration-200 flex flex-col",
                  outputFocused && "ring-2 ring-blue-500/50 border-blue-500/30"
                )}
              >
                {state.type === "csv" &&
                state.csvViewMode === "table" &&
                state.csvTableData ? (
                  renderCsvTable()
                ) : state.validationError ? (
                  <div className="flex items-start gap-3 text-red-400">
                    <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium mb-1">
                        {t("validation.syntaxError")}
                      </div>
                      <div className="text-sm text-red-300">
                        {state.validationError.message}
                      </div>
                      {state.validationError.line && (
                        <div className="text-xs text-red-300 mt-1">
                          {t("validation.line", {
                            line: state.validationError.line,
                          })}
                          {state.validationError.column && (
                            <span className="ml-2">
                              {t("validation.column", {
                                column: state.validationError.column,
                              })}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <Textarea
                    value={state.output}
                    onFocus={() => setOutputFocused(true)}
                    onBlur={() => setOutputFocused(false)}
                    placeholder={t("output.placeholder")}
                    className="h-full bg-transparent border-0 font-mono text-sm text-foreground/90 placeholder:text-foreground/40"
                    readOnly
                    spellCheck={false}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Page-level Drag Overlay */}
      <DragOverlay isVisible={state.dragDrop.isDragOver} />

      {/* Format Detection Dialog */}
      {detectionData && (
        <FormatDetectionDialog
          isOpen={showDetectionDialog}
          onClose={handleFormatDetectionClose}
          detectedFormat={detectionData.detectedFormat}
          confidence={detectionData.confidence}
          alternatives={detectionData.alternatives}
          currentFormat={state.type}
          onConfirm={handleFormatDetectionConfirm}
          fileName={detectionData.fileName}
        />
      )}

      {/* Formatter Selection Dialog */}
      <CommandDialog
        open={formatterDialogOpen}
        onOpenChange={setFormatterDialogOpen}
      >
        <CommandInput placeholder="Search formatters..." />
        <CommandList>
          <CommandEmpty>No formatter found</CommandEmpty>
          <CommandGroup heading="Available Formatters">
            {availableFormatters.map((formatter) => (
              <CommandItem
                key={formatter.id}
                value={formatter.id}
                onSelect={() => handleTypeChange(formatter.id)}
                className="flex items-center gap-3 py-3"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5">
                  {formatter.id === "json" && <Code2 className="h-5 w-5" />}
                  {formatter.id === "csv" && <Table className="h-5 w-5" />}
                  {formatter.id === "xml" && <FileText className="h-5 w-5" />}
                  {formatter.id === "javascript" && (
                    <Braces className="h-5 w-5" />
                  )}
                  {formatter.id === "html" && <Globe className="h-5 w-5" />}
                  {formatter.id === "yaml" && <FileText className="h-5 w-5" />}
                </div>
                <div className="flex flex-col">
                  <span className="font-medium">
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {t(`types.${formatter.id}` as any)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatter.extensions.slice(0, 3).join(", ")}
                    {formatter.extensions.length > 3 &&
                      ` +${formatter.extensions.length - 3} more`}
                  </span>
                </div>
                {state.type === formatter.id && (
                  <CheckCircle className="ml-auto h-4 w-4 text-green-500" />
                )}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </div>
  );
}

export const FormatterPage = memo(FormatterPageComponent);
