import { StopwatchProvider } from "@/features/stopwatch/lib/stopwatch-context";

export default function StopwatchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <StopwatchProvider>{children}</StopwatchProvider>;
}
