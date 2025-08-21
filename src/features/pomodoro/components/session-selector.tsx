"use client";

import React from "react";
import { useTranslations } from "next-intl";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/features/shared/ui/select";
import { usePomodoro } from "../lib/pomodoro-context";

export const SessionSelector = React.memo(function SessionSelector() {
  const t = useTranslations("Pomodoro");
  const { sessions, activeSessionId, setActiveSession, isLoaded } =
    usePomodoro();

  if (!isLoaded || !sessions || sessions.length === 0) {
    return null;
  }

  return (
    <Select value={activeSessionId || ""} onValueChange={setActiveSession}>
      <SelectTrigger className="w-48 bg-white/10 border-white/20 text-white hover:bg-white/20 focus:bg-white/20">
        <SelectValue placeholder={t("session.selectSession")} />
      </SelectTrigger>
      <SelectContent className="bg-black/80 backdrop-blur-sm border-white/20">
        {sessions.map((session) => (
          <SelectItem
            key={session.id}
            value={session.id}
            className="text-white hover:bg-white/10 focus:bg-white/10"
          >
            <div className="flex flex-col items-start">
              <span className="font-medium">{session.title}</span>
              <span className="text-xs text-white/60">
                {session.stats.totalPomodoros} pomodoros
              </span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
});
