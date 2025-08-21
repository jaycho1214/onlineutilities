/**
 * Form Field Component
 *
 * Reusable form field components with consistent styling
 * and optimized performance.
 */

import React from "react";
import { Input } from "@/features/shared/ui/input";
import { Label } from "@/features/shared/ui/label";
import { Checkbox } from "@/features/shared/ui/checkbox";
import { Slider } from "@/features/shared/ui/slider";
import { InlineError } from "./error-display";

interface BaseFieldProps {
  label: string;
  className?: string;
  children?: React.ReactNode;
}

/**
 * Base field wrapper with consistent label styling
 */
export function FormField({ label, className = "", children }: BaseFieldProps) {
  return (
    <div className={className}>
      <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {label}
      </Label>
      {children}
    </div>
  );
}

interface NumberFieldProps extends BaseFieldProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  inputClassName?: string;
}

/**
 * Optimized number input field with validation
 */
export const NumberField = React.memo<NumberFieldProps>(
  ({
    label,
    value,
    onChange,
    min = 1,
    max = 100,
    className = "",
    inputClassName = "w-20",
  }) => (
    <FormField label={label} className={className}>
      <Input
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value) || min)}
        className={inputClassName}
      />
    </FormField>
  ),
);

NumberField.displayName = "NumberField";

interface SliderFieldProps extends BaseFieldProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  showValue?: boolean;
}

/**
 * Optimized slider field with value display
 */
export const SliderField = React.memo<SliderFieldProps>(
  ({
    label,
    value,
    onChange,
    min = 1,
    max = 100,
    step = 1,
    showValue = true,
    className = "",
  }) => (
    <FormField
      label={showValue ? `${label}: ${value}` : label}
      className={className}
    >
      <Slider
        value={[value]}
        onValueChange={([newValue]) => onChange(newValue)}
        min={min}
        max={max}
        step={step}
        className="w-full"
      />
      <div className="flex justify-between text-xs text-gray-500 mt-1">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </FormField>
  ),
);

SliderField.displayName = "SliderField";

interface CheckboxFieldProps {
  id: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
}

/**
 * Optimized checkbox field with consistent styling
 */
export const CheckboxField = React.memo<CheckboxFieldProps>(
  ({ id, label, checked, onChange, className = "" }) => (
    <div className={`flex items-center space-x-2 ${className}`}>
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={(value) => onChange(!!value)}
      />
      <Label
        htmlFor={id}
        className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer"
      >
        {label}
      </Label>
    </div>
  ),
);

CheckboxField.displayName = "CheckboxField";

interface TextFieldProps extends BaseFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  inputClassName?: string;
  helpText?: string;
  error?: string;
}

/**
 * Optimized text input field
 */
export const TextField = React.memo<TextFieldProps>(
  ({
    label,
    value,
    onChange,
    placeholder,
    className = "",
    inputClassName = "font-mono",
    helpText,
    error,
  }) => (
    <FormField label={label} className={className}>
      <Input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={inputClassName}
      />
      <InlineError error={error} />
      {helpText && !error && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {helpText}
        </p>
      )}
    </FormField>
  ),
);

TextField.displayName = "TextField";
