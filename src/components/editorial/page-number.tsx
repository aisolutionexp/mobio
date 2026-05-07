import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const pageNumberVariants = cva("inline-flex items-center", {
  variants: {
    variant: {
      fraction: "",
      dot: "gap-1.5",
      bar: "flex-col gap-1",
    },
  },
  defaultVariants: {
    variant: "fraction",
  },
});

interface PageNumberProps extends VariantProps<typeof pageNumberVariants> {
  current: number;
  total: number;
  showProgress?: boolean;
  className?: string;
}

function zeroPad(n: number): string {
  return n.toString().padStart(2, "0");
}

function PageNumber({
  current,
  total,
  variant = "fraction",
  showProgress,
  className,
}: PageNumberProps) {
  const label = `Página ${current} de ${total}`;

  if (variant === "dot") {
    return (
      <div
        role="status"
        aria-label={label}
        className={cn(pageNumberVariants({ variant, className }))}
      >
        {Array.from({ length: total }, (_, i) => (
          <span
            key={i}
            aria-hidden="true"
            className={cn(
              "size-1.5 rounded-full transition-colors",
              i + 1 === current ? "bg-accent" : "bg-muted-foreground/30",
            )}
          />
        ))}
      </div>
    );
  }

  if (variant === "bar") {
    const progress = total > 0 ? (current / total) * 100 : 0;
    return (
      <div
        role="status"
        aria-label={label}
        className={cn(pageNumberVariants({ variant, className }))}
      >
        <span className="font-heading text-muted-foreground text-sm">
          <span className="tabular-nums">{zeroPad(current)}</span>
          <span className="mx-1 font-sans">/</span>
          <span className="tabular-nums">{zeroPad(total)}</span>
        </span>
        {showProgress && (
          <div className="bg-muted h-0.5 w-full overflow-hidden rounded-full">
            <div
              className="bg-accent h-full rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <span
      role="status"
      aria-label={label}
      className={cn(
        "font-heading text-muted-foreground text-sm",
        pageNumberVariants({ variant, className }),
      )}
    >
      <span className="tabular-nums">{zeroPad(current)}</span>
      <span className="mx-1 font-sans">/</span>
      <span className="tabular-nums">{zeroPad(total)}</span>
    </span>
  );
}

export { PageNumber, pageNumberVariants };
export type { PageNumberProps };
