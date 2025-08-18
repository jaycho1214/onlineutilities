import React from "react";
import { AnimatedTextCycler } from "./animated-text-cycler";
import { cn } from "@/lib/utils";

interface AnimatedTipsProps {
  tips: string[];
  interval?: number;
  className?: string;
  prefix?: string;
  randomOrder?: boolean;
}

export const AnimatedTips: React.FC<AnimatedTipsProps> = ({
  tips,
  interval = 3000,
  className,
  prefix = "💡 Tip: ",
  randomOrder = true,
}) => {
  if (!tips || tips.length === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        "flex items-center gap-1 text-sm text-muted-foreground",
        className,
      )}
    >
      <span className="flex-shrink-0">{prefix}</span>
      <AnimatedTextCycler
        texts={tips}
        interval={interval}
        randomOrder={randomOrder}
        animationDuration={400}
        pauseOnHover={true}
        className="transition-all duration-400"
      />
    </div>
  );
};
