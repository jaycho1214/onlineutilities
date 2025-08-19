"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter 
} from "@/features/shared/ui/dialog";
import { Button } from "@/features/shared/ui/button";
import { Settings, GitBranch, Eye, Type, Code, FileText } from "lucide-react";
import { useTextDiff } from "../lib/text-diff-context";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

interface TextDiffSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TextDiffSettingsDialog({ open, onOpenChange }: TextDiffSettingsDialogProps) {
  const t = useTranslations("TextDiff");
  const { state, updateDiffOptions, updateUISettings } = useTextDiff();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-hidden">
        <div className="flex flex-col h-full max-h-[calc(85vh-2rem)]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="size-5" />
            {t("settings.title")}
          </DialogTitle>
          <DialogDescription>
            {t("settings.description")}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6 my-4 px-1 min-h-0">
          {/* Diff Algorithm Options */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-border/50">
              <GitBranch className="size-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">{t("settings.diffOptions")}</h3>
            </div>
            
            <div className="grid gap-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/40">
                <div className="flex items-center gap-3">
                  <Code className="size-4 text-muted-foreground" />
                  <div>
                    <Label htmlFor="ignore-case" className="text-sm font-medium text-foreground">
                      {t("settings.ignoreCase")}
                    </Label>
                    <p className="text-xs text-muted-foreground">{t("settings.ignoreCaseDesc")}</p>
                  </div>
                </div>
                <Switch
                  id="ignore-case"
                  checked={state.diffOptions.ignoreCase}
                  onCheckedChange={(checked) => 
                    updateDiffOptions({ ignoreCase: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/40">
                <div className="flex items-center gap-3">
                  <FileText className="size-4 text-muted-foreground" />
                  <div>
                    <Label htmlFor="ignore-whitespace" className="text-sm font-medium text-foreground">
                      {t("settings.ignoreWhitespace")}
                    </Label>
                    <p className="text-xs text-muted-foreground">{t("settings.ignoreWhitespaceDesc")}</p>
                  </div>
                </div>
                <Switch
                  id="ignore-whitespace"
                  checked={state.diffOptions.ignoreWhitespace}
                  onCheckedChange={(checked) => 
                    updateDiffOptions({ ignoreWhitespace: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/40">
                <div className="flex items-center gap-3">
                  <Type className="size-4 text-muted-foreground" />
                  <div>
                    <Label htmlFor="ignore-newline" className="text-sm font-medium text-foreground">
                      {t("settings.ignoreNewlineAtEof")}
                    </Label>
                    <p className="text-xs text-muted-foreground">{t("settings.ignoreNewlineAtEofDesc")}</p>
                  </div>
                </div>
                <Switch
                  id="ignore-newline"
                  checked={state.diffOptions.ignoreNewlineAtEof}
                  onCheckedChange={(checked) => 
                    updateDiffOptions({ ignoreNewlineAtEof: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/40">
                <div className="flex items-center gap-3">
                  <FileText className="size-4 text-muted-foreground" />
                  <div>
                    <Label htmlFor="newline-token" className="text-sm font-medium text-foreground">
                      {t("settings.newlineIsToken")}
                    </Label>
                    <p className="text-xs text-muted-foreground">{t("settings.newlineIsTokenDesc")}</p>
                  </div>
                </div>
                <Switch
                  id="newline-token"
                  checked={state.diffOptions.newlineIsToken}
                  onCheckedChange={(checked) => 
                    updateDiffOptions({ newlineIsToken: checked })
                  }
                />
              </div>

              <div className="p-3 rounded-lg bg-muted/30 border border-border/40">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Eye className="size-4 text-muted-foreground" />
                    <div>
                      <Label htmlFor="context-lines" className="text-sm font-medium text-foreground">
                        {t("settings.contextLines")}: {state.diffOptions.context ?? 3}
                      </Label>
                      <p className="text-xs text-muted-foreground">{t("settings.contextLinesDesc")}</p>
                    </div>
                  </div>
                  <Slider
                    id="context-lines"
                    min={0}
                    max={10}
                    step={1}
                    value={[state.diffOptions.context ?? 3]}
                    onValueChange={([value]) => 
                      updateDiffOptions({ context: value })
                    }
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Display Options */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-border/50">
              <Eye className="size-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">{t("settings.uiOptions")}</h3>
            </div>
            
            <div className="grid gap-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/40">
                <div className="flex items-center gap-3">
                  <FileText className="size-4 text-muted-foreground" />
                  <div>
                    <Label htmlFor="line-numbers" className="text-sm font-medium text-foreground">
                      {t("settings.showLineNumbers")}
                    </Label>
                    <p className="text-xs text-muted-foreground">{t("settings.showLineNumbersDesc")}</p>
                  </div>
                </div>
                <Switch
                  id="line-numbers"
                  checked={state.uiSettings.showLineNumbers}
                  onCheckedChange={(checked) => 
                    updateUISettings({ showLineNumbers: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/40">
                <div className="flex items-center gap-3">
                  <Type className="size-4 text-muted-foreground" />
                  <div>
                    <Label htmlFor="word-wrap" className="text-sm font-medium text-foreground">
                      {t("settings.wordWrap")}
                    </Label>
                    <p className="text-xs text-muted-foreground">{t("settings.wordWrapDesc")}</p>
                  </div>
                </div>
                <Switch
                  id="word-wrap"
                  checked={state.uiSettings.wordWrap}
                  onCheckedChange={(checked) => 
                    updateUISettings({ wordWrap: checked })
                  }
                />
              </div>

              <div className="p-3 rounded-lg bg-muted/30 border border-border/40">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Type className="size-4 text-muted-foreground" />
                    <div>
                      <Label htmlFor="font-size" className="text-sm font-medium text-foreground">
                        Font Size: {state.uiSettings.fontSize}px
                      </Label>
                      <p className="text-xs text-muted-foreground">{t("settings.fontSizeDesc")}</p>
                    </div>
                  </div>
                  <Slider
                    id="font-size"
                    min={10}
                    max={20}
                    step={1}
                    value={[state.uiSettings.fontSize]}
                    onValueChange={([value]) => 
                      updateUISettings({ fontSize: value })
                    }
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-shrink-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            size="sm"
          >
            {t("actions.close")}
          </Button>
        </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}