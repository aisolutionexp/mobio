import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const ruleVariants = cva("w-full", {
  variants: {
    variant: {
      default: "border-t border-border",
      accent: "border-t-2 border-accent",
      thick: "border-t-2 border-foreground",
      dashed: "border-t border-dashed border-border",
      dotted: "border-t border-dotted border-muted-foreground/30",
    },
    spacing: {
      sm: "my-4",
      md: "my-8",
      lg: "my-12",
    },
  },
  defaultVariants: {
    variant: "default",
    spacing: "md",
  },
});

interface RuleProps
  extends
    React.HTMLAttributes<HTMLHRElement>,
    VariantProps<typeof ruleVariants> {
  label?: string;
}

function Rule({ variant, spacing, label, className, ...props }: RuleProps) {
  if (label) {
    return (
      <div
        role="separator"
        className={cn(
          "flex items-center gap-4",
          ruleVariants({ spacing }),
          className,
        )}
      >
        <span
          aria-hidden="true"
          className={cn(
            "h-0 flex-1",
            variant === "accent"
              ? "border-accent border-t-2"
              : variant === "thick"
                ? "border-foreground border-t-2"
                : variant === "dashed"
                  ? "border-border border-t border-dashed"
                  : variant === "dotted"
                    ? "border-muted-foreground/30 border-t border-dotted"
                    : "border-border border-t",
          )}
        />
        <span className="text-muted-foreground shrink-0 text-xs tracking-wide uppercase">
          {label}
        </span>
        <span
          aria-hidden="true"
          className={cn(
            "h-0 flex-1",
            variant === "accent"
              ? "border-accent border-t-2"
              : variant === "thick"
                ? "border-foreground border-t-2"
                : variant === "dashed"
                  ? "border-border border-t border-dashed"
                  : variant === "dotted"
                    ? "border-muted-foreground/30 border-t border-dotted"
                    : "border-border border-t",
          )}
        />
      </div>
    );
  }

  return (
    <hr
      data-slot="rule"
      className={cn(ruleVariants({ variant, spacing, className }))}
      {...props}
    />
  );
}

export { Rule, ruleVariants };
export type { RuleProps };
