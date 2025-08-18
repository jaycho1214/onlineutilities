import { ColorFormats } from "./color-conversions";

export interface SliderConfig {
  label: string;
  key: string;
  value: number;
  max: number;
  gradient: string;
}

export const getSliderConfig = (
  colorFormat: "RGB" | "HSL" | "HSV" | "CMYK" | "LAB",
  colorFormats: ColorFormats,
): SliderConfig[] => {
  switch (colorFormat) {
    case "RGB":
      return [
        {
          label: "Red",
          key: "r",
          value: colorFormats.rgb.r,
          max: 255,
          gradient: `linear-gradient(to right, rgb(0, ${colorFormats.rgb.g}, ${colorFormats.rgb.b}), rgb(255, ${colorFormats.rgb.g}, ${colorFormats.rgb.b}))`,
        },
        {
          label: "Green",
          key: "g",
          value: colorFormats.rgb.g,
          max: 255,
          gradient: `linear-gradient(to right, rgb(${colorFormats.rgb.r}, 0, ${colorFormats.rgb.b}), rgb(${colorFormats.rgb.r}, 255, ${colorFormats.rgb.b}))`,
        },
        {
          label: "Blue",
          key: "b",
          value: colorFormats.rgb.b,
          max: 255,
          gradient: `linear-gradient(to right, rgb(${colorFormats.rgb.r}, ${colorFormats.rgb.g}, 0), rgb(${colorFormats.rgb.r}, ${colorFormats.rgb.g}, 255))`,
        },
      ];
    case "HSL":
      return [
        {
          label: "Hue",
          key: "h",
          value: colorFormats.hsl.h,
          max: 360,
          gradient:
            "linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)",
        },
        {
          label: "Saturation",
          key: "s",
          value: colorFormats.hsl.s,
          max: 100,
          gradient: `linear-gradient(to right, hsl(${colorFormats.hsl.h}, 0%, ${colorFormats.hsl.l}%), hsl(${colorFormats.hsl.h}, 100%, ${colorFormats.hsl.l}%))`,
        },
        {
          label: "Lightness",
          key: "l",
          value: colorFormats.hsl.l,
          max: 100,
          gradient: `linear-gradient(to right, hsl(${colorFormats.hsl.h}, ${colorFormats.hsl.s}%, 0%), hsl(${colorFormats.hsl.h}, ${colorFormats.hsl.s}%, 50%), hsl(${colorFormats.hsl.h}, ${colorFormats.hsl.s}%, 100%))`,
        },
      ];
    case "HSV":
      return [
        {
          label: "Hue",
          key: "h",
          value: colorFormats.hsv.h,
          max: 360,
          gradient:
            "linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)",
        },
        {
          label: "Saturation",
          key: "s",
          value: colorFormats.hsv.s,
          max: 100,
          gradient: `linear-gradient(to right, hsl(${colorFormats.hsv.h}, 0%, 50%), hsl(${colorFormats.hsv.h}, 100%, 50%))`,
        },
        {
          label: "Value",
          key: "v",
          value: colorFormats.hsv.v,
          max: 100,
          gradient: `linear-gradient(to right, #000000, hsl(${colorFormats.hsv.h}, ${colorFormats.hsv.s}%, 50%))`,
        },
      ];
    case "CMYK":
      return [
        {
          label: "Cyan",
          key: "c",
          value: colorFormats.cmyk.c,
          max: 100,
          gradient: `linear-gradient(to right, rgb(${
            255 * (1 - 0) * (1 - colorFormats.cmyk.k / 100)
          }, ${
            255 *
            (1 - colorFormats.cmyk.m / 100) *
            (1 - colorFormats.cmyk.k / 100)
          }, ${
            255 *
            (1 - colorFormats.cmyk.y / 100) *
            (1 - colorFormats.cmyk.k / 100)
          }), rgb(${255 * (1 - 1) * (1 - colorFormats.cmyk.k / 100)}, ${
            255 *
            (1 - colorFormats.cmyk.m / 100) *
            (1 - colorFormats.cmyk.k / 100)
          }, ${
            255 *
            (1 - colorFormats.cmyk.y / 100) *
            (1 - colorFormats.cmyk.k / 100)
          }))`,
        },
        {
          label: "Magenta",
          key: "m",
          value: colorFormats.cmyk.m,
          max: 100,
          gradient: `linear-gradient(to right, rgb(${
            255 *
            (1 - colorFormats.cmyk.c / 100) *
            (1 - colorFormats.cmyk.k / 100)
          }, ${255 * (1 - 0) * (1 - colorFormats.cmyk.k / 100)}, ${
            255 *
            (1 - colorFormats.cmyk.y / 100) *
            (1 - colorFormats.cmyk.k / 100)
          }), rgb(${
            255 *
            (1 - colorFormats.cmyk.c / 100) *
            (1 - colorFormats.cmyk.k / 100)
          }, ${255 * (1 - 1) * (1 - colorFormats.cmyk.k / 100)}, ${
            255 *
            (1 - colorFormats.cmyk.y / 100) *
            (1 - colorFormats.cmyk.k / 100)
          }))`,
        },
        {
          label: "Yellow",
          key: "y",
          value: colorFormats.cmyk.y,
          max: 100,
          gradient: `linear-gradient(to right, rgb(${
            255 *
            (1 - colorFormats.cmyk.c / 100) *
            (1 - colorFormats.cmyk.k / 100)
          }, ${
            255 *
            (1 - colorFormats.cmyk.m / 100) *
            (1 - colorFormats.cmyk.k / 100)
          }, ${255 * (1 - 0) * (1 - colorFormats.cmyk.k / 100)}), rgb(${
            255 *
            (1 - colorFormats.cmyk.c / 100) *
            (1 - colorFormats.cmyk.k / 100)
          }, ${
            255 *
            (1 - colorFormats.cmyk.m / 100) *
            (1 - colorFormats.cmyk.k / 100)
          }, ${255 * (1 - 1) * (1 - colorFormats.cmyk.k / 100)}))`,
        },
        {
          label: "Key (Black)",
          key: "k",
          value: colorFormats.cmyk.k,
          max: 100,
          gradient: `linear-gradient(to right, rgb(${
            255 * (1 - colorFormats.cmyk.c / 100) * (1 - 0)
          }, ${255 * (1 - colorFormats.cmyk.m / 100) * (1 - 0)}, ${
            255 * (1 - colorFormats.cmyk.y / 100) * (1 - 0)
          }), rgb(${255 * (1 - colorFormats.cmyk.c / 100) * (1 - 1)}, ${
            255 * (1 - colorFormats.cmyk.m / 100) * (1 - 1)
          }, ${255 * (1 - colorFormats.cmyk.y / 100) * (1 - 1)}))`,
        },
      ];
    default:
      return [];
  }
};
