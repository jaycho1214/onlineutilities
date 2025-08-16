import { useEffect, useRef, useState } from "react";

/**
 * useRafTicker
 * Provides a shared timestamp updated via requestAnimationFrame while `active` is true.
 * Throttles updates to the specified interval (ms) to reduce render frequency.
 */
export function useRafTicker(active: boolean, intervalMs = 16): number {
  const [now, setNow] = useState(() => Date.now());
  const frameId = useRef<number | null>(null);
  const lastTs = useRef<number>(0);

  useEffect(() => {
    if (!active) {
      if (frameId.current) {
        cancelAnimationFrame(frameId.current);
        frameId.current = null;
      }
      return;
    }
    const loop = (ts: number) => {
      if (!lastTs.current || ts - lastTs.current >= intervalMs) {
        lastTs.current = ts;
        setNow(Date.now());
      }
      frameId.current = requestAnimationFrame(loop);
    };
    frameId.current = requestAnimationFrame(loop);
    return () => {
      if (frameId.current) cancelAnimationFrame(frameId.current);
      frameId.current = null;
    };
  }, [active, intervalMs]);

  return now;
}
