/**
 * Format Detection Dialog Component
 *
 * This component provides a user interface for confirming auto-detected formats
 * and allowing users to override the detection if needed.
 */

"use client";

import { memo, useCallback } from "react";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/features/shared/ui/dialog";
import { Button } from "@/features/shared/ui/button";
import { Badge } from "@/features/shared/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckCircle, AlertCircle, FileText } from "lucide-react";
import type { FormatterType } from "../types";
import { getAvailableFormatters } from "../lib/enhanced-formatter-utils";

// ============================================================================
// TYPES
// ============================================================================

interface FormatDetectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  detectedFormat: FormatterType;
  confidence: number;
  alternatives?: Array<{
    format: FormatterType;
    confidence: number;
  }>;
  currentFormat: FormatterType;
  onConfirm: (selectedFormat: FormatterType) => void;
  fileName?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

function FormatDetectionDialogComponent({
  isOpen,
  onClose,
  detectedFormat,
  confidence,
  alternatives = [],
  currentFormat,
  onConfirm,
  fileName,
}: FormatDetectionDialogProps) {
  const t = useTranslations("Formatter");

  const availableFormatters = getAvailableFormatters();

  const getFormatterName = useCallback(
    (format: FormatterType) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return t(`types.${format}` as any);
    },
    [t],
  );

  const getConfidenceColor = useCallback((conf: number) => {
    if (conf >= 80) return "text-green-500";
    if (conf >= 60) return "text-yellow-500";
    return "text-red-500";
  }, []);

  const getConfidenceIcon = useCallback((conf: number) => {
    if (conf >= 80) return <CheckCircle className="h-4 w-4 text-green-500" />;
    if (conf >= 60) return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    return <AlertCircle className="h-4 w-4 text-red-500" />;
  }, []);

  const handleUseDetected = useCallback(() => {
    onConfirm(detectedFormat);
    onClose();
  }, [detectedFormat, onConfirm, onClose]);

  const handleKeepCurrent = useCallback(() => {
    onClose();
  }, [onClose]);

  const handleManualSelect = useCallback(
    (format: string) => {
      onConfirm(format as FormatterType);
      onClose();
    },
    [onConfirm, onClose],
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {t("detection.title")}
          </DialogTitle>
          <DialogDescription>
            {fileName && (
              <span className="block mb-2 font-medium">{fileName}</span>
            )}
            {confidence >= 60 ? (
              <>
                {t("detection.detected", {
                  type: getFormatterName(detectedFormat),
                })}{" "}
                <span className="text-sm text-muted-foreground">
                  ({t("detection.confidence", { confidence })})
                </span>
              </>
            ) : (
              <>{t("notifications.lowConfidenceDetection", { confidence })}</>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Primary Detection */}
          <div className="flex items-center justify-between p-3 border border-white/10 rounded-lg bg-white/5">
            <div className="flex items-center gap-3">
              {getConfidenceIcon(confidence)}
              <div>
                <div className="font-medium">
                  {getFormatterName(detectedFormat)}
                </div>
                <div className={`text-sm ${getConfidenceColor(confidence)}`}>
                  {t("detection.confidence", { confidence })}
                </div>
              </div>
            </div>
            <Badge variant="outline">
              {t("detection.detected", { type: "" }).replace(":", "")}
            </Badge>
          </div>

          {/* Alternatives */}
          {alternatives.length > 0 && (
            <div className="space-y-2">
              <div className="text-sm font-medium text-foreground/70">
                {t("detection.alternatives")}
              </div>
              {alternatives.slice(0, 3).map((alt) => (
                <div
                  key={alt.format}
                  className="flex items-center justify-between p-2 border border-white/5 rounded-md bg-white/2"
                >
                  <div className="flex items-center gap-2">
                    {getConfidenceIcon(alt.confidence)}
                    <span className="text-sm">
                      {getFormatterName(alt.format)}
                    </span>
                  </div>
                  <span
                    className={`text-xs ${getConfidenceColor(alt.confidence)}`}
                  >
                    {alt.confidence}%
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Manual Selection */}
          <div className="space-y-2">
            <div className="text-sm font-medium text-foreground/70">
              {t("detection.manualSelect")}
            </div>
            <Select onValueChange={handleManualSelect}>
              <SelectTrigger>
                <SelectValue placeholder={getFormatterName(currentFormat)} />
              </SelectTrigger>
              <SelectContent>
                {availableFormatters.map((formatter) => (
                  <SelectItem key={formatter.id} value={formatter.id}>
                    {getFormatterName(formatter.id)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 pt-4">
            <Button
              onClick={handleUseDetected}
              className="flex-1"
              variant="outline"
            >
              {t("detection.useDetected", {
                type: getFormatterName(detectedFormat),
              })}
            </Button>
            <Button
              onClick={handleKeepCurrent}
              variant="outline"
              className="flex-1"
            >
              {t("detection.keepCurrent", {
                current: getFormatterName(currentFormat),
              })}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export const FormatDetectionDialog = memo(FormatDetectionDialogComponent);
