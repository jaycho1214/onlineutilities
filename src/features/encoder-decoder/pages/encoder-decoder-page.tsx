/**
 * Encoder/Decoder Page Component
 * 
 * Main page component for the encoder/decoder feature with glassmorphism styling.
 */

"use client";

import { useState, useCallback, memo, useEffect } from "react";
import { GradientBackground } from "@/features/shared/ui/gradient-background";
import { Button } from "@/features/shared/ui/button";
import { ButtonGroup, ButtonGroupItem } from "@/features/shared/ui/button-group";
import { Textarea } from "@/features/shared/ui/textarea";
import { CopyButton } from "@/features/shared/components/copy-button";
import { useTranslations } from "next-intl";
import { useEncoderDecoder } from "../lib/encoder-decoder-context";
import { cn } from "@/lib/utils";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/features/shared/ui/command";
import {
  Lock,
  UnlockKeyhole,
  ChevronDown,
  RotateCcw,
  AlertCircle,
  CheckCircle,
  Copy,
  Clipboard,
  FileText,
  Code,
  Hash,
  Binary,
  Globe,
  Shield,
  Cookie,
} from "lucide-react";
import { Switch } from "@/features/shared/ui/switch";
import { Label } from "@/features/shared/ui/label";
import type { EncodingType } from "../types";
import { getAvailableEncodings, getCategories } from "../encoders/encoder-registry";

