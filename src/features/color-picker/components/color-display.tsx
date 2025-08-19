import React from "react";
import { GlassSurface } from "@/features/shared/ui/glass-surface";
import { ActionButton } from "@/features/shared/ui/action-button";
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

const ColorDisplayComponent: React.FC<ColorDisplayProps> = React.memo(
  ({
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
      } catch {
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
              <ActionButton
                icon={<X className="w-4 h-4" />}
                variant="destructive"
                size="default"
                onClick={onImageRemove}
                tooltip={t("actions.removeImage")}
                className="bg-red-500/20 hover:bg-red-500/30 backdrop-blur-sm text-red-300 border border-red-500/30"
              />
            ) : (
              <ActionButton
                icon={<ImageIcon className="w-4 h-4" />}
                variant="ghost"
                size="default"
                onClick={onImageUpload}
                tooltip={t("actions.uploadImage")}
                className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white border border-white/20"
              />
            )}

            <ActionButton
              icon={<Pipette className={`w-4 h-4 ${isPickerLoading ? "animate-pulse" : ""}`} />}
              variant="ghost"
              size="default"
              onClick={handleScreenPicker}
              disabled={isPickerLoading}
              tooltip={isPickerLoading ? t("actions.openingColorPicker") : t("actions.pickFromScreen")}
              className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white border border-white/20 disabled:opacity-50"
            />
          </div>
        </div>
      </GlassSurface>
    );
  },
);

ColorDisplayComponent.displayName = "ColorDisplay";
export const ColorDisplay = ColorDisplayComponent;
