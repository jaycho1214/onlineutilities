"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { XIcon } from "lucide-react";
import { useTheme } from "next-themes";

import { cn } from "@/lib/utils";

function Dialog({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

function DialogTrigger({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

function DialogPortal({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />;
}

function DialogClose({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}

function DialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50",
        className,
      )}
      {...props}
    />
  );
}

function DialogContent({
  className,
  children,
  showCloseButton = true,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  showCloseButton?: boolean;
}) {
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === "dark";

  const glassStyles = React.useMemo(() => {
    const backgroundOpacity = 0.1;
    const borderRadius = 12;

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
    <DialogPortal data-slot="dialog-portal">
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cn(
          "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-[51] grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 p-6 duration-200 sm:max-w-lg border-0",
          className,
        )}
        style={glassStyles}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close
            data-slot="dialog-close"
            className="ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
          >
            <XIcon />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  );
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("flex flex-col gap-2 text-center sm:text-left", className)}
      {...props}
    />
  );
}

function DialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className,
      )}
      {...props}
    />
  );
}

function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn("text-lg leading-none font-semibold", className)}
      {...props}
    />
  );
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
};
