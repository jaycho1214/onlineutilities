import React from "react";
import { GlassSurface } from "@/features/shared/ui/glass-surface";
import { Upload, Image as ImageIcon } from "lucide-react";

interface DragDropOverlayProps {
  isVisible: boolean;
  isDragOver: boolean;
}

export const DragDropOverlay: React.FC<DragDropOverlayProps> = ({
  isVisible,
  isDragOver,
}) => {
  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-50 transition-all duration-300 ${
        isDragOver
          ? "bg-primary/5 backdrop-blur-sm"
          : "bg-black/10 backdrop-blur-sm"
      }`}
    >
      <div className="flex items-center justify-center h-full p-8">
        <GlassSurface
          className={`max-w-md w-full transition-all duration-300 transform ${
            isDragOver
              ? "scale-105 border-primary/20 bg-primary/3"
              : "scale-100 border-white/5 bg-white/3"
          }`}
        >
          <div className="p-12 text-center space-y-6">
            <div
              className={`transition-all duration-300 ${
                isDragOver ? "scale-110 text-primary" : "scale-100 text-white"
              }`}
            >
              {isDragOver ? (
                <ImageIcon className="w-16 h-16 mx-auto animate-pulse" />
              ) : (
                <Upload className="w-16 h-16 mx-auto" />
              )}
            </div>

            <div className="space-y-2">
              <h3
                className={`text-xl font-semibold transition-colors duration-300 ${
                  isDragOver ? "text-primary" : "text-white"
                }`}
              >
                {isDragOver
                  ? "Drop your image!"
                  : "Drop image to extract colors"}
              </h3>
              <p
                className={`text-sm transition-colors duration-300 ${
                  isDragOver ? "text-primary/80" : "text-white/80"
                }`}
              >
                {isDragOver
                  ? "Release to upload and start picking colors"
                  : "Drag and drop an image file anywhere on the page"}
              </p>
            </div>

            <div className="flex items-center justify-center space-x-2 text-xs text-white/70">
              <span>Supports:</span>
              <span className="px-2 py-1 bg-white/20 rounded text-white">
                JPG
              </span>
              <span className="px-2 py-1 bg-white/20 rounded text-white">
                PNG
              </span>
              <span className="px-2 py-1 bg-white/20 rounded text-white">
                GIF
              </span>
              <span className="px-2 py-1 bg-white/20 rounded text-white">
                WebP
              </span>
            </div>
          </div>
        </GlassSurface>
      </div>
    </div>
  );
};
