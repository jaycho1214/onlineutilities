"use client";

import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { useTheme } from "next-themes";

import { cn } from "@/lib/utils";

function TooltipProvider({
  delayDuration = 0,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
  return (
    <TooltipPrimitive.Provider
      data-slot="tooltip-provider"
      delayDuration={delayDuration}
      {...props}
    />
  );
}

function Tooltip({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Root>) {
  return (
    <TooltipProvider>
      <TooltipPrimitive.Root data-slot="tooltip" {...props} />
    </TooltipProvider>
  );
}

function TooltipTrigger({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />;
}

function TooltipContent({
  className,
  sideOffset = 4,
  children,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content>) {
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === "dark";

  const glassStyles = React.useMemo(() => {
    const backgroundOpacity = 0.1;
    const borderRadius = 8;

    // Light reflection border effect
    const borderEffect = isDarkMode
      ? `inset 0 1px 0 0 rgba(255, 255, 255, 0.3),
         inset 0 -1px 0 0 rgba(255, 255, 255, 0.1),
         inset 1px 0 0 0 rgba(255, 255, 255, 0.15),
         inset -1px 0 0 0 rgba(255, 255, 255, 0.15)`
      : `inset 0 1px 0 0 rgba(255, 255, 255, 0.6),
         inset 0 -1px 0 0 rgba(255, 255, 255, 0.2),
         inset 1px 0 0 0 rgba(255, 255, 255, 0.3),
         inset -1px 0 0 0 rgba(255, 255, 255, 0.3)`;

    const shadowEffect = isDarkMode
      ? `0 20px 80px rgba(0, 0, 0, 0.5)`
      : `0 8px 32px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.08)`;

    const innerGlow = isDarkMode
      ? `inset 0 0 30px rgba(255, 255, 255, 0.01)`
      : `inset 0 0 30px rgba(255, 255, 255, 0.25)`;

    return {
      background: isDarkMode
        ? `rgba(20, 20, 25, ${backgroundOpacity + 0.05})`
        : `rgba(255, 255, 255, ${backgroundOpacity + 0.05})`,
      backdropFilter: isDarkMode
        ? "blur(20px) saturate(2) brightness(0.6)"
        : "blur(20px) saturate(1.8) brightness(1.1)",
      WebkitBackdropFilter: isDarkMode
        ? "blur(20px) saturate(2) brightness(0.6)"
        : "blur(20px) saturate(1.8) brightness(1.1)",
      boxShadow: `${shadowEffect}, ${borderEffect}, ${innerGlow}`,
      borderRadius: `${borderRadius}px`,
    };
  }, [isDarkMode]);

  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        className={cn(
          "animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-fit origin-(--radix-tooltip-content-transform-origin) px-3 py-1.5 text-xs text-balance text-foreground",
          className,
        )}
        style={glassStyles}
        {...props}
      >
        {children}
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  );
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
