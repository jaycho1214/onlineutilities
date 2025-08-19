"use client";

import * as React from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonGroupVariants = cva(
  "inline-flex rounded-lg overflow-hidden gap-1",
  {
    variants: {
      variant: {
        default: "bg-background/50 p-1",
        outline: "border border-border",
        ghost: "",
      },
      size: {
        default: "",
        sm: "",
        lg: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const buttonGroupItemVariants = cva(
  "px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 transition-all [&_svg]:size-4 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "",
        outline: "",
        ghost: "",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

interface ButtonGroupProps
  extends React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>,
    VariantProps<typeof buttonGroupVariants> {}

interface ButtonGroupItemProps
  extends React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>,
    VariantProps<typeof buttonGroupItemVariants> {}

const ButtonGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  ButtonGroupProps
>(({ className, variant, size, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Root
      className={cn(buttonGroupVariants({ variant, size }), className)}
      {...props}
      ref={ref}
    />
  );
});

ButtonGroup.displayName = RadioGroupPrimitive.Root.displayName;

const ButtonGroupItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  ButtonGroupItemProps
>(({ className, variant, children, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Item
      ref={ref}
      className={cn(
        buttonGroupItemVariants({ variant }),
        "data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
        "data-[state=unchecked]:text-muted-foreground data-[state=unchecked]:hover:text-foreground data-[state=unchecked]:hover:bg-muted/50 data-[state=unchecked]:bg-transparent",
        className
      )}
      {...props}
    >
      {children}
    </RadioGroupPrimitive.Item>
  );
});

ButtonGroupItem.displayName = RadioGroupPrimitive.Item.displayName;

export { ButtonGroup, ButtonGroupItem };
