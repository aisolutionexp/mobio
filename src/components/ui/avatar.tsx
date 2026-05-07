import * as React from "react";
import { Avatar as AvatarPrimitive } from "@base-ui/react/avatar";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const avatarVariants = cva(
  "relative inline-flex shrink-0 items-center justify-center overflow-hidden",
  {
    variants: {
      size: {
        xs: "size-6 text-[10px]",
        sm: "size-8 text-xs",
        md: "size-10 text-sm",
        lg: "size-14 text-lg",
        xl: "size-20 text-xl",
      },
      shape: {
        circle: "rounded-full",
        square: "rounded-lg",
      },
    },
    defaultVariants: {
      size: "md",
      shape: "circle",
    },
  },
);

type AvatarStatus = "online" | "offline" | "away" | "busy";

const statusColors: Record<AvatarStatus, string> = {
  online: "bg-success",
  offline: "bg-muted-foreground",
  away: "bg-warning",
  busy: "bg-destructive",
};

const statusLabels: Record<AvatarStatus, string> = {
  online: "Online",
  offline: "Offline",
  away: "Ausente",
  busy: "Ocupado",
};

interface AvatarProps extends VariantProps<typeof avatarVariants> {
  src?: string;
  alt: string;
  fallback: string;
  status?: AvatarStatus;
  className?: string;
}

function Avatar({
  src,
  alt,
  fallback,
  size = "md",
  shape = "circle",
  status,
  className,
}: AvatarProps) {
  const isLarge = size === "lg" || size === "xl";
  const dotSize = isLarge ? "size-3" : "size-2";

  return (
    <AvatarPrimitive.Root
      className={cn(avatarVariants({ size, shape, className }))}
    >
      <AvatarPrimitive.Image
        src={src}
        alt={alt}
        className="size-full object-cover"
      />
      <AvatarPrimitive.Fallback
        className="bg-muted font-heading text-muted-foreground flex size-full items-center justify-center font-medium"
        aria-label={alt}
      >
        {fallback}
      </AvatarPrimitive.Fallback>
      {status && (
        <span
          aria-hidden="true"
          className={cn(
            "ring-background absolute right-0 bottom-0 rounded-full ring-2",
            dotSize,
            statusColors[status],
          )}
          title={statusLabels[status]}
        />
      )}
    </AvatarPrimitive.Root>
  );
}

export { Avatar, avatarVariants };
export type { AvatarProps, AvatarStatus };
