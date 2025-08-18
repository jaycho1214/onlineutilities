"use client";

import React from "react";
import { useRandomGenerator } from "../lib/random-generator-context";
import { PasswordControls } from "./controls/password-controls";
import { NumberControls } from "./controls/number-controls";
import { UuidControls } from "./controls/uuid-controls";
import { NanoidControls } from "./controls/nanoid-controls";
import { CuidControls } from "./controls/cuid-controls";
import { StringControls } from "./controls/string-controls";
import { BooleanControls } from "./controls/boolean-controls";
import { ColorControls } from "./controls/color-controls";
import { DateControls } from "./controls/date-controls";
import type { 
  GeneratorType, 
  GeneratorConfig,
  PasswordConfig,
  NumberConfig,
  UuidConfig,
  NanoidConfig,
  CuidConfig,
  StringConfig,
  BooleanConfig,
  ColorConfig,
  DateConfig
} from "../types";

interface RandomGeneratorControlsProps {
  type: GeneratorType;
  config: GeneratorConfig;
  onConfigChange: (config: GeneratorConfig) => void;
}

export function RandomGeneratorControls({
  type,
  config,
  onConfigChange,
}: RandomGeneratorControlsProps) {
  const { updateConfig } = useRandomGenerator();

  const handleConfigChange = (newConfig: GeneratorConfig) => {
    updateConfig(type, newConfig);
    onConfigChange(newConfig);
  };

  switch (type) {
    case "password":
      return (
        <PasswordControls
          config={config as PasswordConfig}
          onChange={handleConfigChange}
        />
      );
    
    case "number":
      return (
        <NumberControls
          config={config as NumberConfig}
          onChange={handleConfigChange}
        />
      );
    
    case "uuid":
      return (
        <UuidControls
          config={config as UuidConfig}
          onChange={handleConfigChange}
        />
      );
    
    case "nanoid":
      return (
        <NanoidControls
          config={config as NanoidConfig}
          onChange={handleConfigChange}
        />
      );
    
    case "cuid":
      return (
        <CuidControls
          config={config as CuidConfig}
          onChange={handleConfigChange}
        />
      );
    
    case "string":
      return (
        <StringControls
          config={config as StringConfig}
          onChange={handleConfigChange}
        />
      );
    
    case "boolean":
      return (
        <BooleanControls
          config={config as BooleanConfig}
          onChange={handleConfigChange}
        />
      );
    
    case "color":
      return (
        <ColorControls
          config={config as ColorConfig}
          onChange={handleConfigChange}
        />
      );
    
    case "date":
      return (
        <DateControls
          config={config as DateConfig}
          onChange={handleConfigChange}
        />
      );
    
    default:
      return (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <p>Control panel for {type} generator not implemented yet.</p>
        </div>
      );
  }
}