function EncoderDecoderPageComponent() {
  const t = useTranslations("EncoderDecoder");
  const {
    state,
    setType,
    setOperation,
    setInput,
    processInput,
    clearAll,
    copyInput,
    copyOutput,
    pasteToInput,
    pasteToOutput,
    autoCopyOutput,
    toggleAutoConvert,
    toggleSaveHistory,
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleDrop,
  } = useEncoderDecoder();

  // Local state for UI
  const [inputFocused, setInputFocused] = useState(false);
  const [outputFocused, setOutputFocused] = useState(false);
  const [typeDialogOpen, setTypeDialogOpen] = useState(false);

  // Get available encodings
  const availableEncodings = getAvailableEncodings();
  const categories = getCategories();

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

  // Auto-copy on output focus
  useEffect(() => {
    if (outputFocused && state.output && !state.error) {
      const timer = setTimeout(() => {
        copyOutput();
      }, 100); // Small delay to ensure focus is established

      return () => clearTimeout(timer);
    }
  }, [outputFocused, state.output, state.error, copyOutput]);

  const handleTypeChange = useCallback(
    (value: string) => {
      setType(value as EncodingType);
      setTypeDialogOpen(false);
    },
    [setType],
  );

  const handleOperationChange = useCallback(
    (value: string) => {
      setOperation(value as "encode" | "decode");
    },
    [setOperation],
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setInput(e.target.value);
    },
    [setInput],
  );

  const handleOutputPaste = useCallback(
    (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
      e.preventDefault();
      pasteToOutput();
    },
    [pasteToOutput],
  );

  const handleOutputChange = useCallback(
    () => {
      // Only allow changes when input is empty (reversal mode)
      if (!state.input.trim()) {
        // For now, we don't allow direct editing of output
        // The paste handler will handle the reversal logic
        return;
      }
    },
    [state.input],
  );

  const getTypeIcon = useCallback((type: EncodingType) => {
    switch (type) {
      case "base64":
      case "base32":
      case "base58":
        return <Code className="h-4 w-4" />;
      case "url":
      case "uri-component":
        return <Globe className="h-4 w-4" />;
      case "html-entity":
      case "form-data":
        return <FileText className="h-4 w-4" />;
      case "hex":
      case "ascii":
        return <Hash className="h-4 w-4" />;
      case "binary":
        return <Binary className="h-4 w-4" />;
      case "unicode-escape":
      case "punycode":
        return <Globe className="h-4 w-4" />;
      case "rot13":
      case "morse-code":
        return <Shield className="h-4 w-4" />;
      case "cookie":
        return <Cookie className="h-4 w-4" />;
      default:
        return <Lock className="h-4 w-4" />;
    }
  }, []);

  const getStatusIcon = useCallback(() => {
    if (state.error) {
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
    if (state.output && !state.error) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    return null;
  }, [state.error, state.output]);


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
                onClick={() => setTypeDialogOpen(true)}
                variant="outline"
                className="h-10 px-4 flex items-center gap-2 hover:bg-white/5"
                title="Click to change encoding type"
              >
                {getTypeIcon(state.type)}
                <span className="font-medium">
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {t(`types.${state.type}` as any)}
                </span>
                <ChevronDown className="h-4 w-4 ml-1 opacity-50" />
              </Button>

              <ButtonGroup
                value={state.operation}
                onValueChange={handleOperationChange}
                className="h-10 bg-black/10 dark:bg-white/5 backdrop-blur-md border border-white/10"
              >
                <ButtonGroupItem value="encode" className="h-8">
                  <Lock className="h-4 w-4" />
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {t("operations.encode" as any)}
                </ButtonGroupItem>
                <ButtonGroupItem value="decode" className="h-8">
                  <UnlockKeyhole className="h-4 w-4" />
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {t("operations.decode" as any)}
                </ButtonGroupItem>
              </ButtonGroup>
            </div>

            {/* Status and Settings */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Switch
                  id="auto-convert"
                  checked={state.autoConvert}
                  onCheckedChange={toggleAutoConvert}
                />
                <Label htmlFor="auto-convert" className="text-sm">
                  {t("settings.autoConvert")}
                </Label>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  id="save-history"
                  checked={state.saveHistory}
                  onCheckedChange={toggleSaveHistory}
                />
                <Label htmlFor="save-history" className="text-sm">
                  {t("settings.saveHistory")}
                </Label>
              </div>

              {getStatusIcon()}
              {state.error && (
                <span className="text-sm text-red-400 max-w-xs truncate">
                  {state.error}
                </span>
              )}
              {state.output && !state.error && (
                <span className="text-sm text-green-400">
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {t(`status.${state.operation}Success` as any)}
                </span>
              )}
            </div>
          </div>

          {/* Size Limit Warning */}
          {state.sizeLimitExceeded && (
            <div className="flex items-center gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <AlertCircle className="h-4 w-4 text-yellow-500 flex-shrink-0" />
              <span className="text-sm text-yellow-200">
                {t("warnings.sizeLimitExceeded")}
              </span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-start">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 p-2 bg-black/10 dark:bg-white/5 backdrop-blur-md border border-white/10 rounded-xl">
              <Button
                onClick={processInput}
                variant="action"
                disabled={!state.input.trim() || state.isProcessing}
                className="h-12 px-4 gap-2"
                size="sm"
              >
                {state.operation === "encode" ? (
                  <Lock className="h-4 w-4" />
                ) : (
                  <UnlockKeyhole className="h-4 w-4" />
                )}
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {t(`actions.${state.operation}` as any)}
              </Button>
              <Button
                onClick={pasteToInput}
                variant="ghost"
                className="h-12 px-4 gap-2"
                size="sm"
              >
                <Clipboard className="h-4 w-4" />
                {t("actions.paste")}
              </Button>
              <Button
                onClick={copyOutput}
                variant="ghost"
                disabled={!state.output}
                className="h-12 px-4 gap-2"
                size="sm"
              >
                <Copy className="h-4 w-4" />
                {t("actions.copy")}
              </Button>
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
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-0">
            {/* Input Area */}
            <div className="flex flex-col p-1">
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
                placeholder={t("input.placeholder")}
                className={cn(
                  "flex-1 h-full p-4 rounded-xl font-mono text-sm text-foreground/90 placeholder:text-foreground/40",
                  "transition-all duration-200",
                  inputFocused && "ring-2 ring-blue-500/50 border-blue-500/30",
                  state.dragDrop.isDragOver &&
                    "border-blue-500/50 bg-blue-500/5",
                )}
                spellCheck={false}
                disabled={state.isProcessing}
              />
            </div>

            {/* Output Area */}
            <div className="flex flex-col p-1">
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
              <Textarea
                value={state.output}
                onChange={handleOutputChange}
                onFocus={() => setOutputFocused(true)}
                onBlur={() => setOutputFocused(false)}
                onPaste={handleOutputPaste}
                placeholder={
                  !state.input.trim() 
                    ? t("output.placeholderWithReversal")
                    : t("output.placeholder")
                }
                className={cn(
                  "flex-1 h-full p-4 bg-black/10 dark:bg-white/5 backdrop-blur-md border border-white/10 rounded-xl",
                  "font-mono text-sm text-foreground/90 placeholder:text-foreground/40",
                  "transition-all duration-200",
                  outputFocused && "ring-2 ring-blue-500/50 border-blue-500/30",
                  !state.input.trim() && "cursor-text",
                )}
                readOnly={state.input.trim() !== ""}
                spellCheck={false}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Drag Overlay */}
      {state.dragDrop.isDragOver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="p-8 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-center">
            <FileText className="h-12 w-12 mx-auto mb-4 text-blue-400" />
            <h3 className="text-lg font-medium text-white mb-2">
              {t("dragDrop.title")}
            </h3>
            <p className="text-sm text-white/70">
              {t("dragDrop.description")}
            </p>
          </div>
        </div>
      )}

      {/* Type Selection Dialog */}
      <CommandDialog
        open={typeDialogOpen}
        onOpenChange={setTypeDialogOpen}
      >
        <CommandInput placeholder={t("typeSelector.placeholder")} />
        <CommandList>
          <CommandEmpty>{t("typeSelector.noResults")}</CommandEmpty>
          {categories.map((category) => (
            <CommandGroup key={category} heading={category}>
              {availableEncodings
                .filter((encoding) => encoding.category === category)
                .map((encoding) => (
                  <CommandItem
                    key={encoding.id}
                    value={encoding.id}
                    onSelect={() => handleTypeChange(encoding.id)}
                    className="flex items-center gap-3 py-3"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5">
                      {getTypeIcon(encoding.id)}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {t(`types.${encoding.id}` as any)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {t(`descriptions.${encoding.id}` as any)}
                      </span>
                    </div>
                    {state.type === encoding.id && (
                      <CheckCircle className="ml-auto h-4 w-4 text-green-500" />
                    )}
                  </CommandItem>
                ))}
            </CommandGroup>
          ))}
        </CommandList>
      </CommandDialog>
    </div>
  );
}

export const EncoderDecoderPage = memo(EncoderDecoderPageComponent);