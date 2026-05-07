"use client";

import * as React from "react";
import { Tabs as TabsPrimitive } from "@base-ui/react/tabs";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const TabsRoot = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Root>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Root
    ref={ref}
    className={cn("w-full", className)}
    {...props}
  />
));
TabsRoot.displayName = "Tabs";

const tabsListVariants = cva(
  "inline-flex items-center gap-1 text-muted-foreground",
  {
    variants: {
      variant: {
        default: "rounded-lg bg-muted p-1",
        underline: "border-b border-border gap-0",
        pill: "gap-1",
      },
    },
    defaultVariants: {
      variant: "underline",
    },
  },
);

interface TabsListProps
  extends
    React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>,
    VariantProps<typeof tabsListVariants> {}

const TabsList = React.forwardRef<HTMLDivElement, TabsListProps>(
  ({ className, variant, ...props }, ref) => (
    <TabsPrimitive.List
      ref={ref}
      className={cn(tabsListVariants({ variant, className }))}
      data-variant={variant ?? "underline"}
      {...props}
    />
  ),
);
TabsList.displayName = "TabsList";

const tabsTriggerVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all outline-none select-none disabled:pointer-events-none disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "rounded-md px-3 py-1.5 data-[selected]:bg-background data-[selected]:text-foreground data-[selected]:shadow-xs",
        underline:
          "border-b-2 border-transparent px-4 py-2 data-[selected]:border-accent data-[selected]:text-foreground hover:text-foreground",
        pill: "rounded-full px-4 py-1.5 data-[selected]:bg-primary data-[selected]:text-primary-foreground hover:bg-muted",
      },
    },
    defaultVariants: {
      variant: "underline",
    },
  },
);

interface TabsTriggerProps
  extends
    React.ComponentPropsWithoutRef<typeof TabsPrimitive.Tab>,
    VariantProps<typeof tabsTriggerVariants> {
  icon?: React.ReactNode;
}

const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ className, variant, icon, children, ...props }, ref) => (
    <TabsPrimitive.Tab
      ref={ref}
      className={cn(tabsTriggerVariants({ variant, className }))}
      {...props}
    >
      {icon}
      {children}
    </TabsPrimitive.Tab>
  ),
);
TabsTrigger.displayName = "TabsTrigger";

const TabsContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Panel>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Panel
    ref={ref}
    className={cn(
      "focus-visible:ring-ring mt-2 outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
      className,
    )}
    {...props}
  />
));
TabsContent.displayName = "TabsContent";

const Tabs = Object.assign(TabsRoot, {
  List: TabsList,
  Trigger: TabsTrigger,
  Content: TabsContent,
});

export {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  tabsListVariants,
  tabsTriggerVariants,
};
