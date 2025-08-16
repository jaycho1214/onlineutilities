"use client";

import { StopwatchFullscreen } from "@/features/stopwatch/components/stopwatch-fullscreen";

export default function StopwatchFullscreenPage({
  params,
}: {
  params: { id: string };
}) {
  return <StopwatchFullscreen stopwatchId={params.id} />;
}
