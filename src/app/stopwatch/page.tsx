import { Stopwatch } from "@/features/stopwatch/pages/stopwatch-page";

export const metadata = {
  title: "Stopwatch - Online Utilities",
  description:
    "Track elapsed time with multiple stopwatches, lap times, and persistent storage.",
};

export default function Page() {
  return <Stopwatch />;
}
