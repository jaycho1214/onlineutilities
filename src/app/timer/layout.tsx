import { TimerProvider } from "@/features/timer/lib/timer-context";

export default function TimerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <TimerProvider>{children}</TimerProvider>;
}
