"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Button } from "./button";
import { Tooltip, TooltipTrigger, TooltipContent } from "./tooltip";
import { cn } from "@/lib/utils";

const actionButtonVariants = cva(
  "backdrop-blur-sm border transition-all duration-200",
  {
    variants: {
      variant: {
        default: "bg-white/10 hover:bg-white/20 text-white border-white/20",
        destructive:
          "bg-red-500/20 hover:bg-red-500/30 text-red-600 dark:text-red-300 border-red-500/30",
        success:
          "bg-green-500/20 hover:bg-green-500/30 text-green-600 dark:text-green-300 border-green-500/30",
        warning:
          "bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-600 dark:text-yellow-300 border-yellow-500/30",
        info: "bg-blue-500/20 hover:bg-blue-500/30 text-blue-600 dark:text-blue-300 border-blue-500/30",
        ghost:
          "bg-black/10 hover:bg-black/20 dark:bg-white/10 dark:hover:bg-white/20 border-black/20 dark:border-white/20",
        outline:
          "bg-transparent hover:bg-foreground/5 border-foreground/20 hover:border-foreground/30",
      },
      size: {
        sm: "h-7 w-7 rounded-lg",
        default: "h-8 w-8 rounded-lg",
        lg: "h-10 w-10 rounded-lg",
        xl: "h-16 w-16 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

interface ActionButtonProps
  extends Omit<
      React.ComponentProps<typeof Button>,
      "size" | "variant" | "children"
    >,
    VariantProps<typeof actionButtonVariants> {
  icon: React.ReactNode;
  tooltip?: string;
  tooltipSide?: "top" | "right" | "bottom" | "left";
  tooltipAlign?: "start" | "center" | "end";
  loading?: boolean;
}

const ActionButton = React.forwardRef<HTMLButtonElement, ActionButtonProps>(
  (
    {
      icon,
      tooltip,
      tooltipSide = "top",
      tooltipAlign = "center",
      variant = "default",
      size = "default",
      loading = false,
      disabled,
      className,
      ...props
    },
    ref
  ) => {
    const buttonContent = (
      <Button
        ref={ref}
        size="icon"
        variant="ghost"
        disabled={disabled || loading}
        className={cn(
          actionButtonVariants({ variant, size }),
          loading && "animate-pulse",
          className
        )}
        {...props}
      >
        {loading ? (
          <div className="animate-spin rounded-full border-2 border-current border-t-transparent w-4 h-4" />
        ) : (
          icon
        )}
      </Button>
    );

    if (tooltip) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>{buttonContent}</TooltipTrigger>
          <TooltipContent side={tooltipSide} align={tooltipAlign}>
            {tooltip}
          </TooltipContent>
        </Tooltip>
      );
    }

    return buttonContent;
  }
);

ActionButton.displayName = "ActionButton";

export { ActionButton, actionButtonVariants };
export type { ActionButtonProps };
