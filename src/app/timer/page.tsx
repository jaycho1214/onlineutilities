import { Timer } from "@/features/timer/pages/timer-page";

export const metadata = {
  title: "Timer",
  description:
    "Set countdown timers with custom durations. Multiple timers, sound alerts, and fullscreen mode. Perfect for productivity, cooking, and workouts.",
  keywords: [
    "timer",
    "online timer",
    "countdown timer",
    "pomodoro timer",
    "cooking timer",
    "workout timer",
    "productivity timer",
    "alarm timer",
  ],
  openGraph: {
    title: "Timer",
    description:
      "Set countdown timers with custom durations. Multiple timers, sound alerts, and fullscreen mode available.",
    type: "website",
  },
  alternates: {
    canonical: "https://onlineutilities.org/timer",
  },
};

export default function Page() {
  return <Timer />;
}
