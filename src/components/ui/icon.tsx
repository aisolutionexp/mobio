import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

const iconVariants = cva("shrink-0", {
  variants: {
    size: {
      xs: "size-3.5",
      sm: "size-4",
      md: "size-5",
      lg: "size-6",
      xl: "size-8",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

interface IconProps extends VariantProps<typeof iconVariants> {
  name: LucideIcon;
  className?: string;
  decorative?: boolean;
  strokeWidth?: number;
}

function Icon({
  name: IconComponent,
  size = "md",
  className,
  decorative = true,
  strokeWidth,
  ...props
}: IconProps) {
  return (
    <IconComponent
      aria-hidden={decorative}
      className={cn(iconVariants({ size, className }))}
      strokeWidth={strokeWidth}
      {...props}
    />
  );
}

export { Icon, iconVariants };
export type { IconProps };
