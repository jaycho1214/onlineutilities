import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { GlassSurface } from "./glass-surface";

const buttonVariants = cva(
  "size-full inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none",
  {
    variants: {
      variant: {
        default:
          "text-primary-foreground hover:scale-[1.02] active:scale-[0.98]",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 hover:scale-[1.02] active:scale-[0.98]",
        outline: "text-foreground hover:scale-[1.01] active:scale-[0.98]",
        secondary:
          "text-secondary-foreground hover:scale-[1.02] active:scale-[0.98]",
        ghost:
          "text-foreground hover:scale-[1.02] transition-transform duration-200",
        link: "text-primary underline-offset-4 decoration-transparent hover:decoration-current transition-colors duration-300 underline",
        solid:
          "text-primary-foreground bg-primary hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98]",
      },
      size: {
        default: "h-10 px-5 py-2.5",
        sm: "h-9 px-4 py-2 text-sm",
        lg: "h-12 px-8 py-3",
        icon: "hover:rotate-12 hover:scale-110 transition-transform duration-300 ease-out",
        none: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "none",
    },
  },
);

const glassVariants = cva("", {
  variants: {
    variant: {
      default: "opacity-90",
      destructive: "opacity-85",
      outline: "opacity-80",
      secondary: "opacity-85",
      ghost: "opacity-70",
      link: "opacity-90",
      solid: "opacity-100",
    },
    size: {
      default: "",
      sm: "",
      lg: "",
      icon: "w-8 h-8",
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
  innerClassName,
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
    innerClassName?: string;
  }) {
  const Comp = asChild ? Slot : "button";

  const buttonElement = (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size }), innerClassName)}
      {...props}
    >
      {children}
    </Comp>
  );

  if (disableGlass) {
    return (
      <div className={cn("transition-transform", className)}>
        {buttonElement}
      </div>
    );
  }

  return (
    <GlassSurface
      className={cn(
        "transition-transform",
        glassVariants({ variant, size }),
        className,
      )}
    >
      {buttonElement}
    </GlassSurface>
  );
}

export { Button, buttonVariants };
