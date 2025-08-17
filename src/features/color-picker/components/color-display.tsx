import React from "react";
import { GlassSurface } from "@/features/shared/ui/glass-surface";
import { Button } from "@/features/shared/ui/button";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/features/shared/ui/tooltip";
import { Skeleton } from "@/features/shared/ui/skeleton";
import { Pipette, Image as ImageIcon, X } from "lucide-react";
import { CopyButton } from "./copy-button";
import { useTranslations } from "next-intl";

interface ColorDisplayProps {
  selectedColor: string;
  colorName: string | null;
  loadingColorName: boolean;
  onScreenColorPicker: () => Promise<void>;
  onImageUpload: () => void;
  onImageRemove?: () => void;
  hasImage?: boolean;
}

export const ColorDisplay: React.FC<ColorDisplayProps> = React.memo(({
  selectedColor,
  colorName,
  loadingColorName,
  onScreenColorPicker,
  onImageUpload,
  onImageRemove,
  hasImage = false,
}) => {
  const t = useTranslations("ColorPicker");
  const [isPickerLoading, setIsPickerLoading] = React.useState(false);
  
  const handleScreenPicker = async () => {
    setIsPickerLoading(true);
    try {
      await onScreenColorPicker();
    } catch (error) {
      // Error is already logged in the hook
      alert(t("notifications.screenPickerNotSupported"));
    } finally {
      setIsPickerLoading(false);
    }
  };
  
  return (
    <GlassSurface className="relative overflow-hidden">
      <div
        className="w-full h-64 md:h-80 relative transition-colors duration-200"
        style={{ backgroundColor: selectedColor }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />

        {/* Color Info Overlay */}
        <div className="absolute top-6 left-6 text-white drop-shadow-lg">
          <div className="text-xs opacity-75 mb-1">
            {selectedColor.toUpperCase()}
          </div>
          <div className="text-2xl font-bold">
            {loadingColorName ? (
              <Skeleton className="h-8 w-32 bg-white/20" />
            ) : (
              colorName || selectedColor.toUpperCase()
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="absolute top-6 right-6 flex gap-2">
          <CopyButton 
            value={selectedColor}
            className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white border border-white/20"
          />

          {hasImage && onImageRemove ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={onImageRemove}
                  className="bg-red-500/20 hover:bg-red-500/30 backdrop-blur-sm text-red-300 border border-red-500/30"
                >
                  <X className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t("actions.removeImage")}</TooltipContent>
            </Tooltip>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={onImageUpload}
                  className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white border border-white/20"
                >
                  <ImageIcon className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t("actions.uploadImage")}</TooltipContent>
            </Tooltip>
          )}

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                onClick={handleScreenPicker}
                disabled={isPickerLoading}
                className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white border border-white/20 disabled:opacity-50"
              >
                <Pipette className={`w-4 h-4 ${isPickerLoading ? 'animate-pulse' : ''}`} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {isPickerLoading ? t("actions.openingColorPicker") : t("actions.pickFromScreen")}
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </GlassSurface>
  );
});