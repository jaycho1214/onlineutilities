"use client";

import { memo } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { 
  Loader2, 
  FileText, 
  CheckCircle, 
  Brain, 
  AlertTriangle,
  Eye,
  Zap
} from "lucide-react";
import { Badge } from "@/features/shared/ui/badge";
import type { FileLoadingState } from "../types";

interface FileLoadingIndicatorProps {
  fileLoading: FileLoadingState & {
    detectionConfidence?: number;
    detectedAlternatives?: Array<{
      format: string;
      confidence: number;
    }>;
    isDetecting?: boolean;
  };
  className?: string;
}

function FileLoadingIndicatorComponent({ fileLoading, className }: FileLoadingIndicatorProps) {
  const t = useTranslations("Formatter");

  if (!fileLoading.isLoading && !fileLoading.fileName && !fileLoading.isDetecting) {
    return null;
  }

  const getConfidenceColor = (confidence?: number) => {
    if (!confidence) return "text-muted-foreground";
    if (confidence >= 80) return "text-green-500";
    if (confidence >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  const getConfidenceIcon = (confidence?: number) => {
    if (!confidence) return <Eye className="h-3 w-3 text-muted-foreground" />;
    if (confidence >= 80) return <CheckCircle className="h-3 w-3 text-green-500" />;
    if (confidence >= 60) return <AlertTriangle className="h-3 w-3 text-yellow-500" />;
    return <AlertTriangle className="h-3 w-3 text-red-500" />;
  };

  return (
    <div
      className={cn(
        "space-y-2 p-3 rounded-lg",
        "bg-black/10 dark:bg-white/5 backdrop-blur-md border border-white/10",
        "transition-all duration-200",
        className
      )}
    >
      {/* File Loading Status */}
      <div className="flex items-center gap-3">
        {fileLoading.isLoading ? (
          <Loader2 className="h-4 w-4 text-blue-400 animate-spin flex-shrink-0" />
        ) : fileLoading.fileName ? (
          <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
        ) : null}
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-sm">
            <FileText className="h-3 w-3 text-foreground/60" />
            <span className="text-foreground/80 truncate">
              {fileLoading.isLoading
                ? "Loading file..."
                : fileLoading.fileName
                ? t("dragDrop.fileInfo.loaded", { filename: fileLoading.fileName })
                : "Processing..."
              }
            </span>
          </div>
          
          {fileLoading.fileName && fileLoading.fileSize && !fileLoading.isLoading && (
            <div className="text-xs text-foreground/60 mt-1">
              {t("dragDrop.fileInfo.size", { size: fileLoading.fileSize })}
            </div>
          )}
        </div>
      </div>

      {/* Format Detection Status */}
      {fileLoading.isDetecting && (
        <div className="flex items-center gap-2 text-sm text-foreground/70">
          <Brain className="h-4 w-4 animate-pulse text-purple-500" />
          <span>Analyzing content and detecting format...</span>
        </div>
      )}

      {/* Detection Results */}
      {fileLoading.detectedFormat && !fileLoading.isLoading && !fileLoading.isDetecting && (
        <div className="flex items-center gap-2 text-sm">
          <Zap className="h-4 w-4 text-blue-500" />
          <span className="text-foreground/70">
            {t("dragDrop.fileInfo.detected", { format: fileLoading.detectedFormat.toUpperCase() })}
          </span>
          
          {/* Confidence Badge */}
          {fileLoading.detectionConfidence && (
            <Badge variant="outline" className="flex items-center gap-1 text-xs">
              {getConfidenceIcon(fileLoading.detectionConfidence)}
              <span className={getConfidenceColor(fileLoading.detectionConfidence)}>
                {fileLoading.detectionConfidence}%
              </span>
            </Badge>
          )}
        </div>
      )}

      {/* Alternative Formats */}
      {fileLoading.detectedAlternatives && 
       fileLoading.detectedAlternatives.length > 0 && 
       !fileLoading.isLoading && 
       !fileLoading.isDetecting && (
        <div className="flex items-center gap-2 text-xs text-foreground/50">
          <span>Other possibilities:</span>
          <div className="flex gap-1 flex-wrap">
            {fileLoading.detectedAlternatives.slice(0, 3).map((alt) => (
              <Badge 
                key={alt.format}
                variant="outline" 
                className="text-xs px-1.5 py-0.5"
              >
                {alt.format.toUpperCase()} ({alt.confidence}%)
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Low Confidence Warning */}
      {fileLoading.detectionConfidence && 
       fileLoading.detectionConfidence < 60 && 
       !fileLoading.isLoading && 
       !fileLoading.isDetecting && (
        <div className="flex items-center gap-2 text-xs text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded border border-yellow-200 dark:border-yellow-800">
          <AlertTriangle className="h-3 w-3" />
          <span>
            {t("notifications.lowConfidenceDetection", { confidence: fileLoading.detectionConfidence })}
          </span>
        </div>
      )}
    </div>
  );
}

export const FileLoadingIndicator = memo(FileLoadingIndicatorComponent);