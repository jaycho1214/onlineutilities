"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/features/shared/ui/button";
import type { GeneratorType } from "../types";
import {
  KeyRound,
  Hash,
  Fingerprint,
  Code,
  Type,
  ToggleLeft,
  Palette,
  Calendar,
  ChevronDown,
  Globe,
} from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/features/shared/ui/command-glass";

interface RandomGeneratorTypeSelectorProps {
  activeType: GeneratorType;
  onTypeChange: (type: GeneratorType) => void;
}

const typeIcons: Record<GeneratorType, React.ComponentType<{ className?: string }>> = {
  password: KeyRound,
  number: Hash,
  uuid: Fingerprint,
  nanoid: Code,
  cuid: Globe,
  string: Type,
  boolean: ToggleLeft,
  color: Palette,
  date: Calendar,
};

export function RandomGeneratorTypeSelector({
  activeType,
  onTypeChange,
}: RandomGeneratorTypeSelectorProps) {
  const t = useTranslations("RandomGenerator");
  const [isOpen, setIsOpen] = useState(false);

  const types: GeneratorType[] = [
    "password",
    "number", 
    "uuid",
    "nanoid",
    "cuid",
    "string",
    "boolean",
    "color",
    "date",
  ];

  const getTypeIcon = (type: GeneratorType) => {
    const Icon = typeIcons[type];
    return <Icon className="size-4" />;
  };

  const handleTypeChange = (type: GeneratorType) => {
    onTypeChange(type);
    setIsOpen(false);
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        className="w-full justify-start gap-2 h-10 px-3 text-left bg-white/30 dark:bg-white/5 backdrop-blur-sm border-black/10 dark:border-white/10 hover:bg-white/40 dark:hover:bg-white/10"
      >
        {getTypeIcon(activeType)}
        <span className="font-medium">
          {t(`types.${activeType}`)}
        </span>
        <ChevronDown className="size-4 opacity-50 ml-auto" />
      </Button>

      <CommandDialog open={isOpen} onOpenChange={setIsOpen}>
        <CommandInput placeholder="Search generators..." />
        <CommandList>
          <CommandEmpty>No generator found</CommandEmpty>
          <CommandGroup heading="Available Generators">
            {types.map((type) => (
              <CommandItem
                key={type}
                value={type}
                onSelect={() => handleTypeChange(type)}
                className="flex items-center gap-3 py-3"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/30 dark:bg-white/10 backdrop-blur-sm border border-black/5 dark:border-white/5">
                  {getTypeIcon(type)}
                </div>
                <div className="flex flex-col">
                  <span className="font-medium">
                    {t(`types.${type}`)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {t(`${type}.description`)}
                  </span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}