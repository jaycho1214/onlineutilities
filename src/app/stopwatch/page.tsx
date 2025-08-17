import { Stopwatch } from "@/features/stopwatch/pages/stopwatch-page";

export const metadata = {
  title: "Stopwatch",
  description:
    "Free online stopwatch to track elapsed time. Multiple stopwatches, lap times, split times, and persistent storage. Perfect for sports, workouts, and timing activities.",
  keywords: [
    "stopwatch",
    "online stopwatch",
    "timer",
    "lap times",
    "split times",
    "sports timer",
    "workout timer",
    "elapsed time",
    "precision timer",
  ],
  openGraph: {
    title: "Stopwatch",
    description:
      "Track elapsed time with multiple stopwatches, lap times, and persistent storage.",
    type: "website",
  },
  alternates: {
    canonical: "https://onlineutilities.org/stopwatch",
  },
};

export default function Page() {
  return <Stopwatch />;
}
