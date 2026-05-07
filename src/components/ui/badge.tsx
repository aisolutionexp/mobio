import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-sm border font-medium transition-colors select-none",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground border-transparent",
        secondary: "bg-secondary text-secondary-foreground border-transparent",
        outline: "border-border text-foreground bg-transparent",
        accent: "bg-accent/15 text-accent-foreground border-accent/30",
        success: "bg-success/15 text-success border-success/30",
        warning: "bg-warning/15 text-warning-foreground border-warning/30",
        destructive: "bg-destructive/15 text-destructive border-destructive/30",
        info: "bg-info/15 text-info-foreground border-info/30",
      },
      size: {
        sm: "h-5 px-1.5 text-xs",
        default: "h-6 px-2 text-xs",
        lg: "h-7 px-2.5 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

interface BadgeProps
  extends
    React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  removable?: boolean;
  onRemove?: () => void;
  dot?: boolean;
}

function Badge({
  className,
  variant,
  size,
  removable,
  onRemove,
  dot,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      data-slot="badge"
      className={cn(badgeVariants({ variant, size, className }))}
      {...props}
    >
      {dot && (
        <span
          aria-hidden="true"
          className="size-1.5 shrink-0 rounded-full bg-current"
        />
      )}
      {children}
      {removable && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remover ${typeof children === "string" ? children : ""}`}
          className="focus-visible:ring-ring -mr-0.5 ml-0.5 inline-flex size-4 shrink-0 items-center justify-center rounded-sm opacity-70 transition-opacity hover:opacity-100 focus-visible:ring-2 focus-visible:outline-none"
        >
          <X className="size-3" />
        </button>
      )}
    </span>
  );
}

export { Badge, badgeVariants };
