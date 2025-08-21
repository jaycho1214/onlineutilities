"use client";

import React, { useMemo, useEffect } from "react";
import { usePomodoro } from "../lib/pomodoro-context";
import { formatDuration } from "@/lib/time";
import { cn } from "@/lib/utils";
import confetti from "canvas-confetti";

// ============================================================================
// CIRCULAR PROGRESS COMPONENT
// ============================================================================

interface CircularProgressProps {
  value: number; // 0 to 1
  size: number;
  strokeWidth: number;
  className?: string;
}

const CircularProgress = React.memo(function CircularProgress({
  value,
  size,
  strokeWidth,
  className = "",
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - value * circumference;

  return (
    <div
      className={cn("relative", className)}
      style={{ width: size, height: size }}
    >
      {/* Background Circle */}
      <svg
        className="absolute inset-0 -rotate-90 transform"
        width={size}
        height={size}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--border))"
          strokeWidth={strokeWidth}
        />
        {/* Progress Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-300 ease-out"
          style={{
            filter: "drop-shadow(0 0 8px hsl(var(--primary) / 0.3))",
          }}
        />
      </svg>
    </div>
  );
});

// ============================================================================
// POMODORO TIMER COMPONENT
// ============================================================================

export const PomodoroTimer = React.memo(function PomodoroTimer() {
  const { timer, isTimerRunning } = usePomodoro();

  // Trigger confetti when timer completes
  useEffect(() => {
    if (timer?.status === "completed") {
      // Full page confetti falling from top
      const duration = 3000;
      const animationEnd = Date.now() + duration;
      const defaults = {
        startVelocity: 30,
        spread: 360,
        ticks: 60,
        zIndex: 9999,
        colors: [
          "#ff6b6b",
          "#4ecdc4",
          "#45b7d1",
          "#96ceb4",
          "#ffeaa7",
          "#f0a1a8",
          "#a8e6cf",
        ],
      };

      function randomInRange(min: number, max: number) {
        return Math.random() * (max - min) + min;
      }

      const fireConfetti = () => {
        // Fire from multiple points across the top
        confetti({
          ...defaults,
          particleCount: 50,
          origin: { x: randomInRange(0.1, 0.3), y: 0 },
        });
        confetti({
          ...defaults,
          particleCount: 50,
          origin: { x: randomInRange(0.7, 0.9), y: 0 },
        });

        if (Date.now() < animationEnd) {
          requestAnimationFrame(fireConfetti);
        }
      };

      fireConfetti();
    }
  }, [timer?.status]);

  // Add CSS animation for tick effect
  React.useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @keyframes tick {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.02); }
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const progress = useMemo(() => {
    if (!timer || timer.currentDuration === 0) return 0;
    return 1 - timer.timeRemaining / timer.currentDuration;
  }, [timer]);

  const timeDisplay = useMemo(() => {
    if (!timer) return "25:00";
    return formatDuration(timer.timeRemaining);
  }, [timer]);

  const timerColor = useMemo(() => {
    if (!timer) return "text-foreground";

    switch (timer.type) {
      case "pomodoro":
        return "text-red-600 dark:text-red-400";
      case "shortBreak":
        return "text-green-600 dark:text-green-400";
      case "longBreak":
        return "text-blue-600 dark:text-blue-400";
      default:
        return "text-foreground";
    }
  }, [timer]);

  const isBreak = timer?.type === "shortBreak" || timer?.type === "longBreak";

  return (
    <div className="relative flex items-center justify-center">
      {/* Animated background glow */}
      {isTimerRunning && (
        <div
          className={`
            absolute rounded-full blur-xl opacity-20 animate-pulse
            w-80 h-80 -left-40 -top-40
            ${
              timer?.type === "pomodoro"
                ? "bg-red-500"
                : timer?.type === "shortBreak"
                  ? "bg-green-500"
                  : "bg-blue-500"
            }
          `}
        />
      )}

      {/* Timer Circle Container */}
      <div className="relative">
        {/* Progress Ring */}
        <CircularProgress
          value={progress}
          size={380}
          strokeWidth={10}
          className="mb-4"
        />

        {/* Timer Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {/* Time */}
          <div
            className={`
              text-8xl sm:text-9xl md:text-[12rem] lg:text-[14rem] font-mono font-bold 
              transition-all duration-300 ${timerColor}
              ${isTimerRunning ? "animate-pulse" : ""}
            `}
            style={{
              textShadow: "0 0 40px rgba(255, 255, 255, 0.4)",
              animation: isTimerRunning
                ? "tick 1s ease-in-out infinite"
                : "none",
            }}
          >
            {timeDisplay}
          </div>
        </div>

        {/* Decorative Elements */}
        {isTimerRunning && (
          <>
            {/* Rotating outer ring */}
            <div
              className="absolute inset-0 rounded-full border-2 border-white/20 animate-spin"
              style={{
                width: "340px",
                height: "340px",
                transform: "translate(-50%, -50%)",
                left: "50%",
                top: "50%",
                animationDuration: "20s",
                animationDirection: "reverse",
              }}
            />

            {/* Pulsing inner circle */}
            <div
              className="absolute inset-0 rounded-full border border-white/30 animate-ping"
              style={{
                width: "300px",
                height: "300px",
                transform: "translate(-50%, -50%)",
                left: "50%",
                top: "50%",
              }}
            />
          </>
        )}

        {/* Completion celebration effect */}
        {timer?.status === "completed" && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-4xl animate-bounce">
              {isBreak ? "🎉" : "✨"}
            </div>
          </div>
        )}
      </div>
    </div>
  );
});
