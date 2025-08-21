"use client";

import React from "react";
import { GradientBackground } from "@/features/shared/ui/gradient-background";
import { GlassSurface } from "@/features/shared/ui/glass-surface";
import { cn } from "@/lib/utils";

// ============================================================================
// TOMATO ANIMATION
// ============================================================================

function TomatoAnimation() {
  return (
    <div className="relative w-full">
      {/* Rotating glow effect */}
      <div className="absolute inset-0 animate-spin-slow">
        <div className="w-full h-full rounded-full bg-gradient-to-r from-red-500/20 via-orange-500/20 to-red-500/20 blur-xl" />
      </div>

      {/* Main tomato - using grid positioning */}
      <div className="z-10 animate-bounce-subtle text-6xl animate-pulse-gentle">
        🍅
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className={cn(
              "absolute w-1 h-1 bg-red-400/60 rounded-full animate-float",
              i === 0 && "top-2 left-4 animate-delay-0",
              i === 1 && "top-6 right-3 animate-delay-300",
              i === 2 && "bottom-4 left-6 animate-delay-600",
            )}
          />
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// LOADING DOTS
// ============================================================================

function LoadingDots() {
  return (
    <div className="flex items-center justify-center gap-2">
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className={cn(
            "w-2 h-2 bg-white/60 rounded-full animate-bounce",
            i === 0 && "animate-delay-0",
            i === 1 && "animate-delay-150",
            i === 2 && "animate-delay-300",
          )}
        />
      ))}
    </div>
  );
}

// ============================================================================
// PROGRESS RING
// ============================================================================

function ProgressRing({ progress = 0 }: { progress?: number }) {
  const circumference = 2 * Math.PI * 45; // radius of 45
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative">
      <svg className="w-32 h-32 -rotate-90" viewBox="0 0 100 100">
        {/* Background circle */}
        <circle
          cx="50"
          cy="50"
          r="45"
          stroke="currentColor"
          strokeWidth="2"
          fill="transparent"
          className="text-white/20"
        />
        {/* Progress circle */}
        <circle
          cx="50"
          cy="50"
          r="45"
          stroke="currentColor"
          strokeWidth="2"
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          className="text-red-400 transition-all duration-700 ease-out"
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <TomatoAnimation />
      </div>
    </div>
  );
}

// ============================================================================
// MAIN POMODORO LOADING COMPONENT
// ============================================================================

interface PomodoroLoadingProps {
  variant?: "simple" | "detailed" | "minimal";
  message?: string;
  showProgress?: boolean;
  progress?: number;
  size?: "sm" | "md" | "lg";
}

export function PomodoroLoading({
  variant = "detailed",
  message = "Loading your Pomodoro session...",
  showProgress = false,
  progress = 0,
  size = "md",
}: PomodoroLoadingProps) {
  const sizeClasses = {
    sm: "p-4 max-w-sm",
    md: "p-8 max-w-md",
    lg: "p-12 max-w-lg",
  };

  if (variant === "minimal") {
    return (
      <div className="flex items-center justify-center gap-3">
        <div className="text-2xl animate-bounce-subtle">🍅</div>
        <LoadingDots />
      </div>
    );
  }

  if (variant === "simple") {
    return (
      <div className="flex items-center justify-center">
        <div className="text-center space-y-4">
          <TomatoAnimation />
          <div className="text-white/80 font-medium">{message}</div>
          <LoadingDots />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <GradientBackground />
      <GlassSurface className={cn("text-center space-y-6", sizeClasses[size])}>
        {showProgress ? (
          <ProgressRing progress={progress} />
        ) : (
          <TomatoAnimation />
        )}

        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-white font-[family-name:var(--font-eb-garamond)]">
            Focus Time
          </h2>
          <p className="text-white/70 text-sm">{message}</p>
        </div>

        <LoadingDots />

        {/* Subtle tip */}
        <div className="text-xs text-white/50 italic">
          Preparing your productive session...
        </div>
      </GlassSurface>
    </div>
  );
}

// ============================================================================
// CUSTOM ANIMATIONS (add to globals.css)
// ============================================================================

export const pomodoroLoadingStyles = `
@keyframes spin-slow {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes bounce-subtle {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-8px);
  }
}

@keyframes pulse-gentle {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px);
    opacity: 0.3;
  }
  50% {
    transform: translateY(-20px);
    opacity: 0.8;
  }
}

.animate-spin-slow {
  animation: spin-slow 3s linear infinite;
}

.animate-bounce-subtle {
  animation: bounce-subtle 2s ease-in-out infinite;
}

.animate-pulse-gentle {
  animation: pulse-gentle 2s ease-in-out infinite;
}

.animate-float {
  animation: float 3s ease-in-out infinite;
}

.animate-delay-0 {
  animation-delay: 0ms;
}

.animate-delay-150 {
  animation-delay: 150ms;
}

.animate-delay-300 {
  animation-delay: 300ms;
}

.animate-delay-600 {
  animation-delay: 600ms;
}
`;
