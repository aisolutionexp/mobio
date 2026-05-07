import * as React from "react";
import { AlertCircle } from "lucide-react";

import { cn } from "@/lib/utils";

interface FieldProps {
  children: React.ReactNode;
  className?: string;
}

function Field({ children, className }: FieldProps) {
  return (
    <div data-slot="field" className={cn("space-y-2", className)}>
      {children}
    </div>
  );
}

interface FieldLabelProps extends React.ComponentProps<"label"> {
  required?: boolean;
}

function FieldLabel({
  className,
  required,
  children,
  ...props
}: FieldLabelProps) {
  return (
    <label
      data-slot="field-label"
      className={cn(
        "flex items-center gap-1 text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className,
      )}
      {...props}
    >
      {children}
      {required && (
        <span aria-hidden="true" className="text-destructive">
          *
        </span>
      )}
    </label>
  );
}

function FieldControl({ children }: { children: React.ReactNode }) {
  return <div data-slot="field-control">{children}</div>;
}

function FieldHint({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="field-hint"
      className={cn("text-muted-foreground text-xs", className)}
      {...props}
    />
  );
}

function FieldError({
  className,
  children,
  ...props
}: React.ComponentProps<"p">) {
  if (!children) return null;
  return (
    <p
      data-slot="field-error"
      role="alert"
      className={cn(
        "text-destructive flex items-center gap-1.5 text-sm",
        className,
      )}
      {...props}
    >
      <AlertCircle className="size-3.5 shrink-0" />
      {children}
    </p>
  );
}

export { Field, FieldLabel, FieldControl, FieldHint, FieldError };
