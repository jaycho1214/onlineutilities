import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { GlassSurface } from "./glass-surface";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-60 disabled:text-foreground/70 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.98]",
        action:
          "bg-gradient-to-r from-blue-700! to-purple-700! hover:from-blue-800 hover:to-purple-800 text-white shadow-lg transition-all duration-200 hover:shadow-xl disabled:bg-gray-400! disabled:from-gray-400! disabled:to-gray-400! disabled:text-gray-200!",
        destructive:
          "bg-red-500 text-white hover:bg-red-600 active:scale-[0.98]",
        outline: "text-foreground active:scale-[0.98]",
        ghost:
          "text-foreground transition-transform duration-200",
        link: "text-primary underline-offset-4 decoration-transparent hover:decoration-current transition-colors duration-300 underline",
      },
      size: {
        xs: "h-7 px-2 py-1 text-xs",
        sm: "h-9 px-4 py-2 text-sm",
        default: "h-10 px-4 py-2",
        lg: "h-12 px-8 py-3",
        xl: "h-14 px-10 py-4 text-lg",
        icon: "h-8 w-8 hover:rotate-12 transition-transform duration-300 ease-out",
        "lg-icon":
          "h-10 w-10 hover:rotate-12 transition-transform duration-300 ease-out",
        none: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "none",
    },
  }
);

const glassVariants = cva("", {
  variants: {
    variant: {
      default: "opacity-90",
      action: "opacity-95",
      destructive: "opacity-90",
      outline: "opacity-80",
      ghost: "opacity-70",
      link: "opacity-90",
    },
    size: {
      xs: "",
      sm: "",
      default: "",
      lg: "",
      xl: "",
      icon: "w-8 h-8",
      "lg-icon": "w-10 h-10",
      none: "",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "none",
  },
});

function Button({
  className,
  variant = "default",
  size,
  disableGlass = false,
  asChild = false,
  children,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
    disableGlass?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  if (disableGlass) {
    return (
      <Comp
        data-slot="button"
        className={cn(
          buttonVariants({ variant, size }),
          "transition-transform",
          className
        )}
        {...props}
      >
        {children}
      </Comp>
    );
  }

  return (
    <GlassSurface asChild>
      <Comp
        data-slot="button"
        className={cn(
          "transition-transform",
          glassVariants({ variant, size }),
          buttonVariants({ variant, size }),
          className
        )}
        {...props}
      >
        {children}
      </Comp>
    </GlassSurface>
  );
}

export { Button, buttonVariants };
