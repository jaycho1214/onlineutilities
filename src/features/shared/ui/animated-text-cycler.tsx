import React, { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";

interface AnimatedTextCyclerProps {
  texts: string[];
  interval?: number; // in milliseconds, default 3000 (3 seconds)
  className?: string;
  animationDuration?: number; // animation duration in milliseconds, default 300
  pauseOnHover?: boolean; // pause cycling when hovering, default true
  randomOrder?: boolean; // cycle in random order, default false
}

export const AnimatedTextCycler: React.FC<AnimatedTextCyclerProps> = ({
  texts,
  interval = 3000,
  className,
  animationDuration = 300,
  pauseOnHover = true,
  randomOrder = false,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [usedIndices, setUsedIndices] = useState<Set<number>>(new Set());

  const getNextIndex = useCallback(() => {
    if (!randomOrder) {
      return (currentIndex + 1) % texts.length;
    }

    // Random order logic
    let availableIndices = Array.from(
      { length: texts.length }, 
      (_, i) => i
    ).filter(i => !usedIndices.has(i) && i !== currentIndex);

    // If all indices have been used (except current), reset
    if (availableIndices.length === 0) {
      setUsedIndices(new Set([currentIndex]));
      availableIndices = Array.from(
        { length: texts.length }, 
        (_, i) => i
      ).filter(i => i !== currentIndex);
    }

    const randomIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
    setUsedIndices(prev => new Set([...prev, randomIndex]));
    return randomIndex;
  }, [currentIndex, texts.length, randomOrder, usedIndices]);

  const cycleText = useCallback(() => {
    if (isPaused || texts.length <= 1) return;

    // Fade out
    setIsVisible(false);
    
    // Change text after fade out completes
    setTimeout(() => {
      setCurrentIndex(getNextIndex());
      setIsVisible(true);
    }, animationDuration);
  }, [isPaused, texts.length, animationDuration, getNextIndex]);

  useEffect(() => {
    if (texts.length <= 1) return;

    const intervalId = setInterval(cycleText, interval);
    return () => clearInterval(intervalId);
  }, [cycleText, interval, texts.length]);

  const handleMouseEnter = () => {
    if (pauseOnHover) {
      setIsPaused(true);
    }
  };

  const handleMouseLeave = () => {
    if (pauseOnHover) {
      setIsPaused(false);
    }
  };

  if (!texts || texts.length === 0) {
    return null;
  }

  return (
    <span
      className={cn(
        "inline-block transition-opacity ease-in-out",
        isVisible ? "opacity-100" : "opacity-0",
        className
      )}
      style={{
        transitionDuration: `${animationDuration}ms`,
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {texts[currentIndex]}
    </span>
  );
};