import { StopwatchFullscreen } from "@/features/stopwatch/components/stopwatch-fullscreen";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <StopwatchFullscreen stopwatchId={id} />;
}
