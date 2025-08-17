import { Timer } from "@/features/timer/pages/timer-page";

export const metadata = {
  title: "Timer - Online Utilities",
  description:
    "Set countdown timers with custom durations. Get notified when time's up with optional sound alerts.",
};

export default function Page() {
  return <Timer />;
}
