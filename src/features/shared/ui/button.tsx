import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { GlassSurface } from "./glass-surface";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all duration-200 ease-in-out disabled:pointer-events-none disabled:opacity-40 disabled:saturate-0 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none relative overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary/90 hover:-translate-y-0.5 hover:shadow-md hover:shadow-primary/25 active:translate-y-0 active:shadow-sm disabled:bg-muted/50 disabled:text-muted-foreground/50",
        action:
          "bg-gradient-to-r from-blue-700! to-purple-700! hover:from-blue-600! hover:to-purple-600! text-white shadow-md hover:shadow-lg hover:shadow-blue-500/25 hover:-translate-y-0.5 active:translate-y-0 active:shadow-md disabled:!bg-muted/50 disabled:!from-muted/50 disabled:!to-muted/50 disabled:!text-muted-foreground/50",
        destructive:
          "bg-red-500 text-white hover:bg-red-400 hover:-translate-y-0.5 hover:shadow-md hover:shadow-red-500/25 active:translate-y-0 active:shadow-sm disabled:bg-muted/50 disabled:text-muted-foreground/50",
        outline:
          "text-foreground hover:bg-accent/30 hover:text-accent-foreground hover:-translate-y-0.5 hover:shadow-md hover:shadow-accent/20 active:translate-y-0 active:shadow-sm border border-border hover:border-accent/50 disabled:border-muted/50 disabled:text-muted-foreground/50",
        ghost:
          "text-foreground hover:bg-accent/30 hover:text-accent-foreground hover:-translate-y-0.5 hover:shadow-md hover:shadow-accent/10 active:translate-y-0 active:shadow-sm disabled:text-muted-foreground/50",
        link: "text-primary underline-offset-4 decoration-transparent hover:decoration-current hover:text-primary/80 hover:underline-offset-2 underline disabled:text-muted-foreground/50 disabled:no-underline",
      },
      size: {
        xs: "h-7 px-2 py-1 text-xs",
        sm: "h-9 px-4 py-2 text-sm",
        default: "h-10 px-4 py-2",
        lg: "h-12 px-8 py-3",
        xl: "h-14 px-10 py-4 text-lg",
        icon: "h-8 w-8 hover:rotate-6 hover:-translate-y-1 hover:shadow-md hover:shadow-current/20 transition-all duration-300 ease-out",
        "lg-icon":
          "h-10 w-10 hover:rotate-6 hover:-translate-y-1 hover:shadow-lg hover:shadow-current/20 transition-all duration-300 ease-out",
        none: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "none",
    },
  }
);

const glassVariants = cva("transition-all duration-200 ease-out", {
  variants: {
    variant: {
      default: "opacity-90 hover:opacity-98 hover:backdrop-blur-lg",
      action: "opacity-95 hover:opacity-100 hover:backdrop-blur-lg",
      destructive: "opacity-90 hover:opacity-98 hover:backdrop-blur-lg",
      outline: "opacity-80 hover:opacity-95 hover:backdrop-blur-lg",
      ghost: "opacity-70 hover:opacity-90 hover:backdrop-blur-md",
      link: "opacity-90 hover:opacity-98",
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
