/**
 * Time / formatting utilities shared across features.
 */

/**
 * Format an elapsed duration (in ms) into a stopwatch string.
 * Examples:
 *  - < 1 hour: mm:ss.SS
 *  - >= 1 hour: HH:MM:SS.SS
 */
export function formatElapsedTime(msTotal: number): string {
  if (msTotal < 0) msTotal = 0;
  const totalSeconds = Math.floor(msTotal / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const centiseconds = Math.floor((msTotal % 1000) / 10);
  if (hours > 0) {
    return (
      [hours, minutes, seconds]
        .map((n) => n.toString().padStart(2, "0"))
        .join(":") + `.${centiseconds.toString().padStart(2, "0")}`
    );
  }
  return (
    [minutes, seconds].map((n) => n.toString().padStart(2, "0")).join(":") +
    `.${centiseconds.toString().padStart(2, "0")}`
  );
}

/**
 * Lightweight formatter for lap-only display (always mm:ss.SS, hours folded).
 */
export function formatLapTime(msTotal: number): string {
  if (msTotal < 0) msTotal = 0;
  const totalSeconds = Math.floor(msTotal / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const centiseconds = Math.floor((msTotal % 1000) / 10);
  return `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}.${centiseconds.toString().padStart(2, "0")}`;
}

/**
 * Generic duration formatter (ms) without fractional part.
 * Shows HH:MM:SS if >= 1 hour else MM:SS.
 */
export function formatDuration(msTotal: number): string {
  if (msTotal < 0) msTotal = 0;
  const totalSeconds = Math.floor(msTotal / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) {
    return [hours, minutes, seconds]
      .map((n) => n.toString().padStart(2, "0"))
      .join(":");
  }
  return [minutes, seconds].map((n) => n.toString().padStart(2, "0")).join(":");
}
