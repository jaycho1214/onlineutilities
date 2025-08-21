import { PomodoroPage } from "@/features/pomodoro/pages/pomodoro-page";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pomodoro",
  description:
    "Focus timer with customizable sessions, todo lists, and break intervals for enhanced productivity.",
  openGraph: {
    title: "Pomodoro Timer - Focus & Productivity Tool",
    description:
      "Boost your productivity with our customizable Pomodoro timer. Features multiple sessions, todo lists, custom backgrounds, and sound alerts.",
  },
};

export default function Page() {
  return <PomodoroPage />;
}
