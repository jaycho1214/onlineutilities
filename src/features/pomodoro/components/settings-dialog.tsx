"use client";

import React, { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/features/shared/ui/dialog";
import { Button } from "@/features/shared/ui/button";
import { Input } from "@/features/shared/ui/input";
import { Switch } from "@/features/shared/ui/switch";
import { Slider } from "@/features/shared/ui/slider";
import { Label } from "@/features/shared/ui/label";
import { GlassSurface } from "@/features/shared/ui/glass-surface";
import {
  Settings,
  Clock,
  Volume2,
  VolumeX,
  Bell,
  BellOff,
  Image as ImageIcon,
  Trash2,
  Upload,
  Play,
} from "lucide-react";
import { usePomodoro } from "../lib/pomodoro-context";
import { type TimerSettings, DEFAULT_TIMER_SETTINGS } from "../types";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const t = useTranslations("Pomodoro.settings");
  const { currentSession, updateSettings, updateBackground } = usePomodoro();

  const [settings, setSettings] = useState<TimerSettings>(
    currentSession?.settings || DEFAULT_TIMER_SETTINGS,
  );
  const [backgroundPreview, setBackgroundPreview] = useState(
    currentSession?.backgroundImage || null,
  );

  // Update local state when session changes
  React.useEffect(() => {
    if (currentSession) {
      setSettings(currentSession.settings);
      setBackgroundPreview(currentSession.backgroundImage || null);
    }
  }, [currentSession]);

  const handleSaveSettings = async () => {
    if (!currentSession) return;

    try {
      await updateSettings(currentSession.id, settings);
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to save settings:", error);
    }
  };

  const handleTestSound = useCallback(() => {
    if (settings.soundEnabled) {
      const audio = new Audio("/alarm-clock.mp3");
      audio.volume = settings.soundVolume;
      audio.play().catch(() => {});
    }
  }, [settings.soundEnabled, settings.soundVolume]);

  const handleBackgroundUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      if (!file.type.startsWith("image/")) {
        alert("Please select an image file");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setBackgroundPreview(result);
      };
      reader.readAsDataURL(file);
    },
    [],
  );

  const handleSaveBackground = async () => {
    if (!currentSession) return;

    try {
      await updateBackground(currentSession.id, backgroundPreview);
    } catch (error) {
      console.error("Failed to save background:", error);
    }
  };

  const handleRemoveBackground = async () => {
    if (!currentSession) return;

    try {
      await updateBackground(currentSession.id, null);
      setBackgroundPreview(null);
    } catch (error) {
      console.error("Failed to remove background:", error);
    }
  };

  if (!currentSession) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-2xl max-h-[85vh] overflow-hidden"
        onDrop={(e) => {
          e.preventDefault();
          const imageData = e.dataTransfer.getData("text/plain");
          if (imageData) {
            setBackgroundPreview(imageData);
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
        }}
      >
        <div className="flex flex-col h-full max-h-[calc(85vh-2rem)]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="size-5" />
              {t("title")} - {currentSession.title}
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto space-y-6 my-4 px-1 min-h-0">
            {/* Timer Duration Settings */}
            <GlassSurface className="p-4 space-y-4">
              <h3 className="text-white font-medium flex items-center gap-2">
                <Clock className="size-4" />
                {t("sections.durations")}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white/80 flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    {t("labels.pomodoroMinutes")}
                  </Label>
                  <Input
                    type="number"
                    min="1"
                    max="60"
                    value={settings.pomodoroMinutes}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        pomodoroMinutes: Math.max(
                          1,
                          parseInt(e.target.value) || 25,
                        ),
                      })
                    }
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-white/80 flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                    {t("labels.shortBreakMinutes")}
                  </Label>
                  <Input
                    type="number"
                    min="1"
                    max="30"
                    value={settings.shortBreakMinutes}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        shortBreakMinutes: Math.max(
                          1,
                          parseInt(e.target.value) || 5,
                        ),
                      })
                    }
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-white/80 flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-400" />
                    {t("labels.longBreakMinutes")}
                  </Label>
                  <Input
                    type="number"
                    min="1"
                    max="60"
                    value={settings.longBreakMinutes}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        longBreakMinutes: Math.max(
                          1,
                          parseInt(e.target.value) || 15,
                        ),
                      })
                    }
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-white/80 flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-purple-400" />
                    {t("labels.longBreakInterval")}
                  </Label>
                  <Input
                    type="number"
                    min="2"
                    max="10"
                    value={settings.longBreakInterval}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        longBreakInterval: Math.max(
                          2,
                          parseInt(e.target.value) || 4,
                        ),
                      })
                    }
                    className="bg-white/10 border-white/20 text-white"
                  />
                  <p className="text-xs text-white/60">
                    {t("descriptions.longBreakInterval")}
                  </p>
                </div>
              </div>
            </GlassSurface>

            {/* Auto-Start Settings */}
            <GlassSurface className="p-4 space-y-4">
              <h3 className="text-white font-medium flex items-center gap-2">
                <Play className="size-4" />
                {t("sections.autoStart")}
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white/80">
                      {t("labels.autoStartBreaks")}
                    </Label>
                    <p className="text-xs text-white/60">
                      {t("descriptions.autoStartBreaks")}
                    </p>
                  </div>
                  <Switch
                    checked={settings.autoStartBreaks}
                    onCheckedChange={(checked) =>
                      setSettings({
                        ...settings,
                        autoStartBreaks: checked,
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white/80">
                      {t("labels.autoStartPomodoros")}
                    </Label>
                    <p className="text-xs text-white/60">
                      {t("descriptions.autoStartPomodoros")}
                    </p>
                  </div>
                  <Switch
                    checked={settings.autoStartPomodoros}
                    onCheckedChange={(checked) =>
                      setSettings({
                        ...settings,
                        autoStartPomodoros: checked,
                      })
                    }
                  />
                </div>
              </div>
            </GlassSurface>

            {/* Sound Settings */}
            <GlassSurface className="p-4 space-y-4">
              <h3 className="text-white font-medium flex items-center gap-2">
                {settings.soundEnabled ? (
                  <Volume2 className="size-4" />
                ) : (
                  <VolumeX className="size-4" />
                )}
                {t("sections.sound")}
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-white/80">
                    {t("labels.soundEnabled")}
                  </Label>
                  <Switch
                    checked={settings.soundEnabled}
                    onCheckedChange={(checked) =>
                      setSettings({
                        ...settings,
                        soundEnabled: checked,
                      })
                    }
                  />
                </div>

                {settings.soundEnabled && (
                  <div className="space-y-3">
                    <Label className="text-white/80">
                      {t("labels.volume")}
                    </Label>
                    <div className="flex items-center gap-4">
                      <Slider
                        value={[settings.soundVolume]}
                        onValueChange={(value) =>
                          setSettings({
                            ...settings,
                            soundVolume: value[0],
                          })
                        }
                        max={1}
                        min={0}
                        step={0.1}
                        className="flex-1"
                      />
                      <Button
                        variant="outline"
                        onClick={handleTestSound}
                        size="default"
                        className="bg-white/10 border-white/20 text-white hover:bg-white/20 px-4 py-2"
                      >
                        {t("actions.testSound")}
                      </Button>
                    </div>
                    <p className="text-xs text-white/60">
                      {t("descriptions.volume", {
                        volume: Math.round(settings.soundVolume * 100),
                      })}
                    </p>
                  </div>
                )}
              </div>
            </GlassSurface>

            {/* Notification Settings */}
            <GlassSurface className="p-4 space-y-4">
              <h3 className="text-white font-medium flex items-center gap-2">
                {settings.notificationsEnabled ? (
                  <Bell className="size-4" />
                ) : (
                  <BellOff className="size-4" />
                )}
                {t("sections.notifications")}
              </h3>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-white/80">
                    {t("labels.notificationsEnabled")}
                  </Label>
                  <p className="text-xs text-white/60">
                    {t("descriptions.notifications")}
                  </p>
                </div>
                <Switch
                  checked={settings.notificationsEnabled}
                  onCheckedChange={(checked) =>
                    setSettings({
                      ...settings,
                      notificationsEnabled: checked,
                    })
                  }
                />
              </div>
            </GlassSurface>

            {/* Background Settings */}
            <GlassSurface className="p-4 space-y-4">
              <h3 className="text-white font-medium flex items-center gap-2">
                <ImageIcon className="size-4" />
                {t("sections.background")}
              </h3>

              <div className="space-y-4">
                {backgroundPreview && (
                  <div className="space-y-2">
                    <div
                      className="w-full h-32 rounded-lg bg-cover bg-center border border-white/20 cursor-move"
                      style={{ backgroundImage: `url(${backgroundPreview})` }}
                      draggable={true}
                      onDragStart={(e) => {
                        e.dataTransfer.setData("text/plain", backgroundPreview);
                      }}
                    />
                    <div className="flex gap-2">
                      <Button
                        onClick={handleSaveBackground}
                        className="bg-green-500/30 hover:bg-green-500/40 text-green-200 border-green-500/40"
                        variant="outline"
                      >
                        {t("actions.saveBackground")}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleRemoveBackground}
                        className="bg-red-500/30 hover:bg-red-500/40 text-red-200 border-red-500/40"
                      >
                        <Trash2 className="size-4 mr-1" />
                        {t("actions.remove")}
                      </Button>
                    </div>
                  </div>
                )}

                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleBackgroundUpload}
                    className="hidden"
                    id="background-upload"
                  />
                  <Label
                    htmlFor="background-upload"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white hover:bg-white/20 cursor-pointer transition-colors"
                  >
                    <Upload className="size-4" />
                    {t("actions.uploadBackground")}
                  </Label>
                </div>

                <p className="text-xs text-white/60">
                  {t("descriptions.background")}
                </p>
              </div>
            </GlassSurface>
          </div>

          {/* Actions */}
          <DialogFooter>
            <Button
              onClick={handleSaveSettings}
              size="default"
              className="flex-1"
            >
              {t("actions.saveSettings")}
            </Button>
            <Button
              variant="outline"
              size="default"
              onClick={() => onOpenChange(false)}
            >
              {t("actions.cancel")}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
