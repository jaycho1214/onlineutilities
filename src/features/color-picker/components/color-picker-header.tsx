import React from "react";

export const ColorPickerHeader: React.FC = () => {
  return (
    <div className="text-left space-y-2">
      <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
        Color Picker
      </h1>
      <p className="text-muted-foreground">
        Pick colors from screen, images, or create custom palettes
      </p>
    </div>
  );
};