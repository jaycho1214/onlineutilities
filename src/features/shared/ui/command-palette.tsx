"use client";

import * as React from "react";
import { Settings, User } from "lucide-react";
import { useRouter } from "next/navigation";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/features/shared/ui/command-glass";

import { useCommand } from "@/features/shared/providers/command-provider";
import { utilities } from "@/constants";

export function CommandPalette() {
  const { open, setOpen } = useCommand();
  const router = useRouter();

  // Global shortcut (⌘/Ctrl + K) to toggle command palette
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(!open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, setOpen]);

  const handleUtilitySelect = React.useCallback(
    (href: string) => {
      router.push(href);
      setOpen(false);
    },
    [router, setOpen],
  );

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Utilities">
          {utilities.map((utility) => {
            const IconComponent = utility.icon;
            const value = [
              utility.name,
              utility.description,
              utility.keywords?.join(" ") || "",
              utility.category || "",
            ]
              .filter(Boolean)
              .join(" ");
            return (
              <CommandItem
                key={utility.id}
                value={value}
                onSelect={() => handleUtilitySelect(utility.href)}
              >
                <IconComponent className="mr-2 h-4 w-4" />
                <span>{utility.name}</span>
                <span className="ml-auto text-xs text-muted-foreground truncate max-w-[40%]">
                  {utility.description}
                </span>
              </CommandItem>
            );
          })}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Settings">
          <CommandItem>
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
            <CommandShortcut>⌘P</CommandShortcut>
          </CommandItem>
          <CommandItem>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
            <CommandShortcut>⌘S</CommandShortcut>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
