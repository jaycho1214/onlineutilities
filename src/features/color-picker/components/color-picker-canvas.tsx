import React, { useEffect } from "react";

interface ColorPickerCanvasProps {
  imageDataUrl: string | null;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  onCanvasClick: (event: React.MouseEvent<HTMLCanvasElement>) => void;
}

export const ColorPickerCanvas: React.FC<ColorPickerCanvasProps> = ({
  imageDataUrl,
  canvasRef,
  onCanvasClick,
}) => {
  useEffect(() => {
    if (imageDataUrl && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const img = new Image();
      img.onload = () => {
        const maxWidth = 400;
        const maxHeight = 300;
        const scale = Math.min(maxWidth / img.width, maxHeight / img.height);

        canvas.width = img.width * scale;
        canvas.height = img.height * scale;

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      };
      img.src = imageDataUrl;
    }
  }, [imageDataUrl, canvasRef]);

  if (!imageDataUrl) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Click on image to pick color</h3>
      <div className="relative">
        <canvas
          ref={canvasRef}
          onClick={onCanvasClick}
          className="max-w-full border rounded-lg cursor-crosshair"
        />
      </div>
    </div>
  );
};
