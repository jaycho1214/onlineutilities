"use client";

import { useState, useEffect } from "react";
import { Button } from "@/features/shared/ui/button";
import { RefreshCw, Copy, Download } from "lucide-react";

// Color palettes inspired by modern gradients
const colorPalettes = {
  aurora: [
    [139, 92, 246],
    [236, 72, 153],
    [59, 130, 246],
    [251, 191, 36],
    [168, 85, 247],
  ],
  sunset: [
    [251, 113, 133],
    [251, 146, 60],
    [245, 101, 101],
    [249, 115, 22],
    [236, 72, 153],
  ],
  ocean: [
    [59, 130, 246],
    [147, 197, 253],
    [34, 197, 94],
    [20, 184, 166],
    [6, 182, 212],
  ],
  forest: [
    [34, 197, 94],
    [132, 204, 22],
    [163, 230, 53],
    [101, 163, 13],
    [22, 163, 74],
  ],
  cosmic: [
    [139, 92, 246],
    [109, 40, 217],
    [88, 28, 135],
    [124, 58, 237],
    [147, 51, 234],
  ],
  warm: [
    [251, 191, 36],
    [245, 158, 11],
    [249, 115, 22],
    [251, 146, 60],
    [234, 179, 8],
  ],
};

const generateRandomGradient = () => {
  const paletteNames = Object.keys(colorPalettes);
  const selectedPalette =
    colorPalettes[
      paletteNames[Math.floor(Math.random() * paletteNames.length)]
    ];

  const numLayers = 3 + Math.floor(Math.random() * 3); // 3-5 layers
  const gradients = [];

  for (let i = 0; i < numLayers; i++) {
    const color1 =
      selectedPalette[Math.floor(Math.random() * selectedPalette.length)];
    const color2 =
      selectedPalette[Math.floor(Math.random() * selectedPalette.length)];

    const opacity1 = (0.15 + Math.random() * 0.4).toFixed(2);
    const opacity2 = (0.05 + Math.random() * 0.25).toFixed(2);

    const x = Math.floor(Math.random() * 100);
    const y = Math.floor(Math.random() * 100);
    const angle = Math.floor(Math.random() * 360);

    const gradientType = Math.random();

    if (gradientType < 0.4) {
      // Radial gradient
      const size = ["circle", "ellipse"][Math.floor(Math.random() * 2)];
      const dimensions =
        size === "ellipse"
          ? `${200 + Math.floor(Math.random() * 800)}px ${100 + Math.floor(Math.random() * 400)}px`
          : `${200 + Math.floor(Math.random() * 600)}px`;

      gradients.push(
        `radial-gradient(${size} ${dimensions} at ${x}% ${y}%, rgba(${color1.join(",")}, ${opacity1}), rgba(${color2.join(",")}, ${opacity2}), transparent)`,
      );
    } else if (gradientType < 0.7) {
      // Linear gradient
      gradients.push(
        `linear-gradient(${angle}deg, rgba(${color1.join(",")}, ${opacity1}), rgba(${color2.join(",")}, ${opacity2}), transparent)`,
      );
    } else {
      // Conic gradient
      gradients.push(
        `conic-gradient(from ${angle}deg at ${x}% ${y}%, rgba(${color1.join(",")}, ${opacity1}), transparent 25%, rgba(${color2.join(",")}, ${opacity2}), transparent 75%)`,
      );
    }
  }

  // Add base layer
  const baseColors = [
    [248, 250, 252],
    [241, 245, 249],
    [226, 232, 240],
  ];
  const baseColor = baseColors[Math.floor(Math.random() * baseColors.length)];
  gradients.push(
    `linear-gradient(135deg, rgba(${baseColor.join(",")}, 0.8), rgba(${baseColor.join(",")}, 0.9))`,
  );

  return gradients.join(", ");
};

export function GradientGenerator() {
  const [currentGradient, setCurrentGradient] = useState("");
  const [gradientHistory, setGradientHistory] = useState<string[]>([]);

  const generateNewGradient = () => {
    const newGradient = generateRandomGradient();
    setCurrentGradient(newGradient);
    setGradientHistory((prev) => [newGradient, ...prev.slice(0, 8)]); // Keep last 9 gradients
  };

  const copyToClipboard = (gradient: string) => {
    navigator.clipboard.writeText(`background: ${gradient};`);
  };

  const downloadAsCSS = (gradient: string) => {
    const css = `.gradient-bg {\n  background: ${gradient};\n  min-height: 100vh;\n  width: 100%;\n}`;
    const blob = new Blob([css], { type: "text/css" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "gradient.css";
    a.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    generateNewGradient();
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold font-[family-name:var(--font-eb-garamond)]">
          Gradient Generator
        </h1>
        <p className="text-muted-foreground">
          Generate beautiful, ChatGPT-inspired gradients with CSS
        </p>
      </div>

      {/* Main Gradient Display */}
      <div className="relative">
        <div
          className="w-full h-80 rounded-2xl border shadow-2xl transition-all duration-1000 relative overflow-hidden"
          style={{ background: currentGradient }}
        >
          <div className="absolute inset-0 bg-black/5 rounded-2xl" />
          <div className="absolute bottom-4 right-4 flex gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => copyToClipboard(currentGradient)}
              className="bg-white/20 backdrop-blur-sm hover:bg-white/30"
            >
              <Copy className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => downloadAsCSS(currentGradient)}
              className="bg-white/20 backdrop-blur-sm hover:bg-white/30"
            >
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="mt-4 text-center">
          <Button onClick={generateNewGradient} size="lg">
            <RefreshCw className="w-4 h-4 mr-2" />
            Generate New Gradient
          </Button>
        </div>
      </div>

      {/* CSS Output */}
      <div className="bg-muted/50 dark:bg-muted rounded-lg p-4 font-mono text-sm overflow-x-auto border">
        <div className="text-muted-foreground mb-2">{/* Copy this CSS */}</div>
        <div className="break-all text-foreground font-medium">
          background: {currentGradient};
        </div>
      </div>

      {/* Gradient History */}
      {gradientHistory.length > 1 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Recent Gradients</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {gradientHistory.slice(1).map((gradient, index) => (
              <div
                key={index}
                className="group relative cursor-pointer"
                onClick={() => setCurrentGradient(gradient)}
              >
                <div
                  className="w-full h-24 rounded-lg border shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] relative overflow-hidden"
                  style={{ background: gradient }}
                >
                  <div className="absolute inset-0 bg-black/5 rounded-lg" />
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        copyToClipboard(gradient);
                      }}
                      className="bg-white/20 backdrop-blur-sm hover:bg-white/30 h-6 w-6 p-0"
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
