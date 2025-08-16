"use client";

import { TimerFullscreen } from "@/features/timer/components/timer-fullscreen";

export default function TimerFullscreenPage({
  params,
}: {
  params: { id: string };
}) {
  return <TimerFullscreen timerId={params.id} />;
}
