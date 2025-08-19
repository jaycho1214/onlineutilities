"use client";

import * as React from "react";
import { useState, useCallback } from "react";
import { Copy, Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { ActionButton } from "../ui/action-button";
import { cn } from "@/lib/utils";

interface CopyButtonProps
  extends Omit<
    React.ComponentProps<typeof ActionButton>,
    "onClick" | "children" | "icon"
  > {
  onClick?: () => void;
  feedbackDuration?: number;
}

const CopyButton = React.forwardRef<HTMLButtonElement, CopyButtonProps>(
  (
    {
      size = "default",
      variant = "ghost",
      className,
      onClick,
      feedbackDuration = 2000,
      disabled,
      ...props
    },
    ref,
  ) => {
    const t = useTranslations("Formatter");
    const [isCopied, setIsCopied] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);

    const handleCopy = useCallback(() => {
      if (disabled) return;

      // Trigger animation
      setIsAnimating(true);
      setIsCopied(true);

      // Call custom onClick handler if provided
      onClick?.();

      // Reset animation after brief delay
      setTimeout(() => {
        setIsAnimating(false);
      }, 150);

      // Reset state after feedback duration
      setTimeout(() => {
        setIsCopied(false);
      }, feedbackDuration);
    }, [disabled, onClick, feedbackDuration]);

    // Use size directly from ActionButton variants

    // Create animated icon
    const animatedIcon = (
      <div className="relative flex items-center justify-center">
        <div
          className={cn(
            "transition-all duration-200 ease-out",
            isCopied
              ? "scale-0 rotate-90 opacity-0"
              : "scale-100 rotate-0 opacity-100",
          )}
        >
          <Copy
            className={cn(
              "transition-all duration-200",
              size === "sm" && "h-3 w-3",
              size === "default" && "h-4 w-4",
              size === "lg" && "h-5 w-5",
            )}
          />
        </div>

        <div
          className={cn(
            "absolute transition-all duration-200 ease-out",
            isCopied
              ? "scale-100 rotate-0 opacity-100"
              : "scale-0 rotate-90 opacity-0",
          )}
        >
          <Check
            className={cn(
              "transition-all duration-200 text-green-500",
              size === "sm" && "h-3 w-3",
              size === "default" && "h-4 w-4",
              size === "lg" && "h-5 w-5",
            )}
          />
        </div>
      </div>
    );

    return (
      <ActionButton
        ref={ref}
        icon={animatedIcon}
        variant={variant}
        size={size}
        onClick={handleCopy}
        disabled={disabled}
        tooltip={isCopied ? t("actions.copied") : t("actions.copy")}
        className={cn(
          "relative overflow-hidden",
          isCopied && "text-green-500",
          isAnimating && "scale-95",
          className,
        )}
        {...props}
      />
    );
  },
);

CopyButton.displayName = "CopyButton";

export { CopyButton };
export type { CopyButtonProps };
