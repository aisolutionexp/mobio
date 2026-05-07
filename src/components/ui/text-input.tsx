import * as React from "react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldLabel,
  FieldControl,
  FieldHint,
  FieldError,
} from "@/components/ui/field";

interface TextInputProps extends Omit<React.ComponentProps<"input">, "prefix"> {
  label?: string;
  description?: string;
  error?: string;
  leftIcon?: LucideIcon;
  rightIcon?: LucideIcon;
  rightElement?: React.ReactNode;
}

const TextInput = React.forwardRef<HTMLInputElement, TextInputProps>(
  (
    {
      label,
      description,
      error,
      leftIcon: LeftIcon,
      rightIcon: RightIcon,
      rightElement,
      className,
      id: idProp,
      ...props
    },
    ref,
  ) => {
    const generatedId = React.useId();
    const id = idProp ?? generatedId;
    const descriptionId = `${id}-description`;
    const errorId = `${id}-error`;

    const describedBy = [
      description ? descriptionId : null,
      error ? errorId : null,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <Field>
        {label && (
          <FieldLabel htmlFor={id} required={props.required}>
            {label}
          </FieldLabel>
        )}
        <FieldControl>
          <div className="relative">
            {LeftIcon && (
              <LeftIcon
                aria-hidden="true"
                className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
              />
            )}
            <Input
              ref={ref}
              id={id}
              aria-invalid={!!error}
              aria-describedby={describedBy || undefined}
              className={cn(
                LeftIcon && "pl-9",
                (RightIcon || rightElement) && "pr-9",
                className,
              )}
              {...props}
            />
            {(RightIcon || rightElement) && (
              <span className="absolute top-1/2 right-3 -translate-y-1/2">
                {rightElement ??
                  (RightIcon && (
                    <RightIcon
                      aria-hidden="true"
                      className="text-muted-foreground size-4"
                    />
                  ))}
              </span>
            )}
          </div>
        </FieldControl>
        {description && <FieldHint id={descriptionId}>{description}</FieldHint>}
        {error && <FieldError id={errorId}>{error}</FieldError>}
      </Field>
    );
  },
);
TextInput.displayName = "TextInput";

export { TextInput };
export type { TextInputProps };
