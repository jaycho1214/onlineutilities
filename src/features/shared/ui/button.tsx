import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { GlassSurface } from "./glass-surface";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all duration-200 ease-in-out disabled:pointer-events-none disabled:opacity-40 disabled:saturate-0 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none relative overflow-hidden cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:opacity-80 hover:brightness-110 active:opacity-70 active:brightness-90 disabled:bg-muted/50 disabled:text-muted-foreground/50",
        action:
          "bg-gradient-to-r from-blue-700! to-purple-700! text-white hover:opacity-80 hover:brightness-110 active:opacity-70 active:brightness-90 disabled:!bg-muted/50 disabled:!from-muted/50 disabled:!to-muted/50 disabled:!text-muted-foreground/50",
        destructive:
          "bg-red-500 text-white hover:opacity-80 hover:brightness-110 active:opacity-70 active:brightness-90 disabled:bg-muted/50 disabled:text-muted-foreground/50",
        outline:
          "text-foreground hover:opacity-80 active:opacity-70 border border-border hover:border-opacity-80 disabled:border-muted/50 disabled:text-muted-foreground/50",
        ghost:
          "text-foreground hover:opacity-80 active:opacity-70 disabled:text-muted-foreground/50",
        link: "text-primary underline-offset-4 decoration-transparent hover:decoration-current hover:text-primary/80 hover:underline-offset-2 underline disabled:text-muted-foreground/50 disabled:no-underline",
      },
      size: {
        xs: "h-7 px-2 py-1 text-xs",
        sm: "h-9 px-4 py-2 text-sm",
        default: "h-10 px-4 py-2",
        lg: "h-12 px-8 py-3",
        xl: "h-14 px-10 py-4 text-lg",
        icon: "h-8 w-8 hover:opacity-80 active:opacity-70",
        "lg-icon": "h-10 w-10 hover:opacity-80 active:opacity-70",
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
