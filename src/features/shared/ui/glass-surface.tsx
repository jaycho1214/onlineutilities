import React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

export interface GlassSurfaceProps extends React.ComponentProps<"div"> {
  children?: React.ReactNode;
  className?: string;
  asChild?: boolean;
}

export const GlassSurface: React.FC<GlassSurfaceProps> = ({
  children,
  className = "",
  asChild,
  ...rest
}) => {
  const Comp = asChild ? Slot : "div";
  return (
    <Comp
      className={cn(
        "relative overflow-hidden rounded-[20px]",
        "transition-all duration-300 ease-out",
        "transform-gpu",
        "bg-gradient-to-br from-white/30 to-white/20",
        "dark:from-white/[0.02] dark:to-white/[0.01]",
        "backdrop-blur-[5px] backdrop-saturate-[0.4]",
        "border border-white/20 dark:border-white/[0.06]",
        "shadow-[0_20px_70px_-15px_rgba(0,0,0,0.15),0_0_0_1px_inset_rgba(255,255,255,0.1)]",
        "dark:shadow-[0_20px_70px_-15px_rgba(0,0,0,0.5),0_0_0_1px_inset_rgba(255,255,255,0.05)]",
        className,
      )}
      {...rest}
    >
      {children}
    </Comp>
  );
};

GlassSurface.displayName = "GlassSurface";
