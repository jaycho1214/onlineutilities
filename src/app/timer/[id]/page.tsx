import { TimerFullscreen } from "@/features/timer/components/timer-fullscreen";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <TimerFullscreen timerId={id} />;
}
