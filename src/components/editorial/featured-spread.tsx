import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { Eyebrow } from "@/components/editorial/eyebrow";
import { Button } from "@/components/ui/button";

const overlayVariants = cva("absolute inset-0", {
  variants: {
    overlay: {
      dark: "bg-gradient-to-r from-foreground/70 to-foreground/20",
      light: "bg-gradient-to-r from-background/80 to-background/20",
      gradient: "bg-gradient-to-t from-foreground/60 to-transparent",
    },
  },
  defaultVariants: {
    overlay: "dark",
  },
});

const heightMap = {
  sm: "h-60",
  md: "h-[360px]",
  lg: "h-[480px]",
  full: "h-screen",
} as const;

interface FeaturedSpreadProps extends VariantProps<typeof overlayVariants> {
  image: string;
  imageAlt: string;
  eyebrow?: string;
  title: string;
  description?: string;
  cta?: { label: string; href: string };
  height?: keyof typeof heightMap;
  align?: "left" | "center";
  className?: string;
}

function FeaturedSpread({
  image,
  imageAlt,
  eyebrow,
  title,
  description,
  cta,
  overlay = "dark",
  height = "md",
  align = "left",
  className,
}: FeaturedSpreadProps) {
  const isLight = overlay === "light";

  return (
    <div
      data-slot="featured-spread"
      className={cn(
        "relative w-full overflow-hidden rounded-xl",
        heightMap[height],
        className,
      )}
      role="img"
      aria-label={imageAlt}
    >
      <Image
        src={image}
        alt=""
        fill
        className="object-cover"
        sizes="100vw"
        priority
      />

      <div className={overlayVariants({ overlay })} />

      <div
        className={cn(
          "relative z-10 flex h-full flex-col justify-end p-6 md:p-10",
          align === "center" && "items-center text-center",
        )}
      >
        <div className="max-w-xl space-y-3">
          {eyebrow && (
            <Eyebrow
              variant={isLight ? "default" : "accent"}
              className={cn(!isLight && "text-white/80")}
            >
              {eyebrow}
            </Eyebrow>
          )}
          <h2
            className={cn(
              "font-heading text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl",
              isLight ? "text-foreground" : "text-white",
            )}
          >
            {title}
          </h2>
          {description && (
            <p
              className={cn(
                "text-base leading-relaxed",
                isLight ? "text-muted-foreground" : "text-white/80",
              )}
            >
              {description}
            </p>
          )}
          {cta && (
            <div className="pt-2">
              <Button
                variant="accent"
                size="lg"
                render={<Link href={cta.href} />}
              >
                {cta.label}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export { FeaturedSpread };
export type { FeaturedSpreadProps };
