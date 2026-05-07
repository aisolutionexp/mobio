import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const eyebrowVariants = cva(
  "font-sans text-xs font-semibold uppercase tracking-[0.15em]",
  {
    variants: {
      variant: {
        default: "text-muted-foreground",
        accent: "text-accent",
        muted: "text-muted-foreground/70",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

interface EyebrowProps
  extends
    React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof eyebrowVariants> {
  as?: "span" | "p" | "div";
  withRule?: boolean;
}

function Eyebrow({
  as: Component = "span",
  variant,
  withRule,
  className,
  children,
  ...props
}: EyebrowProps) {
  if (withRule) {
    return (
      <div className="flex items-center gap-3">
        <Component
          data-slot="eyebrow"
          className={cn(eyebrowVariants({ variant, className }))}
          {...props}
        >
          {children}
        </Component>
        <span aria-hidden="true" className="bg-border h-px flex-1" />
      </div>
    );
  }

  return (
    <Component
      data-slot="eyebrow"
      className={cn(eyebrowVariants({ variant, className }))}
      {...props}
    >
      {children}
    </Component>
  );
}

export { Eyebrow, eyebrowVariants };
