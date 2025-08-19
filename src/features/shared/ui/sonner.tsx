"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        style: {
          background:
            theme === "dark"
              ? "rgba(17, 24, 39, 0.7)"
              : "rgba(255, 255, 255, 0.7)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          border:
            theme === "dark"
              ? "1px solid rgba(255, 255, 255, 0.1)"
              : "1px solid rgba(255, 255, 255, 0.4)",
          boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
          borderRadius: "16px",
        },
        classNames: {
          toast: "group toast",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary/80 group-[.toast]:backdrop-blur group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted/80 group-[.toast]:backdrop-blur group-[.toast]:text-muted-foreground",
          error: "!bg-red-500/20 !border-red-500/30 !backdrop-blur-xl",
          success: "!bg-green-500/20 !border-green-500/30 !backdrop-blur-xl",
          warning: "!bg-yellow-500/20 !border-yellow-500/30 !backdrop-blur-xl",
          info: "!bg-blue-500/20 !border-blue-500/30 !backdrop-blur-xl",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
