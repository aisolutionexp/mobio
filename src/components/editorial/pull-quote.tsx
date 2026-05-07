import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const pullQuoteVariants = cva("", {
  variants: {
    variant: {
      default: "border-l-2 border-accent pl-6 py-2",
      centered: "text-center py-4",
      large: "border-l-2 border-accent pl-6 py-2",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

interface PullQuoteProps
  extends
    React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof pullQuoteVariants> {
  quote: string;
  attribution?: string;
}

function PullQuote({
  quote,
  attribution,
  variant,
  className,
  ...props
}: PullQuoteProps) {
  const textSize =
    variant === "large" ? "text-2xl md:text-3xl" : "text-xl md:text-2xl";

  return (
    <blockquote
      data-slot="pull-quote"
      className={cn(pullQuoteVariants({ variant, className }))}
      {...props}
    >
      {variant === "centered" && (
        <span
          aria-hidden="true"
          className="font-heading text-accent mb-2 block text-4xl leading-none"
        >
          &ldquo;
        </span>
      )}
      <p
        className={cn(
          "font-heading text-foreground/90 leading-relaxed italic",
          textSize,
        )}
      >
        {variant !== "centered" && <>&ldquo;</>}
        {quote}
        {variant !== "centered" && <>&rdquo;</>}
      </p>
      {attribution && (
        <footer className="text-muted-foreground mt-3 font-sans text-sm">
          {attribution}
        </footer>
      )}
    </blockquote>
  );
}

export { PullQuote, pullQuoteVariants };
export type { PullQuoteProps };
