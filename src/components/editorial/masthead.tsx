import * as React from "react";

import { cn } from "@/lib/utils";
import { Eyebrow } from "@/components/editorial/eyebrow";
import { Rule } from "@/components/editorial/rule";

interface MastheadProps {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  withRule?: boolean;
  className?: string;
}

function Masthead({
  eyebrow,
  title,
  description,
  actions,
  withRule = true,
  className,
}: MastheadProps) {
  return (
    <header data-slot="masthead" className={cn("space-y-2", className)}>
      {eyebrow && <Eyebrow className="mb-2">{eyebrow}</Eyebrow>}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <h1 className="font-heading text-3xl font-bold tracking-tight md:text-4xl">
            {title}
          </h1>
          {description && (
            <p className="text-muted-foreground mt-2 max-w-2xl text-base">
              {description}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex shrink-0 items-center gap-2">{actions}</div>
        )}
      </div>
      {withRule && <Rule spacing="md" />}
    </header>
  );
}

export { Masthead };
export type { MastheadProps };
