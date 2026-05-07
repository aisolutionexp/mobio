"use client";

import * as React from "react";
import { Select as SelectPrimitive } from "@base-ui/react/select";
import { ChevronDown, Check } from "lucide-react";

import { cn } from "@/lib/utils";

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps {
  options: SelectOption[];
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  name?: string;
  required?: boolean;
  className?: string;
}

function Select({
  options,
  value,
  onValueChange,
  placeholder = "Selecione...",
  disabled,
  error,
  name,
  required,
  className,
}: SelectProps) {
  return (
    <SelectPrimitive.Root
      value={value}
      onValueChange={(val) => {
        if (onValueChange && val != null) {
          onValueChange(val as string);
        }
      }}
      disabled={disabled}
      name={name}
      required={required}
    >
      <SelectPrimitive.Trigger
        aria-invalid={!!error}
        className={cn(
          "border-input flex h-9 w-full items-center justify-between rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none md:text-sm",
          "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-3",
          "disabled:pointer-events-none disabled:opacity-50",
          error &&
            "border-destructive ring-destructive/20 dark:border-destructive/50 dark:ring-destructive/40 ring-3",
          className,
        )}
      >
        <SelectPrimitive.Value
          placeholder={placeholder}
          className="data-[placeholder]:text-muted-foreground truncate text-left"
        />
        <SelectPrimitive.Icon className="ml-2 shrink-0">
          <ChevronDown className="text-muted-foreground size-4" />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>

      <SelectPrimitive.Portal>
        <SelectPrimitive.Positioner sideOffset={4} className="z-50">
          <SelectPrimitive.Popup
            className={cn(
              "border-border bg-popover text-popover-foreground max-h-[var(--available-height)] min-w-[var(--anchor-width)] overflow-auto rounded-md border p-1 shadow-sm",
              "origin-[var(--transform-origin)] transition-[transform,scale,opacity] data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0",
            )}
          >
            {options.map((option) => (
              <SelectPrimitive.Item
                key={option.value}
                value={option.value}
                disabled={option.disabled}
                className={cn(
                  "relative flex w-full cursor-default items-center rounded-sm py-1.5 pr-2 pl-8 text-sm outline-none select-none",
                  "hover:bg-accent/10 hover:text-foreground",
                  "focus:bg-accent/10 focus:text-foreground",
                  "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
                )}
              >
                <SelectPrimitive.ItemIndicator className="absolute left-2 flex size-4 items-center justify-center">
                  <Check className="size-3.5" />
                </SelectPrimitive.ItemIndicator>
                <SelectPrimitive.ItemText>
                  {option.label}
                </SelectPrimitive.ItemText>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Popup>
        </SelectPrimitive.Positioner>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}

export { Select };
export type { SelectProps, SelectOption };
