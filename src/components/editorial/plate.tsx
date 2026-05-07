import * as React from "react";

import { cn } from "@/lib/utils";
import { Eyebrow } from "@/components/editorial/eyebrow";
import { Rule } from "@/components/editorial/rule";

interface PlateProps extends React.HTMLAttributes<HTMLDivElement> {
  eyebrow?: string;
  title?: string;
  footer?: React.ReactNode;
  padded?: boolean;
  accent?: boolean;
}

function Plate({
  eyebrow,
  title,
  footer,
  padded = true,
  accent,
  children,
  className,
  ...props
}: PlateProps) {
  return (
    <div
      data-slot="plate"
      className={cn(
        "border-border bg-card rounded-lg border",
        accent && "border-l-accent border-l-2",
        padded && "p-6",
        className,
      )}
      {...props}
    >
      {(eyebrow || title) && (
        <div className={cn("space-y-1", (children || footer) && "mb-4")}>
          {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
          {title && (
            <h3 className="font-heading text-lg font-semibold">{title}</h3>
          )}
          {(children || footer) && <Rule spacing="sm" />}
        </div>
      )}
      {children && <div>{children}</div>}
      {footer && <div className="mt-4">{footer}</div>}
    </div>
  );
}

export { Plate };
export type { PlateProps };
